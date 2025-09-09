const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');

// Schema validare pentru înregistrare
const registerSchema = Joi.object({
  nume: Joi.string().trim().max(100).required().messages({
    'string.empty': 'Numele este obligatoriu',
    'string.max': 'Numele nu poate depăși 100 caractere'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalid',
    'string.empty': 'Email-ul este obligatoriu'
  }),
  parola: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'Parola trebuie să aibă minim 8 caractere',
      'string.pattern.base': 'Parola trebuie să conțină: literă mică, literă mare, cifră și caracter special',
      'string.empty': 'Parola este obligatorie'
    }),
  confirmaParola: Joi.string().valid(Joi.ref('parola')).required().messages({
    'any.only': 'Confirmarea parolei nu coincide',
    'string.empty': 'Confirmarea parolei este obligatorie'
  }),
  rol: Joi.string().valid('admin', 'user').default('user')
});

// Schema validare pentru logare
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalid',
    'string.empty': 'Email-ul este obligatoriu'
  }),
  parola: Joi.string().required().messages({
    'string.empty': 'Parola este obligatorie'
  })
});

// Generare JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token valid 7 zile
  );
};

// Înregistrare utilizator nou
const register = async (req, res) => {
  try {
    // Validare date de intrare
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Date de intrare invalide',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { nume, email, parola, rol } = value;

    // Verifică dacă email-ul există deja
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'Un utilizator cu acest email există deja'
      });
    }

    // Pentru primul utilizator, setează rol admin automat
    const userCount = await User.countDocuments();
    const finalRole = userCount === 0 ? 'admin' : rol;

    // Creează utilizatorul nou
    const user = new User({
      nume,
      email,
      parola,
      rol: finalRole
    });

    await user.save();

    // Generează token
    const token = generateToken(user._id);

    // Actualizează ultima logare
    await user.actualizeazaUltimaLogare();

    res.status(201).json({
      message: 'Utilizator creat cu succes',
      token,
      user: {
        id: user._id,
        nume: user.nume,
        email: user.email,
        rol: user.rol,
        dataCreare: user.dataCreare,
        isFirstUser: userCount === 0
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Eroare la validarea datelor',
        errors
      });
    }
    
    res.status(500).json({
      message: 'Eroare la crearea utilizatorului'
    });
  }
};

// Logare utilizator
const login = async (req, res) => {
  try {
    // Validare date de intrare
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Date de intrare invalide',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { email, parola } = value;

    // Găsește utilizatorul
    const user = await User.findOne({ email }).select('+parola');
    if (!user) {
      return res.status(401).json({
        message: 'Email sau parolă incorectă'
      });
    }

    // Verifică dacă utilizatorul este activ
    if (!user.activ) {
      return res.status(401).json({
        message: 'Cont dezactivat. Contactează administratorul.'
      });
    }

    // Verifică parola
    const isValidPassword = await user.verificaParola(parola);
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Email sau parolă incorectă'
      });
    }

    // Generează token
    const token = generateToken(user._id);

    // Actualizează ultima logare
    await user.actualizeazaUltimaLogare();

    res.json({
      message: 'Logare reușită',
      token,
      user: {
        id: user._id,
        nume: user.nume,
        email: user.email,
        rol: user.rol,
        ultimaLogare: user.ultimaLogare
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Eroare la logare'
    });
  }
};

// Verificare token și profil utilizator
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: 'Utilizator negăsit'
      });
    }

    res.json({
      user: {
        id: user._id,
        nume: user.nume,
        email: user.email,
        rol: user.rol,
        dataCreare: user.dataCreare,
        ultimaLogare: user.ultimaLogare,
        activ: user.activ
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Eroare la obținerea profilului'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile
};