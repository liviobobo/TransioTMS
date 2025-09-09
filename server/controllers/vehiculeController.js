const Vehicul = require('../models/Vehicul');
const Curse = require('../models/Curse');
const mongoose = require('mongoose');
const { calculeazaAlerteExpirare, calculeazaUrmatoareaRevizie, verificaNecesitateRevizie, construiesteFiltruVehicule, proceseazaInformatiiVehicul, valideazaReparatie } = require('../../utils/vehiculeHelpers');

// Obține toate vehiculele cu paginare și filtrare
const getVehicule = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Construiește filtrul de căutare folosind helper-ul
    const filtru = construiesteFiltruVehicule(req.query);
    
    // Execută query-ul
    const vehicule = await Vehicul.find(filtru)
      .select('-__v')
      .sort({ numarInmatriculare: 1 })
      .skip(skip)
      .limit(limit);

    // Calculează totalul pentru paginare
    const total = await Vehicul.countDocuments(filtru);

    // Obține curse legate pentru fiecare vehicul
    const vehiculeIds = vehicule.map(v => v._id);
    const curse = await Curse.find({ vehiculAsignat: { $in: vehiculeIds } })
      .select('vehiculAsignat status');

    // Procesează vehiculele pentru a adăuga informații suplimentare
    const vehiculeProcesate = vehicule.map(vehicul => {
      const vehiculObj = proceseazaInformatiiVehicul(vehicul, curse);
      
      // Filtrare pentru revizie necesară (aplicată după încărcare)
      if (req.query.revizieNecesara === 'true') {
        vehiculObj.necesitaRevizie = verificaNecesitateRevizie(vehicul);
      }

      return vehiculObj;
    });

    // Aplică filtrul pentru revizie necesară dacă este necesar
    let vehiculeFiltrate = vehiculeProcesate;
    if (req.query.revizieNecesara === 'true') {
      vehiculeFiltrate = vehiculeProcesate.filter(v => v.necesitaRevizie);
    }

    res.json({
      success: true,
      data: vehiculeFiltrate,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Eroare la obținerea vehiculelor:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la obținerea vehiculelor', 
      error: error.message 
    });
  }
};

// Obține un vehicul după ID
const getVehicul = async (req, res) => {
  try {
    const vehiculId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(vehiculId)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID vehicul invalid' 
      });
    }

    const vehicul = await Vehicul.findById(vehiculId).select('-__v');

    if (!vehicul) {
      return res.status(404).json({ 
        success: false,
        message: 'Vehiculul nu a fost găsit' 
      });
    }

    // Obține cursele asociate
    const curse = await Curse.find({ vehiculAsignat: vehiculId })
      .select('idCursa pornire destinatie status dataCreare')
      .sort({ dataCreare: -1 });

    const vehiculObj = vehicul.toObject();
    vehiculObj.curseAsociate = curse;
    vehiculObj.alerteExpirare = calculeazaAlerteExpirare(vehicul);
    vehiculObj.urmatoareaRevizie = calculeazaUrmatoareaRevizie(vehicul);

    res.json({
      success: true,
      data: vehiculObj
    });

  } catch (error) {
    console.error('Eroare la obținerea vehiculului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la obținerea vehiculului', 
      error: error.message 
    });
  }
};

// Creează vehicul nou
const createVehicul = async (req, res) => {
  try {
    // Validează dacă numărul de înmatriculare există deja
    const existingVehicul = await Vehicul.findOne({ 
      numarInmatriculare: req.body.numarInmatriculare 
    });

    if (existingVehicul) {
      return res.status(400).json({ 
        success: false,
        message: 'Un vehicul cu acest număr de înmatriculare există deja' 
      });
    }

    const vehicul = new Vehicul(req.body);
    await vehicul.save();

    res.status(201).json({
      success: true,
      data: vehicul,
      message: 'Vehicul creat cu succes'
    });

  } catch (error) {
    console.error('Eroare la crearea vehiculului:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: 'Eroare de validare', 
        errors 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Eroare la crearea vehiculului', 
      error: error.message 
    });
  }
};

// Actualizează vehicul
const updateVehicul = async (req, res) => {
  try {
    const { vehiculId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(vehiculId)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID vehicul invalid' 
      });
    }

    // Verifică dacă vehiculul există
    const existingVehicul = await Vehicul.findById(vehiculId);
    if (!existingVehicul) {
      return res.status(404).json({ 
        success: false,
        message: 'Vehiculul nu a fost găsit' 
      });
    }

    // Verifică unicitatea numărului de înmatriculare (doar dacă se schimbă)
    if (req.body.numarInmatriculare && req.body.numarInmatriculare !== existingVehicul.numarInmatriculare) {
      const duplicateVehicul = await Vehicul.findOne({ 
        numarInmatriculare: req.body.numarInmatriculare,
        _id: { $ne: vehiculId }
      });

      if (duplicateVehicul) {
        return res.status(400).json({ 
          success: false,
          message: 'Un vehicul cu acest număr de înmatriculare există deja' 
        });
      }
    }

    const vehiculActualizat = await Vehicul.findByIdAndUpdate(
      vehiculId, 
      req.body, 
      { new: true, runValidators: true }
    ).select('-__v');

    res.json({
      success: true,
      data: vehiculActualizat,
      message: 'Vehicul actualizat cu succes'
    });

  } catch (error) {
    console.error('Eroare la actualizarea vehiculului:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: 'Eroare de validare', 
        errors 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Eroare la actualizarea vehiculului', 
      error: error.message 
    });
  }
};

// Șterge vehicul
const deleteVehicul = async (req, res) => {
  try {
    const { vehiculId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(vehiculId)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID vehicul invalid' 
      });
    }

    // Verifică dacă vehiculul are curse asociate
    const curseAsociate = await Curse.countDocuments({ vehiculAsignat: vehiculId });
    if (curseAsociate > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Nu se poate șterge vehiculul - are ${curseAsociate} curse asociate` 
      });
    }

    const vehiculSters = await Vehicul.findByIdAndDelete(vehiculId);

    if (!vehiculSters) {
      return res.status(404).json({ 
        success: false,
        message: 'Vehiculul nu a fost găsit' 
      });
    }

    res.json({
      success: true,
      message: 'Vehicul șters cu succes'
    });

  } catch (error) {
    console.error('Eroare la ștergerea vehiculului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la ștergerea vehiculului', 
      error: error.message 
    });
  }
};

// Adaugă reparație la vehicul
const adaugaReparatie = async (req, res) => {
  try {
    const { vehiculId } = req.params;
    const { descriere, cost, data, furnizor, garantie } = req.body;

    if (!mongoose.Types.ObjectId.isValid(vehiculId)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID vehicul invalid' 
      });
    }

    let reparatie;
    try {
      reparatie = valideazaReparatie({ descriere, cost, data, furnizor, garantie });
    } catch (validationError) {
      return res.status(400).json({ 
        success: false,
        message: validationError.message 
      });
    }

    const vehicul = await Vehicul.findByIdAndUpdate(
      vehiculId,
      { $push: { reparatii: reparatie } },
      { new: true }
    );

    if (!vehicul) {
      return res.status(404).json({ 
        success: false,
        message: 'Vehiculul nu a fost găsit' 
      });
    }

    res.json({
      success: true,
      data: vehicul,
      message: 'Reparație adăugată cu succes'
    });

  } catch (error) {
    console.error('Eroare la adăugarea reparației:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la adăugarea reparației', 
      error: error.message 
    });
  }
};

// Actualizează kilometrajul vehiculului
const actualizeazaKm = async (req, res) => {
  try {
    const { vehiculId } = req.params;
    const { kmActuali } = req.body;

    if (!mongoose.Types.ObjectId.isValid(vehiculId)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID vehicul invalid' 
      });
    }

    if (!kmActuali || kmActuali < 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Kilometrajul trebuie să fie un număr pozitiv' 
      });
    }

    const vehicul = await Vehicul.findByIdAndUpdate(
      vehiculId,
      { kmActuali: parseInt(kmActuali) },
      { new: true, runValidators: true }
    );

    if (!vehicul) {
      return res.status(404).json({ 
        success: false,
        message: 'Vehiculul nu a fost găsit' 
      });
    }

    res.json({
      success: true,
      data: vehicul,
      message: 'Kilometraj actualizat cu succes'
    });

  } catch (error) {
    console.error('Eroare la actualizarea kilometrajului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la actualizarea kilometrajului', 
      error: error.message 
    });
  }
};

// Obține statistici pentru dashboard
const getStatisticiVehicule = async (req, res) => {
  try {
    const totalVehicule = await Vehicul.countDocuments();
    const vehiculeActive = await Vehicul.countDocuments({ status: 'activ' });
    const vehiculeInService = await Vehicul.countDocuments({ status: 'in_service' });
    const vehiculeInactiv = await Vehicul.countDocuments({ status: 'inactiv' });

    // Calculez media km și costul total reparații
    const statistici = await Vehicul.aggregate([
      {
        $group: {
          _id: null,
          mediaKm: { $avg: '$kmActuali' },
          costTotalReparatii: { $sum: '$costTotalReparatii' }
        }
      }
    ]);

    // Vehicule cu alerte de expirare
    const vehiculeAlerteExpirare = await Vehicul.find({
      $or: [
        { itpExpira: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
        { asigurareExpira: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } }
      ]
    }).countDocuments();

    res.json({
      success: true,
      data: {
        totalVehicule,
        vehiculeActive,
        vehiculeInService,
        vehiculeInactiv,
        mediaKm: statistici[0]?.mediaKm || 0,
        costTotalReparatii: statistici[0]?.costTotalReparatii || 0,
        vehiculeAlerteExpirare
      }
    });
  } catch (error) {
    console.error('Eroare la obținerea statisticilor vehicule:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea statisticilor vehicule',
      error: error.message
    });
  }
};

module.exports = {
  getVehicule,
  getVehicul,
  createVehicul,
  updateVehicul,
  deleteVehicul,
  adaugaReparatie,
  actualizeazaKm,
  getStatisticiVehicule
};