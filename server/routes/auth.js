const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register - Înregistrare utilizator nou
router.post('/register', register);

// POST /api/auth/login - Logare utilizator
router.post('/login', login);

// GET /api/auth/profile - Obține profilul utilizatorului autentificat
router.get('/profile', authMiddleware, getProfile);

module.exports = router;