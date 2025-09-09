export const EU_COUNTRIES = [
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgia' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croația' },
  { code: 'CY', name: 'Cipru' },
  { code: 'CZ', name: 'Cehia' },
  { code: 'DK', name: 'Danemarca' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finlanda' },
  { code: 'FR', name: 'Franța' },
  { code: 'DE', name: 'Germania' },
  { code: 'GR', name: 'Grecia' },
  { code: 'HU', name: 'Ungaria' },
  { code: 'IE', name: 'Irlanda' },
  { code: 'IT', name: 'Italia' },
  { code: 'LV', name: 'Letonia' },
  { code: 'LT', name: 'Lituania' },
  { code: 'LU', name: 'Luxemburg' },
  { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Olanda' },
  { code: 'PL', name: 'Polonia' },
  { code: 'PT', name: 'Portugalia' },
  { code: 'RO', name: 'România' },
  { code: 'SK', name: 'Slovacia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ES', name: 'Spania' },
  { code: 'SE', name: 'Suedia' },
  // Țări non-UE dar relevante pentru transport
  { code: 'GB', name: 'Marea Britanie' },
  { code: 'CH', name: 'Elveția' },
  { code: 'NO', name: 'Norvegia' },
  { code: 'RS', name: 'Serbia' },
  { code: 'TR', name: 'Turcia' },
  { code: 'UA', name: 'Ucraina' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MK', name: 'Macedonia de Nord' },
  { code: 'AL', name: 'Albania' },
  { code: 'BA', name: 'Bosnia și Herțegovina' },
  { code: 'ME', name: 'Muntenegru' },
  { code: 'XK', name: 'Kosovo' }
].sort((a, b) => a.name.localeCompare(b.name, 'ro'));

// Configurare aplicație centralizată
export const APP_CONFIG = {
  // URLs și API
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || (
    typeof window !== 'undefined' 
      ? window.location.hostname === 'localhost'
        ? 'http://localhost:8001/api'
        : '/api'
      : 'http://localhost:8001/api'
  ),
  
  // Ports (definite în instructiuni.md)
  PORTS: {
    LOCAL: {
      FRONTEND: 3001,
      BACKEND: 8001
    },
    PRODUCTION: {
      FRONTEND: 3001,
      BACKEND: 3000
    }
  },
  
  // Limites și configurări
  FILE_UPLOAD: {
    MAX_SIZE: 30 * 1024 * 1024, // 30MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
  },
  
  // Timeout-uri
  TIMEOUTS: {
    API_REQUEST: 10000, // 10 secunde
    FILE_UPLOAD: 30000, // 30 secunde
    BACKUP_OPERATION: 60000 // 1 minut
  },
  
  // Rate limiting configurări
  RATE_LIMITS: {
    GENERAL: { windowMs: 15 * 60 * 1000, max: 100 },
    AUTH: { windowMs: 15 * 60 * 1000, max: 10 },
    ADMIN: { windowMs: 15 * 60 * 1000, max: 5 },
    DATA_MODIFICATION: { windowMs: 1 * 60 * 1000, max: 20 },
    BACKUP: { windowMs: 60 * 60 * 1000, max: 3 }
  },
  
  // Informații companie centralizate
  COMPANY: {
    NAME: 'Your Company Name',
    SHORT_NAME: 'Company',
    CREATOR: 'Your Name',
    DOMAIN: 'your-domain.com',
    DESCRIPTION: 'Transport Management System'
  },
  
  // Configurări aplicație
  DEFAULT_PORT: 3001,
  PAGINATION_SIZE: 10,
  MIN_KM_INTERVAL: 1000, // km minim pentru revizie vehicul
  MONITORING_MEMORY_LIMIT: 400, // MB
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000 // 24 hours
};

export const VEHICLE_STATUS = [
  'Activ',
  'În Service',
  'Inactiv'
];

export const DRIVER_STATUS = [
  'Activ',
  'În Cursă',
  'Inactiv'
];

export const PARTNER_STATUS = [
  'Activ',
  'Inactiv', 
  'Suspendat',
  'Blacklist'
];

export const BURSE_SURSA = [
  { value: 'timocom', label: 'Timocom' },
  { value: 'trans', label: 'Trans.eu' },
  { value: 'teleroute', label: 'Teleroute' },
  { value: 'direct', label: 'Client Direct' },
  { value: 'recomandare', label: 'Recomandare' },
  { value: 'altele', label: 'Altele' }
];

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Timeouts și Delays (in milliseconds)
export const TIMEOUTS = {
  API_REQUEST: 5000,
  TOAST_DURATION: 4000,
  DEBOUNCE_SEARCH: 300,
  RETRY_DELAY: 1000,
  MONITORING_INTERVAL: 60000
} as const;

