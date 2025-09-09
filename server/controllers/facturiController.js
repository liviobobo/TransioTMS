const Factura = require('../models/Factura');
const Curse = require('../models/Curse');
const Partener = require('../models/Partener');
const mongoose = require('mongoose');

// Obține toate facturile cu paginare și filtrare
const getFacturi = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Construiește filtrul de căutare
    let filtru = {};
    
    // Filtrare după status
    if (req.query.status) {
      filtru.status = req.query.status;
    }
    
    // Filtrare după numărul facturii
    if (req.query.numarFactura) {
      filtru.numarFactura = { $regex: req.query.numarFactura, $options: 'i' };
    }
    
    // Filtrare după cursă (ID sau detalii cursă)
    if (req.query.cursa) {
      // Caută după ID cursă sau detalii din cursă
      const curseMatching = await Curse.find({
        $or: [
          { idCursa: { $regex: req.query.cursa, $options: 'i' } },
          { pornire: { $regex: req.query.cursa, $options: 'i' } },
          { destinatie: { $regex: req.query.cursa, $options: 'i' } }
        ]
      }).select('_id');
      
      if (curseMatching.length > 0) {
        filtru.cursaLegata = { $in: curseMatching.map(c => c._id) };
      }
    }
    
    // Filtrare după partener
    if (req.query.partener) {
      const parteneriMatching = await Partener.find({
        numeFirma: { $regex: req.query.partener, $options: 'i' }
      }).select('_id');
      
      if (parteneriMatching.length > 0) {
        filtru.partenerAsignat = { $in: parteneriMatching.map(p => p._id) };
      }
    }
    
    // Filtrare după dată emisă
    if (req.query.dataEmisaStart && req.query.dataEmisaEnd) {
      filtru.dataEmisa = {
        $gte: new Date(req.query.dataEmisaStart),
        $lte: new Date(req.query.dataEmisaEnd)
      };
    } else if (req.query.dataEmisaStart) {
      filtru.dataEmisa = { $gte: new Date(req.query.dataEmisaStart) };
    } else if (req.query.dataEmisaEnd) {
      filtru.dataEmisa = { $lte: new Date(req.query.dataEmisaEnd) };
    }
    
    // Filtrare după scadență
    if (req.query.scadentaStart && req.query.scadentaEnd) {
      filtru.scadenta = {
        $gte: new Date(req.query.scadentaStart),
        $lte: new Date(req.query.scadentaEnd)
      };
    }
    
    // Filtrare facturi întârziate
    if (req.query.intarziate === 'true') {
      filtru.scadenta = { $lt: new Date() };
      filtru.status = { $in: ['Emisă', 'Trimisă', 'Întârziată'] };
    }
    
    // Execută query-ul
    const facturi = await Factura.find(filtru)
      .populate('cursaLegata', 'idCursa pornire destinatie costNegociat status')
      .populate('partenerAsignat', 'numeFirma contactPersoana telefon email')
      .select('-__v -istoricStatus')
      .sort({ dataEmisa: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Calculează virtuals pentru fiecare factură
    const facturiCuDetalii = facturi.map(factura => {
      const astazi = new Date();
      const esteIntarziata = factura.status !== 'Plătită' && factura.status !== 'Anulată' && astazi > new Date(factura.scadenta);
      const zilePanaLaScadenta = factura.status === 'Plătită' || factura.status === 'Anulată' 
        ? null 
        : Math.ceil((new Date(factura.scadenta) - astazi) / (1000 * 60 * 60 * 24));
      
      return {
        ...factura,
        esteIntarziata,
        zilePanaLaScadenta,
        sumaFormatata: `${factura.suma.toLocaleString('ro-RO')} ${factura.moneda}`
      };
    });
    
    const total = await Factura.countDocuments(filtru);
    
    res.json({
      success: true,
      data: facturiCuDetalii,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
    
  } catch (error) {
    console.error('Eroare la obținerea facturilor:', error);
    res.status(500).json({ 
      message: 'Eroare la obținerea facturilor', 
      error: error.message 
    });
  }
};

// Obține o factură specifică
const getFactura = async (req, res) => {
  try {
    const factura = await Factura.findById(req.params.id)
      .populate('cursaLegata')
      .populate('partenerAsignat')
      .populate('istoricStatus.utilizator', 'nume email')
      .lean();
    
    if (!factura) {
      return res.status(404).json({ message: 'Factura nu a fost găsită' });
    }
    
    // Adaugă virtuals
    const astazi = new Date();
    const esteIntarziata = factura.status !== 'Plătită' && factura.status !== 'Anulată' && astazi > new Date(factura.scadenta);
    const zilePanaLaScadenta = factura.status === 'Plătită' || factura.status === 'Anulată' 
      ? null 
      : Math.ceil((new Date(factura.scadenta) - astazi) / (1000 * 60 * 60 * 24));
    
    res.json({
      success: true,
      data: {
        ...factura,
        esteIntarziata,
        zilePanaLaScadenta,
        sumaFormatata: `${factura.suma.toLocaleString('ro-RO')} ${factura.moneda}`
      }
    });
    
  } catch (error) {
    console.error('Eroare la obținerea facturii:', error);
    res.status(500).json({ 
      message: 'Eroare la obținerea facturii', 
      error: error.message 
    });
  }
};

// Creează o factură nouă
const createFactura = async (req, res) => {
  try {
    const facturaData = req.body;
    
    // Gestionare upload document
    if (req.file) {
      facturaData.documentUpload = {
        nume: req.file.originalname,
        cale: `uploads/facturi/${req.file.filename}`,
        tip: req.file.mimetype,
        marime: req.file.size
      };
    }
    
    // Validare cursă existentă
    const cursa = await Curse.findById(facturaData.cursaLegata)
      .populate('partenerAsignat');
    
    if (!cursa) {
      return res.status(400).json({ message: 'Cursa specificată nu există' });
    }
    
    // Auto-completare din cursă
    if (!facturaData.suma && cursa.costNegociat) {
      facturaData.suma = cursa.costNegociat;
    }
    
    if (!facturaData.partenerAsignat && cursa.partenerAsignat) {
      facturaData.partenerAsignat = cursa.partenerAsignat._id;
    }
    
    // Obține detalii partener pentru facturare
    if (facturaData.partenerAsignat) {
      const partener = await Partener.findById(facturaData.partenerAsignat);
      if (partener) {
        facturaData.detaliiFacturare = {
          adresaClient: partener.adresaCompleta,
          codFiscalClient: partener.codFiscal,
          nrRegistruComertClient: partener.nrRegistruComert,
          persoanaContact: partener.contactPersoana,
          telefonContact: partener.telefon,
          emailContact: partener.email
        };
      }
    }
    
    // Eliminare câmpuri goale pentru a permite generarea automată
    if (!facturaData.numarFactura || facturaData.numarFactura.trim() === '') {
      delete facturaData.numarFactura;
      console.log('🔢 Câmp numarFactura eliminat - va fi generat automat');
    }
    
    // Conversii numerice
    if (facturaData.suma) {
      facturaData.suma = Number(facturaData.suma);
    }
    
    // Validare și setare scadență
    if (facturaData.scadenta) {
      facturaData.scadenta = new Date(facturaData.scadenta);
    }
    
    if (facturaData.dataEmisa) {
      facturaData.dataEmisa = new Date(facturaData.dataEmisa);
    }
    
    console.log('📝 Date procesate pentru factură:', {
      ...facturaData,
      scadenta: facturaData.scadenta?.toISOString(),
      dataEmisa: facturaData.dataEmisa?.toISOString()
    });
    
    const factura = new Factura(facturaData);
    
    // Adaugă utilizatorul în istoric
    if (req.user && req.user.id) {
      factura.istoricStatus.push({
        status: factura.status,
        utilizator: req.user.id,
        motiv: 'Factură creată'
      });
    }
    
    await factura.save();
    
    // Populate pentru răspuns
    await factura.populate('cursaLegata partenerAsignat');
    
    res.status(201).json({
      message: 'Factură creată cu succes',
      factura: factura.toJSON()
    });
    
  } catch (error) {
    console.error('Eroare la crearea facturii:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Erori de validare',
        errors 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Numărul facturii există deja în sistem'
      });
    }
    
    res.status(500).json({ 
      message: 'Eroare la crearea facturii', 
      error: error.message 
    });
  }
};

// Actualizează o factură
const updateFactura = async (req, res) => {
  try {
    // Multer procesează FormData și pune datele în req.body
    const facturaData = { ...req.body };
    
    // Gestionare upload document
    if (req.file) {
      facturaData.documentUpload = {
        nume: req.file.originalname,
        cale: `uploads/facturi/${req.file.filename}`,
        tip: req.file.mimetype,
        marime: req.file.size
      };
    }
    
    const facturaOriginala = await Factura.findById(req.params.id);
    
    if (!facturaOriginala) {
      return res.status(404).json({ message: 'Factura nu a fost găsită' });
    }
    
    // Conversii numerice
    if (facturaData.suma) {
      facturaData.suma = Number(facturaData.suma);
    }
    
    // Validare și conversie date
    if (facturaData.scadenta) {
      facturaData.scadenta = new Date(facturaData.scadenta);
    }
    
    if (facturaData.dataEmisa) {
      facturaData.dataEmisa = new Date(facturaData.dataEmisa);
    }
    
    // Folosim save() pentru a avea acces complet la validatori
    Object.assign(facturaOriginala, facturaData);
    
    // Salvăm modificările
    await facturaOriginala.save();
    
    // Re-populate pentru răspuns
    await facturaOriginala.populate('cursaLegata partenerAsignat');
    
    res.json({
      success: true,
      message: 'Factură actualizată cu succes',
      data: facturaOriginala.toJSON()
    });
    
  } catch (error) {
    console.error('Eroare la actualizarea facturii:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Erori de validare',
        errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Eroare la actualizarea facturii', 
      error: error.message 
    });
  }
};

// Actualizează doar statusul facturii
const updateFacturaStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status-ul este obligatoriu' });
    }
    
    // Validare status valid
    const validStatuses = ['Emisă', 'Trimisă', 'Plătită', 'Întârziată', 'Anulată'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status invalid. Statusuri valide: ${validStatuses.join(', ')}`
      });
    }

    const factura = await Factura.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: false }  // Dezactivez validatorii pentru a nu verifica scadența
    ).populate('cursaLegata partenerAsignat');

    if (!factura) {
      return res.status(404).json({ message: 'Factura nu a fost găsită' });
    }

    res.json({
      message: 'Status actualizat cu succes',
      factura: factura.toJSON()
    });
  } catch (error) {
    console.error('Eroare la actualizarea statusului:', error);
    res.status(500).json({ 
      message: 'Eroare la actualizarea statusului', 
      error: error.message 
    });
  }
};

// Șterge o factură
const deleteFactura = async (req, res) => {
  try {
    const factura = await Factura.findById(req.params.id);
    
    if (!factura) {
      return res.status(404).json({ message: 'Factura nu a fost găsită' });
    }
    
    // Verifică dacă factura poate fi ștearsă
    if (factura.status === 'Plătită') {
      return res.status(400).json({ 
        message: 'Nu poți șterge o factură plătită'
      });
    }
    
    await Factura.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Factură ștearsă cu succes' });
    
  } catch (error) {
    console.error('Eroare la ștergerea facturii:', error);
    res.status(500).json({ 
      message: 'Eroare la ștergerea facturii', 
      error: error.message 
    });
  }
};

// Marchează factura ca plătită
const marcheazaPlatita = async (req, res) => {
  try {
    const { dataPlata } = req.body;
    const factura = await Factura.findById(req.params.id);
    
    if (!factura) {
      return res.status(404).json({ message: 'Factura nu a fost găsită' });
    }
    
    if (factura.status === 'Plătită') {
      return res.status(400).json({ message: 'Factura este deja plătită' });
    }
    
    await factura.marcheazaPlatita(dataPlata, req.user?.id);
    await factura.populate('cursaLegata partenerAsignat');
    
    res.json({
      message: 'Factură marcată ca plătită cu succes',
      factura: factura.toJSON()
    });
    
  } catch (error) {
    console.error('Eroare la marcarea facturii ca plătită:', error);
    res.status(500).json({ 
      message: 'Eroare la marcarea facturii ca plătită', 
      error: error.message 
    });
  }
};

// Anulează o factură
const anulaFactura = async (req, res) => {
  try {
    const { motiv } = req.body;
    const factura = await Factura.findById(req.params.id);
    
    if (!factura) {
      return res.status(404).json({ message: 'Factura nu a fost găsită' });
    }
    
    if (factura.status === 'Plătită') {
      return res.status(400).json({ message: 'Nu poți anula o factură plătită' });
    }
    
    factura.status = 'Anulată';
    factura.istoricStatus.push({
      status: 'Anulată',
      utilizator: req.user?.id,
      motiv: motiv || 'Anulat manual'
    });
    
    await factura.save();
    await factura.populate('cursaLegata partenerAsignat');
    
    res.json({
      message: 'Factură anulată cu succes',
      factura: factura.toJSON()
    });
    
  } catch (error) {
    console.error('Eroare la anularea facturii:', error);
    res.status(500).json({ 
      message: 'Eroare la anularea facturii', 
      error: error.message 
    });
  }
};

// Obține statistici facturi pentru dashboard
const getStatisticiFacturi = async (req, res) => {
  try {
    const statistici = await Factura.getStatistici();
    
    // Facturi întârziate
    const facturiIntarziate = await Factura.gasesteFacuriIntarziate();
    
    // Facturi care scad în următoarele 7 zile
    const inSaptamanaUrmiatoare = new Date();
    inSaptamanaUrmiatoare.setDate(inSaptamanaUrmiatoare.getDate() + 7);
    
    const facturiScadente = await Factura.find({
      scadenta: { 
        $gte: new Date(), 
        $lte: inSaptamanaUrmiatoare 
      },
      status: { $in: ['Emisă', 'Trimisă'] }
    }).countDocuments();
    
    // Venituri lunare - ultimele 6 luni
    const acum6Luni = new Date();
    acum6Luni.setMonth(acum6Luni.getMonth() - 6);
    
    const venituri6Luni = await Factura.aggregate([
      {
        $match: {
          dataEmisa: { $gte: acum6Luni },
          status: 'Plătită'
        }
      },
      {
        $group: {
          _id: {
            anul: { $year: '$dataEmisa' },
            luna: { $month: '$dataEmisa' }
          },
          suma: { $sum: '$suma' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.anul': 1, '_id.luna': 1 }
      }
    ]);
    
    res.json({
      ...statistici,
      facturiIntarziate: facturiIntarziate.length,
      facturiScadente,
      venituri6Luni
    });
    
  } catch (error) {
    console.error('Eroare la obținerea statisticilor:', error);
    res.status(500).json({ 
      message: 'Eroare la obținerea statisticilor', 
      error: error.message 
    });
  }
};

// Obține curse disponibile pentru facturare
const getCurseDisponibile = async (req, res) => {
  try {
    // Curse care nu au factură sau au factura anulată
    const facturiExistente = await Factura.find({ 
      status: { $ne: 'Anulată' } 
    }).distinct('cursaLegata');
    
    const curseDisponibile = await Curse.find({
      _id: { $nin: facturiExistente },
      status: { $in: ['Finalizată', 'Plătită'] }
    })
    .populate('partenerAsignat', 'numeFirma')
    .populate('soferAsignat', 'nume')
    .populate('vehiculAsignat', 'numarInmatriculare')
    .select('idCursa pornire destinatie costNegociat status')
    .sort({ createdAt: -1 })
    .limit(100);
    
    res.json(curseDisponibile);
    
  } catch (error) {
    console.error('Eroare la obținerea curselor disponibile:', error);
    res.status(500).json({ 
      message: 'Eroare la obținerea curselor disponibile', 
      error: error.message 
    });
  }
};

module.exports = {
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
};