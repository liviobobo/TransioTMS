const Sofer = require('../models/Sofer');
const Curse = require('../models/Curse');
const mongoose = require('mongoose');

// Obține toți șoferii cu paginare și filtrare
const getSoferi = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Construiește filtrul de căutare
    let filtru = {};
    
    // Filtrare după nume
    if (req.query.nume) {
      filtru.nume = { $regex: req.query.nume, $options: 'i' };
    }
    
    // Filtrare după status
    if (req.query.status) {
      filtru.status = req.query.status;
    }
    
    // Filtrare pentru expirări în următoarele 30 zile
    if (req.query.alerteExpirare === 'true') {
      const acum = new Date();
      const treizecieZile = new Date(acum.getTime() + (30 * 24 * 60 * 60 * 1000));
      
      filtru.$or = [
        { permisExpira: { $lte: treizecieZile } },
        { atestatExpira: { $lte: treizecieZile } }
      ];
    }
    
    // Execută query-ul cu populare
    const soferi = await Sofer.find(filtru)
      .select('-__v')
      .sort({ nume: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Calculează cursele atribuite pentru fiecare șofer
    const soferiCuCurse = await Promise.all(soferi.map(async (sofer) => {
      const curseLegate = await Curse.countDocuments({ soferAsignat: sofer._id });
      const curseActive = await Curse.countDocuments({ 
        soferAsignat: sofer._id, 
        status: { $in: ['Acceptată', 'În Curs'] }
      });
      
      return {
        ...sofer,
        curseLegate,
        curseActive,
        alerteExpirare: calculeazaAlerteExpirare(sofer)
      };
    }));
    
    const total = await Sofer.countDocuments(filtru);
    
    res.json({
      success: true,
      data: soferiCuCurse,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
    
  } catch (error) {
    console.error('Eroare la obținerea șoferilor:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la obținerea șoferilor', 
      error: error.message 
    });
  }
};

// Obține un șofer specific
const getSofer = async (req, res) => {
  try {
    const sofer = await Sofer.findById(req.params.id)
      .select('-__v')
      .lean();

    if (!sofer) {
      return res.status(404).json({
        success: false,
        message: 'Șoferul nu a fost găsit'
      });
    }
    
    // Adaugă informații despre curse
    const curseLegate = await Curse.find({ soferAsignat: sofer._id })
      .select('idCursa pornire destinatie status kmReali cost')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const curseActive = await Curse.countDocuments({ 
      soferAsignat: sofer._id, 
      status: { $in: ['Acceptată', 'În Curs'] }
    });
    
    res.json({
      success: true,
      data: {
        ...sofer,
        curseLegate,
        curseActive: curseActive,
        alerteExpirare: calculeazaAlerteExpirare(sofer)
      }
    });
    
  } catch (error) {
    console.error('Eroare la obținerea șoferului:', error);
    res.status(500).json({ 
      message: 'Eroare la obținerea șoferului', 
      error: error.message 
    });
  }
};

// Creează un șofer nou
const createSofer = async (req, res) => {
  try {
    const soferData = req.body;
    
    // Validări suplimentare
    if (soferData.permisExpira) {
      soferData.permisExpira = new Date(soferData.permisExpira);
    }
    if (soferData.atestatExpira) {
      soferData.atestatExpira = new Date(soferData.atestatExpira);
    }
    
    // Conversii numerice
    if (soferData.salariuFix) {
      soferData.salariuFix = Number(soferData.salariuFix);
    }
    if (soferData.salariuVariabil) {
      soferData.salariuVariabil = Number(soferData.salariuVariabil);
    }
    
    const sofer = new Sofer(soferData);
    await sofer.save();
    
    res.status(201).json({
      message: 'Șofer creat cu succes',
      sofer: sofer.toJSON()
    });
    
  } catch (error) {
    console.error('Eroare la crearea șoferului:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Erori de validare',
        errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Eroare la crearea șoferului', 
      error: error.message 
    });
  }
};

// Actualizează un șofer
const updateSofer = async (req, res) => {
  try {
    const soferData = req.body;
    
    // Validări și conversii
    if (soferData.permisExpira) {
      soferData.permisExpira = new Date(soferData.permisExpira);
    }
    if (soferData.atestatExpira) {
      soferData.atestatExpira = new Date(soferData.atestatExpira);
    }
    if (soferData.salariuFix) {
      soferData.salariuFix = Number(soferData.salariuFix);
    }
    if (soferData.salariuVariabil) {
      soferData.salariuVariabil = Number(soferData.salariuVariabil);
    }
    
    const sofer = await Sofer.findByIdAndUpdate(
      req.params.id,
      soferData,
      { new: true, runValidators: true }
    );
    
    if (!sofer) {
      return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
    }
    
    res.json({
      message: 'Șofer actualizat cu succes',
      sofer: sofer.toJSON()
    });
    
  } catch (error) {
    console.error('Eroare la actualizarea șoferului:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Erori de validare',
        errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Eroare la actualizarea șoferului', 
      error: error.message 
    });
  }
};

// Șterge un șofer
const deleteSofer = async (req, res) => {
  try {
    // Verifică dacă șoferul are curse active
    const curseActive = await Curse.countDocuments({
      soferAsignat: req.params.id,
      status: { $in: ['Acceptată', 'În Curs'] }
    });
    
    if (curseActive > 0) {
      return res.status(400).json({ 
        message: `Nu poți șterge șoferul. Are ${curseActive} curse active.`
      });
    }
    
    const sofer = await Sofer.findByIdAndDelete(req.params.id);
    
    if (!sofer) {
      return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
    }
    
    res.json({ message: 'Șofer șters cu succes' });
    
  } catch (error) {
    console.error('Eroare la ștergerea șoferului:', error);
    res.status(500).json({ 
      message: 'Eroare la ștergerea șoferului', 
      error: error.message 
    });
  }
};

// Adaugă o plată de salariu
const adaugaPlata = async (req, res) => {
  try {
    const { suma, dataPlata, note } = req.body;
    
    if (!suma || suma <= 0) {
      return res.status(400).json({ message: 'Suma plății trebuie să fie pozitivă' });
    }
    
    const sofer = await Sofer.findById(req.params.id);
    
    if (!sofer) {
      return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
    }
    
    sofer.platiSalarii.push({
      suma: Number(suma),
      dataPlata: dataPlata ? new Date(dataPlata) : new Date(),
      note: note || ''
    });
    
    await sofer.save();
    
    res.json({
      message: 'Plată adăugată cu succes',
      plata: sofer.platiSalarii[sofer.platiSalarii.length - 1]
    });
    
  } catch (error) {
    console.error('Eroare la adăugarea plății:', error);
    res.status(500).json({ 
      message: 'Eroare la adăugarea plății', 
      error: error.message 
    });
  }
};

// Calculează și actualizează veniturile din curse
const calculeazaVenituri = async (req, res) => {
  try {
    const sofer = await Sofer.findById(req.params.id);
    
    if (!sofer) {
      return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
    }
    
    const venituri = await sofer.calculeazaVenituri();
    
    res.json({
      message: 'Venituri calculate cu succes',
      venituriTotale: venituri
    });
    
  } catch (error) {
    console.error('Eroare la calcularea veniturilor:', error);
    res.status(500).json({ 
      message: 'Eroare la calcularea veniturilor', 
      error: error.message 
    });
  }
};

// Obține statistici pentru dashboard
const getStatisticiSoferi = async (req, res) => {
  try {
    const totalSoferi = await Sofer.countDocuments();
    const soferiActivi = await Sofer.countDocuments({ status: 'activ' });
    
    // Șoferi cu expirări în următoarele 30 zile
    const acum = new Date();
    const treizecieZile = new Date(acum.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    const soferiCuExpirari = await Sofer.countDocuments({
      $or: [
        { permisExpira: { $lte: treizecieZile } },
        { atestatExpira: { $lte: treizecieZile } }
      ]
    });
    
    // Șoferi cu curse active (optimizat cu pipeline în $lookup)
    const soferiCuCurseActive = await Sofer.aggregate([
      {
        $lookup: {
          from: 'curses',
          localField: '_id',
          foreignField: 'soferAsignat',
          pipeline: [
            {
              $match: {
                status: { $in: ['Acceptată', 'În Curs'] }
              }
            }
          ],
          as: 'curseActive'
        }
      },
      {
        $match: {
          'curseActive.0': { $exists: true }
        }
      },
      {
        $count: 'total'
      }
    ]);
    
    res.json({
      totalSoferi,
      soferiActivi,
      soferiCuExpirari,
      soferiCuCurseActive: soferiCuCurseActive.length > 0 ? soferiCuCurseActive[0].total : 0
    });
    
  } catch (error) {
    console.error('Eroare la obținerea statisticilor:', error);
    res.status(500).json({ 
      message: 'Eroare la obținerea statisticilor', 
      error: error.message 
    });
  }
};

// Funcție helper pentru calcularea alertelor de expirare
function calculeazaAlerteExpirare(sofer) {
  const acum = new Date();
  const treizecieZile = new Date(acum.getTime() + (30 * 24 * 60 * 60 * 1000));
  
  const alerte = [];
  
  if (new Date(sofer.permisExpira) <= treizecieZile) {
    const zileRamase = Math.ceil((new Date(sofer.permisExpira) - acum) / (24 * 60 * 60 * 1000));
    alerte.push({
      tip: 'permis',
      mesaj: `Permisul de conducere expiră în ${zileRamase} ${zileRamase === 1 ? 'zi' : 'zile'}`,
      urgent: zileRamase <= 7
    });
  }
  
  if (new Date(sofer.atestatExpira) <= treizecieZile) {
    const zileRamase = Math.ceil((new Date(sofer.atestatExpira) - acum) / (24 * 60 * 60 * 1000));
    alerte.push({
      tip: 'atestat',
      mesaj: `Atestatul profesional expiră în ${zileRamase} ${zileRamase === 1 ? 'zi' : 'zile'}`,
      urgent: zileRamase <= 7
    });
  }
  
  return alerte;
}

// Marchează ieșirea șoferului din România
const marcheazaIesireDinRO = async (req, res) => {
  try {
    const { note } = req.body;
    const sofer = await Sofer.findById(req.params.id);
    
    if (!sofer) {
      return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
    }
    
    // Verifică dacă șoferul este deja în străinătate
    if (sofer.locatieCurenta === 'strain') {
      return res.status(400).json({ message: 'Șoferul este deja marcat ca fiind în străinătate' });
    }
    
    // Actualizează statusul
    sofer.locatieCurenta = 'strain';
    sofer.ultimaIesireDinRO = new Date();
    
    // Adaugă în istoric
    sofer.istoricCalatorii.push({
      tip: 'iesire',
      data: new Date(),
      note: note || ''
    });
    
    await sofer.save();
    
    res.json({
      success: true,
      message: 'Ieșire din România marcată cu succes',
      sofer: sofer
    });
    
  } catch (error) {
    console.error('Eroare la marcarea ieșirii:', error);
    res.status(500).json({ 
      message: 'Eroare la marcarea ieșirii din România', 
      error: error.message 
    });
  }
};

// Marchează intrarea șoferului în România
const marcheazaIntrareinRO = async (req, res) => {
  try {
    const { note } = req.body;
    const sofer = await Sofer.findById(req.params.id);
    
    if (!sofer) {
      return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
    }
    
    // Verifică dacă șoferul este deja în România
    if (sofer.locatieCurenta === 'romania') {
      return res.status(400).json({ message: 'Șoferul este deja marcat ca fiind în România' });
    }
    
    // Actualizează statusul
    sofer.locatieCurenta = 'romania';
    sofer.ultimaIntrareinRO = new Date();
    
    // Adaugă în istoric
    sofer.istoricCalatorii.push({
      tip: 'intrare',
      data: new Date(),
      note: note || ''
    });
    
    await sofer.save();
    
    res.json({
      success: true,
      message: 'Intrare în România marcată cu succes',
      sofer: sofer
    });
    
  } catch (error) {
    console.error('Eroare la marcarea intrării:', error);
    res.status(500).json({ 
      message: 'Eroare la marcarea intrării în România', 
      error: error.message 
    });
  }
};

// Obține istoricul călătoriilor pentru un șofer
const getIstoricCalatorii = async (req, res) => {
  try {
    const sofer = await Sofer.findById(req.params.id).select('nume istoricCalatorii locatieCurenta timpInLocatiaCurenta');
    
    if (!sofer) {
      return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
    }
    
    res.json({
      nume: sofer.nume,
      locatieCurenta: sofer.locatieCurenta,
      timpInLocatiaCurenta: sofer.timpInLocatiaCurenta,
      istoricCalatorii: sofer.istoricCalatorii.sort((a, b) => b.data - a.data)
    });
    
  } catch (error) {
    console.error('Eroare la obținerea istoricului:', error);
    res.status(500).json({ 
      message: 'Eroare la obținerea istoricului călătoriilor', 
      error: error.message 
    });
  }
};

module.exports = {
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
};