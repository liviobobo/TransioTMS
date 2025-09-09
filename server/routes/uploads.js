const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');
const { logger, loggers } = require('../utils/logger');

const router = express.Router();

// Configurare directoare upload
const uploadsDir = path.join(__dirname, '../uploads');
const contractsDir = path.join(uploadsDir, 'contracts');
const documentsDir = path.join(uploadsDir, 'documents');

// Creează directoarele dacă nu există
[uploadsDir, contractsDir, documentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configurare multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = req.params.type || 'documents';
    const destDir = type === 'contracts' ? contractsDir : documentsDir;
    cb(null, destDir);
  },
  filename: function (req, file, cb) {
    // Generează nume unic pentru fișier
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// Filtru pentru tipuri de fișiere permise
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Tip fișier nepermis. Sunt permise doar: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 30 * 1024 * 1024 // 30MB
  },
  fileFilter: fileFilter
});

// Upload single file
router.post('/:type', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nu a fost selectat niciun fișier'
      });
    }

    const type = req.params.type;
    const fileData = {
      nume: req.file.originalname,
      cale: `/uploads/${type}/${req.file.filename}`,
      tipFisier: req.file.mimetype,
      marime: req.file.size,
      dataIncarcare: new Date()
    };

    loggers.crud('File uploaded', {
      userId: req.user.id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      uploadType: type
    });

    res.json({
      success: true,
      message: 'Fișier încărcat cu succes',
      data: fileData
    });

  } catch (error) {
    logger.error('Upload error:', error);
    
    // Șterge fișierul dacă a fost încărcat dar a eșuat procesarea
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Eroare la încărcarea fișierului'
    });
  }
});

// Upload multiple files
router.post('/:type/multiple', authMiddleware, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nu au fost selectate fișiere'
      });
    }

    const type = req.params.type;
    const filesData = req.files.map(file => ({
      nume: file.originalname,
      cale: `/uploads/${type}/${file.filename}`,
      tipFisier: file.mimetype,
      marime: file.size,
      dataIncarcare: new Date()
    }));

    loggers.crud('Multiple files uploaded', {
      userId: req.user.id,
      fileCount: req.files.length,
      uploadType: type,
      files: req.files.map(f => ({ name: f.originalname, size: f.size }))
    });

    res.json({
      success: true,
      message: `${req.files.length} fișiere încărcate cu succes`,
      data: filesData
    });

  } catch (error) {
    logger.error('Multiple upload error:', error);
    
    // Șterge fișierele încărcate în caz de eroare
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Eroare la încărcarea fișierelor'
    });
  }
});

// Descarcă fișier
router.get('/download/:type/:filename', authMiddleware, (req, res) => {
  try {
    const { type, filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', type, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Fișierul nu a fost găsit'
      });
    }

    loggers.crud('File download', {
      userId: req.user.id,
      fileName: filename,
      fileType: type
    });

    res.download(filePath);

  } catch (error) {
    logger.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la descărcarea fișierului'
    });
  }
});

// Șterge fișier
router.delete('/:type/:filename', authMiddleware, (req, res) => {
  try {
    const { type, filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', type, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Fișierul nu a fost găsit'
      });
    }

    fs.unlinkSync(filePath);

    loggers.crud('File deleted', {
      userId: req.user.id,
      fileName: filename,
      fileType: type
    });

    res.json({
      success: true,
      message: 'Fișier șters cu succes'
    });

  } catch (error) {
    logger.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea fișierului'
    });
  }
});

module.exports = router;