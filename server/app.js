const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Confirmare încărcare versiune actualizată
console.log('🚀 Transio Backend v1.0.0 - Starting up...');

// Creează directorul pentru loguri dacă nu există - TREBUIE ÎNAINTE DE IMPORT LOGGER
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Creează directorul pentru backups dacă nu există - TREBUIE ÎNAINTE DE IMPORT BACKUP
const backupsDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

// Import logging utilities - DUPĂ CREAREA DIRECTORULUI LOGS
const { logger, loggers, requestLogger, errorLogger } = require('./utils/logger');

// Import backup manager - DUPĂ CREAREA DIRECTORULUI BACKUPS
const backupManager = require('./utils/backup');

// Import performance monitoring
const performanceMonitor = require('./utils/monitoring');

// Import security utilities
const { sanitizeInput, detectAttacks, logSensitiveOperations, createStrictRateLimit } = require('./utils/security');

// Import centralized configuration
const CONFIG = require('./config/constants');

// Importăm toate modelele pentru a le înregistra în Mongoose
const User = require('./models/User');
const Curse = require('./models/Curse');
const Sofer = require('./models/Sofer');
const Vehicul = require('./models/Vehicul');
const Partener = require('./models/Partener');
const Factura = require('./models/Factura');
const Setari = require('./models/Setari');

const authRoutes = require('./routes/auth');
const curseRoutes = require('./routes/curse');
const soferiRoutes = require('./routes/soferi');
const vehiculeRoutes = require('./routes/vehicule');
const parteneriRoutes = require('./routes/parteneri');
const facturiRoutes = require('./routes/facturi');
const rapoarteRoutes = require('./routes/rapoarte');
const setariRoutes = require('./routes/setari');
const uploadsRoutes = require('./routes/uploads');

const app = express();

// Trust proxy pentru reverse proxy (Apache) - doar 1 nivel
app.set('trust proxy', 1);

// Request logging middleware
app.use(requestLogger);

// Performance monitoring middleware
app.use(performanceMonitor.requestMonitor());

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.APP_URL || 'http://localhost:3001']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration - allow localhost in development
const corsOrigins = process.env.NODE_ENV === 'development' 
  ? [
      'http://localhost:3001',     // Frontend local
      'http://localhost:8001',     // Backend local  
      'http://localhost:3000',     // Fallback
      'http://127.0.0.1:3001',     // Frontend local IP
      'http://127.0.0.1:8001'      // Backend local IP
    ]
  : [
      process.env.APP_URL || 'http://localhost:3001'
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'development') {
      // In development, allow all localhost origins
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}));

// Rate limiting cu diferite limite pe endpoint folosind CONFIG
const generalLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMITS.GENERAL.windowMs,
  max: CONFIG.RATE_LIMITS.GENERAL.max,
  message: {
    error: 'Prea multe cereri din această adresă IP. Încercați din nou în 15 minute.'
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});

const authLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMITS.AUTH.windowMs,
  max: CONFIG.RATE_LIMITS.AUTH.max,
  message: {
    error: 'Prea multe încercări de autentificare. Încercați din nou în 15 minute.'
  }
});

// Rate limiters pentru endpoint-uri critice
const adminLimiter = createStrictRateLimit(CONFIG.RATE_LIMITS.ADMIN.max, CONFIG.RATE_LIMITS.ADMIN.windowMs);
const backupLimiter = createStrictRateLimit(CONFIG.RATE_LIMITS.BACKUP.max, CONFIG.RATE_LIMITS.BACKUP.windowMs);
const dataModificationLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMITS.DATA_MODIFICATION.windowMs,
  max: CONFIG.RATE_LIMITS.DATA_MODIFICATION.max,
  message: {
    error: 'Prea multe operații de modificare. Încercați din nou în 1 minut.'
  }
});

app.use(generalLimiter);
app.use('/api/auth', authLimiter);

// Body parsing middleware with centralized configuration
app.use(express.json({ limit: CONFIG.FILE_UPLOAD.MAX_SIZE }));
app.use(express.urlencoded({ extended: true, limit: CONFIG.FILE_UPLOAD.MAX_SIZE }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Security middleware
app.use(sanitizeInput);
app.use(detectAttacks);
app.use(logSensitiveOperations);

// MongoDB connection - eliminat opțiuni depreciate
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/transio_local')
.then(() => {
  logger.info('Connected to MongoDB successfully');
})
.catch((error) => {
  loggers.error(error, { context: 'MongoDB connection' });
  process.exit(1);
});

// Routes cu rate limiting specific
app.use('/api/auth', authRoutes);
app.use('/api/curse', dataModificationLimiter, curseRoutes);
app.use('/api/soferi', dataModificationLimiter, soferiRoutes);
app.use('/api/vehicule', dataModificationLimiter, vehiculeRoutes);
app.use('/api/parteneri', dataModificationLimiter, parteneriRoutes);
app.use('/api/facturi', dataModificationLimiter, facturiRoutes);
app.use('/api/rapoarte', rapoarteRoutes);
app.use('/api/setari', adminLimiter, setariRoutes);
app.use('/api/uploads', dataModificationLimiter, uploadsRoutes);

// Backup routes direct cu strict rate limiting
app.get('/api/backup/download', backupLimiter, async (req, res) => {
  try {
    // Middleware auth verificat manual
    const authMiddleware = require('./middleware/auth').authMiddleware;
    
    await new Promise((resolve, reject) => {
      authMiddleware(req, res, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    if (req.user.rol !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const result = await backupManager.getLatestBackup();
    
    if (result.success && result.filePath) {
      logger.info('Backup download initiated', { userId: req.user.id, filePath: result.filePath });
      
      res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
      res.setHeader('Content-Type', 'application/json');
      res.download(result.filePath);
    } else {
      res.status(404).json({ success: false, message: 'Nu există backup-uri disponibile' });
    }
  } catch (error) {
    loggers.error(error, { context: 'download backup direct route', userId: req.user?.id });
    res.status(500).json({ success: false, message: 'Eroare la descărcarea backup-ului' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const healthStatus = await performanceMonitor.getHealthStatus();
    res.json({
      ...healthStatus,
      message: 'Transio Backend is running'
    });
  } catch (error) {
    loggers.error(error, { context: 'health check endpoint' });
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use(errorLogger);
app.use((error, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message,
      stack: error.stack 
    });
  } else {
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

// Confirmare finală - toate modulele încărcate, server pornit
console.log('🎯 ALL MODULES LOADED SUCCESSFULLY - READY TO START SERVER');
console.log('🔌 Attempting to start server on port:', PORT);

app.listen(PORT, () => {
  console.log('✅ SERVER SUCCESSFULLY STARTED ON PORT:', PORT);
  console.log('🌐 Environment:', process.env.NODE_ENV || 'development');
  console.log('⏰ Start time:', new Date().toISOString());

  logger.info(`Transio Backend started on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Confirmare încărcare completă a aplicației
console.log('✅ Transio Backend v1.0.1 fully loaded - All modules initialized successfully');
console.log('🚀 Server starting on port:', process.env.PORT || 3000);
console.log('📅 Timestamp:', new Date().toISOString());

module.exports = app;