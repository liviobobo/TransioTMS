#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Running post-build script...');

// Verifică dacă directorul .next există
const nextDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(nextDir)) {
  console.error('❌ Directorul .next nu există! Rulați npm run build mai întâi.');
  process.exit(1);
}

// Verifică structura build-ului
const staticDir = path.join(nextDir, 'static');
if (!fs.existsSync(staticDir)) {
  console.error('❌ Directorul .next/static nu există! Build-ul pare incomplet.');
  process.exit(1);
}

// Listează fișierele statice pentru verificare
const chunks = fs.readdirSync(path.join(staticDir, 'chunks')).length;
console.log(`✅ Build verificat: ${chunks} chunk-uri găsite în .next/static/chunks`);

// Verifică dacă există pagina soferi și vehicule în build
const pagesDir = path.join(nextDir, 'server', 'pages');
if (fs.existsSync(pagesDir)) {
  const pages = fs.readdirSync(pagesDir);
  const hasSoferi = pages.some(p => p.includes('soferi'));
  const hasVehicule = pages.some(p => p.includes('vehicule'));
  
  if (!hasSoferi || !hasVehicule) {
    console.warn('⚠️ Paginile soferi sau vehicule lipsesc din build!');
  } else {
    console.log('✅ Paginile soferi și vehicule sunt incluse în build');
  }
}

console.log('✅ Post-build script completat cu succes!');