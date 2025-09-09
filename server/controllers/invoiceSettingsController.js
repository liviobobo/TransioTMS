const Joi = require('joi');
const Setari = require('../models/Setari');

// Schema pentru validare setări facturi - permite string-uri numerice
const setariFacturiSchema = Joi.object({
  serie: Joi.string().trim().max(5).required().messages({
    'string.empty': 'Seria este obligatorie',
    'string.max': 'Seria nu poate depăși 5 caractere'
  }),
  numarCurent: Joi.alternatives().try(
    Joi.number().integer().min(1).max(999999),
    Joi.string().pattern(/^\d+$/).custom((value, helpers) => {
      const numValue = parseInt(value, 10);
      if (numValue < 1) {
        return helpers.error('number.min');
      }
      if (numValue > 999999) {
        return helpers.error('number.max');
      }
      return numValue;
    })
  ).required().messages({
    'number.base': 'Numărul curent trebuie să fie un număr',
    'number.min': 'Numărul curent trebuie să fie minim 1',
    'number.max': 'Numărul curent nu poate fi mai mare de 999999',
    'string.pattern.base': 'Numărul curent trebuie să conțină doar cifre',
    'any.required': 'Numărul curent este obligatoriu'
  })
});

// Cache în memorie pentru performanță
let setariFacturiCache = null;

// Obține setări facturi
const getSetariFacturi = async (req, res) => {
  try {
    let setariFacturi = setariFacturiCache;

    if (!setariFacturi) {
      // Încarcă din baza de date folosind modelul Setari
      setariFacturi = await Setari.getSetari('facturi');

      if (!setariFacturi) {
        // Setări implicite
        setariFacturi = {
          serie: 'TR',
          numarCurent: 2
        };

        // Salvează setările implicite în baza de date
        await Setari.saveSetari('facturi', setariFacturi);
      }

      setariFacturiCache = setariFacturi;
    }

    res.json({
      success: true,
      data: setariFacturi
    });

  } catch (error) {
    console.error('Eroare la obținerea setărilor facturi:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea setărilor facturi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Salvează setări facturi
const saveSetariFacturi = async (req, res) => {
  try {
    // Doar adminii pot salva setări
    if (req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acces interzis - necesită drepturi de administrator'
      });
    }

    // Validare date
    const { error, value } = setariFacturiSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Date invalide',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Asigură-te că numarCurent este întotdeauna un număr
    const setariProcesate = {
      ...value,
      numarCurent: typeof value.numarCurent === 'string' 
        ? parseInt(value.numarCurent, 10) 
        : value.numarCurent
    };

    // Salvează în baza de date folosind modelul Setari
    const setariSalvate = await Setari.saveSetari('facturi', setariProcesate);

    // Actualizează cache-ul
    setariFacturiCache = setariSalvate;

    res.json({
      success: true,
      message: 'Setări facturi salvate cu succes',
      data: setariSalvate
    });

  } catch (error) {
    console.error('Eroare la salvarea setărilor facturi:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la salvarea setărilor facturi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getSetariFacturi,
  saveSetariFacturi
};