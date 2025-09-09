const Curse = require('../models/Curse');
const Sofer = require('../models/Sofer');
const Vehicul = require('../models/Vehicul');
const Partener = require('../models/Partener');
const Factura = require('../models/Factura');

// Raport venituri lunare - agregat din curse și facturi
const getRaportVenituriLunare = async (req, res) => {
  try {
    const { an = new Date().getFullYear() } = req.query;

    // Agregare venituri din curse finalizate
    const curseVenituri = await Curse.aggregate([
      {
        $match: {
          status: 'Finalizată',
          createdAt: {
            $gte: new Date(an, 0, 1), // 1 ianuarie
            $lt: new Date(an + 1, 0, 1) // 1 ianuarie anul următor
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          venitTotal: { $sum: '$venitNetCalculat' },
          numarCurse: { $sum: 1 },
          kmTotal: { $sum: '$kmReali' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Agregare facturi plătite
    const facturiPlătite = await Factura.aggregate([
      {
        $match: {
          status: 'Plătită',
          dataEmisa: {
            $gte: new Date(an, 0, 1),
            $lt: new Date(an + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$dataEmisa' },
          sumaTotala: { $sum: '$suma' },
          numarFacturi: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Combinare date pentru toate lunile
    const luni = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
                 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

    const raportLunar = luni.map((luna, index) => {
      const lunaCurse = curseVenituri.find(c => c._id === index + 1) || { venitTotal: 0, numarCurse: 0, kmTotal: 0 };
      const lunaFacturi = facturiPlătite.find(f => f._id === index + 1) || { sumaTotala: 0, numarFacturi: 0 };

      return {
        luna,
        lunaIndex: index + 1,
        venituriCurse: lunaCurse.venitTotal || 0,
        numarCurse: lunaCurse.numarCurse || 0,
        kmParcursi: lunaCurse.kmTotal || 0,
        incasariFacturi: lunaFacturi.sumaTotala || 0,
        numarFacturi: lunaFacturi.numarFacturi || 0,
        profitNet: (lunaCurse.venitTotal || 0) - (lunaFacturi.sumaTotala || 0)
      };
    });

    // Calcule totale anuale
    const totalAnual = {
      venituriTotale: curseVenituri.reduce((sum, luna) => sum + luna.venitTotal, 0),
      curseTotale: curseVenituri.reduce((sum, luna) => sum + luna.numarCurse, 0),
      kmTotali: curseVenituri.reduce((sum, luna) => sum + luna.kmTotal, 0),
      incasariTotale: facturiPlătite.reduce((sum, luna) => sum + luna.sumaTotala, 0),
      facturiTotale: facturiPlătite.reduce((sum, luna) => sum + luna.numarFacturi, 0),
      profitTotal: curseVenituri.reduce((sum, luna) => sum + luna.venitTotal, 0) -
                  facturiPlătite.reduce((sum, luna) => sum + luna.sumaTotala, 0)
    };

    res.json({
      success: true,
      data: {
        an: parseInt(an),
        lunar: raportLunar,
        totalAnual
      }
    });

  } catch (error) {
    console.error('Eroare la generare raport venituri lunare:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la generare raport venituri lunare',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Raport performanță șoferi
const getRaportPerformantaSoferi = async (req, res) => {
  try {
    const { luna, an } = req.query;

    console.log('=== DEBUG RAPORT ȘOFERI ===');
    console.log('Parametri primiti:', { luna, an });

    // Simplificare: include toate status-urile pentru a vedea performanță generală
    const matchCondition = {
      soferAsignat: { $exists: true, $ne: null },
      status: { $in: ['Ofertă', 'Acceptată', 'În Curs', 'Finalizată', 'Plătită'] }
    };

    // Dacă sunt specificați luna și anul, adaugă filtru de dată
    if (luna && an) {
      const dataStart = new Date(an, luna - 1, 1);
      const dataEnd = new Date(an, luna, 1);
      matchCondition.createdAt = {
        $gte: dataStart,
        $lt: dataEnd
      };
    }

    console.log('Match condition pentru agregare:', matchCondition);

    // Verificare simplă: câte curse are fiecare șofer
    const curseCount = await Curse.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$soferAsignat',
          numarCurse: { $sum: 1 },
          kmTotal: { $sum: '$kmEstimati' },
          venitTotal: { $sum: '$venitNetCalculat' },
          curseFinalizate: {
            $sum: { $cond: [{ $eq: ['$status', 'Finalizată'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'sofers',
          localField: '_id',
          foreignField: '_id',
          as: 'soferInfo'
        }
      },
      {
        $unwind: '$soferInfo'
      },
      {
        $project: {
          soferId: '$_id',
          numeSofer: '$soferInfo.nume',
          numarCurse: 1,
          kmTotali: '$kmTotal',
          venitTotal: 1,
          curseFinalizate: 1,
          rataFinalizare: {
            $cond: {
              if: { $eq: ['$numarCurse', 0] },
              then: 0,
              else: { $multiply: [{ $divide: ['$curseFinalizate', '$numarCurse'] }, 100] }
            }
          },
          medieKmPerCursa: {
            $cond: {
              if: { $eq: ['$numarCurse', 0] },
              then: 0,
              else: { $divide: ['$kmTotal', '$numarCurse'] }
            }
          },
          medieVenitPerCursa: {
            $cond: {
              if: { $eq: ['$numarCurse', 0] },
              then: 0,
              else: { $divide: ['$venitTotal', '$numarCurse'] }
            }
          }
        }
      },
      { $sort: { numarCurse: -1 } }
    ]);

    console.log('Rezultate agregare șoferi:', curseCount.length);

    if (curseCount.length > 0) {
      console.log('Primul rezultat:', curseCount[0]);
    }

    // Returnează rezultatele agregării simplificate
    const performantaSoferi = curseCount;

    res.json({
      success: true,
      data: {
        soferi: performantaSoferi
      }
    });

  } catch (error) {
    console.error('Eroare la generare raport performanță șoferi:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la generare raport performanță șoferi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Raport costuri reparații vehicule
const getRaportCosturiReparatii = async (req, res) => {
  try {
    const { an = new Date().getFullYear() } = req.query;

    // Obține vehiculele cu reparații (optimizat cu $match early)
    const vehiculeReparatii = await Vehicul.aggregate([
      {
        $match: {
          'reparatii.0': { $exists: true }, // Doar vehicule cu reparații
          'reparatii.data': {
            $gte: new Date(an, 0, 1),
            $lt: new Date(an + 1, 0, 1)
          }
        }
      },
      {
        $unwind: '$reparatii'
      },
      {
        $match: {
          'reparatii.data': {
            $gte: new Date(an, 0, 1),
            $lt: new Date(an + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: '$_id',
          numarInmatriculare: { $first: '$numarInmatriculare' },
          marca: { $first: '$marca' },
          model: { $first: '$model' },
          numarReparatii: { $sum: 1 },
          costTotalReparatii: { $sum: '$reparatii.cost' }
        }
      },
      {
        $sort: { costTotalReparatii: -1 }
      }
    ]);

    // Pentru fiecare vehicul, calculează separat cursele și km
    const costuriReparatii = [];
    for (const vehicul of vehiculeReparatii) {
      // Găsește cursele pentru acest vehicul
      const curseVehicul = await Curse.find({
        vehiculAsignat: vehicul._id,
        status: { $in: ['Acceptată', 'În Curs', 'Finalizată', 'Plătită'] }
      }).select('kmEstimati');

      const numarCurse = curseVehicul.length;
      const kmParcursi = curseVehicul.reduce((total, cursa) => total + (cursa.kmEstimati || 0), 0);

      costuriReparatii.push({
        ...vehicul,
        numarCurse,
        kmParcursi,
        costPerKm: kmParcursi > 0 ? vehicul.costTotalReparatii / kmParcursi : 0,
        costPerCursa: numarCurse > 0 ? vehicul.costTotalReparatii / numarCurse : 0
      });
    }

    // Debug logging
    console.log('=== DEBUG RAPORT REPARAȚII ===');
    console.log('Număr vehicule găsite:', costuriReparatii.length);
    
    // Să testez o simplă căutare de curse
    if (costuriReparatii.length > 0) {
      const testVehicul = costuriReparatii[0];
      console.log('Test vehicul:', testVehicul.numarInmatriculare);
      
      const testCurse = await Curse.find({ 
        vehiculAsignat: testVehicul._id,
        status: { $in: ['Acceptată', 'În Curs', 'Finalizată', 'Plătită'] }
      }).select('kmEstimati kmReali status').limit(3);
      
      console.log('Curse găsite pentru test:', testCurse.length);
      testCurse.forEach((cursa, idx) => {
        console.log(`  Cursă ${idx + 1}:`, {
          status: cursa.status,
          kmEstimati: cursa.kmEstimati,
          kmReali: cursa.kmReali
        });
      });
    }
    
    costuriReparatii.slice(0, 3).forEach((vehicul, index) => {
      console.log(`Vehicul ${index + 1}:`, {
        numarInmatriculare: vehicul.numarInmatriculare,
        numarCurse: vehicul.numarCurse,
        kmParcursi: vehicul.kmParcursi,
        costTotalReparatii: vehicul.costTotalReparatii,
        costPerKm: vehicul.costPerKm,
        costPerCursa: vehicul.costPerCursa
      });
    });

    // Totaluri generale
    const totaluri = costuriReparatii.reduce((acc, vehicul) => ({
      numarReparatii: acc.numarReparatii + vehicul.numarReparatii,
      costTotal: acc.costTotal + vehicul.costTotalReparatii,
      kmTotali: acc.kmTotali + vehicul.kmParcursi,
      curseTotale: acc.curseTotale + vehicul.numarCurse
    }), { numarReparatii: 0, costTotal: 0, kmTotali: 0, curseTotale: 0 });

    res.json({
      success: true,
      data: {
        an: parseInt(an),
        vehicule: costuriReparatii,
        totaluri
      }
    });

  } catch (error) {
    console.error('Eroare la generare raport costuri reparații:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la generare raport costuri reparații',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Raport datorii parteneri
const getRaportDatoriiParteneri = async (req, res) => {
  try {
    // Agregare datorii din facturi neplătite
    const datoriiParteneri = await Factura.aggregate([
      {
        $match: {
          status: { $in: ['Emisă', 'Trimisă', 'Întârziată'] }
        }
      },
      {
        $lookup: {
          from: 'parteneri',
          localField: 'partenerAsignat',
          foreignField: '_id',
          as: 'partener'
        }
      },
      {
        $unwind: '$partener'
      },
      {
        $lookup: {
          from: 'curse',
          localField: 'cursaLegata',
          foreignField: '_id',
          as: 'cursa'
        }
      },
      {
        $unwind: { path: '$cursa', preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: '$partenerAsignat',
          numeFirma: { $first: '$partener.numeFirma' },
          contactPersoana: { $first: '$partener.contactPersoana' },
          email: { $first: '$partener.email' },
          telefon: { $first: '$partener.telefon' },
          numarFacturi: { $sum: 1 },
          sumaTotala: { $sum: '$suma' },
          facturiIntarziate: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Întârziată'] }, 1, 0]
            }
          },
          valoareIntarzieri: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Întârziată'] }, '$suma', 0]
            }
          }
        }
      },
      {
        $sort: { sumaTotala: -1 }
      }
    ]);

    const totaluri = datoriiParteneri.reduce((acc, partener) => ({
      numarParteneri: acc.numarParteneri + 1,
      sumaTotala: acc.sumaTotala + partener.sumaTotala,
      facturiTotale: acc.facturiTotale + partener.numarFacturi,
      facturiIntarziate: acc.facturiIntarziate + partener.facturiIntarziate,
      valoareIntarzieri: acc.valoareIntarzieri + partener.valoareIntarzieri
    }), { numarParteneri: 0, sumaTotala: 0, facturiTotale: 0, facturiIntarziate: 0, valoareIntarzieri: 0 });

    res.json({
      success: true,
      data: {
        parteneri: datoriiParteneri,
        totaluri
      }
    });

  } catch (error) {
    console.error('Eroare la generare raport datorii parteneri:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la generare raport datorii parteneri',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getRaportVenituriLunare,
  getRaportPerformantaSoferi,
  getRaportCosturiReparatii,
  getRaportDatoriiParteneri
};
