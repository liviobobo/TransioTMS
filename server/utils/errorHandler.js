const winston = require('winston');

// Logger configuration
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'transio-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

class AppError extends Error {
  constructor(message, statusCode, context) {
    super(message);
    this.statusCode = statusCode;
    this.context = context;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const handleError = (error, context) => {
  // Log error
  logger.error({
    message: error.message,
    context: context,
    stack: error.stack,
    statusCode: error.statusCode || 500
  });

  // Determine status code
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Eroare internă de server';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Date invalide';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Format de date invalid';
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'Înregistrare duplicată';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token invalid';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirat';
  }

  return {
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { 
      error: error.message,
      stack: error.stack 
    })
  };
};

// Async wrapper pentru controllere
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error middleware
const errorMiddleware = (err, req, res, next) => {
  const errorResponse = handleError(err, `${req.method} ${req.originalUrl}`);
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json(errorResponse);
};

module.exports = {
  AppError,
  handleError,
  asyncHandler,
  errorMiddleware,
  logger
};