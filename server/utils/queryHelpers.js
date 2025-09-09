// Query helpers pentru optimizarea performanței și reducerea over-fetching

// Selective field definitions for different use cases
const FIELD_SETS = {
  // Pentru liste - doar câmpurile esențiale
  list: {
    sofer: 'nume numarTelefon activ',
    vehicul: 'numarInmatriculare marca model activ',
    partener: 'numeFirma contactPersoana email bursaSursa activ',
    cursa: 'idCursa status pornire costNegociat venitNetCalculat kmEstimati kmReali createdAt soferAsignat vehiculAsignat partenerAsignat'
  },
  
  // Pentru dashboard - statistici esențiale
  dashboard: {
    sofer: 'nume activ',
    vehicul: 'numarInmatriculare activ',
    partener: 'numeFirma activ',
    cursa: 'idCursa status venitNetCalculat kmEstimati createdAt'
  },
  
  // Pentru detalii complete - toate câmpurile importante
  details: {
    sofer: 'nume numarTelefon adresaCompleta permisExpira atestatExpira status activ',
    vehicul: 'numarInmatriculare marca model anFabricatie capacitate kmActuali asigurareExpira itpExpira status activ',
    partener: 'numeFirma contactPersoana telefon email adresaFirma bursaSursa statusPartener ratingPartener activ',
    cursa: null // toate câmpurile pentru detalii
  },
  
  // Pentru formulare - câmpuri necesare pentru dropdown-uri
  form: {
    sofer: 'nume numarTelefon activ',
    vehicul: 'numarInmatriculare marca model activ',
    partener: 'numeFirma contactPersoana telefon activ'
  }
}

/**
 * Creează query cu selective population bazat pe tipul de utilizare
 * @param {Object} query - Mongoose query object
 * @param {string} type - Tipul de utilizare: 'list', 'dashboard', 'details', 'form'
 * @param {Object} options - Opțiuni adiționale
 * @returns {Object} Query optimizat
 */
function withSelectivePopulation(query, type = 'list', options = {}) {
  const fields = FIELD_SETS[type] || FIELD_SETS.list
  
  // Populează doar dacă este specificat în opțiuni sau folosește default
  if (options.includeSofer !== false && fields.sofer) {
    query = query.populate('soferAsignat', fields.sofer)
  }
  
  if (options.includeVehicul !== false && fields.vehicul) {
    query = query.populate('vehiculAsignat', fields.vehicul)
  }
  
  if (options.includePartener !== false && fields.partener) {
    query = query.populate('partenerAsignat', fields.partener)
  }
  
  // Pentru curse, selectează câmpurile specifice dacă sunt definite
  if (fields.cursa) {
    query = query.select(fields.cursa)
  }
  
  return query
}

/**
 * Creează filter pentru paginare cu validare
 * @param {Object} reqQuery - Query parameters din request
 * @returns {Object} Pagination object
 */
function createPaginationFilter(reqQuery) {
  const page = Math.max(1, parseInt(reqQuery.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(reqQuery.limit) || 10))
  const skip = (page - 1) * limit
  
  return { page, limit, skip }
}

/**
 * Creează filter pentru căutare cu sanitizare
 * @param {Object} reqQuery - Query parameters din request
 * @param {Array} searchFields - Câmpurile în care să caute
 * @returns {Object} Search filter object
 */
function createSearchFilter(reqQuery, searchFields = []) {
  const filter = {}
  
  // Status filter
  if (reqQuery.status) {
    if (Array.isArray(reqQuery.status)) {
      filter.status = { $in: reqQuery.status }
    } else {
      filter.status = reqQuery.status
    }
  }
  
  // Active filter pentru entități cu câmpul activ
  if (reqQuery.activ !== undefined) {
    filter.activ = reqQuery.activ === 'true'
  }
  
  // Search în mai multe câmpuri
  if (reqQuery.search && searchFields.length > 0) {
    const searchRegex = { $regex: reqQuery.search, $options: 'i' }
    filter.$or = searchFields.map(field => ({ [field]: searchRegex }))
  }
  
  // Date range filter
  if (reqQuery.dateFrom || reqQuery.dateTo) {
    filter.createdAt = {}
    if (reqQuery.dateFrom) {
      filter.createdAt.$gte = new Date(reqQuery.dateFrom)
    }
    if (reqQuery.dateTo) {
      filter.createdAt.$lte = new Date(reqQuery.dateTo)
    }
  }
  
  return filter
}

/**
 * Formatează răspunsul pentru API cu metadate consistente
 * @param {Array} data - Datele de returnat
 * @param {Object} pagination - Informații paginare
 * @param {number} total - Total număr de records
 * @param {Object} additionalMeta - Metadate adiționale
 * @returns {Object} Formatted response
 */
function formatApiResponse(data, pagination = null, total = null, additionalMeta = {}) {
  const response = {
    success: true,
    data,
    ...(additionalMeta && Object.keys(additionalMeta).length > 0 && { meta: additionalMeta })
  }
  
  if (pagination && total !== null) {
    response.pagination = {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit),
      hasNext: pagination.page < Math.ceil(total / pagination.limit),
      hasPrev: pagination.page > 1
    }
  }
  
  return response
}

/**
 * Middleware pentru cache headers bazat pe tipul de dată
 * @param {string} cacheType - 'static', 'dynamic', 'no-cache'
 * @returns {Function} Express middleware
 */
function setCacheHeaders(cacheType = 'dynamic') {
  return (req, res, next) => {
    switch (cacheType) {
      case 'static':
        // Pentru date care se schimbă rar (setări, liste statice)
        res.set('Cache-Control', 'public, max-age=3600') // 1 oră
        break
      case 'dynamic':
        // Pentru date care se schimbă frecvent (curse, dashboard)
        res.set('Cache-Control', 'private, max-age=300') // 5 minute
        break
      case 'no-cache':
        // Pentru date sensibile sau foarte dinamice
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
        break
    }
    next()
  }
}

/**
 * Agregare optimizată pentru statistici dashboard
 * @param {Object} matchFilter - Filter pentru match stage
 * @returns {Array} Aggregation pipeline
 */
function createDashboardAggregation(matchFilter = {}) {
  return [
    { $match: matchFilter },
    {
      $facet: {
        statusStats: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalRevenue: { $sum: '$venitNetCalculat' },
              totalKm: { $sum: '$kmEstimati' }
            }
          }
        ],
        monthlyStats: [
          {
            $match: {
              createdAt: { 
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
              }
            }
          },
          {
            $group: {
              _id: null,
              totalTrips: { $sum: 1 },
              totalRevenue: { $sum: '$venitNetCalculat' },
              totalCosts: { $sum: '$comisionBursa' },
              avgRevenue: { $avg: '$venitNetCalculat' }
            }
          }
        ],
        recentTrips: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $project: {
              idCursa: 1,
              status: 1,
              pornire: 1,
              'descarcareMultipla.companie': 1,
              venitNetCalculat: 1,
              createdAt: 1
            }
          }
        ]
      }
    }
  ]
}

module.exports = {
  withSelectivePopulation,
  createPaginationFilter,
  createSearchFilter,
  formatApiResponse,
  setCacheHeaders,
  createDashboardAggregation,
  FIELD_SETS
}