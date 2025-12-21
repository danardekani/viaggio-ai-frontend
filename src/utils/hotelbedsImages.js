/**
 * Hotelbeds Image URL Helper
 *
 * Hotelbeds API returns image paths without the full URL.
 * This utility constructs proper URLs with different size options.
 *
 * Available sizes:
 * - small (74px width)
 * - medium (117px width)
 * - standard (320px width) - default
 * - bigger (800px width)
 * - xl (1024px width)
 * - xxl (2048px width)
 * - original (full resolution)
 */

const HOTELBEDS_BASE_URL = 'https://photos.hotelbeds.com/giata';

const SIZE_PATHS = {
  small: '/small/',
  medium: '/medium/',
  standard: '/',
  bigger: '/bigger/',
  xl: '/xl/',
  xxl: '/xxl/',
  original: '/original/'
};

/**
 * Constructs a Hotelbeds image URL with the specified size
 * @param {string} imagePath - The image path from API (e.g., "00/000001/000001a_hb_a_001.jpg")
 * @param {string} size - Size variant: small, medium, standard, bigger, xl, xxl, original
 * @returns {string} Full image URL
 */
export function getHotelbedsImageUrl(imagePath, size = 'bigger') {
  if (!imagePath) return null;

  // If it's already a full URL (not a Hotelbeds path), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Clean the path - remove any leading slashes
  const cleanPath = imagePath.replace(/^\/+/, '');

  // Get size path, default to 'bigger' for good quality without being too large
  const sizePath = SIZE_PATHS[size] || SIZE_PATHS.bigger;

  return `${HOTELBEDS_BASE_URL}${sizePath}${cleanPath}`;
}

/**
 * Get thumbnail URL (for cards and small previews)
 * Uses 'bigger' size (800px) for good quality on cards
 */
export function getHotelThumbnailUrl(imagePath) {
  return getHotelbedsImageUrl(imagePath, 'bigger');
}

/**
 * Get main image URL (for quick view and full display)
 * Uses 'xl' size (1024px) for high quality display
 */
export function getHotelMainImageUrl(imagePath) {
  return getHotelbedsImageUrl(imagePath, 'xl');
}

/**
 * Get small thumbnail URL (for thumbnail strips)
 * Uses 'medium' size (117px) for compact thumbnails
 */
export function getHotelSmallThumbnailUrl(imagePath) {
  return getHotelbedsImageUrl(imagePath, 'medium');
}

/**
 * Process an array of hotel images, extracting paths and applying URL construction
 * @param {Array} images - Array of image objects or strings from API
 * @param {string} size - Size variant to use
 * @returns {Array<string>} Array of full image URLs
 */
export function processHotelImages(images, size = 'bigger') {
  if (!images || !Array.isArray(images)) return [];

  return images
    .map(img => {
      // Handle different image formats from API
      const path = typeof img === 'string'
        ? img
        : (img.path || img.url || img);

      return getHotelbedsImageUrl(path, size);
    })
    .filter(Boolean);
}

export default {
  getHotelbedsImageUrl,
  getHotelThumbnailUrl,
  getHotelMainImageUrl,
  getHotelSmallThumbnailUrl,
  processHotelImages
};
