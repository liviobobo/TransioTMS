const cron = require('node-cron');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
let logger, loggers;
try {
  const loggerModule = require('./logger');
  logger = loggerModule.logger;
  loggers = loggerModule.loggers;
} catch (error) {
  // Fallback dacă logger-ul nu este încă inițializat
  logger = { info: console.log, debug: console.log };
  loggers = { error: console.error };
}

const execAsync = promisify(exec);

class BackupManager {
  constructor() {
    this.backupDir = path.join(__dirname, '..', 'backups');
    this.maxBackups = 30; // Păstrează 30 de backup-uri
    this.dbName = 'transio';
    this.dbHost = 'localhost:27017';

    this.initializeBackupDirectory();
    this.scheduleBackups();
  }

  initializeBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      logger.info('Created backup directory', { path: this.backupDir });
    }
  }

  // Programează backup-urile automate
  scheduleBackups() {
    try {
      // Backup zilnic la 02:00
      cron.schedule('0 2 * * *', async () => {
        await this.performDailyBackup();
      }, {
        timezone: 'Europe/Bucharest'
      });

      // Backup săptămânal sâmbăta la 03:00
      cron.schedule('0 3 * * 6', async () => {
        await this.performWeeklyBackup();
      }, {
        timezone: 'Europe/Bucharest'
      });

      // Backup lunar prima zi la 04:00
      cron.schedule('0 4 1 * *', async () => {
        await this.performMonthlyBackup();
      }, {
        timezone: 'Europe/Bucharest'
      });
    } catch (error) {
      logger.info('Error scheduling backups', { error: error.message });
      // Fallback fără cron dacă există probleme
    }

    logger.info('Backup scheduler initialized', {
      daily: '02:00',
      weekly: 'Saturday 03:00',
      monthly: '1st day 04:00'
    });
  }

  // Generează numele pentru backup
  generateBackupName(type = 'daily') {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    return `${this.dbName}-backup-${type}-${dateStr}-${timeStr}.json`;
  }

  // Performă backup folosind Mongoose (fără dependență de mongoexport)
  async performBackup(type = 'daily') {
    try {
      const startTime = Date.now();
      logger.info(`Starting ${type} backup using Mongoose`, { type });

      const fileName = this.generateBackupName(type);
      const filePath = path.join(this.backupDir, fileName);

      let backupData = {};
      let totalRecords = 0;

      // Importă modelele Mongoose pentru acces direct la DB
      let collections = {};
      
      try {
        // Import toate modelele necesare cu path absolut
        const path = require('path');
        const modelsPath = path.join(__dirname, '..', 'models');
        
        // Verifică că directorul există
        const fs = require('fs');
        if (!fs.existsSync(modelsPath)) {
          throw new Error(`Models directory not found: ${modelsPath}`);
        }
        
        // Liste fișiere din models
        const modelFiles = fs.readdirSync(modelsPath);
        
        // Încarcă modelele unul câte unul cu error handling
        const User = require(path.join(modelsPath, 'User'));
        const Cursa = require(path.join(modelsPath, 'Curse'));
        const Sofer = require(path.join(modelsPath, 'Sofer'));
        const Vehicul = require(path.join(modelsPath, 'Vehicul'));
        const Partener = require(path.join(modelsPath, 'Partener'));
        const Factura = require(path.join(modelsPath, 'Factura'));
        const Setari = require(path.join(modelsPath, 'Setari'));

        // Definește colecțiile cu modelele lor
        collections = {
          users: User,
          curse: Cursa,
          soferi: Sofer,
          vehicule: Vehicul,
          parteneri: Partener,
          facturi: Factura,
          setaris: Setari
        };
        
        logger.info('All models loaded successfully for backup', { 
          models: Object.keys(collections)
        });

        // Exportă fiecare colecție folosind Mongoose
        
        for (const [collectionName, Model] of Object.entries(collections)) {
          try {
            logger.debug(`Exporting collection ${collectionName}...`);
            
            const data = await Model.find({}).lean();
            backupData[collectionName] = data;
            totalRecords += data.length;

            logger.debug(`Exported collection ${collectionName}`, { 
              collection: collectionName, 
              recordCount: data.length 
            });

          } catch (collectionError) {
            loggers.error(collectionError, { 
              context: 'collection backup', 
              collection: collectionName 
            });
            backupData[collectionName] = [];
          }
        }

      } catch (modelError) {
        loggers.error(modelError, { context: 'loading models for backup' });
        throw new Error(`Nu s-au putut încărca modelele pentru backup: ${modelError.message}`);
      }

      // Scrie backup-ul complet
      const backupContent = {
        metadata: {
          backupDate: new Date().toISOString(),
          type,
          database: this.dbName,
          version: '2.0',
          method: 'mongoose-direct',
          collections: Object.keys(backupData),
          totalRecords
        },
        data: backupData
      };

      fs.writeFileSync(filePath, JSON.stringify(backupContent, null, 2));

      const duration = Date.now() - startTime;
      const fileSize = (fs.statSync(filePath).size / 1024 / 1024).toFixed(2); // MB

      logger.info(`Backup completed successfully`, {
        type,
        fileName,
        method: 'mongoose-direct',
        duration: `${duration}ms`,
        fileSize: `${fileSize}MB`,
        totalRecords
      });

      // Curăță backup-urile vechi
      await this.cleanOldBackups(type);

      return { success: true, fileName, fileSize, duration, totalRecords };

    } catch (error) {
      loggers.error(error, { context: 'backup creation', type });
      return { success: false, error: error.message };
    }
  }

  // Backup zilnic
  async performDailyBackup() {
    return await this.performBackup('daily');
  }

  // Backup săptămânal  
  async performWeeklyBackup() {
    return await this.performBackup('weekly');
  }

  // Backup lunar
  async performMonthlyBackup() {
    return await this.performBackup('monthly');
  }

  // Creează backup manual - funcția lipsă
  async createBackup(type = 'manual') {
    return await this.performBackup(type);
  }

  // Curăță backup-urile vechi
  async cleanOldBackups(type) {
    try {
      const files = fs.readdirSync(this.backupDir);
      const typeFiles = files
        .filter(file => file.includes(`-${type}-`) && file.endsWith('.json'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          mtime: fs.statSync(path.join(this.backupDir, file)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

      // Păstrează doar cele mai recente backup-uri
      const maxBackupsForType = type === 'monthly' ? 12 : (type === 'weekly' ? 8 : this.maxBackups);
      
      if (typeFiles.length > maxBackupsForType) {
        const filesToDelete = typeFiles.slice(maxBackupsForType);
        
        for (const file of filesToDelete) {
          fs.unlinkSync(file.path);
          logger.info(`Deleted old backup`, { fileName: file.name, type });
        }
      }

    } catch (error) {
      loggers.error(error, { context: 'backup cleanup', type });
    }
  }

  // Restore din backup folosind Mongoose (fără dependență de mongoimport)
  async restoreFromBackup(fileName) {
    try {
      const filePath = path.join(this.backupDir, fileName);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Backup file not found: ${fileName}`);
      }

      logger.info(`Starting restore from backup using Mongoose`, { fileName });

      const backupContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (!backupContent.data || !backupContent.metadata) {
        throw new Error('Invalid backup file format');
      }

      let restoredCollections = 0;
      let totalRecords = 0;

      // Importă modelele Mongoose pentru restore  
      let collections = {};
      
      try {
        // Import toate modelele necesare cu path absolut
        const path = require('path');
        const modelsPath = path.join(__dirname, '..', 'models');
        
        const User = require(path.join(modelsPath, 'User'));
        const Cursa = require(path.join(modelsPath, 'Curse'));
        const Sofer = require(path.join(modelsPath, 'Sofer'));
        const Vehicul = require(path.join(modelsPath, 'Vehicul'));
        const Partener = require(path.join(modelsPath, 'Partener'));
        const Factura = require(path.join(modelsPath, 'Factura'));
        const Setari = require(path.join(modelsPath, 'Setari'));

        collections = {
          users: User,
          curse: Cursa,
          soferi: Sofer,
          vehicule: Vehicul,
          parteneri: Partener,
          facturi: Factura,
          setaris: Setari
        };
        
        logger.info('All models loaded successfully for restore', { 
          models: Object.keys(collections)
        });

        for (const [collectionName, Model] of Object.entries(collections)) {
          try {
            const collectionData = backupContent.data[collectionName];
            
            if (!collectionData || collectionData.length === 0) {
              logger.debug(`No data for collection ${collectionName}, skipping`);
              continue;
            }

            logger.debug(`Restoring collection ${collectionName}...`);

            // Șterge toate documentele existente din colecție
            await Model.deleteMany({});
            
            // Inserează datele din backup
            await Model.insertMany(collectionData, { ordered: false });

            restoredCollections++;
            totalRecords += collectionData.length;
            
            logger.info(`Restored collection ${collectionName}`, { 
              collection: collectionName, 
              recordCount: collectionData.length 
            });

          } catch (collectionError) {
            loggers.error(collectionError, { 
              context: 'collection restore', 
              collection: collectionName 
            });
          }
        }

      } catch (modelError) {
        loggers.error(modelError, { context: 'loading models for restore' });
        throw new Error(`Nu s-au putut încărca modelele pentru restore: ${modelError.message}`);
      }

      logger.info(`Restore completed`, {
        fileName,
        method: 'mongoose-direct',
        totalCollections: Object.keys(backupContent.data).length,
        restoredCollections,
        totalRecords,
        backupDate: backupContent.metadata.backupDate
      });

      return { 
        success: true, 
        restoredCollections, 
        totalCollections: Object.keys(backupContent.data).length,
        totalRecords
      };

    } catch (error) {
      loggers.error(error, { context: 'backup restore', fileName });
      return { success: false, error: error.message };
    }
  }

  // Lista backup-urilor disponibile
  listBackups() {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backups = files
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          
          return {
            fileName: file,
            size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
            createdAt: stats.mtime.toISOString(),
            type: file.includes('-daily-') ? 'daily' : 
                  file.includes('-weekly-') ? 'weekly' : 
                  file.includes('-monthly-') ? 'monthly' : 'manual'
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return backups;
    } catch (error) {
      loggers.error(error, { context: 'list backups' });
      return [];
    }
  }

  // Backup manual
  async createManualBackup(description = '') {
    const type = `manual${description ? '-' + description.replace(/[^a-zA-Z0-9]/g, '') : ''}`;
    return await this.performBackup(type);
  }

  // Obține ultimul backup pentru download
  getLatestBackup() {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backupFiles = files
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          
          return {
            fileName: file,
            filePath: filePath,
            createdAt: stats.mtime
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt);

      if (backupFiles.length === 0) {
        return { success: false, message: 'Nu există backup-uri disponibile' };
      }

      return { 
        success: true, 
        fileName: backupFiles[0].fileName,
        filePath: backupFiles[0].filePath
      };
    } catch (error) {
      loggers.error(error, { context: 'get latest backup' });
      return { success: false, error: error.message };
    }
  }
}

// Confirmare încărcare backup manager actualizat
logger.info('Backup manager v2.0.0 loaded successfully - using Mongoose direct (no mongoexport dependency)');

module.exports = new BackupManager();