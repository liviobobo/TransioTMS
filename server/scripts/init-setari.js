const mongoose = require('mongoose');
require('dotenv').config();

// Import modelul Setari
const Setari = require('../models/Setari');

async function initializeSetari() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/transio');
    console.log('✅ Connected to MongoDB');

    // Verifică dacă setările pentru facturi există
    const setariFacturi = await Setari.findOne({ tip: 'facturi' });
    
    if (!setariFacturi) {
      console.log('🏗️  Creating default setari facturi...');
      await Setari.create({
        tip: 'facturi',
        data: {
          serie: 'TR',
          numarCurent: 1
        }
      });
      console.log('✅ Setari facturi created successfully');
    } else {
      console.log('✅ Setari facturi already exist:', setariFacturi.data);
    }

    // Verifică dacă setările pentru firmă există
    const setariFirma = await Setari.findOne({ tip: 'firma' });
    
    if (!setariFirma) {
      console.log('🏗️  Creating default setari firma...');
      await Setari.create({
        tip: 'firma',
        data: {
          numeFirma: '',
          cui: '',
          adresaCompleta: '',
          telefon: '',
          email: '',
          bancaNumeComplet: '',
          iban: '',
          reprezentantLegal: ''
        }
      });
      console.log('✅ Setari firma created successfully');
    } else {
      console.log('✅ Setari firma already exist');
    }

    console.log('🎉 Initialization complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during initialization:', error);
    process.exit(1);
  }
}

initializeSetari();