const mongoose = require('mongoose');

const incarcareSchema = new mongoose.Schema({
  companie: {
    type: String,
    required: true,
    trim: true
  },
  adresa: {
    type: String,
    required: true,
    trim: true
  },
  tara: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  coordonate: {
    type: String,
    trim: true,
    default: ''
  },
  informatiiIncarcare: {
    type: String,
    trim: true,
    default: ''
  },
  referintaIncarcare: {
    type: String,
    trim: true,
    default: ''
  },
  dataOra: {
    type: Date,
    required: true
  },
  descriereMarfa: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  greutate: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const descarcareSchema = new mongoose.Schema({
  companie: {
    type: String,
    required: true,
    trim: true
  },
  adresa: {
    type: String,
    required: true,
    trim: true
  },
  tara: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  coordonate: {
    type: String,
    trim: true,
    default: ''
  },
  informatiiDescarcare: {
    type: String,
    trim: true,
    default: ''
  },
  referintaDescarcare: {
    type: String,
    trim: true,
    default: ''
  },
  dataOra: {
    type: Date,
    required: true
  }
}, { _id: false });

const cursaSchema = new mongoose.Schema({
  idCursa: {
    type: String,
    unique: true,
    required: true
  },
  sursa: {
    type: String,
    required: true,
    enum: ['timocom', 'teleroute', 'trans', 'altele', 'direct']
  },
  pornire: {
    type: String,
    required: true,
    trim: true
  },
  incarcareMultipla: [incarcareSchema],
  descarcareMultipla: {
    type: [descarcareSchema],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Trebuie să existe cel puțin o adresă de descărcare'
    }
  },
  soferAsignat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sofer',
    required: true
  },
  vehiculAsignat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicul', 
    required: true
  },
  partenerAsignat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partener',
    required: false
  },
  kmEstimati: {
    type: Number,
    required: true,
    min: 1
  },
  kmReali: {
    type: Number,
    min: 0,
    validate: {
      validator: function(v) {
        return !v || v >= this.kmEstimati;
      },
      message: 'Km reali trebuie să fie >= Km estimați'
    }
  },
  costNegociat: {
    type: Number,
    required: true,
    min: 0
  },
  comisionBursa: {
    type: Number,
    default: 0,
    min: 0
  },
  venitNetCalculat: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    required: true,
    enum: ['Ofertă', 'Acceptată', 'În Curs', 'Finalizată', 'Plătită', 'Anulată'],
    default: 'Ofertă'
  },
  documenteAtasate: [{
    nume: String,
    cale: String,
    tipFisier: String,
    marime: Number,
    dataIncarcare: {
      type: Date,
      default: Date.now
    }
  }],
  note: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-increment pentru ID cursă
cursaSchema.pre('save', async function(next) {
  if (!this.idCursa) {
    try {
      // Găsește ultima cursă cu ID numeric pentru a evita duplicatele
      const lastCursa = await mongoose.model('Cursa').findOne({}, { idCursa: 1 })
        .sort({ idCursa: -1 })
        .limit(1);
      
      let nextNumber = 1;
      if (lastCursa && lastCursa.idCursa) {
        // Extrage numărul din ID-ul "C001", "C002", etc.
        const match = lastCursa.idCursa.match(/C(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      
      this.idCursa = `C${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Eroare la generarea ID cursă:', error);
      // Fallback la timestamp pentru a evita duplicate
      this.idCursa = `C${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});

// Calculează venit net automat
cursaSchema.pre('save', function(next) {
  this.venitNetCalculat = this.costNegociat - this.comisionBursa;
  next();
});

// Populare automată pentru referințe - temporar dezactivată pentru dezvoltare

// Indexes pentru performanță optimizată
cursaSchema.index({ status: 1 });
cursaSchema.index({ soferAsignat: 1 });
cursaSchema.index({ vehiculAsignat: 1 });
cursaSchema.index({ partenerAsignat: 1 });
cursaSchema.index({ createdAt: -1 }); // Pentru sortare cronologică
cursaSchema.index({ status: 1, createdAt: -1 }); // Compound index pentru filtre frecvente
cursaSchema.index({ createdAt: -1, status: 1 }); // Pentru queries dashboard cu date + status
cursaSchema.index({ sursa: 1, status: 1 }); // Pentru rapoarte pe sursă + status

const Cursa = mongoose.model('Cursa', cursaSchema);

module.exports = Cursa;