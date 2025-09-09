const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

// Schema validare pentru creare utilizator
const createUserSchema = Joi.object({
  nume: Joi.string().trim().max(100).required().messages({
    'string.empty': 'Numele este obligatoriu',
    'string.max': 'Numele nu poate depăși 100 caractere'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalid',
    'string.empty': 'Email-ul este obligatoriu'
  }),
  parola: Joi.string().min(6).required().messages({
    'string.min': 'Parola trebuie să aibă minim 6 caractere',
    'string.empty': 'Parola este obligatorie'
  }),
  confirmaParola: Joi.string().valid(Joi.ref('parola')).required().messages({
    'any.only': 'Confirmarea parolei nu coincide cu parola',
    'any.required': 'Confirmarea parolei este obligatorie'
  }),
  rol: Joi.string().valid('admin', 'user').default('user').required().messages({
    'any.only': 'Rolul trebuie să fie admin sau user',
    'any.required': 'Rolul este obligatoriu'
  })
});

// Schema validare pentru actualizare utilizator
const updateUserSchema = Joi.object({
  nume: Joi.string().trim().max(100).optional(),
  email: Joi.string().email().optional(),
  rol: Joi.string().valid('admin', 'user').optional(),
  activ: Joi.boolean().optional()
});

// Obține toți utilizatorii
const getUsers = async (req, res) => {
  try {
    // Doar adminii pot vedea toți utilizatorii
    if (req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acces interzis - necesită drepturi de administrator'
      });
    }

    const users = await User.find({})
      .select('-parola')
      .sort({ dataCreare: -1 });

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Eroare la obținerea utilizatorilor:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea utilizatorilor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Creează utilizator nou
const createUser = async (req, res) => {
  try {
    console.log('🔄 [CREATE USER] Începe crearea utilizatorului...');
    console.log('👤 [CREATE USER] Utilizator curent:', req.user?.nume, 'cu rolul:', req.user?.rol);
    console.log('📨 [CREATE USER] Payload primit:', req.body);

    // Doar adminii pot crea utilizatori
    if (req.user.rol !== 'admin') {
      console.log('❌ [CREATE USER] Acces interzis - nu este admin');
      return res.status(403).json({
        success: false,
        message: 'Acces interzis - necesită drepturi de administrator'
      });
    }

    // Validare date
    const { error, value } = createUserSchema.validate(req.body);
    if (error) {
      console.log('❌ [CREATE USER] Eroare validare Joi:', error.details.map(d => d.message));
      return res.status(400).json({
        success: false,
        message: 'Date invalide',
        errors: error.details.map(detail => detail.message)
      });
    }

    console.log('✅ [CREATE USER] Validare Joi trecută cu succes:', value);

    const { nume, email, parola, rol } = value;

    // Verifică dacă email-ul există deja
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilizator cu acest email există deja'
      });
    }

    // Creează utilizatorul nou
    const user = new User({
      nume,
      email,
      parola,
      rol
    });

    await user.save();

    // Returnează utilizatorul fără parola
    const userResponse = await User.findById(user._id).select('-parola');

    res.status(201).json({
      success: true,
      message: 'Utilizator creat cu succes',
      data: userResponse
    });

  } catch (error) {
    console.error('Eroare la crearea utilizatorului:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Eroare la validarea datelor',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Eroare la crearea utilizatorului',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Actualizează utilizator
const updateUser = async (req, res) => {
  try {
    // Doar adminii pot actualiza utilizatori
    if (req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acces interzis - necesită drepturi de administrator'
      });
    }

    const { id } = req.params;

    // Validare date
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Date invalide',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Nu permite actualizarea propriului cont (pentru siguranță)
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Nu puteți modifica propriul cont'
      });
    }

    // Dacă se actualizează email-ul, verifică unicitatea
    if (value.email) {
      const existingUser = await User.findOne({ email: value.email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Un utilizator cu acest email există deja'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      value,
      { new: true, runValidators: true }
    ).select('-parola');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }

    res.json({
      success: true,
      message: 'Utilizator actualizat cu succes',
      data: user
    });

  } catch (error) {
    console.error('Eroare la actualizarea utilizatorului:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Eroare la validarea datelor',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea utilizatorului',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Șterge utilizator
const deleteUser = async (req, res) => {
  try {
    // Doar adminii pot șterge utilizatori
    if (req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acces interzis - necesită drepturi de administrator'
      });
    }

    const { id } = req.params;

    // Nu permite ștergerea propriului cont
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Nu puteți șterge propriul cont'
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }

    res.json({
      success: true,
      message: 'Utilizator șters cu succes'
    });

  } catch (error) {
    console.error('Eroare la ștergerea utilizatorului:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea utilizatorului',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Schimbă parola utilizatorului curent
const changePassword = async (req, res) => {
  try {
    const { parolaActuala, parolaNoua, confirmaParola } = req.body;

    // Validare parole
    if (!parolaActuala || !parolaNoua || !confirmaParola) {
      return res.status(400).json({
        success: false,
        message: 'Toate câmpurile sunt obligatorii'
      });
    }

    if (parolaNoua !== confirmaParola) {
      return res.status(400).json({
        success: false,
        message: 'Confirmarea parolei nu coincide'
      });
    }

    if (parolaNoua.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Parola nouă trebuie să aibă minim 6 caractere'
      });
    }

    // Găsește utilizatorul și verifică parola actuală
    const user = await User.findById(req.user.id).select('+parola');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }

    const isValidPassword = await user.verificaParola(parolaActuala);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Parola actuală este incorectă'
      });
    }

    // Actualizează parola
    user.parola = parolaNoua;
    await user.save();

    res.json({
      success: true,
      message: 'Parola schimbată cu succes'
    });

  } catch (error) {
    console.error('Eroare la schimbarea parolei:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la schimbarea parolei',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obține setările aplicației (momentan doar informații de bază)
const getAppSettings = async (req, res) => {
  try {
    const settings = {
      appName: 'Transio',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      features: {
        rapoarte: true,
        export: true,
        multiUser: true,
        notifications: false // Pentru viitor
      }
    };

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Eroare la obținerea setărilor:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea setărilor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

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

// Import modelul Setari
const Setari = require('../models/Setari');

// Cache în memorie pentru performanță
let setariFacturiCache = null;
let setariFirmaCache = null;

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

    console.log('🔍 Payload primit pentru setări facturi:', JSON.stringify(req.body, null, 2));

    // Validare date
    const { error, value } = setariFacturiSchema.validate(req.body);
    if (error) {
      console.log('❌ Eroare validare setări facturi:', error.details);
      console.log('📝 Detalii eroare:', error.details.map(d => `${d.path.join('.')}: ${d.message}`));
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

    console.log('✅ Setări facturi validate și procesate:', setariProcesate);

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

// Funcții helper interne pentru accesul din alte module (ex: Factura model)
const getSetariFacturiInternal = async () => {
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

    return setariFacturi;
  } catch (error) {
    console.error('Eroare la obținerea setărilor facturi (internal):', error);
    // Returnează setările implicite în caz de eroare
    return {
      serie: 'TR',
      numarCurent: 1
    };
  }
};

const saveSetariFacturiInternal = async (noileSetari) => {
  try {
    // Salvează în baza de date folosind modelul Setari
    const setariSalvate = await Setari.saveSetari('facturi', noileSetari);

    // Actualizează cache-ul
    setariFacturiCache = setariSalvate;

    return setariSalvate;
  } catch (error) {
    console.error('Eroare la salvarea setărilor facturi (internal):', error);
    throw error;
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  getAppSettings,
  getSetariFacturi,
  saveSetariFacturi,
  getSetariFirma,
  saveSetariFirma,
  // Funcții helper interne
  getSetariFacturiInternal,
  saveSetariFacturiInternal
};
