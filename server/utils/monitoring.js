const os = require('os');
const mongoose = require('mongoose');
let logger, loggers;
try {
  const loggerModule = require('./logger');
  logger = loggerModule.logger;
  loggers = loggerModule.loggers;
} catch (error) {
  // Fallback dacă logger-ul nu este încă inițializat
  logger = { info: console.log, error: console.error };
  loggers = { error: console.error };
}

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        avgResponseTime: 0
      },
      system: {
        memory: {},
        cpu: {},
        disk: {}
      },
      database: {
        connections: 0,
        queries: {
          total: 0,
          slow: 0,
          errors: 0
        }
      }
    };
    
    this.startMonitoring();
  }

  startMonitoring() {
    // Monitorizare sistem la fiecare 30 secunde
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Log metrics la fiecare 5 minute
    setInterval(() => {
      this.logPerformanceMetrics();
    }, 5 * 60 * 1000);

    // Reset request counters la fiecare oră
    setInterval(() => {
      this.resetRequestMetrics();
    }, 60 * 60 * 1000);

    logger.info('Performance monitoring started');
  }

  collectSystemMetrics() {
    try {
      // Memory metrics
      const memUsage = process.memoryUsage();
      this.metrics.system.memory = {
        used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
        systemFree: Math.round(os.freemem() / 1024 / 1024), // MB
        systemTotal: Math.round(os.totalmem() / 1024 / 1024) // MB
      };

      // CPU metrics
      const cpuUsage = process.cpuUsage();
      this.metrics.system.cpu = {
        user: cpuUsage.user,
        system: cpuUsage.system,
        loadAverage: os.loadavg(),
        cores: os.cpus().length
      };

      // Database connections
      this.metrics.database.connections = mongoose.connection.readyState;

    } catch (error) {
      loggers.error(error, { context: 'system metrics collection' });
    }
  }

  logPerformanceMetrics() {
    const { memory } = this.metrics.system;
    const { requests } = this.metrics;

    // Warning pentru utilizare mare de memorie
    if (memory.used > 400) { // > 400MB
      loggers.performance('High memory usage detected', memory.used, {
        level: 'warning',
        memoryUsed: memory.used,
        memoryTotal: memory.total,
        systemFree: memory.systemFree
      });
    }

    // Info metrics generale
    loggers.performance('Performance metrics snapshot', 0, {
      requests: {
        total: requests.total,
        successRate: requests.total > 0 ? ((requests.success / requests.total) * 100).toFixed(2) : 0,
        avgResponseTime: requests.avgResponseTime
      },
      memory: {
        heapUsed: `${memory.used}MB`,
        heapTotal: `${memory.total}MB`,
        systemUsage: `${((memory.systemTotal - memory.systemFree) / memory.systemTotal * 100).toFixed(1)}%`
      },
      database: {
        status: this.getDatabaseStatus(),
        connections: this.metrics.database.connections
      }
    });
  }

  getDatabaseStatus() {
    switch (mongoose.connection.readyState) {
      case 0: return 'disconnected';
      case 1: return 'connected';
      case 2: return 'connecting';
      case 3: return 'disconnecting';
      default: return 'unknown';
    }
  }

  recordRequest(req, res, responseTime) {
    this.metrics.requests.total++;
    
    if (res.statusCode >= 200 && res.statusCode < 400) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.errors++;
    }

    // Calculează timpul mediu de răspuns
    const currentAvg = this.metrics.requests.avgResponseTime;
    const totalRequests = this.metrics.requests.total;
    this.metrics.requests.avgResponseTime = 
      ((currentAvg * (totalRequests - 1)) + responseTime) / totalRequests;

    // Log pentru request-uri lente (> 2 secunde)
    if (responseTime > 2000) {
      loggers.performance('Slow request detected', responseTime, {
        method: req.method,
        url: req.originalUrl,
        responseTime: `${responseTime}ms`,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
    }
  }

  resetRequestMetrics() {
    const previousMetrics = { ...this.metrics.requests };
    
    this.metrics.requests = {
      total: 0,
      success: 0,
      errors: 0,
      avgResponseTime: 0
    };

    logger.info('Request metrics reset', {
      previousHour: {
        total: previousMetrics.total,
        successRate: previousMetrics.total > 0 ? 
          ((previousMetrics.success / previousMetrics.total) * 100).toFixed(2) : 0,
        avgResponseTime: `${previousMetrics.avgResponseTime.toFixed(0)}ms`
      }
    });
  }

  // Middleware pentru monitorizare requests
  requestMonitor() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const responseTime = Date.now() - start;
        this.recordRequest(req, res, responseTime);
      });
      
      next();
    };
  }

  // Health check complet
  async getHealthStatus() {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        system: {
          memory: this.metrics.system.memory,
          cpu: {
            cores: this.metrics.system.cpu.cores,
            loadAverage: this.metrics.system.cpu.loadAverage[0]
          }
        },
        database: {
          status: this.getDatabaseStatus(),
          connected: mongoose.connection.readyState === 1
        },
        requests: {
          total: this.metrics.requests.total,
          successRate: this.metrics.requests.total > 0 ? 
            ((this.metrics.requests.success / this.metrics.requests.total) * 100).toFixed(2) : 100,
          avgResponseTime: `${this.metrics.requests.avgResponseTime.toFixed(0)}ms`
        }
      };

      // Determină status general
      if (this.metrics.system.memory.used > 450) { // > 450MB
        health.status = 'warning';
      }
      
      if (mongoose.connection.readyState !== 1) {
        health.status = 'critical';
      }

      if (this.metrics.system.cpu.loadAverage[0] > this.metrics.system.cpu.cores * 0.8) {
        health.status = health.status === 'critical' ? 'critical' : 'warning';
      }

      return health;
    } catch (error) {
      loggers.error(error, { context: 'health check' });
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  // Alertă pentru probleme critice
  checkCriticalAlerts() {
    const { memory } = this.metrics.system;
    const { cpu } = this.metrics.system;

    // Memorie critică (> 90% din total)
    if (memory.used / memory.total > 0.9) {
      loggers.security('Critical memory usage detected', {
        level: 'critical',
        memoryUsage: `${(memory.used / memory.total * 100).toFixed(1)}%`,
        used: `${memory.used}MB`,
        total: `${memory.total}MB`
      });
    }

    // CPU load critic
    if (cpu.loadAverage[0] > cpu.cores * 1.5) {
      loggers.security('Critical CPU load detected', {
        level: 'critical',
        loadAverage: cpu.loadAverage[0],
        cores: cpu.cores,
        threshold: cpu.cores * 1.5
      });
    }

    // Database disconnected
    if (mongoose.connection.readyState !== 1) {
      loggers.security('Database connection lost', {
        level: 'critical',
        readyState: mongoose.connection.readyState,
        status: this.getDatabaseStatus()
      });
    }
  }
}

// Confirmare încărcare monitoring module actualizat
console.log('📊 Monitoring module v1.0.1 loaded successfully with safe logger import');

module.exports = new PerformanceMonitor();