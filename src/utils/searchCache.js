// ============================================================================
// SEARCH CACHE UTILITY - IndexedDB Version
// Provides persistent caching with TTL and stale-while-revalidate pattern
// ============================================================================

const DB_NAME = 'viaggio_cache';
const DB_VERSION = 1;
const STORE_NAME = 'searches';

// Cache durations
const CACHE_TTL = 15 * 60 * 1000;      // 15 minutes - data is "fresh"
const STALE_TTL = 60 * 60 * 1000;      // 1 hour - data is "stale but usable"
const EXPIRE_TTL = 24 * 60 * 60 * 1000; // 24 hours - delete

// Memory cache for instant access (L1)
const memoryCache = new Map();
const MAX_MEMORY_ENTRIES = 50;

// IndexedDB instance
let db = null;
let dbReady = null;

// ============================================================================
// INDEXEDDB INITIALIZATION
// ============================================================================

function initDB() {
  if (dbReady) return dbReady;

  dbReady = new Promise((resolve) => {
    if (!window.indexedDB) {
      console.warn('IndexedDB not available, using memory-only cache');
      resolve(null);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      resolve(null);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('📦 IndexedDB stores created');
      console.log('📦 IndexedDB cache initialized');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'cacheKey' });
        store.createIndex('destination', 'destination', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });

  return dbReady;
}

// Initialize on load
initDB();

// ============================================================================
// CACHE KEY GENERATION
// ============================================================================

function generateCacheKey(destination, options = {}) {
  const parts = [
    destination?.toLowerCase().trim(),
    options.destinationId,
    options.sortBy || 'popular',
    options.searchTerms
  ].filter(Boolean);
  return parts.join('_');
}

// ============================================================================
// MEMORY CACHE (L1 - Instant)
// ============================================================================

function getFromMemory(key) {
  const entry = memoryCache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age >= EXPIRE_TTL) {
    memoryCache.delete(key);
    return null;
  }

  return {
    data: entry.data,
    isFresh: age < CACHE_TTL,
    isStale: age >= CACHE_TTL && age < STALE_TTL,
    age
  };
}

function setInMemory(key, data, timestamp = Date.now()) {
  // LRU eviction
  if (memoryCache.size >= MAX_MEMORY_ENTRIES) {
    const firstKey = memoryCache.keys().next().value;
    memoryCache.delete(firstKey);
  }
  memoryCache.set(key, { data, timestamp });
}

// ============================================================================
// INDEXEDDB CACHE (L2 - Persistent)
// ============================================================================

async function getFromIDB(key) {
  await initDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result;
        if (!entry) {
          resolve(null);
          return;
        }

        const age = Date.now() - entry.timestamp;
        if (age >= EXPIRE_TTL) {
          // Async cleanup
          deleteFromIDB(key);
          resolve(null);
          return;
        }

        resolve({
          data: entry.data,
          isFresh: age < CACHE_TTL,
          isStale: age >= CACHE_TTL && age < STALE_TTL,
          age
        });
      };

      request.onerror = () => resolve(null);
    } catch (e) {
      console.warn('IDB read error:', e);
      resolve(null);
    }
  });
}

async function setInIDB(key, data, destination, options = {}) {
  await initDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const entry = {
        cacheKey: key,
        data,
        destination: destination?.toLowerCase().trim(),
        options,
        timestamp: Date.now()
      };

      const request = store.put(entry);
      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.warn('IDB write error:', request.error);
        resolve(false);
      };
    } catch (e) {
      console.warn('IDB transaction error:', e);
      resolve(false);
    }
  });
}

async function deleteFromIDB(key) {
  await initDB();
  if (!db) return;

  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(key);
  } catch (e) {
    console.warn('IDB delete error:', e);
  }
}

// ============================================================================
// PUBLIC API - Same interface as before
// ============================================================================

/**
 * Get cached search results
 * @returns {Object} { data, isFresh, isStale } or null if not cached
 */
export async function getCachedSearch(destination, options = {}) {
  const key = generateCacheKey(destination, options);

  // L1: Check memory first (instant)
  const memoryResult = getFromMemory(key);
  if (memoryResult) {
    console.log(`⚡ Memory cache hit for "${destination}"`);
    return memoryResult;
  }

  // L2: Check IndexedDB
  const idbResult = await getFromIDB(key);
  if (idbResult) {
    console.log(`💾 IndexedDB cache ${idbResult.isFresh ? 'hit' : 'stale'} for "${destination}"`);
    // Promote to memory
    setInMemory(key, idbResult.data, Date.now() - idbResult.age);
    return idbResult;
  }

  console.log(`❌ Cache miss for "${destination}"`);
  return null;
}

/**
 * Store search results in cache
 */
export async function setCachedSearch(destination, options = {}, data) {
  const key = generateCacheKey(destination, options);
  const timestamp = Date.now();

  // Store in both layers
  setInMemory(key, data, timestamp);
  await setInIDB(key, data, destination, options);

  console.log(`📦 Cached search for "${destination}" (${data.tours?.length || 0} tours)`);
}

/**
 * Pre-warm cache for a destination (background fetch)
 */
export async function prewarmDestination(backendUrl, destination, destinationId = null) {
  const key = generateCacheKey(destination, { destinationId });

  // Check memory first
  const memoryResult = getFromMemory(key);
  if (memoryResult && !memoryResult.isStale) {
    console.log(`⏭️ Skip prewarm "${destination}" - already cached`);
    return memoryResult.data;
  }

  // Check IDB
  const idbResult = await getFromIDB(key);
  if (idbResult && !idbResult.isStale) {
    console.log(`⏭️ Skip prewarm "${destination}" - already in IndexedDB`);
    return idbResult.data;
  }

  try {
    console.log(`🔥 Pre-warming cache for "${destination}"...`);

    const response = await fetch(`${backendUrl}/api/tours/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination,
        destinationId,
        resultCount: 100,
        sortBy: 'popular'
        // NO DATES - ensures we get results
      })
    });

    if (!response.ok) throw new Error('Prewarm fetch failed');

    const data = await response.json();
    await setCachedSearch(destination, { destinationId }, data);

    console.log(`✅ Pre-warmed "${destination}" (${data.tours?.length || 0} tours)`);
    return data;
  } catch (error) {
    console.warn(`❌ Prewarm failed for "${destination}":`, error.message);
    return null;
  }
}

/**
 * Pre-warm multiple destinations in parallel (with staggering)
 */
export async function prewarmDestinations(backendUrl, destinations) {
  console.log(`🔥 Pre-warming cache for ${destinations.length} destinations...`);

  for (let i = 0; i < destinations.length; i++) {
    const dest = destinations[i];
    await prewarmDestination(backendUrl, dest.name, dest.destinationId);

    // Small delay between requests
    if (i < destinations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  console.log(`🏁 Pre-warm complete for ${destinations.length} destinations`);
}

/**
 * Clear all cached searches
 */
export async function clearSearchCache() {
  memoryCache.clear();

  await initDB();
  if (db) {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
    } catch (e) {
      console.warn('Failed to clear IDB:', e);
    }
  }

  console.log('🗑️ Search cache cleared');
}

/**
 * Get cache stats for debugging
 */
export async function getCacheStats() {
  await initDB();

  const stats = {
    memoryEntries: memoryCache.size,
    idbAvailable: !!db,
    idbEntries: 0
  };

  if (db) {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const countRequest = store.count();

      await new Promise((resolve) => {
        countRequest.onsuccess = () => {
          stats.idbEntries = countRequest.result;
          resolve();
        };
        countRequest.onerror = () => resolve();
      });
    } catch (e) {
      console.warn('Failed to get IDB stats:', e);
    }
  }

  return stats;
}

// Expose for debugging
if (typeof window !== 'undefined') {
  window.viaggioCache = {
    stats: getCacheStats,
    clear: clearSearchCache,
    memory: memoryCache
  };
}
