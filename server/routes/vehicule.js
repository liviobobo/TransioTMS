const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getVehicule,
  getVehicul,
  createVehicul,
  updateVehicul,
  deleteVehicul,
  adaugaReparatie,
  actualizeazaKm,
  getStatisticiVehicule
} = require('../controllers/vehiculeController');

// Middleware de autentificare pentru toate rutele
router.use(authMiddleware);

// Rute pentru CRUD vehicule
router.get('/', getVehicule);                    // GET /api/vehicule - Lista vehicule cu paginare
router.get('/statistici', getStatisticiVehicule); // GET /api/vehicule/statistici - Statistici pentru dashboard
router.get('/:id', getVehicul);                  // GET /api/vehicule/:id - Detalii vehicul
router.post('/', createVehicul);                 // POST /api/vehicule - Creare vehicul nou
router.put('/:id', updateVehicul);               // PUT /api/vehicule/:id - Actualizare vehicul
router.delete('/:id', deleteVehicul);            // DELETE /api/vehicule/:id - Ștergere vehicul

// Rute pentru acțiuni speciale
router.post('/:id/reparatii', adaugaReparatie);  // POST /api/vehicule/:id/reparatii - Adaugă reparație
router.put('/:id/kilometraj', actualizeazaKm);   // PUT /api/vehicule/:id/kilometraj - Actualizează km

module.exports = router;