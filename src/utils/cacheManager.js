// ============================================================================
// VIAGGIO.AI CACHE MANAGER - Production-Grade Multi-Layer Caching
// ============================================================================
// 
// Architecture:
// ┌─────────────────────────────────────────────────────────────────────────┐
// │  L1: Memory Cache (instant, session-only)                               │
// │  └── React state, Map objects - for current view                        │
// ├─────────────────────────────────────────────────────────────────────────┤
// │  L2: IndexedDB (fast, persistent, 50MB-1GB+)                            │
// │  └── Tour catalogs, search results, user preferences                    │
// ├─────────────────────────────────────────────────────────────────────────┤
// │  L3: Backend Cache (Redis) - handled server-side                        │
// │  └── API responses, shared across all users                             │
// └─────────────────────────────────────────────────────────────────────────┘
//
// Usage:
//   import { cacheManager } from './utils/cacheManager';
//   
//   // Store search results
//   await cacheManager.setTours('Paris', tours, { sortBy: 'popular' });
//   
//   // Retrieve with freshness check
//   const cached = await cacheManager.getTours('Paris', { sortBy: 'popular' });
//   if (cached?.isFresh) { /* use cached.data */ }
//
// ============================================================================

const DB_NAME = 'viaggio_cache';
const DB_VERSION = 1;

// Cache durations
const CACHE_FRESH_MS = 15 * 60 * 1000;    // 15 minutes - considered fresh
const CACHE_STALE_MS = 60 * 60 * 1000;    // 1 hour - serve stale, revalidate
const CACHE_EXPIRE_MS = 24 * 60 * 60 * 1000; // 24 hours - delete

// Store names
const STORES = {
  TOURS: 'tours',
  HOTELS: 'hotels',
  DESTINATIONS: 'destinations',
  METADATA: 'metadata'
};

// ============================================================================
// L1: MEMORY CACHE (Instant access, session-only)
// ============================================================================

class MemoryCache {
  constructor(maxSize = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  set(key, data, ttlMs = CACHE_FRESH_MS) {
    // Enforce max size (LRU eviction)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
      createdAt: Date.now()
    });
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  get size() {
    return this.cache.size;
  }
}

// ============================================================================
// L2: INDEXEDDB CACHE (Persistent, large capacity)
// ============================================================================

class IndexedDBCache {
  constructor() {
    this.db = null;
    this.dbReady = this._initDB();
  }

  async _initDB() {
    return new Promise((resolve, reject) => {
      // Check if IndexedDB is available
      if (!window.indexedDB) {
        console.warn('IndexedDB not available, falling back to memory-only cache');
        resolve(null);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        resolve(null); // Don't reject, just fall back to memory
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('📦 IndexedDB cache initialized');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Tours store - indexed by destination and timestamp
        if (!db.objectStoreNames.contains(STORES.TOURS)) {
          const toursStore = db.createObjectStore(STORES.TOURS, { keyPath: 'cacheKey' });
          toursStore.createIndex('destination', 'destination', { unique: false });
          toursStore.createIndex('timestamp', 'timestamp', { unique: false });
          toursStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }

        // Hotels store
        if (!db.objectStoreNames.contains(STORES.HOTELS)) {
          const hotelsStore = db.createObjectStore(STORES.HOTELS, { keyPath: 'cacheKey' });
          hotelsStore.createIndex('destination', 'destination', { unique: false });
          hotelsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Destinations store (for autocomplete)
        if (!db.objectStoreNames.contains(STORES.DESTINATIONS)) {
          const destStore = db.createObjectStore(STORES.DESTINATIONS, { keyPath: 'provider' });
          destStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Metadata store (cache stats, version info)
        if (!db.objectStoreNames.contains(STORES.METADATA)) {
          db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
        }

        console.log('📦 IndexedDB stores created');
      };
    });
  }

  async _getStore(storeName, mode = 'readonly') {
    await this.dbReady;
    if (!this.db) return null;

    try {
      const tx = this.db.transaction(storeName, mode);
      return tx.objectStore(storeName);
    } catch (e) {
      console.error(`Failed to get store ${storeName}:`, e);
      return null;
    }
  }

  async get(storeName, key) {
    const store = await this._getStore(storeName);
    if (!store) return null;

    return new Promise((resolve) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const entry = request.result;
        if (!entry) {
          resolve(null);
          return;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
          this.delete(storeName, key); // Async cleanup
          resolve(null);
          return;
        }

        // Determine freshness
        const age = Date.now() - entry.timestamp;
        resolve({
          data: entry.data,
          isFresh: age < CACHE_FRESH_MS,
          isStale: age >= CACHE_FRESH_MS && age < CACHE_STALE_MS,
          age,
          timestamp: entry.timestamp
        });
      };
      request.onerror = () => resolve(null);
    });
  }

  async set(storeName, key, data, metadata = {}) {
    const store = await this._getStore(storeName, 'readwrite');
    if (!store) return false;

    return new Promise((resolve) => {
      const entry = {
        cacheKey: key,
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_EXPIRE_MS,
        ...metadata
      };

      const request = store.put(entry);
      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.error('IndexedDB write error:', request.error);
        resolve(false);
      };
    });
  }

  async delete(storeName, key) {
    const store = await this._getStore(storeName, 'readwrite');
    if (!store) return false;

    return new Promise((resolve) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  async clear(storeName) {
    const store = await this._getStore(storeName, 'readwrite');
    if (!store) return false;

    return new Promise((resolve) => {
      const request = store.clear();
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  async getAll(storeName) {
    const store = await this._getStore(storeName);
    if (!store) return [];

    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  // Cleanup expired entries
  async cleanup() {
    await this.dbReady;
    if (!this.db) return;

    const now = Date.now();
    let cleaned = 0;

    for (const storeName of [STORES.TOURS, STORES.HOTELS]) {
      const store = await this._getStore(storeName, 'readwrite');
      if (!store) continue;

      const index = store.index('expiresAt');
      const range = IDBKeyRange.upperBound(now);

      await new Promise((resolve) => {
        const request = index.openCursor(range);
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cleaned++;
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => resolve();
      });
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
    }
  }

  // Get cache statistics
  async getStats() {
    await this.dbReady;
    if (!this.db) return { available: false };

    const stats = {
      available: true,
      stores: {}
    };

    for (const storeName of Object.values(STORES)) {
      const items = await this.getAll(storeName);
      stats.stores[storeName] = {
        count: items.length,
        sizeEstimate: JSON.stringify(items).length
      };
    }

    // Estimate total size
    if (navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate();
      stats.quota = estimate.quota;
      stats.usage = estimate.usage;
      stats.usagePercent = ((estimate.usage / estimate.quota) * 100).toFixed(2) + '%';
    }

    return stats;
  }
}

// ============================================================================
// CACHE MANAGER - Unified API combining L1 + L2
// ============================================================================

class CacheManager {
  constructor() {
    this.memory = new MemoryCache(100); // Keep 100 items in memory
    this.idb = new IndexedDBCache();
    
    // Periodic cleanup
    this._startCleanupInterval();
  }

  _startCleanupInterval() {
    // Cleanup every 10 minutes
    setInterval(() => {
      this.idb.cleanup().catch(console.error);
    }, 10 * 60 * 1000);
  }

  // ============================================================================
  // TOURS CACHE
  // ============================================================================

  _buildToursCacheKey(destination, options = {}) {
    const sortBy = options.sortBy || 'popular';
    const provider = options.provider || 'all';
    // Don't include dates in cache key - we want dateless searches to be reusable
    return `${destination.toLowerCase().trim()}::${sortBy}::${provider}`;
  }

  /**
   * Get cached tours for a destination
   * @returns {Object|null} { data, isFresh, isStale, age } or null
   */
  async getTours(destination, options = {}) {
    const cacheKey = this._buildToursCacheKey(destination, options);

    // L1: Check memory first (instant)
    const memoryResult = this.memory.get(cacheKey);
    if (memoryResult) {
      console.log(`⚡ Memory cache hit for "${destination}"`);
      return { data: memoryResult, isFresh: true, isStale: false, fromMemory: true };
    }

    // L2: Check IndexedDB
    const idbResult = await this.idb.get(STORES.TOURS, cacheKey);
    if (idbResult) {
      console.log(`💾 IndexedDB cache ${idbResult.isFresh ? 'hit' : 'stale'} for "${destination}"`);
      
      // Promote to memory cache for faster subsequent access
      this.memory.set(cacheKey, idbResult.data);
      
      return idbResult;
    }

    console.log(`❌ Cache miss for "${destination}"`);
    return null;
  }

  /**
   * Cache tour search results
   */
  async setTours(destination, tours, options = {}) {
    const cacheKey = this._buildToursCacheKey(destination, options);

    // Slim down tour data to reduce storage
    const slimTours = tours.map(this._slimTourData);

    const cacheData = {
      tours: slimTours,
      totalCount: tours.length,
      cachedAt: Date.now()
    };

    // L1: Store in memory
    this.memory.set(cacheKey, cacheData);

    // L2: Persist to IndexedDB
    await this.idb.set(STORES.TOURS, cacheKey, cacheData, {
      destination: destination.toLowerCase().trim(),
      sortBy: options.sortBy || 'popular',
      provider: options.provider || 'all'
    });

    console.log(`📦 Cached ${slimTours.length} tours for "${destination}"`);
  }

  /**
   * Slim down tour data for efficient storage
   * Only keep fields needed for search results display
   */
  _slimTourData(tour) {
    return {
      id: tour.id,
      productCode: tour.productCode,
      name: tour.name,
      price: tour.price,
      originalPrice: tour.originalPrice,
      currency: tour.currency || 'USD',
      pricingType: tour.pricingType,
      rating: tour.rating,
      reviewCount: tour.reviewCount,
      duration: tour.duration,
      image: tour.image, // Single image only
      hasDiscount: tour.hasDiscount,
      freeCancellation: tour.freeCancellation,
      skipTheLine: tour.skipTheLine,
      privateTour: tour.privateTour,
      likelyToSellOut: tour.likelyToSellOut,
      bookingLink: tour.bookingLink,
      provider: tour.provider
      // Excluded: images array, description, inclusions, exclusions, itinerary, etc.
      // These are fetched on-demand when user clicks a tour
    };
  }

  // ============================================================================
  // HOTELS CACHE
  // ============================================================================

  _buildHotelsCacheKey(destination, options = {}) {
    const checkIn = options.checkIn || '';
    const checkOut = options.checkOut || '';
    const guests = options.guests || 2;
    return `${destination.toLowerCase().trim()}::${checkIn}::${checkOut}::${guests}`;
  }

  async getHotels(destination, options = {}) {
    const cacheKey = this._buildHotelsCacheKey(destination, options);

    const memoryResult = this.memory.get(cacheKey);
    if (memoryResult) {
      return { data: memoryResult, isFresh: true, isStale: false, fromMemory: true };
    }

    const idbResult = await this.idb.get(STORES.HOTELS, cacheKey);
    if (idbResult) {
      this.memory.set(cacheKey, idbResult.data);
      return idbResult;
    }

    return null;
  }

  async setHotels(destination, hotels, options = {}) {
    const cacheKey = this._buildHotelsCacheKey(destination, options);

    const cacheData = {
      hotels,
      totalCount: hotels.length,
      cachedAt: Date.now()
    };

    this.memory.set(cacheKey, cacheData);
    await this.idb.set(STORES.HOTELS, cacheKey, cacheData, {
      destination: destination.toLowerCase().trim(),
      checkIn: options.checkIn,
      checkOut: options.checkOut
    });
  }

  // ============================================================================
  // DESTINATIONS CACHE (for autocomplete)
  // ============================================================================

  async getDestinations(provider = 'viator') {
    const memoryResult = this.memory.get(`destinations::${provider}`);
    if (memoryResult) return memoryResult;

    const idbResult = await this.idb.get(STORES.DESTINATIONS, provider);
    if (idbResult) {
      this.memory.set(`destinations::${provider}`, idbResult.data);
      return idbResult.data;
    }

    return null;
  }

  async setDestinations(provider, destinations) {
    this.memory.set(`destinations::${provider}`, destinations, 30 * 60 * 1000); // 30 min in memory
    await this.idb.set(STORES.DESTINATIONS, provider, destinations, { provider });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Clear all caches
   */
  async clearAll() {
    this.memory.clear();
    await Promise.all([
      this.idb.clear(STORES.TOURS),
      this.idb.clear(STORES.HOTELS),
      this.idb.clear(STORES.DESTINATIONS)
    ]);
    console.log('🗑️ All caches cleared');
  }

  /**
   * Clear tours cache only
   */
  async clearTours() {
    // Clear memory cache (tours only)
    for (const key of this.memory.cache.keys()) {
      if (!key.startsWith('destinations::') && !key.includes('hotel')) {
        this.memory.delete(key);
      }
    }
    await this.idb.clear(STORES.TOURS);
    console.log('🗑️ Tours cache cleared');
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    return {
      memory: {
        size: this.memory.size,
        maxSize: this.memory.maxSize
      },
      indexedDB: await this.idb.getStats()
    };
  }

  /**
   * Pre-warm cache for popular destinations
   */
  async prewarm(backendUrl, destinations) {
    console.log(`🔥 Pre-warming cache for ${destinations.length} destinations...`);

    for (const dest of destinations) {
      const destName = typeof dest === 'string' ? dest : dest.name;
      
      // Check if already cached
      const cached = await this.getTours(destName);
      if (cached?.isFresh) {
        console.log(`⏭️ Skipping "${destName}" - already cached`);
        continue;
      }

      try {
        const response = await fetch(`${backendUrl}/api/tours/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: destName,
            resultCount: 100, // Limit prewarm to 100 tours
            sortBy: 'popular'
            // NO DATES - ensures we get results!
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.tours?.length > 0) {
            await this.setTours(destName, data.tours);
            console.log(`🔥 Pre-warmed "${destName}" with ${data.tours.length} tours`);
          }
        }
      } catch (e) {
        console.error(`Pre-warm failed for "${destName}":`, e);
      }

      // Stagger requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('🔥 Pre-warm complete');
  }

  /**
   * Pre-warm single destination (on hover)
   */
  async prewarmDestination(backendUrl, destination) {
    const cached = await this.getTours(destination);
    if (cached) {
      console.log(`⏭️ Prewarm skipped for "${destination}" - already cached`);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/tours/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          resultCount: 100,
          sortBy: 'popular'
          // NO DATES!
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.tours?.length > 0) {
          await this.setTours(destination, data.tours);
        }
      }
    } catch (e) {
      console.error(`Prewarm failed for "${destination}":`, e);
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const cacheManager = new CacheManager();

// Legacy exports for backwards compatibility with existing code
export const getCachedSearch = async (destination, options) => {
  const result = await cacheManager.getTours(destination, options);
  return result;
};

export const setCachedSearch = async (destination, options, data) => {
  await cacheManager.setTours(destination, data.tours || [], options);
};

export const clearCache = () => cacheManager.clearAll();

export const prewarmDestination = (backendUrl, destination) => 
  cacheManager.prewarmDestination(backendUrl, destination);

export const prewarmDestinations = (backendUrl, destinations) => 
  cacheManager.prewarm(backendUrl, destinations);

// Expose for debugging in browser console
if (typeof window !== 'undefined') {
  window.viaggioCache = cacheManager;
}
