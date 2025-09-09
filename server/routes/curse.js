const express = require('express');
const router = express.Router();
const curseController = require('../controllers/curseController');
const auth = require('../middleware/auth');

// Toate rutele necesită autentificare
router.use(auth.authMiddleware);

// GET /api/curse - Lista curse cu filtrare și paginare
router.get('/', curseController.getAllCurse);

// GET /api/curse/statistici - Statistici pentru dashboard
router.get('/statistici', curseController.getStatisticiCurse);

// GET /api/curse/dashboard-stats - Statistici agregat pentru dashboard (optimizat)
router.get('/dashboard-stats', curseController.getDashboardStats);

// GET /api/curse/:id - O cursă specifică
router.get('/:id', curseController.getCursaById);

// POST /api/curse - Creează cursă nouă
router.post('/', curseController.createCursa);

// PUT /api/curse/:id - Actualizează cursă
router.put('/:id', curseController.updateCursa);

// PATCH /api/curse/:id/status - Actualizează doar status-ul
router.patch('/:id/status', curseController.updateStatus);

// DELETE /api/curse/:id - Șterge cursă
router.delete('/:id', curseController.deleteCursa);

module.exports = router;