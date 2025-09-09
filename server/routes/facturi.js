const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');
const {
  getFacturi,
  getFactura,
  createFactura,
  updateFactura,
  updateFacturaStatus,
  deleteFactura,
  marcheazaPlatita,
  anulaFactura,
  getStatisticiFacturi,
  getCurseDisponibile
} = require('../controllers/facturiController');

// Configurare multer pentru upload facturi
const storageFacturi = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'facturi');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'factura-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadFactura = multer({
  storage: storageFacturi,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Doar fișiere JPG și PDF sunt permise!'));
    }
  }
});

// Middleware de autentificare pentru toate rutele
router.use(authMiddleware);

// Rute pentru CRUD facturi
router.get('/', getFacturi);                          // GET /api/facturi - Lista facturi cu paginare
router.get('/statistici', getStatisticiFacturi);     // GET /api/facturi/statistici - Statistici pentru dashboard
router.get('/curse-disponibile', getCurseDisponibile); // GET /api/facturi/curse-disponibile - Curse fără factură
router.get('/:id', getFactura);                       // GET /api/facturi/:id - Detalii factură
router.post('/', uploadFactura.single('documentUpload'), createFactura);  // POST /api/facturi - Creare factură nouă cu upload
router.put('/:id', uploadFactura.single('documentFactura'), updateFactura); // PUT /api/facturi/:id - Actualizare factură cu upload
router.patch('/:id/status', updateFacturaStatus);          // PATCH /api/facturi/:id/status - Actualizare doar status
router.delete('/:id', deleteFactura);                 // DELETE /api/facturi/:id - Ștergere factură

// Rută pentru descărcare document factură
router.get('/download/:id', async (req, res) => {
  try {
    const Factura = require('../models/Factura');
    const factura = await Factura.findById(req.params.id);
    
    if (!factura || !factura.documentUpload || !factura.documentUpload.cale) {
      return res.status(404).json({ message: 'Document negăsit' });
    }
    
    const filePath = path.join(__dirname, '..', factura.documentUpload.cale);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fișierul nu există pe server' });
    }
    
    res.download(filePath, factura.documentUpload.nume);
  } catch (error) {
    console.error('Eroare la descărcarea documentului:', error);
    res.status(500).json({ message: 'Eroare la descărcarea documentului' });
  }
});

// Rute pentru acțiuni speciale
router.post('/:id/marcheaza-platita', marcheazaPlatita); // POST /api/facturi/:id/marcheaza-platita - Marchează ca plătită
router.post('/:id/anuleaza', anulaFactura);              // POST /api/facturi/:id/anuleaza - Anulează factura

module.exports = router;