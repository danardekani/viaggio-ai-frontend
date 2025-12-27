/**
 * Attractions/Landmarks API Utility Functions
 * For searching and fetching tours by landmarks
 */

/**
 * Fetch attractions for a destination (for Popular Landmarks tab)
 * @param {string} backendUrl - Backend API URL
 * @param {number} destinationId - Destination ID
 * @param {object} options - Optional parameters
 * @returns {Promise<object>} - Attractions data
 */
export async function fetchAttractions(backendUrl, destinationId, options = {}) {
  const { sort = 'DEFAULT', start = 1, count = 30 } = options;

  const params = new URLSearchParams({
    destinationId: destinationId.toString(),
    sort,
    start: start.toString(),
    count: count.toString()
  });

  const response = await fetch(`${backendUrl}/api/tours/attractions?${params}`);
  if (!response.ok) throw new Error(`Failed to fetch attractions: ${response.status}`);
  return response.json();
}

/**
 * Fetch tours for a specific landmark/attraction
 * IMPORTANT: Viator API requires BOTH destinationId AND seoId (attractionId)
 *
 * @param {string} backendUrl - Backend API URL
 * @param {string} seoId - Attraction SEO ID
 * @param {number} destinationId - Destination ID (REQUIRED by Viator API)
 * @param {object} options - Optional parameters
 * @returns {Promise<object>} - Tours data
 */
export async function fetchToursByAttraction(backendUrl, seoId, destinationId, options = {}) {
  if (!destinationId) {
    throw new Error('destinationId is required for attraction search');
  }

  const { start = 1, count = 50, sortBy = 'popular' } = options;

  const params = new URLSearchParams({
    destinationId: destinationId.toString(),  // Required by Viator API
    start: start.toString(),
    count: count.toString(),
    sortBy
  });

  const response = await fetch(`${backendUrl}/api/tours/attractions/${seoId}/tours?${params}`);
  if (!response.ok) throw new Error(`Failed to fetch tours: ${response.status}`);
  return response.json();
}

/**
 * Combined autocomplete - returns both destinations AND attractions
 * @param {string} backendUrl - Backend API URL
 * @param {string} query - Search query
 * @param {number} limit - Max results per type
 * @returns {Promise<object>} - Combined results { destinations: [], attractions: [] }
 */
export async function fetchCombinedAutocomplete(backendUrl, query, limit = 8) {
  if (!query || query.length < 2) return { destinations: [], attractions: [] };

  const params = new URLSearchParams({ q: query, limit: limit.toString() });
  const response = await fetch(`${backendUrl}/api/tours/autocomplete/combined?${params}`);
  if (!response.ok) return { destinations: [], attractions: [] };
  return response.json();
}

/**
 * Get details for a specific attraction
 * @param {string} backendUrl - Backend API URL
 * @param {string} attractionId - Attraction ID
 * @returns {Promise<object>} - Attraction details
 */
export async function fetchAttractionDetails(backendUrl, attractionId) {
  const response = await fetch(`${backendUrl}/api/tours/attractions/${attractionId}`);
  if (!response.ok) throw new Error(`Failed to fetch attraction details: ${response.status}`);
  return response.json();
}
