const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Import controllere specializate
const { getUsers, createUser, updateUser, deleteUser, changePassword } = require('../controllers/usersController');
const { getAppSettings } = require('../controllers/appSettingsController');
const { getSetariFacturi, saveSetariFacturi } = require('../controllers/invoiceSettingsController');
const { getSetariFirma, saveSetariFirma } = require('../controllers/companySettingsController');
const { createBackup, restoreBackup } = require('../controllers/backupController');

// Toate rutele necesită autentificare
router.use(authMiddleware);

// GET /api/setari/app - Setări aplicație
router.get('/app', getAppSettings);

// GET /api/setari/users - Lista utilizatori (doar admin)
router.get('/users', getUsers);

// POST /api/setari/users - Creează utilizator nou (doar admin)
router.post('/users', createUser);

// PUT /api/setari/users/:userId - Actualizează utilizator
router.put('/users/:userId', updateUser);

// DELETE /api/setari/users/:userId - Șterge utilizator (doar admin)
router.delete('/users/:userId', deleteUser);

// PUT /api/setari/users/:userId/password - Schimbă parola utilizatorului
router.put('/users/:userId/password', changePassword);

// GET /api/setari/facturi - Obține setări facturi
router.get('/facturi', getSetariFacturi);

// POST /api/setari/facturi - Salvează setări facturi (doar admin)
router.post('/facturi', saveSetariFacturi);

// GET /api/setari/firma - Obține setări firmă
router.get('/firma', getSetariFirma);

// POST /api/setari/firma - Salvează setări firmă (doar admin)
router.post('/firma', saveSetariFirma);

// POST /api/setari/backups/create - Creează backup manual
router.post('/backups/create', createBackup);

// POST /api/setari/restore - Restaurează din backup
router.post('/restore', restoreBackup);

module.exports = router;