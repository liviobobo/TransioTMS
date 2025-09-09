const mongoose = require('mongoose');

const soferSchema = new mongoose.Schema({
  nume: {
    type: String,
    required: [true, 'Numele este obligatoriu'],
    trim: true,
    minlength: [2, 'Numele trebuie să aibă cel puțin 2 caractere'],
    maxlength: [100, 'Numele nu poate depăși 100 de caractere']
  },
  
  numarTelefon: {
    type: String,
    required: [true, 'Numărul de telefon este obligatoriu'],
    trim: true,
    match: [/^[\+]?[0-9\s\-\(\)]{10,}$/, 'Format telefon invalid']
  },
  
  adresaCompleta: {
    type: String,
    required: [true, 'Adresa completă este obligatorie'],
    trim: true,
    maxlength: [500, 'Adresa nu poate depăși 500 de caractere']
  },
  
  adresaEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Format email invalid']
  },
  
  permisExpira: {
    type: Date,
    required: [true, 'Data de expirare a permisului este obligatorie'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Data expirării permisului trebuie să fie în viitor'
    }
  },
  
  atestatExpira: {
    type: Date,
    required: [true, 'Data de expirare a atestatului este obligatorie'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Data expirării atestatului trebuie să fie în viitor'
    }
  },
  
  documente: [{
    tip: {
      type: String,
      enum: ['permis', 'atestat', 'contract', 'altul'],
      required: true
    },
    nume: {
      type: String,
      required: true
    },
    cale: {
      type: String,
      required: true
    },
    dataIncarcare: {
      type: Date,
      default: Date.now
    }
  }],
  
  salariuFix: {
    type: Number,
    min: [0, 'Salariul fix nu poate fi negativ'],
    default: 0
  },
  
  salariuVariabil: {
    type: Number,
    min: [0, 'Procentul salariului variabil nu poate fi negativ'],
    max: [100, 'Procentul nu poate depăși 100%'],
    default: 0
  },
  
  venituriTotaleCurse: {
    type: Number,
    default: 0,
    min: [0, 'Veniturile nu pot fi negative']
  },
  
  platiSalarii: [{
    suma: {
      type: Number,
      required: true,
      min: [0, 'Suma plății nu poate fi negativă']
    },
    dataPlata: {
      type: Date,
      required: true,
      default: Date.now
    },
    note: {
      type: String,
      maxlength: [500, 'Notele nu pot depăși 500 de caractere']
    }
  }],
  
  note: {
    type: String,
    maxlength: [1000, 'Notele nu pot depăși 1000 de caractere']
  },
  
  curseLegate: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cursa'
  }],
  
  status: {
    type: String,
    enum: ['activ', 'inactiv', 'concediu', 'suspendat'],
    default: 'activ'
  },
  
  // Tracking pentru ieșiri/intrări din România
  locatieCurenta: {
    type: String,
    enum: ['romania', 'strain'],
    default: 'romania'
  },
  
  ultimaIesireDinRO: {
    type: Date,
    default: null
  },
  
  ultimaIntrareinRO: {
    type: Date,
    default: null
  },
  
  istoricCalatorii: [{
    tip: {
      type: String,
      enum: ['iesire', 'intrare'],
      required: true
    },
    data: {
      type: Date,
      required: true,
      default: Date.now
    },
    note: {
      type: String,
      maxlength: [500, 'Notele nu pot depăși 500 de caractere']
    }
  }]
}, {
  timestamps: true,
  autoIndex: false // Previne crearea automată de index-uri duplicate
});

// Index pentru căutări rapide
soferSchema.index({ nume: 1 });
soferSchema.index({ permisExpira: 1 });
soferSchema.index({ atestatExpira: 1 });
soferSchema.index({ status: 1 });

// Virtual pentru calculul curselor atribuite
soferSchema.virtual('curseAtribuite', {
  ref: 'Cursa',
  localField: '_id',
  foreignField: 'soferAsignat',
  count: true
});

// Virtual pentru calculul timpului petrecut în locația curentă
soferSchema.virtual('timpInLocatiaCurenta').get(function() {
  const acum = new Date();
  let dataReferinta;
  
  if (this.locatieCurenta === 'romania') {
    dataReferinta = this.ultimaIntrareinRO || this.createdAt || acum;
  } else {
    dataReferinta = this.ultimaIesireDinRO || this.createdAt || acum;
  }
  
  const diferenta = acum - new Date(dataReferinta);
  const zile = Math.floor(diferenta / (1000 * 60 * 60 * 24));
  const saptamani = Math.floor(zile / 7);
  
  return {
    zile: zile,
    saptamani: saptamani,
    text: saptamani > 0 
      ? `${zile} zile (${saptamani} ${saptamani === 1 ? 'săptămână' : 'săptămâni'})` 
      : `${zile} ${zile === 1 ? 'zi' : 'zile'}`
  };
});

// Virtual pentru verificarea expirărilor în următoarele 30 zile
soferSchema.virtual('alerteExpirare').get(function() {
  const acum = new Date();
  const treizecieZile = new Date(acum.getTime() + (30 * 24 * 60 * 60 * 1000));
  
  const alerte = [];
  
  if (this.permisExpira <= treizecieZile) {
    const zileRamase = Math.ceil((this.permisExpira - acum) / (24 * 60 * 60 * 1000));
    alerte.push({
      tip: 'permis',
      mesaj: `Permisul de conducere expiră în ${zileRamase} ${zileRamase === 1 ? 'zi' : 'zile'}`,
      urgent: zileRamase <= 7
    });
  }
  
  if (this.atestatExpira <= treizecieZile) {
    const zileRamase = Math.ceil((this.atestatExpira - acum) / (24 * 60 * 60 * 1000));
    alerte.push({
      tip: 'atestat',
      mesaj: `Atestatul profesional expiră în ${zileRamase} ${zileRamase === 1 ? 'zi' : 'zile'}`,
      urgent: zileRamase <= 7
    });
  }
  
  return alerte;
});

// Calculează veniturile totale din curse
soferSchema.methods.calculeazaVenituri = async function() {
  const Curse = mongoose.model('Curse');
  const curse = await Curse.find({ 
    soferAsignat: this._id, 
    status: { $in: ['Finalizată', 'Plătită'] }
  });
  
  let venituri = 0;
  curse.forEach(cursa => {
    venituri += (cursa.venitNet || 0) * (this.salariuVariabil / 100);
  });
  
  this.venituriTotaleCurse = venituri;
  await this.save();
  return venituri;
};

// Pre-save hook pentru validări suplimentare - MAI PERMISIV PENTRU MVP
soferSchema.pre('save', function(next) {
  // Pentru MVP, permitem salvare temporară fără documente
  // Utilizatorul va putea adăuga documente ulterior prin editare
  console.log('💡 MVP Mode: Permițând salvare șofer fără documente - vor fi adăugate ulterior');

  // Doar validăm că numele și telefonul sunt prezente
  if (!this.nume || !this.numarTelefon) {
    return next(new Error('Numele și numărul de telefon sunt obligatorii'));
  }

  next();
});

// Transform output pentru frontend
soferSchema.set('toJSON', { virtuals: true });

const Sofer = mongoose.model('Sofer', soferSchema);

module.exports = Sofer;