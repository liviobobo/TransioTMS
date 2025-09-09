const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getParteneri,
  getPartener,
  createPartener,
  updatePartener,
  deletePartener,
  adaugaContract,
  calculeazaStatistici,
  actualizeazaDatorii,
  getStatisticiParteneri
} = require('../controllers/parteneriController');

// Middleware de autentificare pentru toate rutele
router.use(authMiddleware);

// Rute pentru CRUD parteneri
router.get('/', getParteneri);                    // GET /api/parteneri - Lista parteneri cu paginare
router.get('/statistici', getStatisticiParteneri); // GET /api/parteneri/statistici - Statistici pentru dashboard
router.get('/:id', getPartener);                  // GET /api/parteneri/:id - Detalii partener
router.post('/', createPartener);                 // POST /api/parteneri - Creare partener nou
router.put('/:id', updatePartener);               // PUT /api/parteneri/:id - Actualizare partener
router.delete('/:id', deletePartener);            // DELETE /api/parteneri/:id - Ștergere partener

// Rute pentru acțiuni speciale
router.post('/:id/contracte', adaugaContract);              // POST /api/parteneri/:id/contracte - Adaugă contract
router.post('/:id/calculeaza-statistici', calculeazaStatistici); // POST /api/parteneri/:id/calculeaza-statistici
router.post('/:id/actualizeaza-datorii', actualizeazaDatorii);   // POST /api/parteneri/:id/actualizeaza-datorii

module.exports = router;