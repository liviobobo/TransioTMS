// Configurare centralizată pentru server cu environment variables
const CONFIG = {
  // Porturi conform instructiuni.md
  PORTS: {
    LOCAL: {
      FRONTEND: parseInt(process.env.FRONTEND_PORT) || 3001,
      BACKEND: parseInt(process.env.BACKEND_PORT) || 8001
    },
    PRODUCTION: {
      FRONTEND: parseInt(process.env.FRONTEND_PORT) || 3001,
      BACKEND: parseInt(process.env.BACKEND_PORT) || 3000
    }
  },
  
  // Rate limiting configurări (cu environment variables)
  RATE_LIMITS: {
    GENERAL: { 
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000,   // 1 minut (optimizat)
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 200                 // 200 requests per minut
    },
    AUTH: { 
      windowMs: 15 * 60 * 1000,  // 15 minutes
      max: 10                    // 10 auth attempts
    },
    ADMIN: { 
      windowMs: 5 * 60 * 1000,   // 5 minutes (optimizat)
      max: 20                     // 20 admin operations
    },
    DATA_MODIFICATION: { 
      windowMs: 1 * 60 * 1000,   // 1 minute
      max: 60                    // 60 CRUD operations (optimizat)
    },
    BACKUP: { 
      windowMs: 60 * 60 * 1000,  // 1 hour
      max: 3                     // 3 backup operations
    }
  },
  
  // File upload limits (cu environment variables)
  FILE_UPLOAD: {
    MAX_SIZE: process.env.MAX_FILE_SIZE || '10mb',
    UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
    ALLOWED_TYPES: process.env.ALLOWED_FILE_TYPES ? process.env.ALLOWED_FILE_TYPES.split(',') : ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    TIMEOUT: 30000 // 30 seconds
  },
  
  // Security timeouts
  TIMEOUTS: {
    REQUEST: 10000,    // 10 seconds
    BACKUP: 60000      // 1 minute
  },
  
  // Database configuration
  DB: {
    CONNECTION_TIMEOUT: 30000,
    SOCKET_TIMEOUT: 45000,
    URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/transio_local'
  },
  
  // Security configuration
  SECURITY: {
    JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    SECURE_COOKIES: process.env.SECURE_COOKIES === 'true',
    COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || 'strict'
  }
};

module.exports = CONFIG;