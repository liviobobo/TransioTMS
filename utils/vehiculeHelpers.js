// Funcții helper pentru calculul alertelor și reviziei vehiculelor

// Calculează alertele de expirare pentru un vehicul
function calculeazaAlerteExpirare(vehicul) {
  const acum = new Date();
  const treizecieZile = new Date(acum.getTime() + (30 * 24 * 60 * 60 * 1000));
  
  const alerte = [];
  
  // Alertă asigurare
  if (new Date(vehicul.asigurareExpira) <= treizecieZile) {
    const zileRamase = Math.ceil((new Date(vehicul.asigurareExpira) - acum) / (24 * 60 * 60 * 1000));
    alerte.push({
      tip: 'asigurare',
      mesaj: `Asigurarea expiră în ${zileRamase} ${zileRamase === 1 ? 'zi' : 'zile'}`,
      urgent: zileRamase <= 7
    });
  }
  
  // Alertă ITP
  if (new Date(vehicul.itpExpira) <= treizecieZile) {
    const zileRamase = Math.ceil((new Date(vehicul.itpExpira) - acum) / (24 * 60 * 60 * 1000));
    alerte.push({
      tip: 'itp',
      mesaj: `ITP expiră în ${zileRamase} ${zileRamase === 1 ? 'zi' : 'zile'}`,
      urgent: zileRamase <= 7
    });
  }
  
  // Alertă revizie pe km
  if (vehicul.kmUltimaRevizie && vehicul.intervalRevizie?.km) {
    const kmDelaRevizie = vehicul.kmActuali - vehicul.kmUltimaRevizie;
    const kmPanaLaRevizie = vehicul.intervalRevizie.km - kmDelaRevizie;
    
    if (kmPanaLaRevizie <= 5000) {
      alerte.push({
        tip: 'revizie_km',
        mesaj: `Revizie necesară în ${kmPanaLaRevizie} km`,
        urgent: kmPanaLaRevizie <= 1000
      });
    }
  }
  
  // Alertă revizie pe timp
  if (vehicul.dataUltimeiRevizii && vehicul.intervalRevizie?.luni) {
    const luniDelaRevizie = Math.floor((acum - new Date(vehicul.dataUltimeiRevizii)) / (30 * 24 * 60 * 60 * 1000));
    const luniPanaLaRevizie = vehicul.intervalRevizie.luni - luniDelaRevizie;
    
    if (luniPanaLaRevizie <= 2) {
      alerte.push({
        tip: 'revizie_timp',
        mesaj: `Revizie necesară în ${luniPanaLaRevizie} ${luniPanaLaRevizie === 1 ? 'lună' : 'luni'}`,
        urgent: luniPanaLaRevizie <= 0
      });
    }
  }
  
  return alerte;
}

// Calculează data următoarei revizii
function calculeazaUrmatoareaRevizie(vehicul) {
  if (!vehicul.dataUltimeiRevizii || !vehicul.intervalRevizie?.luni) {
    return null;
  }
  
  const urmatoareaRevizie = new Date(vehicul.dataUltimeiRevizii);
  urmatoareaRevizie.setMonth(urmatoareaRevizie.getMonth() + vehicul.intervalRevizie.luni);
  
  return urmatoareaRevizie;
}

// Verifică dacă vehiculul necesită revizie
function verificaNecesitateRevizie(vehicul) {
  const acum = new Date();
  
  // Verifică pe baza timpului
  if (vehicul.dataUltimeiRevizii && vehicul.intervalRevizie?.luni) {
    const luniDelaRevizie = Math.floor((acum - new Date(vehicul.dataUltimeiRevizii)) / (30 * 24 * 60 * 60 * 1000));
    if (luniDelaRevizie >= vehicul.intervalRevizie.luni) {
      return true;
    }
  }
  
  // Verifică pe baza km
  if (vehicul.kmUltimaRevizie && vehicul.intervalRevizie?.km) {
    const kmDelaRevizie = vehicul.kmActuali - vehicul.kmUltimaRevizie;
    if (kmDelaRevizie >= vehicul.intervalRevizie.km) {
      return true;
    }
  }
  
  return false;
}

// Calculează cost mediu per km pentru vehicul
function calculeazaCostMediuPerKm(vehicul) {
  if (!vehicul.reparatii || vehicul.reparatii.length === 0 || vehicul.kmActuali <= 0) {
    return 0;
  }
  
  const costTotal = vehicul.reparatii.reduce((sum, reparatie) => sum + reparatie.cost, 0);
  return parseFloat((costTotal / vehicul.kmActuali).toFixed(4));
}

// Estimează următoarea revizie pe baza km și timp
function estimeazaUrmatoareaRevizie(vehicul) {
  if (!vehicul.dataUltimeiRevizii || !vehicul.intervalRevizie) {
    return null;
  }
  
  const acum = new Date();
  const reviziiPosibile = [];
  
  // Estimare pe baza timpului
  if (vehicul.intervalRevizie.luni) {
    const revizieData = new Date(vehicul.dataUltimeiRevizii);
    revizieData.setMonth(revizieData.getMonth() + vehicul.intervalRevizie.luni);
    reviziiPosibile.push(revizieData);
  }
  
  // Estimare pe baza km (presupunem o medie de 100 km/zi)
  if (vehicul.intervalRevizie.km && vehicul.kmUltimaRevizie) {
    const kmRamasi = vehicul.intervalRevizie.km - (vehicul.kmActuali - vehicul.kmUltimaRevizie);
    if (kmRamasi > 0) {
      const zileEstimate = Math.ceil(kmRamasi / 100);
      const revizieKm = new Date();
      revizieKm.setDate(revizieKm.getDate() + zileEstimate);
      reviziiPosibile.push(revizieKm);
    }
  }
  
  // Returnează data cea mai apropiată
  if (reviziiPosibile.length === 0) {
    return null;
  }
  
  return reviziiPosibile.reduce((earliest, current) => 
    current < earliest ? current : earliest
  );
}

// Construiește filtrul pentru query-urile de vehicule
function construiesteFiltruVehicule(queryParams) {
  let filtru = {};
  
  // Filtrare după numărul de înmatriculare
  if (queryParams.numarInmatriculare) {
    filtru.numarInmatriculare = { $regex: queryParams.numarInmatriculare, $options: 'i' };
  }
  
  // Filtrare după status
  if (queryParams.status) {
    filtru.status = queryParams.status;
  }
  
  // Filtrare după marcă
  if (queryParams.marca) {
    filtru.marca = { $regex: queryParams.marca, $options: 'i' };
  }
  
  // Filtrare pentru expirări în următoarele 30 zile
  if (queryParams.alerteExpirare === 'true') {
    const acum = new Date();
    const treizecieZile = new Date(acum.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    filtru.$or = [
      { asigurareExpira: { $lte: treizecieZile } },
      { itpExpira: { $lte: treizecieZile } }
    ];
  }
  
  return filtru;
}

// Procesează informațiile suplimentare pentru un vehicul
function proceseazaInformatiiVehicul(vehicul, curse) {
  const vehiculObj = vehicul.toObject();
  
  // Calculează cursele legate
  const curseLegate = curse.filter(c => c.vehiculAsignat?.toString() === vehicul._id.toString());
  vehiculObj.curseLegate = curseLegate.length;
  vehiculObj.curseActive = curseLegate.filter(c => ['planificata', 'in_desfasurare', 'in_asteptare'].includes(c.status)).length;

  // Calculează alertele și următoarea revizie
  vehiculObj.alerteExpirare = calculeazaAlerteExpirare(vehicul);
  vehiculObj.urmatoareaRevizie = calculeazaUrmatoareaRevizie(vehicul);

  return vehiculObj;
}

// Validează datele reparației
function valideazaReparatie(reparatieData) {
  const { descriere, cost, data, furnizor, garantie } = reparatieData;
  
  if (!descriere?.trim()) {
    throw new Error('Descrierea reparației este obligatorie');
  }
  
  if (!cost || isNaN(parseFloat(cost))) {
    throw new Error('Costul reparației trebuie să fie un număr valid');
  }
  
  if (!data || !Date.parse(data)) {
    throw new Error('Data reparației trebuie să fie validă');
  }
  
  return {
    descriere: descriere.trim(),
    cost: parseFloat(cost),
    data: new Date(data),
    furnizor: furnizor?.trim() || '',
    garantie: garantie?.trim() || ''
  };
}

module.exports = {
  calculeazaAlerteExpirare,
  calculeazaUrmatoareaRevizie,
  verificaNecesitateRevizie,
  calculeazaCostMediuPerKm,
  estimeazaUrmatoareaRevizie,
  construiesteFiltruVehicule,
  proceseazaInformatiiVehicul,
  valideazaReparatie
};