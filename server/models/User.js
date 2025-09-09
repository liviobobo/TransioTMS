const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nume: {
    type: String,
    required: [true, 'Numele este obligatoriu'],
    trim: true,
    maxlength: [100, 'Numele nu poate depăși 100 caractere']
  },
  email: {
    type: String,
    required: [true, 'Email-ul este obligatoriu'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalid']
  },
  parola: {
    type: String,
    required: [true, 'Parola este obligatorie'],
    minlength: [6, 'Parola trebuie să aibă minim 6 caractere']
  },
  rol: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
    required: true
  },
  dataCreare: {
    type: Date,
    default: Date.now
  },
  ultimaLogare: {
    type: Date
  },
  activ: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.parola;
      return ret;
    }
  }
});

// Hash parola înainte de salvare
userSchema.pre('save', async function(next) {
  if (!this.isModified('parola')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.parola = await bcrypt.hash(this.parola, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Metodă pentru verificarea parolei
userSchema.methods.verificaParola = async function(parolaIntrodusa) {
  return await bcrypt.compare(parolaIntrodusa, this.parola);
};

// Metodă pentru actualizarea ultimei logări
userSchema.methods.actualizeazaUltimaLogare = function() {
  this.ultimaLogare = new Date();
  return this.save();
};

// Index pentru performanță - eliminat duplicate pentru email (deja unique)
userSchema.index({ rol: 1 });
userSchema.index({ activ: 1 });

module.exports = mongoose.model('User', userSchema);