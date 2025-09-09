const Vehicul = require('../models/Vehicul');

// Obține statistici pentru dashboard
const getStatisticiVehicule = async (req, res) => {
  try {
    const totalVehicule = await Vehicul.countDocuments();
    const vehiculeDisponibile = await Vehicul.countDocuments({ status: 'disponibil' });
    const vehiculeInCursa = await Vehicul.countDocuments({ status: 'in_cursa' });
    const vehiculeInReparatie = await Vehicul.countDocuments({ status: 'in_reparatie' });
    
    // Vehicule cu expirări în următoarele 30 zile
    const acum = new Date();
    const treizecieZile = new Date(acum.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    const vehiculeCuExpirari = await Vehicul.countDocuments({
      $or: [
        { asigurareExpira: { $lte: treizecieZile } },
        { itpExpira: { $lte: treizecieZile } }
      ]
    });
    
    // Cost total reparații în ultimele 12 luni
    const unAnInUrma = new Date();
    unAnInUrma.setFullYear(unAnInUrma.getFullYear() - 1);
    
    const vehiculeReparatii = await Vehicul.find({
      'reparatii.data': { $gte: unAnInUrma }
    });
    
    const costTotalReparatii = vehiculeReparatii.reduce((total, vehicul) => {
      const reparatiiRecente = vehicul.reparatii.filter(r => r.data >= unAnInUrma);
      return total + reparatiiRecente.reduce((sum, r) => sum + r.cost, 0);
    }, 0);
    
    res.json({
      totalVehicule,
      vehiculeDisponibile,
      vehiculeInCursa,
      vehiculeInReparatie,
      vehiculeCuExpirari,
      costTotalReparatii,
      costMediuPerVehicul: totalVehicule > 0 ? costTotalReparatii / totalVehicule : 0
    });
    
  } catch (error) {
    console.error('Eroare la obținerea statisticilor:', error);
    res.status(500).json({ 
      message: 'Eroare la obținerea statisticilor', 
      error: error.message 
    });
  }
};

module.exports = {
  getStatisticiVehicule
};