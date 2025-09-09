const backupManager = require('../utils/backup');
const { logger } = require('../utils/logger');

// POST /api/setari/backups/create - Creează backup manual
const createBackup = async (req, res) => {
  try {
    logger.info(`Backup manual inițiat de utilizatorul ${req.user.id}`);
    
    const backupData = await backupManager.createBackup('manual');
    
    res.json({
      success: true,
      message: 'Backup creat cu succes',
      data: backupData
    });
  } catch (error) {
    logger.error('Eroare la crearea backup-ului manual:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la crearea backup-ului'
    });
  }
};

// POST /api/setari/restore - Restaurează din backup
const restoreBackup = async (req, res) => {
  try {
    logger.info(`Restaurare backup inițiată de utilizatorul ${req.user.id}`);
    
    await backupManager.restoreFromBackup(req.body);
    
    res.json({
      success: true,
      message: 'Date restaurate cu succes'
    });
  } catch (error) {
    logger.error('Eroare la restaurarea din backup:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la restaurarea datelor'
    });
  }
};

module.exports = {
  createBackup,
  restoreBackup
};