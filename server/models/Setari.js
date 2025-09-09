const mongoose = require('mongoose');

const setariSchema = new mongoose.Schema({
  tip: {
    type: String,
    required: true,
    enum: ['facturi', 'firma'],
    unique: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true,
  autoIndex: false // Previne crearea automată de index-uri duplicate
});

// Index-ul pentru căutări rapide este deja definit prin unique: true la câmpul tip
// Nu mai adăugăm index suplimentar pentru a evita duplicate

// Metodă statică pentru obținerea setărilor
setariSchema.statics.getSetari = async function(tip) {
  try {
    const setare = await this.findOne({ tip });
    return setare ? setare.data : null;
  } catch (error) {
    console.error('Eroare la obținerea setărilor:', error);
    return null;
  }
};

// Metodă statică pentru salvarea setărilor
setariSchema.statics.saveSetari = async function(tip, data) {
  try {
    const setare = await this.findOneAndUpdate(
      { tip },
      { data },
      { upsert: true, new: true }
    );
    return setare.data;
  } catch (error) {
    console.error('Eroare la salvarea setărilor:', error);
    throw error;
  }
};

const Setari = mongoose.model('Setari', setariSchema);

module.exports = Setari;
