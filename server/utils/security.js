let loggers;
try {
  const loggerModule = require('./logger');
  loggers = loggerModule.loggers;
} catch (error) {
  // Fallback dacă logger-ul nu este încă inițializat
  loggers = { error: console.error, security: console.log };
}

// Middleware pentru sanitizarea input-urilor
const sanitizeInput = (req, res, next) => {
  try {
    // Sanitizează body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitizează query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    // Sanitizează params
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    loggers.security('Input sanitization failed', { 
      error: error.message,
      ip: req.ip,
      url: req.originalUrl,
      method: req.method
    });
    next(error);
  }
};

// Sanitizează recursiv un obiect
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitizează cheia
      const cleanKey = sanitizeString(key);
      
      if (typeof value === 'string') {
        sanitized[cleanKey] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[cleanKey] = sanitizeObject(value);
      } else {
        sanitized[cleanKey] = value;
      }
    }
    return sanitized;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  return obj;
};

// Sanitizează string-uri pentru a preveni XSS și injection
const sanitizeString = (str) => {
  if (typeof str !== 'string') {
    return str;
  }

  return str
    // Remove potential HTML tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Escape common injection attempts
    .replace(/['";]/g, '')
    // Remove SQL injection patterns
    .replace(/(\b(ALTER|CREATE|DELETE|DROP|EXEC|INSERT|SELECT|UNION|UPDATE)\b)/gi, '')
    // Remove NoSQL injection patterns
    .replace(/\$where|\$regex|\$gt|\$lt|\$ne/gi, '')
    .trim();
};

// Middleware pentru detectarea tentativelor de atac
const detectAttacks = (req, res, next) => {
  try {
    const suspiciousPatterns = [
      /(\b(union|select|insert|delete|drop|create|alter)\b.*\b(from|into|table)\b)/i,
      /(\$where|\$regex|\$gt|\$lt|\$ne|\$in|\$nin)/i,
      /<script|javascript:|vbscript:|onload=|onerror=/i,
      /(\.\.\/){3,}/gi, // Path traversal
      /(cmd|powershell|bash|sh)(\s|$)/i,
      /base64|eval\(|setTimeout\(|setInterval\(/i
    ];

    const checkString = (str, path = '') => {
      if (typeof str !== 'string') return false;
      
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(str)) {
          loggers.security('Potential attack detected', {
            pattern: pattern.toString(),
            value: str.substring(0, 100), // Limit log size
            path: path,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.originalUrl,
            method: req.method,
            level: 'warning'
          });
          return true;
        }
      }
      return false;
    };

    const checkObject = (obj, path = '') => {
      if (obj === null || obj === undefined) return false;
      
      if (Array.isArray(obj)) {
        return obj.some((item, index) => checkObject(item, `${path}[${index}]`));
      }
      
      if (typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          if (checkString(key, currentPath) || checkObject(value, currentPath)) {
            return true;
          }
        }
      }
      
      if (typeof obj === 'string') {
        return checkString(obj, path);
      }
      
      return false;
    };

    // Check all parts of the request
    const suspicious = 
      checkObject(req.body, 'body') ||
      checkObject(req.query, 'query') ||
      checkObject(req.params, 'params') ||
      checkString(req.get('User-Agent'), 'userAgent');

    if (suspicious) {
      // Don't block the request, just log it
      // In production, you might want to block or limit such requests
      loggers.security('Suspicious request processed', {
        ip: req.ip,
        url: req.originalUrl,
        method: req.method
      });
    }

    next();
  } catch (error) {
    loggers.error(error, { context: 'attack detection' });
    next();
  }
};

// Middleware pentru logarea operațiilor sensibile
const logSensitiveOperations = (req, res, next) => {
  const sensitiveEndpoints = [
    '/api/auth/login',
    '/api/auth/register', 
    '/api/setari/users',
    '/api/setari/backups/restore',
    '/api/setari/backups/create'
  ];

  const isSensitive = sensitiveEndpoints.some(endpoint => 
    req.originalUrl.startsWith(endpoint)
  );

  if (isSensitive) {
    loggers.security('Sensitive operation accessed', {
      endpoint: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Rate limiting personalizat pentru operații critice
const createStrictRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    
    // Curăță înregistrările vechi
    for (const [ip, data] of attempts.entries()) {
      if (now - data.resetTime > windowMs) {
        attempts.delete(ip);
      }
    }
    
    // Verifică tentativele curente
    if (!attempts.has(key)) {
      attempts.set(key, {
        count: 1,
        resetTime: now
      });
    } else {
      const data = attempts.get(key);
      if (now - data.resetTime > windowMs) {
        // Reset window
        data.count = 1;
        data.resetTime = now;
      } else {
        data.count++;
        
        if (data.count > maxAttempts) {
          loggers.security('Rate limit exceeded for critical operation', {
            ip: key,
            attempts: data.count,
            endpoint: req.originalUrl,
            level: 'warning'
          });
          
          return res.status(429).json({
            success: false,
            message: 'Prea multe încercări. Încercați din nou mai târziu.',
            retryAfter: Math.ceil((windowMs - (now - data.resetTime)) / 1000)
          });
        }
      }
    }
    
    next();
  };
};

// Confirmare încărcare security module actualizat
console.log('🔒 Security module v1.0.1 loaded successfully with safe logger import');

module.exports = {
  sanitizeInput,
  detectAttacks,
  logSensitiveOperations,
  createStrictRateLimit
};