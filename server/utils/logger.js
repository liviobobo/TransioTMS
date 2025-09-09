const winston = require('winston');
const path = require('path');

// Configurare formaturi personalizate
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Adaugă stack trace pentru erori
    if (stack) {
      log += `\nStack: ${stack}`;
    }
    
    // Adaugă metadata suplimentară
    if (Object.keys(meta).length > 0) {
      log += `\nMetadata: ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Configurare transport pentru diferite nivele
let logger;
try {
  logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: customFormat,
    defaultMeta: { service: 'transio-backend' },
  transports: [
        // Transport pentru erori critice
    new winston.transports.File({
      filename: path.join(__dirname, 'logs/error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    }),

    // Transport pentru toate logurile
    new winston.transports.File({
      filename: path.join(__dirname, 'logs/combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      tailable: true
    }),

    // Transport pentru loguri de acces
    new winston.transports.File({
      filename: path.join(__dirname, 'logs/access.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, message }) => `${timestamp} ${message}`)
      ),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    })
  ]
  });

  // În development, logurile apar și în consolă
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`)
      )
    }));
  }
} catch (error) {
  console.error('Failed to initialize Winston logger:', error);
  // Fallback to console logging
  logger = {
    info: (...args) => console.log('[INFO]', ...args),
    error: (...args) => console.error('[ERROR]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    debug: (...args) => console.debug('[DEBUG]', ...args)
  };
}

// Funcții helper pentru diferite tipuri de loguri
let loggers;
try {
  loggers = {
  // Log pentru acces HTTP
  access: (req, res, responseTime) => {
    const message = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${responseTime}ms - ${req.ip} - ${req.get('User-Agent')}`;
    logger.info(message, { 
      method: req.method, 
      url: req.originalUrl, 
      status: res.statusCode, 
      responseTime,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  },

  // Log pentru autentificare
  auth: (action, userId, ip, success = true) => {
    const level = success ? 'info' : 'warn';
    const message = `Auth ${action}: ${userId ? `User ${userId}` : 'Unknown'} from ${ip} - ${success ? 'SUCCESS' : 'FAILED'}`;
    logger.log(level, message, { action, userId, ip, success, category: 'auth' });
  },

  // Log pentru operații CRUD
  crud: (operation, model, id, userId, success = true) => {
    const level = success ? 'info' : 'error';
    const message = `CRUD ${operation}: ${model}${id ? ` (ID: ${id})` : ''} by User ${userId} - ${success ? 'SUCCESS' : 'FAILED'}`;
    logger.log(level, message, { operation, model, id, userId, success, category: 'crud' });
  },

  // Log pentru erori de sistem
  error: (error, context = {}) => {
    logger.error(error.message || error, { 
      stack: error.stack, 
      ...context, 
      category: 'system_error' 
    });
  },

  // Log pentru debug
  debug: (message, data = {}) => {
    logger.debug(message, { ...data, category: 'debug' });
  },

  // Log pentru securitate
  security: (event, details, level = 'warn') => {
    const message = `Security Event: ${event}`;
    logger.log(level, message, { ...details, category: 'security' });
  },

  // Log pentru performance
  performance: (operation, duration, details = {}) => {
    const level = duration > 1000 ? 'warn' : 'info'; // Warning pentru operații lente
    const message = `Performance: ${operation} took ${duration}ms`;
    logger.log(level, message, { operation, duration, ...details, category: 'performance' });
  }
  };
} catch (error) {
  console.error('Failed to initialize loggers:', error);
  // Fallback to console logging
  loggers = {
    access: (...args) => console.log('[ACCESS]', ...args),
    auth: (...args) => console.log('[AUTH]', ...args),
    crud: (...args) => console.log('[CRUD]', ...args),
    error: (...args) => console.error('[ERROR]', ...args),
    security: (...args) => console.warn('[SECURITY]', ...args),
    debug: (...args) => console.debug('[DEBUG]', ...args),
    performance: (...args) => console.log('[PERF]', ...args)
  };
}

// Middleware pentru logging HTTP requests
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    loggers.access(req, res, responseTime);
  });
  
  next();
};

// Middleware pentru catching unhandled errors
const errorLogger = (err, req, res, next) => {
  loggers.error(err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    params: req.params,
    query: req.query
  });
  
  next(err);
};

// Confirmare încărcare logger actualizat
console.log('📝 Logger module v1.0.1 loaded successfully with fallback support');

module.exports = {
  logger,
  loggers,
  requestLogger,
  errorLogger
};