const Partener = require('../models/Partener');
const Curse = require('../models/Curse');
const mongoose = require('mongoose');

// Obține toți partenerii cu paginare și filtrare
const getParteneri = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Construiește filtrul de căutare
    let filtru = {};
    
    // Filtrare după numele firmei
    if (req.query.numeFirma) {
      filtru.numeFirma = { $regex: req.query.numeFirma, $options: 'i' };
    }
    
    // Filtrare după bursa sursă
    if (req.query.bursaSursa) {
      filtru.bursaSursa = req.query.bursaSursa;
    }
    
    // Filtrare după status
    if (req.query.statusPartener) {
      filtru.statusPartener = req.query.statusPartener;
    }
    
    // Filtrare pentru parteneri cu datorii
    if (req.query.cuDatorii === 'true') {
      filtru.datoriiPendinte = { $gt: 0 };
    }
    
    // Filtrare după rating
    if (req.query.ratingMinim) {
      filtru.ratingPartener = { $gte: parseInt(req.query.ratingMinim) };
    }
    
    // Execută query-ul
    const parteneri = await Partener.find(filtru)
      .select('-__v')
      .sort({ numeFirma: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Adaugă informații despre curse pentru fiecare partener
    const parteneriCuDetalii = await Promise.all(parteneri.map(async (partener) => {
      const curseLegate = await Curse.countDocuments({ partenerAsignat: partener._id });
      const curseActive = await Curse.countDocuments({ 
        partenerAsignat: partener._id, 
        status: { $in: ['Acceptată', 'În Curs'] }
      });
      
      return {
        ...partener,
        curseLegate,
        curseActive,
        adresaCompleta: calculeazaAdresaCompleta(partener.adresaFirma),
        statusDatorii: calculeazaStatusDatorii(partener.datoriiPendinte),
        procentPlataLaTimp: calculeazaProcentPlataLaTimp(partener.statistici, partener.termeniPlata)
      };
    }));
    
    const total = await Partener.countDocuments(filtru);
    
    res.json({
      success: true,
      data: parteneriCuDetalii,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
    
  } catch (error) {
    console.error('Eroare la obținerea partenerilor:', error);
    res.status(500).json({ 
      message: 'Eroare la obținerea partenerilor', 
      error: error.message 
    });
  }
};

// Obține un partener specific
const getPartener = async (req, res) => {
  try {
    const partener = await Partener.findById(req.params.id)
      .select('-__v')
      .lean();

    if (!partener) {
      return res.status(404).json({
        success: false,
        message: 'Partenerul nu a fost găsit'
      });
    }
    
    // Adaugă informații despre curse
    const curseLegate = await Curse.find({ partenerAsignat: partener._id })
      .select('idCursa pornire descarcareMultipla status costNegociat createdAt')
      .sort({ createdAt: -1 })
      .limit(20);
    
    const curseActive = await Curse.countDocuments({ 
      partenerAsignat: partener._id, 
      status: { $in: ['Acceptată', 'În Curs'] }
    });
    
    // Calculează statistici
    const totalCurse = await Curse.countDocuments({ partenerAsignat: partener._id });
    const valoareTotalaCurse = await Curse.aggregate([
      { $match: { partenerAsignat: new mongoose.Types.ObjectId(partener._id) } },
      { $group: { _id: null, total: { $sum: '$costNegociat' } } }
    ]);
    
    res.json({
      success: true,
      data: {
        ...partener,
        curseLegate,
        curseActive,
        totalCurse,
        valoareTotalaCurse: valoareTotalaCurse.length > 0 ? valoareTotalaCurse[0].total : 0,
        adresaCompleta: calculeazaAdresaCompleta(partener.adresaFirma),
        statusDatorii: calculeazaStatusDatorii(partener.datoriiPendinte),
        procentPlataLaTimp: calculeazaProcentPlataLaTimp(partener.statistici, partener.termeniPlata)
      }
    });
    
  } catch (error) {
    console.error('Eroare la obținerea partenerului:', error);
    res.status(500).json({ 
      message: 'Eroare la obținerea partenerului', 
      error: error.message 
    });
  }
};

// Creează un partener nou
const createPartener = async (req, res) => {
  try {
    const partenerData = req.body;
    
    // Validări și conversii
    if (partenerData.ratingPartener) {
      partenerData.ratingPartener = Number(partenerData.ratingPartener);
    }
    
    if (partenerData.termeniPlata?.zilePlata) {
      partenerData.termeniPlata.zilePlata = Number(partenerData.termeniPlata.zilePlata);
    }
    
    // Conversii numerice pentru totale
    ['datoriiPendinte', 'totalFacturat', 'totalIncasat'].forEach(field => {
      if (partenerData[field]) {
        partenerData[field] = Number(partenerData[field]);
      }
    });
    
    const partener = new Partener(partenerData);
    await partener.save();
    
    res.status(201).json({
      success: true,
      message: 'Partener creat cu succes',
      data: partener.toJSON()
    });
    
  } catch (error) {
    console.error('Eroare la crearea partenerului:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Erori de validare',
        errors 
      });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} există deja în sistem`
      });
    }
    
    res.status(500).json({ 
      message: 'Eroare la crearea partenerului', 
      error: error.message 
    });
  }
};

// Actualizează un partener
const updatePartener = async (req, res) => {
  try {
    const partenerData = req.body;
    
    // Validări și conversii
    if (partenerData.ratingPartener) {
      partenerData.ratingPartener = Number(partenerData.ratingPartener);
    }
    
    if (partenerData.termeniPlata?.zilePlata) {
      partenerData.termeniPlata.zilePlata = Number(partenerData.termeniPlata.zilePlata);
    }
    
    // Conversii numerice pentru totale
    ['datoriiPendinte', 'totalFacturat', 'totalIncasat'].forEach(field => {
      if (partenerData[field]) {
        partenerData[field] = Number(partenerData[field]);
      }
    });
    
    const partener = await Partener.findByIdAndUpdate(
      req.params.id,
      partenerData,
      { new: true, runValidators: true }
    );
    
    if (!partener) {
      return res.status(404).json({ message: 'Partenerul nu a fost găsit' });
    }
    
    res.json({
      message: 'Partener actualizat cu succes',
      partener: partener.toJSON()
    });
    
  } catch (error) {
    console.error('Eroare la actualizarea partenerului:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Erori de validare',
        errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Eroare la actualizarea partenerului', 
      error: error.message 
    });
  }
};

// Șterge un partener
const deletePartener = async (req, res) => {
  try {
    // Verifică dacă partenerul are curse active
    const curseActive = await Curse.countDocuments({
      partenerAsignat: req.params.id,
      status: { $in: ['Acceptată', 'În Curs'] }
    });
    
    if (curseActive > 0) {
      return res.status(400).json({ 
        message: `Nu poți șterge partenerul. Are ${curseActive} curse active.`
      });
    }
    
    const partener = await Partener.findByIdAndDelete(req.params.id);
    
    if (!partener) {
      return res.status(404).json({ message: 'Partenerul nu a fost găsit' });
    }
    
    res.json({ message: 'Partener șters cu succes' });
    
  } catch (error) {
    console.error('Eroare la ștergerea partenerului:', error);
    res.status(500).json({ 
      message: 'Eroare la ștergerea partenerului', 
      error: error.message 
    });
  }
};

// Adaugă un contract
const adaugaContract = async (req, res) => {
  try {
    const { nume, cale, tipContract } = req.body;
    
    if (!nume || !cale) {
      return res.status(400).json({ 
        message: 'Numele și calea contractului sunt obligatorii' 
      });
    }
    
    const partener = await Partener.findById(req.params.id);
    
    if (!partener) {
      return res.status(404).json({ message: 'Partenerul nu a fost găsit' });
    }
    
    partener.contracteAtasate.push({
      nume,
      cale,
      tipContract: tipContract || 'contract_cadru',
      dataIncarcare: new Date()
    });
    
    await partener.save();
    
    res.json({
      message: 'Contract adăugat cu succes',
      contract: partener.contracteAtasate[partener.contracteAtasate.length - 1]
    });
    
  } catch (error) {
    console.error('Eroare la adăugarea contractului:', error);
    res.status(500).json({ 
      message: 'Eroare la adăugarea contractului', 
      error: error.message 
    });
  }
};

// Calculează și actualizează statisticile
const calculeazaStatistici = async (req, res) => {
  try {
    const partener = await Partener.findById(req.params.id);
    
    if (!partener) {
      return res.status(404).json({ message: 'Partenerul nu a fost găsit' });
    }
    
    const statistici = await partener.calculeazaStatistici();
    
    res.json({
      message: 'Statistici calculate cu succes',
      statistici
    });
    
  } catch (error) {
    console.error('Eroare la calcularea statisticilor:', error);
    res.status(500).json({ 
      message: 'Eroare la calcularea statisticilor', 
      error: error.message 
    });
  }
};

// Actualizează datoriile
const actualizeazaDatorii = async (req, res) => {
  try {
    const partener = await Partener.findById(req.params.id);
    
    if (!partener) {
      return res.status(404).json({ message: 'Partenerul nu a fost găsit' });
    }
    
    const datoriiActualizate = await partener.actualizeazaDatorii();
    
    res.json({
      message: 'Datorii actualizate cu succes',
      datoriiPendinte: datoriiActualizate,
      statusDatorii: calculeazaStatusDatorii(datoriiActualizate)
    });
    
  } catch (error) {
    console.error('Eroare la actualizarea datoriilor:', error);
    res.status(500).json({ 
      message: 'Eroare la actualizarea datoriilor', 
      error: error.message 
    });
  }
};

// Obține statistici pentru dashboard
const getStatisticiParteneri = async (req, res) => {
  try {
    const totalParteneri = await Partener.countDocuments();
    const parteneriActivi = await Partener.countDocuments({ statusPartener: 'activ' });
    const parteneriCuDatorii = await Partener.countDocuments({ datoriiPendinte: { $gt: 0 } });
    
    // Partenerii top după valoarea curselor
    const topParteneri = await Partener.aggregate([
      { $match: { statusPartener: 'activ' } },
      { $sort: { totalFacturat: -1 } },
      { $limit: 5 },
      { $project: { numeFirma: 1, totalFacturat: 1, statistici: 1 } }
    ]);
    
    // Total datorii pendinte
    const totalDatorii = await Partener.aggregate([
      { $group: { _id: null, total: { $sum: '$datoriiPendinte' } } }
    ]);
    
    // Distribuția pe burse
    const distributieBurse = await Partener.aggregate([
      { $group: { _id: '$bursaSursa', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalParteneri,
      parteneriActivi,
      parteneriCuDatorii,
      totalDatoriiPendinte: totalDatorii.length > 0 ? totalDatorii[0].total : 0,
      topParteneri,
      distributieBurse
    });
    
  } catch (error) {
    console.error('Eroare la obținerea statisticilor:', error);
    res.status(500).json({ 
      message: 'Eroare la obținerea statisticilor', 
      error: error.message 
    });
  }
};

// Funcții helper
function calculeazaAdresaCompleta(adresaFirma) {
  if (!adresaFirma) return '';
  
  const parts = [];
  if (adresaFirma.strada) parts.push(adresaFirma.strada);
  if (adresaFirma.oras) parts.push(adresaFirma.oras);
  if (adresaFirma.codPostal) parts.push(adresaFirma.codPostal);
  if (adresaFirma.tara) parts.push(adresaFirma.tara);
  
  return parts.join(', ');
}

function calculeazaStatusDatorii(datoriiPendinte) {
  if (datoriiPendinte === 0) return 'la_zi';
  if (datoriiPendinte < 1000) return 'datorie_mica';
  if (datoriiPendinte < 5000) return 'datorie_medie';
  return 'datorie_mare';
}

function calculeazaProcentPlataLaTimp(statistici, termeniPlata) {
  if (!statistici || statistici.numarCurseTotal === 0) return 100;
  
  const timpAsteptat = termeniPlata?.zilePlata || 30;
  const timpMediu = statistici.timpMediuPlata || 0;
  
  if (timpMediu <= timpAsteptat) return 100;
  
  const performanta = Math.max(0, 100 - ((timpMediu - timpAsteptat) / timpAsteptat * 100));
  return Math.round(performanta);
}

module.exports = {
  getParteneri,
  getPartener,
  createPartener,
  updatePartener,
  deletePartener,
  adaugaContract,
  calculeazaStatistici,
  actualizeazaDatorii,
  getStatisticiParteneri
};