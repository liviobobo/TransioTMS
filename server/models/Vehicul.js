const mongoose = require('mongoose');

const reparatieSchema = new mongoose.Schema({
  descriere: {
    type: String,
    required: [true, 'Descrierea reparației este obligatorie'],
    trim: true,
    maxlength: [1000, 'Descrierea nu poate depăși 1000 de caractere']
  },
  
  cost: {
    type: Number,
    required: [true, 'Costul reparației este obligatoriu'],
    min: [0, 'Costul nu poate fi negativ']
  },
  
  data: {
    type: Date,
    required: [true, 'Data reparației este obligatorie'],
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'Data reparației nu poate fi în viitor'
    }
  },
  
  furnizor: {
    type: String,
    required: [true, 'Furnizorul este obligatoriu'],
    trim: true,
    maxlength: [200, 'Numele furnizorului nu poate depăși 200 de caractere']
  },
  
  documente: [{
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
  
  kmLaReparatie: {
    type: Number,
    min: [0, 'Kilometrajul nu poate fi negativ']
  }
}, {
  timestamps: true
});

const vehiculSchema = new mongoose.Schema({
  numarInmatriculare: {
    type: String,
    required: [true, 'Numărul de înmatriculare este obligatoriu'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{1,2}-\d{2,3}-[A-Z]{3}$/, 'Format număr înmatriculare invalid (ex: B-123-ABC)']
  },
  
  model: {
    type: String,
    required: [true, 'Modelul vehiculului este obligatoriu'],
    trim: true,
    maxlength: [100, 'Modelul nu poate depăși 100 de caractere']
  },
  
  marca: {
    type: String,
    required: [true, 'Marca vehiculului este obligatorie'],
    trim: true,
    maxlength: [50, 'Marca nu poate depăși 50 de caractere']
  },
  
  anFabricatie: {
    type: Number,
    required: [true, 'Anul de fabricație este obligatoriu'],
    min: [1990, 'Anul nu poate fi mai mic de 1990'],
    max: [new Date().getFullYear(), 'Anul nu poate fi în viitor']
  },
  
  capacitate: {
    type: Number,
    required: [true, 'Capacitatea este obligatorie'],
    min: [0, 'Capacitatea nu poate fi negativă']
  },
  
  unitateCapacitate: {
    type: String,
    enum: ['kg', 'tone', 'm3'],
    default: 'kg'
  },

  // Informații spațiu de încărcare
  spatiuIncarcare: {
    dimensiuni: {
      inaltime: {
        type: Number,
        min: [0, 'Înălțimea nu poate fi negativă']
      },
      latime: {
        type: Number,
        min: [0, 'Lățimea nu poate fi negativă']
      },
      lungime: {
        type: Number,
        min: [0, 'Lungimea nu poate fi negativă']
      },
      unitateDimensiuni: {
        type: String,
        enum: ['cm', 'm'],
        default: 'cm'
      }
    },
    tipIncarcare: {
      type: String,
      enum: ['Prelata', 'Box', 'Frigo'],
      default: 'Prelata'
    },
    infoSpatiu: {
      type: String,
      trim: true,
      maxlength: [500, 'Informațiile despre spațiu nu pot depăși 500 de caractere']
    }
  },
  
  kmActuali: {
    type: Number,
    required: [true, 'Kilometrajul actual este obligatoriu'],
    min: [0, 'Kilometrajul nu poate fi negativ']
  },
  
  dataUltimeiRevizii: {
    type: Date
  },
  
  kmUltimaRevizie: {
    type: Number,
    min: [0, 'Kilometrajul nu poate fi negativ']
  },
  
  intervalRevizie: {
    km: {
      type: Number,
      default: 30000,
      min: [1000, 'Intervalul de revizie trebuie să fie minim 1000 km']
    },
    luni: {
      type: Number,
      default: 12,
      min: [1, 'Intervalul de revizie trebuie să fie minim 1 lună']
    }
  },
  
  reparatii: [reparatieSchema],
  
  costTotalReparatii: {
    type: Number,
    default: 0,
    min: [0, 'Costul total nu poate fi negativ']
  },
  
  status: {
    type: String,
    enum: ['disponibil', 'in_cursa', 'in_reparatie', 'indisponibil'],
    default: 'disponibil'
  },
  
  asigurareExpira: {
    type: Date,
    required: [true, 'Data expirării asigurării este obligatorie'],
    validate: {
      validator: function(value) {
        // Pentru MVP, permitem date până la 30 zile în trecut pentru flexibilitate
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return value > thirtyDaysAgo;
      },
      message: 'Data expirării asigurării trebuie să fie în ultimele 30 de zile'
    }
  },

  itpExpira: {
    type: Date,
    required: [true, 'Data expirării ITP este obligatorie'],
    validate: {
      validator: function(value) {
        // Pentru MVP, permitem date până la 30 zile în trecut pentru flexibilitate
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return value > thirtyDaysAgo;
      },
      message: 'Data expirării ITP trebuie să fie în ultimele 30 de zile'
    }
  },
  
  curseLegate: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cursa'
  }],
  
  note: {
    type: String,
    maxlength: [1000, 'Notele nu pot depăși 1000 de caractere']
  }
}, {
  timestamps: true,
  autoIndex: false // Previne crearea automată de index-uri duplicate
});

// Index pentru căutări rapide - eliminat duplicate pentru numarInmatriculare (deja unique)
vehiculSchema.index({ status: 1 });
vehiculSchema.index({ asigurareExpira: 1 });
vehiculSchema.index({ itpExpira: 1 });

// Virtual pentru calculul curselor atribuite
vehiculSchema.virtual('curseAtribuite', {
  ref: 'Cursa',
  localField: '_id',
  foreignField: 'vehiculAsignat',
  count: true
});

// Virtual pentru verificarea expirărilor și alertelor
vehiculSchema.virtual('alerteExpirare').get(function() {
  const acum = new Date();
  const treizecieZile = new Date(acum.getTime() + (30 * 24 * 60 * 60 * 1000));
  
  const alerte = [];
  
  // Alertă asigurare
  if (this.asigurareExpira <= treizecieZile) {
    const zileRamase = Math.ceil((this.asigurareExpira - acum) / (24 * 60 * 60 * 1000));
    alerte.push({
      tip: 'asigurare',
      mesaj: `Asigurarea expiră în ${zileRamase} ${zileRamase === 1 ? 'zi' : 'zile'}`,
      urgent: zileRamase <= 7
    });
  }
  
  // Alertă ITP
  if (this.itpExpira <= treizecieZile) {
    const zileRamase = Math.ceil((this.itpExpira - acum) / (24 * 60 * 60 * 1000));
    alerte.push({
      tip: 'itp',
      mesaj: `ITP expiră în ${zileRamase} ${zileRamase === 1 ? 'zi' : 'zile'}`,
      urgent: zileRamase <= 7
    });
  }
  
  // Alertă revizie pe bază de km
  if (this.kmUltimaRevizie && this.intervalRevizie.km) {
    const kmDelaRevizie = this.kmActuali - this.kmUltimaRevizie;
    const kmPanaLaRevizie = this.intervalRevizie.km - kmDelaRevizie;
    
    if (kmPanaLaRevizie <= 5000) {
      alerte.push({
        tip: 'revizie_km',
        mesaj: `Revizie necesară în ${kmPanaLaRevizie} km`,
        urgent: kmPanaLaRevizie <= 1000
      });
    }
  }
  
  // Alertă revizie pe bază de timp
  if (this.dataUltimeiRevizii && this.intervalRevizie.luni) {
    const luniDelaRevizie = Math.floor((acum - this.dataUltimeiRevizii) / (30 * 24 * 60 * 60 * 1000));
    const luniPanaLaRevizie = this.intervalRevizie.luni - luniDelaRevizie;
    
    if (luniPanaLaRevizie <= 2) {
      alerte.push({
        tip: 'revizie_timp',
        mesaj: `Revizie necesară în ${luniPanaLaRevizie} ${luniPanaLaRevizie === 1 ? 'lună' : 'luni'}`,
        urgent: luniPanaLaRevizie <= 0
      });
    }
  }
  
  return alerte;
});

// Virtual pentru data următoarei revizii estimate
vehiculSchema.virtual('urmatoareaRevizie').get(function() {
  if (!this.dataUltimeiRevizii || !this.intervalRevizie.luni) {
    return null;
  }
  
  const urmatoareaRevizie = new Date(this.dataUltimeiRevizii);
  urmatoareaRevizie.setMonth(urmatoareaRevizie.getMonth() + this.intervalRevizie.luni);
  
  return urmatoareaRevizie;
});

// Pre-save hook pentru actualizarea costului total
vehiculSchema.pre('save', function(next) {
  // Calculează costul total al reparațiilor
  this.costTotalReparatii = this.reparatii.reduce((total, reparatie) => {
    return total + (reparatie.cost || 0);
  }, 0);
  
  // Actualizează km la ultima reparație
  if (this.reparatii.length > 0) {
    const ultimaReparatie = this.reparatii[this.reparatii.length - 1];
    if (!ultimaReparatie.kmLaReparatie) {
      ultimaReparatie.kmLaReparatie = this.kmActuali;
    }
  }
  
  next();
});

// Metodă pentru adăugarea unei reparații
vehiculSchema.methods.adaugaReparatie = function(reparatieData) {
  this.reparatii.push({
    ...reparatieData,
    kmLaReparatie: reparatieData.kmLaReparatie || this.kmActuali
  });
  
  return this.save();
};

// Metodă pentru calcularea costurilor lunare
vehiculSchema.methods.calculeazaCosturiLunare = function(luni = 12) {
  const dataLimita = new Date();
  dataLimita.setMonth(dataLimita.getMonth() - luni);
  
  const reparatiiRecente = this.reparatii.filter(reparatie => 
    reparatie.data >= dataLimita
  );
  
  const costTotal = reparatiiRecente.reduce((total, reparatie) => 
    total + reparatie.cost, 0
  );
  
  return {
    costTotal,
    costMediu: costTotal / luni,
    numarReparatii: reparatiiRecente.length
  };
};

// Transform output pentru frontend
vehiculSchema.set('toJSON', { virtuals: true });

const Vehicul = mongoose.model('Vehicul', vehiculSchema);

module.exports = Vehicul;