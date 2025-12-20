// ============================================================================
// SEARCH CACHE UTILITY
// Provides localStorage caching with TTL and stale-while-revalidate pattern
// ============================================================================

const CACHE_KEY = 'viaggio_search_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes - data is "fresh"
const STALE_TTL = 30 * 60 * 1000; // 30 minutes - data is "stale but usable"
const MAX_ENTRIES = 20;

// ============================================================================
// CACHE HELPERS
// ============================================================================

function getCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (e) {
    console.warn('Cache read error:', e);
    return {};
  }
}

function setCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Cache write error:', e);
    // If localStorage is full, clear old entries
    if (e.name === 'QuotaExceededError') {
      clearOldEntries(cache, 10);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      } catch (e2) {
        console.warn('Cache write failed after cleanup:', e2);
      }
    }
  }
}

function clearOldEntries(cache, keepCount) {
  const entries = Object.entries(cache);
  if (entries.length <= keepCount) return;

  // Sort by timestamp (oldest first) and remove oldest
  entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
  const toRemove = entries.slice(0, entries.length - keepCount);
  toRemove.forEach(([key]) => delete cache[key]);
}

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
// PUBLIC API
// ============================================================================

/**
 * Get cached search results
 * @returns {Object} { data, isFresh, isStale } or null if not cached
 */
export function getCachedSearch(destination, options = {}) {
  const cache = getCache();
  const key = generateCacheKey(destination, options);
  const entry = cache[key];

  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  const isFresh = age < CACHE_TTL;
  const isStale = age >= CACHE_TTL && age < STALE_TTL;
  const isExpired = age >= STALE_TTL;

  if (isExpired) {
    // Remove expired entry
    delete cache[key];
    setCache(cache);
    return null;
  }

  return {
    data: entry.data,
    isFresh,
    isStale,
    age
  };
}

/**
 * Store search results in cache
 */
export function setCachedSearch(destination, options = {}, data) {
  const cache = getCache();
  const key = generateCacheKey(destination, options);

  // Enforce max entries
  if (Object.keys(cache).length >= MAX_ENTRIES) {
    clearOldEntries(cache, MAX_ENTRIES - 1);
  }

  cache[key] = {
    data,
    timestamp: Date.now(),
    destination,
    options
  };

  setCache(cache);
  console.log(`📦 Cached search for "${destination}" (${data.tours?.length || 0} tours)`);
}

/**
 * Pre-warm cache for a destination (background fetch)
 */
export async function prewarmDestination(backendUrl, destination, destinationId = null) {
  const key = generateCacheKey(destination, { destinationId });
  const cache = getCache();

  // Skip if already cached and not expired
  if (cache[key]) {
    const age = Date.now() - cache[key].timestamp;
    if (age < STALE_TTL) {
      console.log(`⏭️ Skip prewarm "${destination}" - already cached`);
      return cache[key].data;
    }
  }

  try {
    console.log(`🔥 Pre-warming cache for "${destination}"...`);

    const response = await fetch(`${backendUrl}/api/tours/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination,
        destinationId,
        resultCount: 20,
        sortBy: 'popular'
      })
    });

    if (!response.ok) throw new Error('Prewarm fetch failed');

    const data = await response.json();
    setCachedSearch(destination, { destinationId }, data);

    console.log(`✅ Pre-warmed "${destination}" (${data.tours?.length || 0} tours)`);
    return data;
  } catch (error) {
    console.warn(`❌ Prewarm failed for "${destination}":`, error.message);
    return null;
  }
}

/**
 * Pre-warm multiple destinations in parallel (with staggering to avoid overwhelming the server)
 */
export async function prewarmDestinations(backendUrl, destinations) {
  console.log(`🚀 Starting pre-warm for ${destinations.length} destinations...`);

  // Stagger requests by 200ms to avoid overwhelming the server
  const results = [];
  for (let i = 0; i < destinations.length; i++) {
    const dest = destinations[i];

    // Start fetch (don't await yet)
    const promise = prewarmDestination(backendUrl, dest.name, dest.destinationId);
    results.push(promise);

    // Small delay between requests (except for last one)
    if (i < destinations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Wait for all to complete
  await Promise.allSettled(results);
  console.log(`🏁 Pre-warm complete for ${destinations.length} destinations`);
}

/**
 * Clear all cached searches
 */
export function clearSearchCache() {
  localStorage.removeItem(CACHE_KEY);
  console.log('🗑️ Search cache cleared');
}

/**
 * Get cache stats for debugging
 */
export function getCacheStats() {
  const cache = getCache();
  const entries = Object.entries(cache);
  const now = Date.now();

  return {
    totalEntries: entries.length,
    freshEntries: entries.filter(([, v]) => now - v.timestamp < CACHE_TTL).length,
    staleEntries: entries.filter(([, v]) => {
      const age = now - v.timestamp;
      return age >= CACHE_TTL && age < STALE_TTL;
    }).length,
    destinations: entries.map(([, v]) => v.destination)
  };
}
