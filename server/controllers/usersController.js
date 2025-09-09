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

// Schema validare pentru schimbare parolă
const changePasswordSchema = Joi.object({
  parolaVeche: Joi.string().required().messages({
    'string.empty': 'Parola veche este obligatorie'
  }),
  parolaNoua: Joi.string().min(6).required().messages({
    'string.min': 'Parola nouă trebuie să aibă minim 6 caractere',
    'string.empty': 'Parola nouă este obligatorie'
  }),
  confirmaParolaNoua: Joi.string().valid(Joi.ref('parolaNoua')).required().messages({
    'any.only': 'Confirmarea parolei noi nu coincide cu parola nouă',
    'any.required': 'Confirmarea parolei noi este obligatorie'
  })
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
      message: 'Eroare internă a serverului'
    });
  }
};

// Creează utilizator nou
const createUser = async (req, res) => {
  try {
    // Doar adminii pot crea utilizatori
    if (req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acces interzis - necesită drepturi de administrator'
      });
    }

    // Validează datele
    const { error, value } = createUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { nume, email, parola, rol } = value;

    // Verifică dacă email-ul există deja
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilizator cu acest email există deja'
      });
    }

    // Hash parola
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(parola, saltRounds);

    // Creează utilizatorul
    const newUser = new User({
      nume: nume.trim(),
      email: email.toLowerCase().trim(),
      parola: hashedPassword,
      rol,
      activ: true,
      dataCreare: new Date(),
      dataModificare: new Date()
    });

    await newUser.save();

    // Returnează utilizatorul fără parola
    const userResponse = newUser.toObject();
    delete userResponse.parola;

    res.status(201).json({
      success: true,
      data: userResponse,
      message: 'Utilizator creat cu succes'
    });
  } catch (error) {
    console.error('Eroare la crearea utilizatorului:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare internă a serverului'
    });
  }
};

// Actualizează utilizator
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Doar adminii pot actualiza utilizatori sau utilizatorul își poate actualiza propriul cont
    if (req.user.rol !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acces interzis'
      });
    }

    // Validează datele
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Verifică dacă utilizatorul există
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizatorul nu a fost găsit'
      });
    }

    // Verifică email duplicat dacă se încearcă actualizarea
    if (value.email && value.email !== user.email) {
      const existingUser = await User.findOne({ 
        email: value.email.toLowerCase(),
        _id: { $ne: userId }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Un utilizator cu acest email există deja'
        });
      }
    }

    // Actualizează utilizatorul
    const updateData = { ...value };
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
    }
    updateData.dataModificare = new Date();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-parola' }
    );

    res.json({
      success: true,
      data: updatedUser,
      message: 'Utilizator actualizat cu succes'
    });
  } catch (error) {
    console.error('Eroare la actualizarea utilizatorului:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare internă a serverului'
    });
  }
};

// Șterge utilizator
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Doar adminii pot șterge utilizatori
    if (req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acces interzis - necesită drepturi de administrator'
      });
    }

    // Nu permite ștergerea propriului cont
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Nu poți să îți ștergi propriul cont'
      });
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilizatorul nu a fost găsit'
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
      message: 'Eroare internă a serverului'
    });
  }
};

// Schimbă parola utilizatorului
const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;

    // Doar adminii pot schimba parola altora sau utilizatorul își poate schimba propria parolă
    if (req.user.rol !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acces interzis'
      });
    }

    // Validează datele
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { parolaVeche, parolaNoua } = value;

    // Găsește utilizatorul
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizatorul nu a fost găsit'
      });
    }

    // Verifică parola veche doar dacă nu este admin care schimbă parola altcuiva
    if (req.user._id.toString() === userId) {
      const isValidPassword = await bcrypt.compare(parolaVeche, user.parola);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Parola veche este incorectă'
        });
      }
    }

    // Hash noua parolă
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(parolaNoua, saltRounds);

    // Actualizează parola
    await User.findByIdAndUpdate(userId, {
      parola: hashedNewPassword,
      dataModificare: new Date()
    });

    res.json({
      success: true,
      message: 'Parola a fost schimbată cu succes'
    });
  } catch (error) {
    console.error('Eroare la schimbarea parolei:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare internă a serverului'
    });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  changePassword
};