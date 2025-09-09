const mongoose = require('mongoose');

const facturaSchema = new mongoose.Schema({
  numarFactura: {
    type: String,
    unique: true,
    required: [true, 'Numărul facturii este obligatoriu']
  },
  
  // Câmp pentru upload factură
  documentUpload: {
    nume: String,
    cale: String,
    tip: String,
    marime: Number,
    dataUpload: {
      type: Date,
      default: Date.now
    }
  },
  
  cursaLegata: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cursa',
    required: [true, 'Cursa legată este obligatorie']
  },
  
  partenerAsignat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partener',
    required: [true, 'Partenerul este obligatoriu']
  },
  
  suma: {
    type: Number,
    required: [true, 'Suma este obligatorie'],
    min: [0, 'Suma nu poate fi negativă']
  },
  
  moneda: {
    type: String,
    enum: ['EUR', 'RON', 'USD'],
    default: 'EUR'
  },
  
  dataEmisa: {
    type: Date,
    required: [true, 'Data emisă este obligatorie'],
    default: Date.now
  },
  
  scadenta: {
    type: Date,
    required: [true, 'Scadența este obligatorie'],
    validate: {
      validator: function(value) {
        // Verificăm doar pentru documente noi sau când se modifică explicit scadența
        // și doar dacă nu schimbăm doar statusul
        if (this.isNew || (this.isModified && this.isModified('scadenta'))) {
          if (this.dataEmisa) {
            return value > this.dataEmisa;
          }
        }
        return true;
      },
      message: 'Scadența trebuie să fie după data emisă'
    }
  },
  
  status: {
    type: String,
    enum: ['Emisă', 'Trimisă', 'Plătită', 'Întârziată', 'Anulată'],
    required: [true, 'Statusul este obligatoriu'],
    default: 'Emisă'
  },
  
  dataPlata: {
    type: Date
  },
  
  documentFactura: {
    nume: String,
    cale: String,
    dataGenerare: {
      type: Date,
      default: Date.now
    }
  },
  
  note: {
    type: String,
    maxlength: [2000, 'Notele nu pot depăși 2000 de caractere']
  },
  
  // Detalii pentru facturare
  detaliiFacturare: {
    adresaClient: String,
    codFiscalClient: String,
    nrRegistruComertClient: String,
    persoanaContact: String,
    telefonContact: String,
    emailContact: String
  },
  
  // Istoric status-uri
  istoricStatus: [{
    status: {
      type: String,
      required: true
    },
    data: {
      type: Date,
      default: Date.now
    },
    utilizator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    motiv: String
  }],
  
  // Metadata pentru email
  emailTrimis: {
    data: Date,
    catre: String,
    status: {
      type: String,
      enum: ['trimis', 'esuat', 'in_asteptare']
    }
  },
  
  // Auto-calculate numărul de zile întârziate
  zileIntarziere: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index-uri pentru performanță - eliminat duplicate pentru numarFactura (deja unique)
facturaSchema.index({ cursaLegata: 1 });
facturaSchema.index({ partenerAsignat: 1 });
facturaSchema.index({ status: 1 });
facturaSchema.index({ dataEmisa: 1 });
facturaSchema.index({ scadenta: 1 });

// Virtual pentru statusul întârzierii
facturaSchema.virtual('esteIntarziata').get(function() {
  if (this.status === 'Plătită' || this.status === 'Anulată') return false;
  return new Date() > this.scadenta;
});

// Virtual pentru zilele până la scadență
facturaSchema.virtual('zilePanaLaScadenta').get(function() {
  if (this.status === 'Plătită' || this.status === 'Anulată') return null;
  
  const astazi = new Date();
  const diferenta = this.scadenta - astazi;
  return Math.ceil(diferenta / (1000 * 60 * 60 * 24));
});

// Virtual pentru suma formatată
facturaSchema.virtual('sumaFormatata').get(function() {
  return `${this.suma.toLocaleString('ro-RO')} ${this.moneda}`;
});

// Nu mai generăm automat numărul facturii - utilizatorul îl introduce manual

// Pre-save hook pentru actualizarea statusului întârziat
facturaSchema.pre('save', function(next) {
  // Actualizează statusul dacă este întârziată
  if (this.esteIntarziata && this.status === 'Emisă') {
    this.status = 'Întârziată';
  }
  
  // Calculează zilele de întârziere
  if (this.esteIntarziata) {
    const astazi = new Date();
    const diferenta = astazi - this.scadenta;
    this.zileIntarziere = Math.ceil(diferenta / (1000 * 60 * 60 * 24));
  } else {
    this.zileIntarziere = 0;
  }
  
  // Adaugă în istoric dacă statusul s-a schimbat
  if (this.isModified('status')) {
    this.istoricStatus.push({
      status: this.status,
      data: new Date()
    });
  }
  
  // Setează data plății dacă statusul devine 'Plătită'
  if (this.status === 'Plătită' && !this.dataPlata) {
    this.dataPlata = new Date();
  }
  
  next();
});

// Post-save hook pentru actualizarea datoriilor partenerului
facturaSchema.post('save', async function() {
  try {
    const Partener = mongoose.model('Partener');
    const partener = await Partener.findById(this.partenerAsignat);
    
    if (partener && typeof partener.actualizeazaDatorii === 'function') {
      await partener.actualizeazaDatorii();
    }
  } catch (error) {
    console.error('Eroare la actualizarea datoriilor partenerului:', error);
  }
});

// Metodă pentru marcarea ca plătită
facturaSchema.methods.marcheazaPlatita = function(dataPlata, utilizator) {
  this.status = 'Plătită';
  this.dataPlata = dataPlata || new Date();
  this.zileIntarziere = 0;
  
  // Adaugă în istoric
  this.istoricStatus.push({
    status: 'Plătită',
    data: new Date(),
    utilizator: utilizator,
    motiv: 'Marcat manual ca plătit'
  });
  
  return this.save();
};

// Metodă pentru generarea detaliilor PDF
facturaSchema.methods.getDetaliiPDF = function() {
  return {
    numarFactura: this.numarFactura,
    dataEmisa: this.dataEmisa.toLocaleDateString('ro-RO'),
    scadenta: this.scadenta.toLocaleDateString('ro-RO'),
    suma: this.sumaFormatata,
    status: this.status,
    note: this.note || '',
    detaliiClient: this.detaliiFacturare || {}
  };
};

// Metodă statică pentru găsirea facturilor întârziate
facturaSchema.statics.gasesteFacuriIntarziate = function() {
  const astazi = new Date();
  return this.find({
    scadenta: { $lt: astazi },
    status: { $in: ['Emisă', 'Trimisă', 'Întârziată'] }
  }).populate('cursaLegata partenerAsignat');
};

// Metodă statică pentru statistici facturi
facturaSchema.statics.getStatistici = async function() {
  const [totalFacturi, sumeTotale, statusDistribution] = await Promise.all([
    this.countDocuments(),
    this.aggregate([
      {
        $group: {
          _id: null,
          totalGeneral: { $sum: '$suma' },
          totalPlatite: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Plătită'] }, '$suma', 0]
            }
          },
          totalPendente: {
            $sum: {
              $cond: [{ $ne: ['$status', 'Plătită'] }, '$suma', 0]
            }
          }
        }
      }
    ]),
    this.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          suma: { $sum: '$suma' }
        }
      }
    ])
  ]);
  
  return {
    totalFacturi,
    sume: sumeTotale[0] || { totalGeneral: 0, totalPlatite: 0, totalPendente: 0 },
    distributieStatus: statusDistribution
  };
};

// Transform pentru output JSON
facturaSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

const Factura = mongoose.model('Factura', facturaSchema);

module.exports = Factura;