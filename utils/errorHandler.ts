import { toast } from 'react-toastify'
import { log } from './logger'

interface ErrorContext {
  operation?: string;
  module?: string;
  silent?: boolean;
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public context?: ErrorContext
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: any, context?: ErrorContext) => {
  const errorMessage = error?.response?.data?.message || 
                       error?.message || 
                       'A apărut o eroare neașteptată';
  
  const statusCode = error?.response?.status;
  
  // Log structured cu noul logger
  log.error(`${context?.operation || 'Operation'} failed: ${errorMessage}`, {
    statusCode,
    error: error?.message || error,
    stack: error?.stack
  }, context?.module || 'App')
  
  // Afișează toast doar dacă nu e marcat ca silent
  if (!context?.silent) {
    if (statusCode === 401) {
      toast.error('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
    } else if (statusCode === 403) {
      toast.error('Nu ai permisiunea pentru această acțiune.');
    } else if (statusCode === 404) {
      toast.error('Resursa solicitată nu a fost găsită.');
    } else if (statusCode >= 500) {
      toast.error('Eroare de server. Te rugăm să încerci mai târziu.');
    } else {
      toast.error(errorMessage);
    }
  }
  
  return {
    message: errorMessage,
    statusCode,
    context
  };
};

// Hook pentru React components
import { useCallback } from 'react';

export const useErrorHandler = (module?: string) => {
  const handleErrorLocal = useCallback((error: any, operation?: string, silent = false) => {
    return handleError(error, { module, operation, silent });
  }, [module]);
  
  return { handleError: handleErrorLocal };
};

// Pentru server-side
export const serverErrorHandler = (error: any, context: string) => {
  const errorMessage = error?.message || 'Server error';
  
  log.error(`Server error in ${context}: ${errorMessage}`, {
    stack: error?.stack,
    name: error?.name,
    code: error?.code
  }, 'Server');
  
  // Determină status code bazat pe tipul erorii
  let statusCode = 500;
  if (error.name === 'ValidationError') {
    statusCode = 400;
  } else if (error.name === 'CastError') {
    statusCode = 400;
  } else if (error.code === 11000) {
    statusCode = 409; // Conflict (duplicate)
  }
  
  return {
    success: false,
    message: errorMessage,
    statusCode,
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  };
};