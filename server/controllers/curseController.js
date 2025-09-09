const Cursa = require('../models/Curse');
const Sofer = require('../models/Sofer');
const Vehicul = require('../models/Vehicul');
const Partener = require('../models/Partener');
const Factura = require('../models/Factura');
const Joi = require('joi');
const { 
  withSelectivePopulation, 
  createPaginationFilter, 
  createSearchFilter, 
  formatApiResponse 
} = require('../utils/queryHelpers');
const { loggers } = require('../utils/logger');

// Schema de validare pentru cursă  
const cursaValidationSchema = Joi.object({
  sursa: Joi.string().valid('timocom', 'teleroute', 'trans', 'altele', 'direct').required(),
  pornire: Joi.string().trim().required(),
  incarcareMultipla: Joi.array().items(
    Joi.object({
      companie: Joi.string().trim().required(),
      adresa: Joi.string().trim().required(),
      tara: Joi.string().trim().allow('').default(''),
      coordonate: Joi.string().trim().allow('').default(''),
      informatiiIncarcare: Joi.string().trim().allow('').default(''),
      referintaIncarcare: Joi.string().trim().allow('').default(''),
      dataOra: Joi.string().required(), // Accept string pentru datetime-local
      descriereMarfa: Joi.string().trim().allow('').default(''),
      greutate: Joi.number().min(0).default(0)
    })
  ).optional(),
  descarcareMultipla: Joi.array().items(
    Joi.object({
      companie: Joi.string().trim().required(),
      adresa: Joi.string().trim().required(),
      tara: Joi.string().trim().allow('').default(''),
      coordonate: Joi.string().trim().allow('').default(''),
      informatiiDescarcare: Joi.string().trim().allow('').default(''),
      referintaDescarcare: Joi.string().trim().allow('').default(''),
      dataOra: Joi.string().required() // Accept string pentru datetime-local
    })
  ).min(1).required(),
  soferAsignat: Joi.string().trim().allow('').optional(), // ObjectId ca string, poate fi gol
  vehiculAsignat: Joi.string().trim().allow('').optional(), // ObjectId ca string, poate fi gol
  partenerAsignat: Joi.string().trim().allow('').optional(), // ObjectId ca string, poate fi gol
  kmEstimati: Joi.number().min(1).required(),
  kmReali: Joi.number().min(0).optional(),
  costNegociat: Joi.number().min(0).required(),
  comisionBursa: Joi.number().min(0).default(0),
  status: Joi.string().valid('Ofertă', 'Acceptată', 'În Curs', 'Finalizată', 'Plătită', 'Anulată').default('Ofertă'),
  note: Joi.string().trim().optional().allow(''),
  greutate: Joi.number().optional(), // Calculat din încărcare
  documenteAtasateExistente: Joi.array().optional().default([])
});

// Obține toate cursele cu filtrare și paginare - OPTIMIZAT
exports.getAllCurse = async (req, res) => {
  try {
    // Folosește helper-ele pentru pagination și filtering
    const pagination = createPaginationFilter(req.query);
    const searchFields = [
      'idCursa', 
      'pornire', 
      'descarcareMultipla.companie', 
      'descarcareMultipla.adresa'
    ];
    const filter = createSearchFilter(req.query, searchFields);
    
    // Adaugă filtru specific pentru șofer dacă este specificat
    if (req.query.sofer) {
      filter.soferAsignat = req.query.sofer;
    }

    // Query optimizat cu selective population
    let query = Cursa.find(filter);
    query = withSelectivePopulation(query, 'list');
    
    const curse = await query
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    const total = await Cursa.countDocuments(filter);

    // Răspuns formatat consistent
    res.json(formatApiResponse(curse, pagination, total));
    
  } catch (error) {
    loggers.error(error, {
      operation: 'GET_ALL_CURSE',
      userId: req.user?.id,
      query: req.query
    });
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea curselor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obține o cursă după ID
exports.getCursaById = async (req, res) => {
  try {
    const cursa = await Cursa.findById(req.params.id)
      .populate('soferAsignat', 'nume numarTelefon')
      .populate('vehiculAsignat', 'numarInmatriculare marca model')
      .populate('partenerAsignat', 'numeFirma contactPersoana email bursaSursa');
    
    if (!cursa) {
      return res.status(404).json({
        success: false,
        message: 'Cursa nu a fost găsită'
      });
    }

    res.json({
      success: true,
      data: cursa
    });
  } catch (error) {
    loggers.error(error, {
      operation: 'GET_CURSA_BY_ID',
      cursaId: req.params.id,
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea cursei',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Creează o cursă nouă
exports.createCursa = async (req, res) => {
  try {
    loggers.debug('Creating new cursa', { 
      operation: 'CREATE_CURSA',
      userId: req.user?.id,
      bodySize: JSON.stringify(req.body).length
    });
    
    // Validare date
    const { error, value } = cursaValidationSchema.validate(req.body);
    if (error) {
      loggers.debug('Validation failed for cursa creation', {
        operation: 'CREATE_CURSA_VALIDATION',
        userId: req.user?.id,
        errors: error.details.map(detail => ({ field: detail.path, message: detail.message }))
      });
      return res.status(400).json({
        success: false,
        message: 'Date invalide',
        errors: error.details.map(detail => `${detail.path.join('.')}: ${detail.message}`)
      });
    }

    // Transformă datele pentru MongoDB cu protecție împotriva erorilor
    const cursaData = {
      ...value
    };
    
    // Convertește date din string în Date objects cu validare
    try {
      // Convertește încărcare multiplă
      cursaData.incarcareMultipla = (value.incarcareMultipla || []).map(inc => ({
        companie: inc.companie,
        adresa: inc.adresa,
        tara: inc.tara || '',
        coordonate: inc.coordonate || '',
        informatiiIncarcare: inc.informatiiIncarcare || '',
        referintaIncarcare: inc.referintaIncarcare || '',
        descriereMarfa: inc.descriereMarfa || '',
        greutate: inc.greutate || 0,
        dataOra: inc.dataOra ? new Date(inc.dataOra) : null
      }));
      
      // Convertește descărcare multiplă  
      cursaData.descarcareMultipla = (value.descarcareMultipla || []).map(desc => ({
        companie: desc.companie,
        adresa: desc.adresa,
        tara: desc.tara || '',
        coordonate: desc.coordonate || '',
        informatiiDescarcare: desc.informatiiDescarcare || '',
        referintaDescarcare: desc.referintaDescarcare || '',
        dataOra: desc.dataOra ? new Date(desc.dataOra) : null
      }));
    } catch (dateError) {
      loggers.error(dateError, {
        operation: 'CREATE_CURSA_DATE_CONVERSION',
        userId: req.user?.id,
        message: 'Date conversion failed'
      });
      return res.status(400).json({
        success: false,
        message: 'Format dată invalid: ' + dateError.message
      });
    }

    // Generează idCursa automat dacă lipsește
    if (!cursaData.idCursa) {
      // Găsește ultimul ID folosit pentru a genera următorul în ordine
      const lastCursa = await Cursa.findOne().sort({ idCursa: -1 });
      let nextNumber = 1;
      
      if (lastCursa && lastCursa.idCursa) {
        // Extrage numărul din ultimul ID (ex: C001 -> 1)
        const match = lastCursa.idCursa.match(/C(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      
      cursaData.idCursa = `C${nextNumber.toString().padStart(3, '0')}`;
    }

    loggers.debug('Cursa data prepared for MongoDB', {
      operation: 'CREATE_CURSA_DATA_PREP',
      userId: req.user?.id,
      cursaId: cursaData.idCursa,
      dataSize: JSON.stringify(cursaData).length
    });

    const cursa = new Cursa(cursaData);
    await cursa.save();

    loggers.crud('CREATE', 'Cursa', cursa._id, req.user?.id, true);

    res.status(201).json({
      success: true,
      message: 'Cursa a fost creată cu succes',
      data: cursa
    });
  } catch (error) {
    loggers.error(error, {
      operation: 'CREATE_CURSA',
      userId: req.user?.id,
      cursaData: cursaData?.idCursa
    });
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'ID-ul cursei există deja'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Eroare la crearea cursei',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Actualizează o cursă
exports.updateCursa = async (req, res) => {
  try {
    // Validare date
    const { error, value } = cursaValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Date invalide',
        errors: error.details.map(detail => detail.message)
      });
    }

    const cursa = await Cursa.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    );

    if (!cursa) {
      return res.status(404).json({
        success: false,
        message: 'Cursa nu a fost găsită'
      });
    }

    res.json({
      success: true,
      message: 'Cursa a fost actualizată cu succes',
      data: cursa
    });
  } catch (error) {
    loggers.error(error, {
      operation: 'UPDATE_CURSA',
      cursaId: req.params.id,
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea cursei',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Șterge o cursă
exports.deleteCursa = async (req, res) => {
  try {
    const cursa = await Cursa.findById(req.params.id);
    
    if (!cursa) {
      return res.status(404).json({
        success: false,
        message: 'Cursa nu a fost găsită'
      });
    }

    // Permit ștergerea curselor cu orice status
    // Nota: Utilizatorul dorește să poată șterge curse chiar și cu status Finalizată

    await Cursa.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Cursa a fost ștearsă cu succes'
    });
  } catch (error) {
    loggers.error(error, {
      operation: 'DELETE_CURSA',
      cursaId: req.params.id,
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea cursei',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Actualizează statusul cursei
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    loggers.info('Update status request:', {
      cursaId: req.params.id,
      newStatus: status,
      userId: req.user?.id
    });
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status-ul este obligatoriu'
      });
    }

    // Validare status valid
    const validStatuses = ['Ofertă', 'Acceptată', 'În Curs', 'Finalizată', 'Plătită', 'Anulată'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status invalid. Statusuri valide: ${validStatuses.join(', ')}`
      });
    }

    const cursa = await Cursa.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!cursa) {
      return res.status(404).json({
        success: false,
        message: 'Cursa nu a fost găsită'
      });
    }

    res.json({
      success: true,
      message: 'Status-ul cursei a fost actualizat',
      data: cursa
    });
  } catch (error) {
    loggers.error(error, {
      operation: 'UPDATE_CURSA_STATUS',
      cursaId: req.params.id,
      newStatus: req.body.status,
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea status-ului',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Statistici pentru dashboard
exports.getStatisticiCurse = async (req, res) => {
  try {
    const stats = await Cursa.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalVenit: { $sum: '$venitNetCalculat' },
          totalKm: { $sum: '$kmReali' }
        }
      }
    ]);

    const curseActive = await Cursa.countDocuments({ status: 'În Curs' });
    const curseFinalizate = await Cursa.countDocuments({ status: 'Finalizată' });
    
    // Venit lunar
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const venitLunar = await Cursa.aggregate([
      {
        $match: {
          createdAt: { $gte: currentMonth, $lt: nextMonth },
          status: { $in: ['Finalizată', 'Plătită'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$venitNetCalculat' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        curseActive,
        curseFinalizate,
        venitLunar: venitLunar[0]?.total || 0,
        detaliiStatus: stats
      }
    });
  } catch (error) {
    loggers.error(error, {
      operation: 'GET_STATISTICI_CURSE',
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea statisticilor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Dashboard Statistics - Agregat optimizat pentru performanță
exports.getDashboardStats = async (req, res) => {
  try {
    // Folosim aggregation pipeline pentru o singură query optimizată
    const [cursaStats] = await Promise.all([
      // Statistici curse cu agregare
      Cursa.aggregate([
        {
          $facet: {
            statusStats: [
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 },
                  totalVenit: { $sum: '$venitNetCalculat' },
                  totalKm: { $sum: '$kmEstimati' }
                }
              }
            ],
            monthlyRevenue: [
              {
                $match: {
                  createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
                }
              },
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: '$venitNetCalculat' },
                  totalCosts: { $sum: '$comisionBursa' },
                  totalTrips: { $sum: 1 }
                }
              }
            ],
            recentTrips: [
              { $sort: { createdAt: -1 } },
              { $limit: 5 },
              {
                $lookup: {
                  from: 'sofers',
                  localField: 'soferAsignat',
                  foreignField: '_id',
                  as: 'sofer'
                }
              },
              {
                $project: {
                  idCursa: 1,
                  status: 1,
                  pornire: 1,
                  'descarcareMultipla.companie': 1,
                  venitNetCalculat: 1,
                  createdAt: 1,
                  'sofer.nume': 1
                }
              }
            ]
          }
        }
      ])
    ]);

    // Statistici count simple pentru alte entități - în paralel
    const [activeSoferi, activeVehicule, activeParteneri, unpaidInvoices] = await Promise.all([
      Sofer.countDocuments({ activ: true }),
      Vehicul.countDocuments({ activ: true }),
      Partener.countDocuments({ activ: true }),
      Factura.countDocuments({ status: 'Neplătită' })
    ]);

    // Formatează datele pentru frontend
    const stats = cursaStats[0];
    
    const dashboardData = {
      curse: {
        total: stats.statusStats.reduce((acc, curr) => acc + curr.count, 0),
        portalii: stats.statusStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        venitTotal: stats.statusStats.reduce((acc, curr) => acc + curr.totalVenit, 0),
        kmTotal: stats.statusStats.reduce((acc, curr) => acc + curr.totalKm, 0)
      },
      lunaCurenta: stats.monthlyRevenue[0] || { totalRevenue: 0, totalCosts: 0, totalTrips: 0 },
      resurse: {
        soferiActivi: activeSoferi,
        vehiculeActive: activeVehicule,
        parteneriActivi: activeParteneri
      },
      alerte: {
        facturiNeplatite: unpaidInvoices
      },
      curseRecente: stats.recentTrips
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    loggers.error(error, {
      operation: 'GET_DASHBOARD_STATS',
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea statisticilor dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};