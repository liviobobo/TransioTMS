// Cache simplu în memorie pentru a îmbunătăți performanța
class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  // Setează o valoare în cache cu TTL opțional (în milisecunde)
  set(key, value, ttl = 60000) { // Default 1 minut
    // Curăță timer-ul existent dacă există
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Setează valoarea în cache
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });

    // Setează timer pentru expirare
    if (ttl > 0) {
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl);
      this.timers.set(key, timer);
    }
  }

  // Obține o valoare din cache
  get(key) {
    const item = this.cache.get(key);
    if (item) {
      return item.value;
    }
    return null;
  }

  // Verifică dacă o cheie există în cache
  has(key) {
    return this.cache.has(key);
  }

  // Șterge o cheie din cache
  delete(key) {
    // Curăță timer-ul
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    // Șterge din cache
    return this.cache.delete(key);
  }

  // Curăță tot cache-ul
  clear() {
    // Curăță toate timer-ele
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.cache.clear();
  }

  // Obține dimensiunea cache-ului
  size() {
    return this.cache.size;
  }

  // Curăță intrările expirate manual
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      // Păstrează doar intrările din ultima oră
      if (now - item.timestamp > 3600000) {
        this.delete(key);
      }
    }
  }
}

// Cache-uri specifice pentru diferite tipuri de date
const cacheInstances = {
  curse: new SimpleCache(),
  soferi: new SimpleCache(),
  vehicule: new SimpleCache(),
  parteneri: new SimpleCache(),
  facturi: new SimpleCache(),
  general: new SimpleCache()
};

// Curățare periodică a cache-ului (la fiecare 10 minute)
setInterval(() => {
  Object.values(cacheInstances).forEach(cache => cache.cleanup());
}, 600000);

module.exports = {
  SimpleCache,
  cacheInstances
};