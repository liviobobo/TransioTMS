const Setari = require('../models/Setari');

// Cache în memorie pentru performanță
let setariFacturiCache = null;

// Funcții helper interne pentru accesul din alte module (ex: Factura model)
const getSetariFacturiInternal = async () => {
  try {
    let setariFacturi = setariFacturiCache;

    if (!setariFacturi) {
      // Încarcă din baza de date folosind modelul Setari
      setariFacturi = await Setari.getSetari('facturi');

      if (!setariFacturi) {
        // Setări implicite
        setariFacturi = {
          serie: 'TR',
          numarCurent: 2
        };

        // Salvează setările implicite în baza de date
        await Setari.saveSetari('facturi', setariFacturi);
      }

      setariFacturiCache = setariFacturi;
    }

    return setariFacturi;
  } catch (error) {
    console.error('Eroare la obținerea setărilor facturi (internal):', error);
    // Returnează setările implicite în caz de eroare
    return {
      serie: 'TR',
      numarCurent: 1
    };
  }
};

const saveSetariFacturiInternal = async (noileSetari) => {
  try {
    // Salvează în baza de date folosind modelul Setari
    const setariSalvate = await Setari.saveSetari('facturi', noileSetari);

    // Actualizează cache-ul
    setariFacturiCache = setariSalvate;

    return setariSalvate;
  } catch (error) {
    console.error('Eroare la salvarea setărilor facturi (internal):', error);
    throw error;
  }
};

module.exports = {
  getSetariFacturiInternal,
  saveSetariFacturiInternal
};