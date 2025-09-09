const mongoose = require('mongoose');

const partenerSchema = new mongoose.Schema({
  numeFirma: {
    type: String,
    required: [true, 'Numele firmei este obligatoriu'],
    trim: true,
    maxlength: [200, 'Numele firmei nu poate depăși 200 de caractere']
  },
  
  contactPersoana: {
    type: String,
    required: false, // Făcut opțional pentru quick-add
    trim: true,
    maxlength: [100, 'Numele persoanei de contact nu poate depăși 100 de caractere'],
    default: ''
  },
  
  telefon: {
    type: String,
    required: [true, 'Numărul de telefon este obligatoriu'],
    trim: true,
    match: [/^[\+]?[0-9\s\-\(\)]{10,}$/, 'Format telefon invalid']
  },
  
  email: {
    type: String,
    required: [true, 'Adresa de email este obligatorie'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Format email invalid']
  },
  
  adresaFirma: {
    strada: {
      type: String,
      trim: true,
      maxlength: [200, 'Strada nu poate depăși 200 de caractere']
    },
    oras: {
      type: String,
      trim: true,
      maxlength: [100, 'Orașul nu poate depăși 100 de caractere']
    },
    codPostal: {
      type: String,
      trim: true,
      maxlength: [20, 'Codul poștal nu poate depăși 20 de caractere']
    },
    tara: {
      type: String,
      trim: true,
      maxlength: [100, 'Țara nu poate depăși 100 de caractere'],
      default: 'România'
    }
  },
  
  bursaSursa: {
    type: String,
    required: [true, 'Bursa sursă este obligatorie'],
    enum: ['timocom', 'trans', 'teleroute', 'direct', 'recomandare', 'altele'],
    default: 'timocom'
  },
  
  codFiscal: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [50, 'Codul fiscal nu poate depăși 50 de caractere']
  },
  
  nrRegistruComert: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [50, 'Numărul de registru comerț nu poate depăși 50 de caractere']
  },
  
  contracteAtasate: [{
    nume: {
      type: String,
      required: true,
      trim: true
    },
    cale: {
      type: String,
      required: true
    },
    dataIncarcare: {
      type: Date,
      default: Date.now
    },
    tipContract: {
      type: String,
      enum: ['contract_cadru', 'contract_specific', 'acord_colaborare', 'altul'],
      default: 'contract_cadru'
    }
  }],
  
  istoricCurse: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cursa'
  }],
  
  datoriiPendinte: {
    type: Number,
    default: 0,
    min: [0, 'Datoriile nu pot fi negative']
  },
  
  totalFacturat: {
    type: Number,
    default: 0,
    min: [0, 'Totalul facturat nu poate fi negativ']
  },
  
  totalIncasat: {
    type: Number,
    default: 0,
    min: [0, 'Totalul încasat nu poate fi negativ']
  },
  
  ratingPartener: {
    type: Number,
    min: [1, 'Rating-ul minim este 1'],
    max: [5, 'Rating-ul maxim este 5'],
    default: 3
  },
  
  termeniPlata: {
    zilePlata: {
      type: Number,
      min: [0, 'Zilele de plată nu pot fi negative'],
      default: 30
    },
    tipPlata: {
      type: String,
      enum: ['avans', 'la_livrare', 'termen_fixe', 'lunar'],
      default: 'termen_fixe'
    },
    valutaPreferata: {
      type: String,
      enum: ['EUR', 'RON', 'USD'],
      default: 'EUR'
    }
  },
  
  statusPartener: {
    type: String,
    enum: ['activ', 'inactiv', 'suspendat', 'blacklist'],
    default: 'activ'
  },
  
  dataUltimeiColaborari: {
    type: Date
  },
  
  note: {
    type: String,
    maxlength: [2000, 'Notele nu pot depăși 2000 de caractere']
  },
  
  // Statistici calculate automat
  statistici: {
    numarCurseTotal: {
      type: Number,
      default: 0
    },
    numarCurseAn: {
      type: Number,
      default: 0
    },
    valoareMedieComanda: {
      type: Number,
      default: 0
    },
    timpMediuPlata: {
      type: Number, // în zile
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index pentru căutări rapide
partenerSchema.index({ numeFirma: 1 });
partenerSchema.index({ bursaSursa: 1 });
partenerSchema.index({ statusPartener: 1 });
partenerSchema.index({ email: 1 });
partenerSchema.index({ codFiscal: 1 });

// Virtual pentru cursele active
partenerSchema.virtual('curseActive', {
  ref: 'Cursa',
  localField: '_id',
  foreignField: 'partenerAsignat',
  match: { status: { $in: ['Acceptată', 'În Curs'] } },
  count: true
});

// Virtual pentru adresa completă
partenerSchema.virtual('adresaCompleta').get(function() {
  const adresa = this.adresaFirma;
  if (!adresa) return '';
  
  const parts = [];
  if (adresa.strada) parts.push(adresa.strada);
  if (adresa.oras) parts.push(adresa.oras);
  if (adresa.codPostal) parts.push(adresa.codPostal);
  if (adresa.tara) parts.push(adresa.tara);
  
  return parts.join(', ');
});

// Virtual pentru procentul de plată la timp
partenerSchema.virtual('procentPlataLaTimp').get(function() {
  if (this.statistici.numarCurseTotal === 0) return 100;
  
  // Calculăm pe baza timpului mediu de plată vs termenii de plată
  const timpAsteptat = this.termeniPlata.zilePlata;
  const timpMediu = this.statistici.timpMediuPlata;
  
  if (timpMediu <= timpAsteptat) return 100;
  
  // Calculăm procentul de performanță
  const performanta = Math.max(0, 100 - ((timpMediu - timpAsteptat) / timpAsteptat * 100));
  return Math.round(performanta);
});

// Virtual pentru statusul datoriilor
partenerSchema.virtual('statusDatorii').get(function() {
  if (this.datoriiPendinte === 0) return 'la_zi';
  if (this.datoriiPendinte < 1000) return 'datorie_mica';
  if (this.datoriiPendinte < 5000) return 'datorie_medie';
  return 'datorie_mare';
});

// Pre-save hook pentru actualizarea statisticilor
partenerSchema.pre('save', function(next) {
  // Actualizează data ultimei colaborări dacă se adaugă curse noi
  if (this.isModified('istoricCurse') && this.istoricCurse.length > 0) {
    this.dataUltimeiColaborari = new Date();
  }
  
  next();
});

// Metodă pentru calcularea statisticilor din curse
partenerSchema.methods.calculeazaStatistici = async function() {
  const Curse = mongoose.model('Curse');
  
  // Curse totale
  const curseTotale = await Curse.find({ partenerAsignat: this._id });
  this.statistici.numarCurseTotal = curseTotale.length;
  
  // Curse din acest an
  const startAn = new Date(new Date().getFullYear(), 0, 1);
  const curseAn = await Curse.find({ 
    partenerAsignat: this._id,
    createdAt: { $gte: startAn }
  });
  this.statistici.numarCurseAn = curseAn.length;
  
  // Valoarea medie a comenzii
  if (curseTotale.length > 0) {
    const valoareTotala = curseTotale.reduce((sum, cursa) => sum + (cursa.costNegociat || 0), 0);
    this.statistici.valoareMedieComanda = Math.round(valoareTotala / curseTotale.length);
  }
  
  // Calculează totalurile
  const curseFinalizate = curseTotale.filter(cursa => 
    ['Finalizată', 'Plătită'].includes(cursa.status)
  );
  
  this.totalFacturat = curseFinalizate.reduce((sum, cursa) => sum + (cursa.costNegociat || 0), 0);
  
  await this.save();
  return this.statistici;
};

// Metodă pentru actualizarea datoriilor
partenerSchema.methods.actualizeazaDatorii = async function() {
  const Factura = mongoose.model('Factura');
  
  try {
    // Calculează datoriile din facturile neplătite
    const facturiNeplătite = await Factura.find({
      partenerAsignat: this._id,
      status: { $in: ['Emisă', 'Trimisă', 'Întârziată'] }
    });
    
    this.datoriiPendinte = facturiNeplătite.reduce((sum, factura) => sum + (factura.suma || 0), 0);
    
    // Calculează totalul încasat din facturile plătite
    const facturiPlătite = await Factura.find({
      partenerAsignat: this._id,
      status: 'Plătită'
    });
    
    this.totalIncasat = facturiPlătite.reduce((sum, factura) => sum + (factura.suma || 0), 0);
    
    await this.save();
    return this.datoriiPendinte;
  } catch (error) {
    // Dacă modelul Factura nu există încă, doar salvează
    await this.save();
    return this.datoriiPendinte;
  }
};

// Metodă pentru adăugarea unui contract
partenerSchema.methods.adaugaContract = function(contractData) {
  this.contracteAtasate.push({
    ...contractData,
    dataIncarcare: new Date()
  });
  
  return this.save();
};

// Transform output pentru frontend
partenerSchema.set('toJSON', { virtuals: true });

const Partener = mongoose.model('Partener', partenerSchema);

module.exports = Partener;