const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getSoferi,
  getSofer,
  createSofer,
  updateSofer,
  deleteSofer,
  adaugaPlata,
  calculeazaVenituri,
  getStatisticiSoferi,
  marcheazaIesireDinRO,
  marcheazaIntrareinRO,
  getIstoricCalatorii
} = require('../controllers/soferiController');

// Middleware de autentificare pentru toate rutele
router.use(authMiddleware);

// Rute pentru CRUD șoferi
router.get('/', getSoferi);                    // GET /api/soferi - Lista șoferi cu paginare
router.get('/statistici', getStatisticiSoferi); // GET /api/soferi/statistici - Statistici pentru dashboard
router.get('/:id', getSofer);                  // GET /api/soferi/:id - Detalii șofer
router.post('/', createSofer);                 // POST /api/soferi - Creare șofer nou
router.put('/:id', updateSofer);               // PUT /api/soferi/:id - Actualizare șofer
router.delete('/:id', deleteSofer);            // DELETE /api/soferi/:id - Ștergere șofer

// Rute pentru acțiuni speciale
router.post('/:id/plati', adaugaPlata);        // POST /api/soferi/:id/plati - Adaugă plată salariu
router.post('/:id/calculeaza-venituri', calculeazaVenituri); // POST /api/soferi/:id/calculeaza-venituri

// Rute pentru tracking locație
router.post('/:id/iesire-ro', marcheazaIesireDinRO);    // POST /api/soferi/:id/iesire-ro - Marchează ieșirea din România
router.post('/:id/intrare-ro', marcheazaIntrareinRO);   // POST /api/soferi/:id/intrare-ro - Marchează intrarea în România
router.get('/:id/istoric-calatorii', getIstoricCalatorii); // GET /api/soferi/:id/istoric-calatorii - Istoric călătorii

module.exports = router;