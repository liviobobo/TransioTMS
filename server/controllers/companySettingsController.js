const Joi = require('joi');
const Setari = require('../models/Setari');

// Schema pentru validare setări firmă
const setariFirmaSchema = Joi.object({
  numeFirma: Joi.string().trim().max(200).required().messages({
    'string.empty': 'Numele firmei este obligatoriu',
    'string.max': 'Numele firmei nu poate depăși 200 caractere'
  }),
  cui: Joi.string().trim().max(50).required().messages({
    'string.empty': 'CUI este obligatoriu',
    'string.max': 'CUI nu poate depăși 50 caractere'
  }),
  adresaCompleta: Joi.string().trim().max(500).optional().allow(''),
  telefon: Joi.string().trim().max(20).optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  bancaNumeComplet: Joi.string().trim().max(200).optional().allow(''),
  iban: Joi.string().trim().max(50).optional().allow(''),
  reprezentantLegal: Joi.string().trim().max(200).optional().allow('')
});

// Cache în memorie pentru performanță
let setariFirmaCache = null;

// Obține setări firmă
const getSetariFirma = async (req, res) => {
  try {
    let setariFirma = setariFirmaCache;
    
    if (!setariFirma) {
      // Încearcă să încărce din baza de date
      const setariDB = await Setari.findOne({ tip: 'firma' });
      
      if (setariDB) {
        setariFirma = setariDB.data;
        setariFirmaCache = setariFirma;
      } else {
        // Setări implicite goale
        setariFirma = {
          numeFirma: '',
          cui: '',
          adresaCompleta: '',
          telefon: '',
          email: '',
          bancaNumeComplet: '',
          iban: '',
          reprezentantLegal: ''
        };
        setariFirmaCache = setariFirma;
      }
    }

    res.json({
      success: true,
      data: setariFirma
    });

  } catch (error) {
    console.error('Eroare la obținerea setărilor firmă:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea setărilor firmă',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Salvează setări firmă
const saveSetariFirma = async (req, res) => {
  try {
    // Doar adminii pot salva setări
    if (req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acces interzis - necesită drepturi de administrator'
      });
    }

    // Validare date
    const { error, value } = setariFirmaSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Date invalide',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Salvează în baza de date
    await Setari.findOneAndUpdate(
      { tip: 'firma' },
      { data: value },
      { upsert: true, new: true }
    );

    // Actualizează cache-ul
    setariFirmaCache = value;

    res.json({
      success: true,
      message: 'Setări firmă salvate cu succes',
      data: value
    });

  } catch (error) {
    console.error('Eroare la salvarea setărilor firmă:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la salvarea setărilor firmă',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getSetariFirma,
  saveSetariFirma
};