const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware pentru autentificare JWT
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Access token lipsește' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access token invalid' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-parola');
    
    if (!user || !user.activ) {
      return res.status(401).json({ message: 'Utilizator invalid sau inactiv' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalid' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirat' });
    }
    
    res.status(500).json({ message: 'Eroare la autentificare' });
  }
};

// Middleware pentru verificarea rolului
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Utilizator neautentificat' });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ 
        message: 'Acces interzis - drepturi insuficiente',
        requiredRole: roles,
        userRole: req.user.rol
      });
    }

    next();
  };
};

// Middleware pentru admin only
const adminOnly = checkRole('admin');

module.exports = {
  authMiddleware,
  checkRole,
  adminOnly
};