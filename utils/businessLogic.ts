/**
 * Business Logic Module - Centralizarea calculelor și logicii de business
 * Separat de componente UI pentru o mai bună organizare și reutilizare
 */

// ========== CALCULE FINANCIARE ==========

export const CalculeFinanciare = {
  /**
   * Calculează TVA pentru o sumă dată
   */
  calculeazaTVA: (suma: number, procentTVA: number = 19): { sumaBaza: number; tva: number; total: number } => {
    const tva = suma * (procentTVA / 100);
    return {
      sumaBaza: suma,
      tva: parseFloat(tva.toFixed(2)),
      total: parseFloat((suma + tva).toFixed(2))
    };
  },

  /**
   * Calculează suma din preț cu TVA inclus
   */
  extrageSumaDinPretCuTVA: (pretCuTVA: number, procentTVA: number = 19): { sumaBaza: number; tva: number } => {
    const sumaBaza = pretCuTVA / (1 + procentTVA / 100);
    const tva = pretCuTVA - sumaBaza;
    return {
      sumaBaza: parseFloat(sumaBaza.toFixed(2)),
      tva: parseFloat(tva.toFixed(2))
    };
  },

  /**
   * Calculează comision pentru parteneri
   */
  calculeazaComision: (suma: number, procentComision: number): number => {
    return parseFloat((suma * (procentComision / 100)).toFixed(2));
  },

  /**
   * Calculează profit net (venit - costuri)
   */
  calculeazaProfitNet: (venit: number, costuri: number[]): number => {
    const totalCosturi = costuri.reduce((sum, cost) => sum + cost, 0);
    return parseFloat((venit - totalCosturi).toFixed(2));
  },

  /**
   * Formatează sumă în format monetar
   */
  formateazaSuma: (suma: number, moneda: string = 'EUR'): string => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: moneda
    }).format(suma);
  }
};

// ========== CALCULE TARIFE TRANSPORT ==========

export const CalculeTarife = {
  /**
   * Calculează tarif pe km
   */
  calculeazaTarifPerKm: (distanta: number, costTotal: number): number => {
    if (distanta <= 0) return 0;
    return parseFloat((costTotal / distanta).toFixed(2));
  },

  /**
   * Calculează cost transport pe baza tarifului și distanței
   */
  calculeazaCostTransport: (distanta: number, tarifPerKm: number, taxeAditionale: number = 0): number => {
    const costBaza = distanta * tarifPerKm;
    return parseFloat((costBaza + taxeAditionale).toFixed(2));
  },

  /**
   * Calculează cost combustibil
   */
  calculeazaCostCombustibil: (distanta: number, consum: number, pretCombustibil: number): number => {
    const litriNecesari = (distanta / 100) * consum;
    return parseFloat((litriNecesari * pretCombustibil).toFixed(2));
  },

  /**
   * Estimează timpul de transport
   */
  estimeazaTimpTransport: (distanta: number, vitezaMedie: number = 70): { ore: number; minute: number } => {
    const timpTotal = distanta / vitezaMedie;
    const ore = Math.floor(timpTotal);
    const minute = Math.round((timpTotal - ore) * 60);
    return { ore, minute };
  }
};

// ========== CALCULE VEHICULE ==========

export const CalculeVehicule = {
  /**
   * Verifică dacă vehiculul necesită revizie
   */
  necesitaRevizie: (kmActuali: number, kmUltimaRevizie: number, intervalRevizie: number = 15000): boolean => {
    return (kmActuali - kmUltimaRevizie) >= intervalRevizie;
  },

  /**
   * Calculează km până la următoarea revizie
   */
  kmPanaLaRevizie: (kmActuali: number, kmUltimaRevizie: number, intervalRevizie: number = 15000): number => {
    const kmParcursi = kmActuali - kmUltimaRevizie;
    return Math.max(0, intervalRevizie - kmParcursi);
  },

  /**
   * Verifică expirări documente
   */
  verificaExpirari: (dataExpirare: Date): { expirat: boolean; zileRamase: number } => {
    const azi = new Date();
    const diferenta = dataExpirare.getTime() - azi.getTime();
    const zileRamase = Math.ceil(diferenta / (1000 * 60 * 60 * 24));
    
    return {
      expirat: zileRamase <= 0,
      zileRamase
    };
  },

  /**
   * Calculează cost mediu pe km pentru vehicul
   */
  calculeazaCostMediuPerKm: (costTotalReparatii: number, kmParcursi: number): number => {
    if (kmParcursi <= 0) return 0;
    return parseFloat((costTotalReparatii / kmParcursi).toFixed(3));
  }
};

// ========== CALCULE ȘOFERI ==========

export const CalculeSoferi = {
  /**
   * Calculează salariu total (fix + variabil)
   */
  calculeazaSalariuTotal: (
    salariuFix: number, 
    procentDinCurse: number, 
    venitCurse: number,
    bonusuri: number = 0
  ): number => {
    const salariuVariabil = (venitCurse * procentDinCurse) / 100;
    return parseFloat((salariuFix + salariuVariabil + bonusuri).toFixed(2));
  },

  /**
   * Calculează ore lucrate
   */
  calculeazaOreLucrate: (oraStart: Date, oraStop: Date, pauze: number = 0): number => {
    const diferentaMs = oraStop.getTime() - oraStart.getTime();
    const oreTotale = diferentaMs / (1000 * 60 * 60);
    return Math.max(0, oreTotale - pauze);
  },

  /**
   * Verifică dacă șoferul a depășit limita de ore
   */
  verificaLimitaOre: (oreLucrate: number, limitaZilnica: number = 9): boolean => {
    return oreLucrate > limitaZilnica;
  },

  /**
   * Calculează bonus performanță
   */
  calculeazaBonusPerformanta: (
    nrCurse: number, 
    targetCurse: number, 
    bonusPerCursaExtra: number
  ): number => {
    const curseExtra = Math.max(0, nrCurse - targetCurse);
    return curseExtra * bonusPerCursaExtra;
  }
};

// ========== CALCULE FACTURI ==========

export const CalculeFacturi = {
  /**
   * Calculează zile până la scadență
   */
  calculeazaZileScadenta: (dataScadenta: Date): number => {
    const azi = new Date();
    azi.setHours(0, 0, 0, 0);
    dataScadenta.setHours(0, 0, 0, 0);
    
    const diferenta = dataScadenta.getTime() - azi.getTime();
    return Math.ceil(diferenta / (1000 * 60 * 60 * 24));
  },

  /**
   * Verifică dacă factura este întârziată
   */
  esteIntarziata: (dataScadenta: Date, status: string): boolean => {
    if (status === 'platita' || status === 'anulata') return false;
    const zileRamase = CalculeFacturi.calculeazaZileScadenta(dataScadenta);
    return zileRamase < 0;
  },

  /**
   * Calculează penalizări întârziere
   */
  calculeazaPenalizari: (
    sumaFactura: number, 
    zileIntarziere: number, 
    procentPenalizareZi: number = 0.1
  ): number => {
    if (zileIntarziere <= 0) return 0;
    const penalizare = sumaFactura * (procentPenalizareZi / 100) * zileIntarziere;
    return parseFloat(penalizare.toFixed(2));
  },

  /**
   * Calculează total de încasat
   */
  calculeazaTotalDeIncasat: (facturi: any[]): { total: number; platit: number; restant: number } => {
    const total = facturi.reduce((sum, f) => sum + f.suma, 0);
    const platit = facturi
      .filter(f => f.status === 'platita')
      .reduce((sum, f) => sum + f.suma, 0);
    
    return {
      total: parseFloat(total.toFixed(2)),
      platit: parseFloat(platit.toFixed(2)),
      restant: parseFloat((total - platit).toFixed(2))
    };
  }
};

// ========== VALIDĂRI BUSINESS ==========

export const Validari = {
  /**
   * Validează CUI (Cod Unic de Înregistrare)
   */
  valideazaCUI: (cui: string): boolean => {
    // Elimină spații și caractere non-numerice
    const cuiCurat = cui.replace(/\D/g, '');
    
    // CUI trebuie să aibă între 2 și 10 cifre
    if (cuiCurat.length < 2 || cuiCurat.length > 10) {
      return false;
    }
    
    // Algoritmul de validare CUI românesc
    const cheie = '753217532';
    let suma = 0;
    
    for (let i = 0; i < cuiCurat.length - 1; i++) {
      suma += parseInt(cuiCurat[i]) * parseInt(cheie[i]);
    }
    
    const rest = suma % 11;
    const cifraControl = rest === 10 ? 0 : rest;
    
    return cifraControl === parseInt(cuiCurat[cuiCurat.length - 1]);
  },

  /**
   * Validează CNP
   */
  valideazaCNP: (cnp: string): boolean => {
    if (!/^\d{13}$/.test(cnp)) return false;
    
    const constanta = '279146358279';
    let suma = 0;
    
    for (let i = 0; i < 12; i++) {
      suma += parseInt(cnp[i]) * parseInt(constanta[i]);
    }
    
    const rest = suma % 11;
    const cifraControl = rest === 10 ? 1 : rest;
    
    return cifraControl === parseInt(cnp[12]);
  },

  /**
   * Validează IBAN
   */
  valideazaIBAN: (iban: string): boolean => {
    const ibanCurat = iban.replace(/\s/g, '').toUpperCase();
    
    // Verifică lungimea pentru IBAN românesc
    if (!ibanCurat.startsWith('RO') || ibanCurat.length !== 24) {
      return false;
    }
    
    // Mută primele 4 caractere la sfârșit
    const rearranged = ibanCurat.substring(4) + ibanCurat.substring(0, 4);
    
    // Convertește literele în numere
    const numeric = rearranged.replace(/[A-Z]/g, (char) => {
      return (char.charCodeAt(0) - 55).toString();
    });
    
    // Verifică mod 97
    let remainder = '';
    for (let i = 0; i < numeric.length; i++) {
      remainder = (parseInt(remainder + numeric[i]) % 97).toString();
    }
    
    return remainder === '1';
  },

  /**
   * Validează număr de înmatriculare
   */
  valideazaNumarInmatriculare: (numar: string): boolean => {
    // Format: XX 00 XXX sau B 000 XXX
    const pattern = /^[A-Z]{1,2}\s?\d{2,3}\s?[A-Z]{3}$/;
    return pattern.test(numar.toUpperCase().replace(/\s+/g, ' ').trim());
  }
};

// ========== CONVERSII ȘI FORMATĂRI ==========

export const Formatari = {
  /**
   * Formatează distanța
   */
  formateazaDistanta: (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toLocaleString('ro-RO')} km`;
  },

  /**
   * Formatează greutate
   */
  formateazaGreutate: (kg: number): string => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(2)} t`;
    }
    return `${kg} kg`;
  },

  /**
   * Formatează durata
   */
  formateazaDurata: (ore: number): string => {
    const zile = Math.floor(ore / 24);
    const oreRamase = ore % 24;
    
    if (zile > 0) {
      return `${zile}z ${oreRamase}h`;
    }
    return `${ore}h`;
  },

  /**
   * Formatează număr telefon
   */
  formateazaTelefon: (telefon: string): string => {
    const cleaned = telefon.replace(/\D/g, '');
    
    if (cleaned.startsWith('40') && cleaned.length === 11) {
      // Format: +40 7XX XXX XXX
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    
    if (cleaned.startsWith('07') && cleaned.length === 10) {
      // Format: 07XX XXX XXX
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    
    return telefon;
  }
};

// ========== STATISTICI ȘI AGREGĂRI ==========

export const Statistici = {
  /**
   * Calculează medie
   */
  calculeazaMedie: (valori: number[]): number => {
    if (valori.length === 0) return 0;
    const suma = valori.reduce((acc, val) => acc + val, 0);
    return parseFloat((suma / valori.length).toFixed(2));
  },

  /**
   * Calculează mediană
   */
  calculeazaMediana: (valori: number[]): number => {
    if (valori.length === 0) return 0;
    
    const sorted = [...valori].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
  },

  /**
   * Calculează procent
   */
  calculeazaProcent: (parte: number, total: number): number => {
    if (total === 0) return 0;
    return parseFloat(((parte / total) * 100).toFixed(2));
  },

  /**
   * Calculează rata de creștere
   */
  calculeazaRataCrestere: (valoareVeche: number, valoareNoua: number): number => {
    if (valoareVeche === 0) return valoareNoua > 0 ? 100 : 0;
    return parseFloat((((valoareNoua - valoareVeche) / valoareVeche) * 100).toFixed(2));
  }
};

// ========== HELPERS PENTRU DATE ==========

export const DateHelpers = {
  /**
   * Adaugă zile la o dată
   */
  adaugaZile: (data: Date, zile: number): Date => {
    const rezultat = new Date(data);
    rezultat.setDate(rezultat.getDate() + zile);
    return rezultat;
  },

  /**
   * Calculează diferența în zile
   */
  diferentaZile: (data1: Date, data2: Date): number => {
    const diferenta = Math.abs(data2.getTime() - data1.getTime());
    return Math.ceil(diferenta / (1000 * 60 * 60 * 24));
  },

  /**
   * Verifică dacă data este în trecut
   */
  esteInTrecut: (data: Date): boolean => {
    return data < new Date();
  },

  /**
   * Formatează dată pentru input
   */
  formateazaPentruInput: (data: Date): string => {
    return data.toISOString().split('T')[0];
  },

  /**
   * Obține prima și ultima zi din lună
   */
  limiteLuna: (data: Date): { prima: Date; ultima: Date } => {
    const prima = new Date(data.getFullYear(), data.getMonth(), 1);
    const ultima = new Date(data.getFullYear(), data.getMonth() + 1, 0);
    return { prima, ultima };
  }
};

export default {
  CalculeFinanciare,
  CalculeTarife,
  CalculeVehicule,
  CalculeSoferi,
  CalculeFacturi,
  Validari,
  Formatari,
  Statistici,
  DateHelpers
};