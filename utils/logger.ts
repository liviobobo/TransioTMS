// Frontend Logger - Lightweight și optimizat pentru browser
import { TIMEOUTS } from './constants'
interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  data?: any
  timestamp: string
  module?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isClient = typeof window !== 'undefined'

  private formatMessage(level: string, message: string, module?: string): string {
    const timestamp = new Date().toISOString()
    const modulePrefix = module ? `[${module}]` : ''
    return `${timestamp} [${level.toUpperCase()}] ${modulePrefix} ${message}`
  }

  private log(level: LogEntry['level'], message: string, data?: any, module?: string) {
    const formattedMessage = this.formatMessage(level, message, module)
    
    // În development, log la consolă cu styling
    if (this.isDevelopment && this.isClient) {
      const styles = {
        debug: 'color: #64748b',
        info: 'color: #2563eb', 
        warn: 'color: #f59e0b',
        error: 'color: #dc2626; font-weight: bold'
      }
      
      console.log(`%c${formattedMessage}`, styles[level])
      if (data) {
        console.log('%cData:', 'color: #64748b; font-style: italic', data)
      }
      return
    }

    // În production, doar error și warn la consolă
    if (level === 'error' || level === 'warn') {
      console[level](formattedMessage, data)
    }

    // Aici poți adăuga trimitere către serviciu extern de logging
    // ca Sentry, LogRocket, etc.
    if (level === 'error' && typeof window !== 'undefined') {
      // Exemplu: trimite către serviciu de monitoring
      this.sendToMonitoring({ level, message, data, timestamp: new Date().toISOString(), module })
    }
  }

  private sendToMonitoring(entry: LogEntry) {
    // Placeholder pentru serviciu extern de monitoring
    // În producție poți configura Sentry sau alt serviciu
    if (this.isDevelopment) {
      console.warn('Monitoring service not configured:', entry)
    }
  }

  debug(message: string, data?: any, module?: string) {
    this.log('debug', message, data, module)
  }

  info(message: string, data?: any, module?: string) {
    this.log('info', message, data, module)
  }

  warn(message: string, data?: any, module?: string) {
    this.log('warn', message, data, module)
  }

  error(message: string, data?: any, module?: string) {
    this.log('error', message, data, module)
  }

  // Metode specifice pentru cazuri comune
  apiCall(endpoint: string, method: string, data?: any, module?: string) {
    this.info(`API Call: ${method.toUpperCase()} ${endpoint}`, data, module)
  }

  apiResponse(endpoint: string, status: number, data?: any, module?: string) {
    const level = status >= 400 ? 'error' : 'info'
    this.log(level, `API Response: ${status} ${endpoint}`, data, module)
  }

  userAction(action: string, data?: any, module?: string) {
    this.info(`User Action: ${action}`, data, module)
  }

  performance(operation: string, duration: number, module?: string) {
    const level = duration > TIMEOUTS.RETRY_DELAY ? 'warn' : 'debug'
    this.log(level, `Performance: ${operation} took ${duration}ms`, undefined, module)
  }
}

// Singleton instance
const logger = new Logger()

// Hook pentru React components
export const useLogger = (module?: string) => {
  return {
    debug: (message: string, data?: any) => logger.debug(message, data, module),
    info: (message: string, data?: any) => logger.info(message, data, module),
    warn: (message: string, data?: any) => logger.warn(message, data, module),
    error: (message: string, data?: any) => logger.error(message, data, module),
    apiCall: (endpoint: string, method: string, data?: any) => logger.apiCall(endpoint, method, data, module),
    apiResponse: (endpoint: string, status: number, data?: any) => logger.apiResponse(endpoint, status, data, module),
    userAction: (action: string, data?: any) => logger.userAction(action, data, module),
    performance: (operation: string, duration: number) => logger.performance(operation, duration, module)
  }
}

// Export principal
export default logger

// Convenience exports
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  apiCall: logger.apiCall.bind(logger),
  apiResponse: logger.apiResponse.bind(logger),
  userAction: logger.userAction.bind(logger),
  performance: logger.performance.bind(logger)
}