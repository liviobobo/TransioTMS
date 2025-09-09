const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getRaportVenituriLunare,
  getRaportPerformantaSoferi,
  getRaportCosturiReparatii,
  getRaportDatoriiParteneri
} = require('../controllers/rapoarteController');

// Toate rutele necesită autentificare
router.use(authMiddleware);

// GET /api/rapoarte/venituri-lunare - Raport venituri lunare
router.get('/venituri-lunare', getRaportVenituriLunare);

// GET /api/rapoarte/performanta-soferi - Raport performanță șoferi
router.get('/performanta-soferi', getRaportPerformantaSoferi);

// GET /api/rapoarte/costuri-reparatii - Raport costuri reparații vehicule
router.get('/costuri-reparatii', getRaportCosturiReparatii);

// GET /api/rapoarte/datorii-parteneri - Raport datorii parteneri
router.get('/datorii-parteneri', getRaportDatoriiParteneri);

module.exports = router;
