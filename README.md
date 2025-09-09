# Transio - Sistem de Management Transport

Un sistem complet open-source de management pentru transporturi (TMS) construit cu tehnologii web moderne. Proiectat special pentru companiile de transport europene, cu accent pe bursele de marfă precum Timocom.

## 🚀 Funcționalități

### Module de Bază
- **Dashboard**: Vizualizare în timp real cu rezumate agregate și alerte proactive
- **Gestionare Curse**: Management complet al ciclului de viață al comenzilor de la ofertă la plată
- **Management Șoferi**: Date personale, documente, urmărire plăți, alerte expirări
- **Management Vehicule**: Urmărire întreținere, monitorizare kilometraj, istoric reparații
- **Management Parteneri**: Bază de date companii/clienți, istoric comenzi, contracte
- **Facturare**: Generare facturi, urmărire, export PDF
- **Rapoarte**: Sistem complet de raportare cu export CSV/Excel
- **Setări**: Management utilizatori, configurare sistem, backup/restore

### Funcționalități Tehnice
- 🔐 Autentificare JWT cu management de roluri
- 📱 Progressive Web App (PWA) cu suport offline
- 🌐 Arhitectură API RESTful
- 📊 Agregare date și raportare în timp real
- 📄 Generare PDF pentru facturi și documente
- 🔄 Sistem automat de backup
- 📈 Monitorizare performanță
- 🛡️ Conformitate securitate OWASP

## 🛠️ Stack Tehnologic

### Frontend
- **Framework**: Next.js 14 cu React 18
- **Limbaj**: TypeScript
- **Stilizare**: Tailwind CSS
- **Management State**: React Context + Hooks
- **Formulare**: React Hook Form
- **Componente UI**: Componente custom cu iconuri Lucide

### Backend
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Bază de Date**: MongoDB cu Mongoose ODM
- **Autentificare**: JWT cu bcrypt
- **Securitate**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Validare**: Joi

### Infrastructură
- **Manager Procese**: PM2
- **Server Web**: Apache/Nginx (reverse proxy)
- **SSL**: Compatibil Let's Encrypt

## 📋 Cerințe Preliminare

- Node.js 20.0.0 sau mai nou
- MongoDB 6.0 sau mai nou
- npm sau yarn package manager
- PM2 (pentru deployment în producție)

## 🚀 Pornire Rapidă

### 1. Clonează repository-ul
```bash
git clone https://github.com/yourusername/transio.git
cd transio
```

### 2. Instalează dependențele
```bash
# Instalează dependențele frontend
npm install

# Instalează dependențele backend
cd server
npm install
cd ..
```

### 3. Configurează variabilele de mediu

Creează fișiere `.env` atât în directorul rădăcină cât și în directorul server:

**`.env` în rădăcină:**
```env
NODE_ENV=development
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

**`.env` în server:**
```env
NODE_ENV=development
PORT=8001
MONGODB_URI=mongodb://localhost:27017/transio
JWT_SECRET=schimba-aceasta-cheie-secreta-in-productie
APP_URL=http://localhost:3001
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=email@example.com
SMTP_PASS=parola-email
```

### 4. Inițializează baza de date
```bash
# Asigură-te că MongoDB rulează
mongod

# Aplicația va crea colecțiile automat la prima rulare
```

### 5. Pornește serverele de dezvoltare
```bash
# Într-un terminal - Frontend
npm run dev

# În alt terminal - Backend
cd server
npm run dev
```

Aplicația va fi disponibilă la:
- Frontend: http://localhost:3001
- Backend API: http://localhost:8001

### 6. Creează utilizatorul admin inițial

Folosește endpoint-ul de înregistrare sau MongoDB direct pentru a crea primul utilizator admin.

## 🏗️ Structura Proiectului

```
transio/
├── components/          # Componente React
│   ├── curso/          # Componente pentru curse
│   ├── sofer/          # Componente pentru șoferi
│   ├── vehicul/        # Componente pentru vehicule
│   └── ...
├── pages/              # Pagini Next.js
│   ├── api/           # Rute API (dacă există)
│   ├── curse/         # Pagini curse
│   ├── soferi/        # Pagini șoferi
│   └── ...
├── public/            # Fișiere statice
├── server/            # Aplicație backend
│   ├── models/        # Scheme MongoDB
│   ├── routes/        # Rute Express
│   ├── controllers/   # Controllere rute
│   ├── middleware/    # Middleware personalizat
│   ├── utils/         # Funcții utilitare
│   └── app.js        # Punct de intrare Express
├── styles/           # Stiluri globale
├── utils/            # Utilitare frontend
└── hooks/            # Hook-uri React personalizate
```

## 🚀 Deployment în Producție

### Folosind PM2

1. Construiește frontend-ul:
```bash
npm run build
```

2. Configurează fișierul ecosystem PM2 (deja inclus):
```bash
# Editează ecosystem.config.js cu căile și setările tale
```

3. Pornește cu PM2:
```bash
pm2 start ecosystem.config.js
```

4. Salvează configurația PM2:
```bash
pm2 save
pm2 startup
```

### Folosind Docker (Opțional)

Suport Docker vine în curând.

## 🔧 Configurare

### Configurare Bază de Date
- String de conexiune MongoDB în `MONGODB_URI`
- Numele bazei de date poate fi schimbat în string-ul de conexiune
- Indexurile sunt create automat

### Configurare Securitate
- Schimbă `JWT_SECRET` cu un string random puternic
- Configurează originile CORS în `server/app.js`
- Setează rate limiting conform nevoilor tale
- Activează HTTPS în producție

### Configurare Email
- Configurează setările SMTP în `.env`
- Template-urile de email sunt în `server/templates/`

## 📚 Documentație API

### Autentificare
```
POST /api/auth/login     - Login utilizator
POST /api/auth/register  - Înregistrare utilizator
POST /api/auth/logout    - Logout utilizator
GET  /api/auth/me       - Obține utilizatorul curent
```

### Resurse
Toate resursele urmează convențiile RESTful:
```
GET    /api/[resursa]      - Listează toate
GET    /api/[resursa]/:id  - Obține una
POST   /api/[resursa]      - Creează nouă
PUT    /api/[resursa]/:id  - Actualizează
DELETE /api/[resursa]/:id  - Șterge
```

Resurse disponibile:
- `/api/curse` - Curse transport
- `/api/soferi` - Șoferi
- `/api/vehicule` - Vehicule
- `/api/parteneri` - Parteneri
- `/api/facturi` - Facturi
- `/api/rapoarte` - Rapoarte
- `/api/setari` - Setări

## 🧪 Testare

```bash
# Rulează testele frontend
npm test

# Rulează testele backend
cd server
npm test
```

## 🤝 Contribuții

Contribuțiile sunt binevenite! Te rugăm să trimiți un Pull Request.

1. Fork-uiește proiectul
2. Creează branch-ul pentru funcționalitate (`git checkout -b feature/FunctionalitateNoua`)
3. Commit-ează schimbările (`git commit -m 'Adaugă funcționalitate nouă'`)
4. Push pe branch (`git push origin feature/FunctionalitateNoua`)
5. Deschide un Pull Request

## 📝 Licență

Acest proiect este licențiat sub Licența MIT - vezi fișierul [LICENSE](LICENSE) pentru detalii.

## 🙏 Mulțumiri

- Construit cu Next.js și Express.js
- Componente UI de la Lucide React
- Stilizat cu Tailwind CSS

## 📞 Suport

Pentru suport, te rugăm să deschizi un issue în repository-ul GitHub.

## 🔒 Securitate

Pentru probleme de securitate, te rugăm să contactezi administratorii repository-ului.

---

Creat cu ❤️ pentru industria de transport