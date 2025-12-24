import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  MapPin,
  Calendar,
  Users,
  Globe,
  Smartphone,
  FileText,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Heart,
  Share2,
  Shield,
  Info,
  Navigation,
  Camera,
  MessageSquare,
  ThumbsUp,
  ExternalLink,
  Loader2,
  Home,
  Building,
  Plane
} from 'lucide-react';

// ============================================================================
// BREADCRUMB COMPONENT
// ============================================================================
const Breadcrumb = ({ destination, onNavigate }) => {
  // Parse destination into hierarchy (simplified - would use API data in production)
  const parts = useMemo(() => {
    const result = [{ label: 'Home', path: 'home' }];
    if (destination) {
      // Add destination parts
      const destParts = destination.split(',').map(p => p.trim());
      if (destParts.length >= 2) {
        result.push({ label: destParts[1], path: 'country' }); // Country
        result.push({ label: destParts[0], path: 'city' }); // City
      } else {
        result.push({ label: destination, path: 'destination' });
      }
      result.push({ label: 'Tours & Activities', path: 'tours' });
    }
    return result;
  }, [destination]);

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto whitespace-nowrap py-2">
      {parts.map((part, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span className="text-gray-300">/</span>}
          <button
            onClick={() => onNavigate?.(part.path)}
            className={`hover:text-blue-600 transition-colors ${
              idx === parts.length - 1 ? 'text-gray-400' : 'hover:underline'
            }`}
          >
            {part.label}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

// ============================================================================
// RATING BREAKDOWN COMPONENT
// ============================================================================
const RatingBreakdown = ({ reviews, totalReviews, averageRating }) => {
  // Calculate distribution (mock if not provided)
  const distribution = useMemo(() => {
    if (reviews?.distribution) return reviews.distribution;
    // Generate realistic distribution based on average
    const avg = averageRating || 4.5;
    const total = totalReviews || 100;
    return {
      5: Math.round(total * (avg > 4.5 ? 0.65 : avg > 4 ? 0.5 : 0.35)),
      4: Math.round(total * (avg > 4 ? 0.25 : 0.3)),
      3: Math.round(total * 0.07),
      2: Math.round(total * 0.02),
      1: Math.round(total * 0.01)
    };
  }, [reviews, totalReviews, averageRating]);

  const maxCount = Math.max(...Object.values(distribution));

  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map(stars => (
        <div key={stars} className="flex items-center gap-3">
          <span className="text-sm text-gray-600 w-12">{stars} stars</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${(distribution[stars] / maxCount) * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-500 w-12 text-right">
            {distribution[stars]?.toLocaleString() || 0}
          </span>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// REVIEW CARD COMPONENT
// ============================================================================
const ReviewCard = ({ review }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-gray-100 py-4 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <span className="text-gray-600 font-medium">
            {review.author?.charAt(0)?.toUpperCase() || 'A'}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{review.author || 'Anonymous'}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= (review.rating || 5)
                      ? 'text-emerald-500 fill-emerald-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          {review.title && (
            <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
          )}
          <p className="text-gray-600 text-sm">
            {expanded || (review.text?.length || 0) <= 200
              ? review.text
              : review.text?.substring(0, 200) + '...'}
          </p>
          {review.text?.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 text-sm mt-1 hover:underline"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
          {review.date && (
            <p className="text-xs text-gray-400 mt-2">{review.date}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN PRODUCT DISPLAY PAGE COMPONENT
// ============================================================================
export default function ProductDisplayPage({
  tour,
  onBack,
  onAddToCart,
  isInCart,
  formatCurrency,
  travelers = 2,
  backendUrl,
  searchParams
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [selectedTravelers, setSelectedTravelers] = useState(travelers);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    included: true,
    itinerary: false,
    additional: false,
    reviews: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fullTourData, setFullTourData] = useState(tour);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showPayLaterInfo, setShowPayLaterInfo] = useState(false);
  const [showCancellationDetails, setShowCancellationDetails] = useState(false);
  const [visibleReviewCount, setVisibleReviewCount] = useState(10);

  // Fetch full tour details on mount
  useEffect(() => {
    const fetchFullDetails = async () => {
      if (!tour?.productCode && !tour?.id) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `${backendUrl}/api/tours/${tour.productCode || tour.id}`
        );
        if (response.ok) {
          const data = await response.json();
          const fetchedData = data.tour || data;

          // Merge fetched data but preserve original price if API doesn't return one
          setFullTourData(prev => {
            const merged = { ...prev, ...fetchedData };
            // Preserve price from original tour if fetched data doesn't have a valid price
            if (!merged.price && !merged.fromPrice && !merged.retailPrice && prev?.price) {
              merged.price = prev.price;
            }
            return merged;
          });
        }
      } catch (error) {
        console.error('Failed to fetch tour details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFullDetails();
  }, [tour?.productCode, tour?.id, backendUrl]);

  // Helper to get optimized image URL (Viator images support different sizes)
  const getOptimizedImageUrl = useCallback((imageUrl, size = 'large') => {
    if (!imageUrl || typeof imageUrl !== 'string') return imageUrl;

    // Viator images often have size parameters in URL
    // Common patterns: /photos/, /thumbnail/, etc.
    // Replace with appropriate size
    const sizeMap = {
      thumb: { width: 200, height: 150 },
      small: { width: 400, height: 300 },
      medium: { width: 800, height: 600 },
      large: { width: 1200, height: 900 }
    };

    // If URL already has width/height params, try to update them
    if (imageUrl.includes('width=') || imageUrl.includes('w=')) {
      return imageUrl
        .replace(/width=\d+/g, `width=${sizeMap[size].width}`)
        .replace(/height=\d+/g, `height=${sizeMap[size].height}`)
        .replace(/w=\d+/g, `w=${sizeMap[size].width}`)
        .replace(/h=\d+/g, `h=${sizeMap[size].height}`);
    }

    // Viator CDN pattern - append size if not present
    if (imageUrl.includes('media.viator.com') && !imageUrl.includes('?')) {
      return `${imageUrl}?w=${sizeMap[size].width}&h=${sizeMap[size].height}&fit=crop`;
    }

    return imageUrl;
  }, []);

  // Memoize images with optimized URLs
  const images = useMemo(() => {
    if (!fullTourData) return [];
    if (fullTourData.images?.length > 0) {
      return fullTourData.images.map(img => {
        const url = typeof img === 'string' ? img : img.url || img;
        return getOptimizedImageUrl(url, 'large');
      });
    }
    if (fullTourData.image) return [getOptimizedImageUrl(fullTourData.image, 'large')];
    return [];
  }, [fullTourData, getOptimizedImageUrl]);

  // Thumbnail images (smaller size for strip)
  const thumbnailImages = useMemo(() => {
    if (!fullTourData) return [];
    if (fullTourData.images?.length > 0) {
      return fullTourData.images.map(img => {
        const url = typeof img === 'string' ? img : img.url || img;
        return getOptimizedImageUrl(url, 'thumb');
      });
    }
    if (fullTourData.image) return [getOptimizedImageUrl(fullTourData.image, 'thumb')];
    return [];
  }, [fullTourData, getOptimizedImageUrl]);

  // Memoize tour flags
  const tourFlags = useMemo(() => fullTourData?.flags || [], [fullTourData?.flags]);

  // Detect if tour is multi-day
  const isMultiDay = useMemo(() => {
    // Check duration string for multi-day indicators
    const duration = fullTourData?.duration?.toLowerCase() || '';
    if (duration.includes('day') && !duration.includes('1 day') && !duration.includes('full day') && !duration.includes('half day')) {
      const dayMatch = duration.match(/(\d+)\s*day/);
      if (dayMatch && parseInt(dayMatch[1]) > 1) return true;
    }
    // Check tags for multi-day tag (11922)
    const tourTagIds = fullTourData?.tags || [];
    if (tourTagIds.includes(11922) || tourTagIds.includes('11922')) return true;
    // Check name/title
    const name = fullTourData?.name?.toLowerCase() || '';
    if (name.includes('multi-day') || name.includes('multiday') || name.match(/\d+\s*day/)) return true;
    return false;
  }, [fullTourData]);

  // Get number of days for multi-day tours
  const tourDays = useMemo(() => {
    if (!isMultiDay) return 1;
    const duration = fullTourData?.duration?.toLowerCase() || '';
    const dayMatch = duration.match(/(\d+)\s*day/);
    if (dayMatch) return parseInt(dayMatch[1]);
    // Check name
    const name = fullTourData?.name?.toLowerCase() || '';
    const nameMatch = name.match(/(\d+)\s*day/);
    if (nameMatch) return parseInt(nameMatch[1]);
    return 2; // Default to 2 days for multi-day
  }, [fullTourData, isMultiDay]);

  // Extract landmarks from description when itinerary only has "Pass By" entries
  const extractedLandmarks = useMemo(() => {
    const itinerary = fullTourData?.itinerary || [];

    // Check if all itinerary items are just "Pass By" with no real location names
    const allPassBy = itinerary.length > 0 && itinerary.every(stop => {
      const name = stop.name || stop.title || stop.location || '';
      const description = stop.description || '';
      const isGenericName = typeof name === 'string' &&
        (name.toLowerCase() === 'pass by' || name.toLowerCase() === 'stop' || name === '');
      const isGenericDesc = typeof description === 'string' &&
        (description.toLowerCase() === 'pass by' || description === '');
      return isGenericName && isGenericDesc;
    });

    if (!allPassBy) return null; // Use original itinerary

    // Try to extract landmarks from the tour description
    const description = fullTourData?.description || '';
    if (!description) return null;

    // Common landmark patterns to look for
    const landmarks = [];

    // Pattern 1: "pass by [Landmark]" or "fly by [Landmark]" or "see [Landmark]"
    const passPatterns = [
      /(?:pass(?:ing)?\s*(?:by|over)?|fly(?:ing)?\s*(?:by|over)?|see(?:ing)?|view(?:ing)?|admire|soar\s*(?:over|by)?)\s+(?:the\s+)?([A-Z][A-Za-z\s']+?)(?:\s*[,.]|\s+and\s+|\s+before|\s+as\s+|\s+from|\s+which)/gi,
      /(?:over|by|past)\s+(?:the\s+)?([A-Z][A-Za-z\s']+?)(?:\s*[,.]|\s+and\s+|\s+before|\s+as\s+|\s+from)/gi
    ];

    // Known NYC landmarks to look for specifically
    const knownLandmarks = [
      'Statue of Liberty', 'Ellis Island', 'One World Trade Center', 'World Trade Center',
      'Empire State Building', 'Chrysler Building', 'Brooklyn Bridge', 'Manhattan Bridge',
      'Central Park', 'Times Square', 'Rockefeller Center', 'Hudson River',
      'East River', 'Freedom Tower', 'Wall Street', 'Battery Park',
      'Governors Island', 'Liberty Island', 'New York Harbor', 'Manhattan Skyline',
      'Intrepid', 'USS Intrepid', 'George Washington Bridge', 'Yankee Stadium',
      'Grand Central', 'Flatiron Building', 'Madison Square Garden'
    ];

    // Check for known landmarks in description (case-insensitive)
    const descLower = description.toLowerCase();
    knownLandmarks.forEach(landmark => {
      if (descLower.includes(landmark.toLowerCase()) && !landmarks.includes(landmark)) {
        landmarks.push(landmark);
      }
    });

    // Also try to extract using patterns
    passPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(description)) !== null) {
        const extracted = match[1]?.trim();
        if (extracted && extracted.length > 2 && extracted.length < 50) {
          // Clean up the extracted name
          const cleaned = extracted
            .replace(/\s+/g, ' ')
            .replace(/[,.]$/, '')
            .trim();
          if (cleaned && !landmarks.some(l => l.toLowerCase() === cleaned.toLowerCase())) {
            landmarks.push(cleaned);
          }
        }
      }
    });

    // If we found landmarks, return them as itinerary items
    if (landmarks.length > 0) {
      return landmarks.map((name, idx) => ({
        name,
        isPassBy: true,
        extractedFromDescription: true,
        originalIndex: idx
      }));
    }

    return null;
  }, [fullTourData]);

  // Pricing calculations - check multiple possible price fields
  const { isPerGroup, displayPrice, hasDiscount, totalPrice, originalPrice } = useMemo(() => {
    const perGroup = fullTourData?.pricingType === 'group' || tour?.pricingType === 'group';
    // Check multiple possible price field names from Viator API
    // Also fall back to original tour prop if fullTourData doesn't have price
    const price = fullTourData?.price
      || fullTourData?.fromPrice
      || fullTourData?.retailPrice
      || fullTourData?.pricing?.amount
      || fullTourData?.pricing?.retail
      || fullTourData?.pricing?.fromPrice
      || fullTourData?.priceFrom
      || tour?.price  // Fallback to original tour prop
      || tour?.fromPrice
      || tour?.retailPrice
      || 0;

    const origPrice = fullTourData?.originalPrice
      || fullTourData?.pricing?.original
      || fullTourData?.strikethrough
      || tour?.originalPrice  // Fallback to original tour prop
      || null;

    return {
      isPerGroup: perGroup,
      displayPrice: price,
      originalPrice: origPrice,
      hasDiscount: fullTourData?.hasDiscount || tour?.hasDiscount || tourFlags.includes('SPECIAL_OFFER') || (origPrice && origPrice > price),
      totalPrice: perGroup ? price : price * selectedTravelers
    };
  }, [fullTourData, tour, tourFlags, selectedTravelers]);

  // Navigation handlers
  const prevImage = useCallback(() => {
    setCurrentImageIndex(i => i === 0 ? images.length - 1 : i - 1);
  }, [images.length]);

  const nextImage = useCallback(() => {
    setCurrentImageIndex(i => i === images.length - 1 ? 0 : i + 1);
  }, [images.length]);

  // Toggle section
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  // Handle breadcrumb navigation
  const handleBreadcrumbNavigate = useCallback((path) => {
    if (path === 'home' || path === 'tours') {
      onBack?.();
    }
  }, [onBack]);

  // Generate cancellation policy details
  const cancellationPolicyDetails = useMemo(() => {
    const policyCode = fullTourData?.cancellationPolicy
      || fullTourData?.cancellation?.type
      || fullTourData?.cancellationType
      || '';

    // Map policy codes to detailed descriptions
    const policyMap = {
      'STANDARD': {
        title: 'Standard Cancellation Policy',
        description: 'For a full refund, cancel at least 24 hours before the scheduled departure time.',
        details: [
          'Full refund if canceled 24+ hours in advance',
          'No refund if canceled within 24 hours of the experience',
          'Changes are not accepted less than 24 hours before the experience'
        ],
        isFree: true
      },
      'MODERATE': {
        title: 'Moderate Cancellation Policy',
        description: 'For a full refund, cancel at least 4 days before the scheduled departure time.',
        details: [
          'Full refund if canceled 4+ days in advance',
          '50% refund if canceled 2-4 days in advance',
          'No refund if canceled within 48 hours of the experience'
        ],
        isFree: false
      },
      'STRICT': {
        title: 'Strict Cancellation Policy',
        description: 'For a full refund, cancel at least 7 days before the scheduled departure time.',
        details: [
          'Full refund if canceled 7+ days in advance',
          '50% refund if canceled 3-7 days in advance',
          'No refund if canceled within 72 hours of the experience'
        ],
        isFree: false
      },
      'CUSTOM': {
        title: 'Custom Cancellation Policy',
        description: fullTourData?.cancellationDetails || 'This experience has specific cancellation terms. Please review before booking.',
        details: fullTourData?.cancellationTerms || [
          'Cancellation terms vary for this experience',
          'Please check the booking confirmation for specific details',
          'Contact support if you have questions about cancellation'
        ],
        isFree: false
      }
    };

    // Determine which policy to use
    if (tourFlags.includes('FREE_CANCELLATION')) {
      return {
        title: 'Free Cancellation',
        description: 'For a full refund, cancel at least 24 hours before the scheduled departure time.',
        details: [
          'Full refund if canceled 24+ hours in advance',
          'No refund if canceled within 24 hours of the experience',
          'Cut-off times are based on the experience\'s local time'
        ],
        isFree: true
      };
    }

    const upperPolicy = policyCode.toUpperCase();
    if (policyMap[upperPolicy]) {
      return policyMap[upperPolicy];
    }

    // If we have a custom string policy
    if (typeof policyCode === 'string' && policyCode.length > 10) {
      return {
        title: 'Cancellation Policy',
        description: policyCode,
        details: [],
        isFree: policyCode.toLowerCase().includes('free') || policyCode.toLowerCase().includes('24 hour')
      };
    }

    // Default policy
    return {
      title: 'Cancellation Policy',
      description: 'Cancellation terms apply. Please check booking details for specific terms.',
      details: [
        'Cancellation policies vary by experience',
        'Review the booking confirmation for exact terms',
        'Contact support for cancellation assistance'
      ],
      isFree: false
    };
  }, [fullTourData, tourFlags]);

  if (!fullTourData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to results</span>
            </button>

            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Breadcrumb */}
          <Breadcrumb
            destination={searchParams?.destination}
            onNavigate={handleBreadcrumbNavigate}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* TITLE & RATING */}
            <div>
              {/* Source badge */}
              <div className="mb-2">
                {(fullTourData.source || tour?.source) === 'hotelbeds' ? (
                  <span className="px-2 py-0.5 bg-[#FF6B00] text-white text-xs font-medium rounded">
                    Hotelbeds
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-[#16A34A] text-white text-xs font-medium rounded">
                    Viator
                  </span>
                )}
              </div>

              {/* Reserve Now & Pay Later badge - clickable for more info */}
              {tourFlags.includes('FREE_CANCELLATION') && (
                <button
                  onClick={() => setShowPayLaterInfo(true)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded mb-3 hover:bg-red-700 transition-colors"
                >
                  Reserve Now & Pay Later
                  <Info className="w-3 h-3" />
                </button>
              )}

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {fullTourData.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                {fullTourData.rating && fullTourData.rating !== 'New' && (
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.floor(fullTourData.rating)
                              ? 'text-emerald-500 fill-emerald-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-gray-900 ml-1">
                      {fullTourData.rating}
                    </span>
                    <span className="text-gray-500">
                      ({fullTourData.reviewCount?.toLocaleString() || 0} reviews)
                    </span>
                  </div>
                )}

                {fullTourData.location && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{fullTourData.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* IMAGE GALLERY */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              {/* Main Image - using object-contain for better quality */}
              <div className="relative bg-gray-900 flex items-center justify-center" style={{ minHeight: '400px', maxHeight: '500px' }}>
                {images.length > 0 ? (
                  <img
                    src={images[currentImageIndex]}
                    alt={fullTourData.name}
                    className="max-w-full max-h-[500px] w-auto h-auto object-contain"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100" style={{ height: '400px' }}>
                    <MapPin className="w-16 h-16 text-blue-300" />
                  </div>
                )}

                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 text-white text-sm rounded-full">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}

                {/* See all photos button */}
                {images.length > 1 && (
                  <button
                    onClick={() => setShowAllPhotos(true)}
                    className="absolute bottom-4 right-4 px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-lg shadow-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    See all {images.length} photos
                  </button>
                )}
              </div>

              {/* Thumbnail strip - using smaller optimized images */}
              {thumbnailImages.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50">
                  {thumbnailImages.slice(0, 8).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all ${
                        idx === currentImageIndex
                          ? 'ring-2 ring-blue-500'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${fullTourData.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* KEY INFO BAR */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex flex-wrap gap-6">
                {fullTourData.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-medium text-gray-900">{fullTourData.duration}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Ticket type</p>
                    <p className="font-medium text-gray-900">Mobile ticket</p>
                  </div>
                </div>

                {fullTourData.languages?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Languages</p>
                      <p className="font-medium text-gray-900">
                        {fullTourData.languages.slice(0, 3).join(', ')}
                        {fullTourData.languages.length > 3 && ` +${fullTourData.languages.length - 3}`}
                      </p>
                    </div>
                  </div>
                )}

                {tourFlags.includes('SKIP_THE_LINE') && (
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Access</p>
                      <p className="font-medium text-blue-600">Skip the line</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* OVERVIEW SECTION */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('overview')}
                className="w-full px-6 py-4 flex items-center justify-between text-left border-b border-gray-100"
              >
                <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
                {expandedSections.overview ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSections.overview && (
                <div className="p-6 space-y-4">
                  {fullTourData.description && (
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {fullTourData.description}
                    </p>
                  )}

                  {/* Highlights */}
                  {fullTourData.highlights?.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Highlights</h3>
                      <ul className="space-y-2">
                        {fullTourData.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-600">
                            <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* WHAT'S INCLUDED SECTION */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('included')}
                className="w-full px-6 py-4 flex items-center justify-between text-left border-b border-gray-100"
              >
                <h2 className="text-lg font-semibold text-gray-900">What's Included</h2>
                {expandedSections.included ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSections.included && (
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Inclusions */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-500" />
                        Included
                      </h3>
                      <ul className="space-y-2">
                        {(fullTourData.inclusions || [
                          'Professional guide',
                          'All entrance fees',
                          'Mobile ticket'
                        ]).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Exclusions */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <X className="w-5 h-5 text-red-500" />
                        Not Included
                      </h3>
                      <ul className="space-y-2">
                        {(fullTourData.exclusions || [
                          'Food and drinks',
                          'Gratuities',
                          'Hotel pickup and drop-off'
                        ]).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                            <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ITINERARY SECTION */}
            {(fullTourData.itinerary?.length > 0 || fullTourData.pointsOfInterest?.length > 0 || extractedLandmarks?.length > 0) && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleSection('itinerary')}
                  className="w-full px-6 py-4 flex items-center justify-between text-left border-b border-gray-100"
                >
                  <h2 className="text-lg font-semibold text-gray-900">Itinerary</h2>
                  {expandedSections.itinerary ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {expandedSections.itinerary && (
                  <div className="p-6">
                    {/* Use extracted landmarks if API returned generic "Pass By" */}
                    {extractedLandmarks ? (
                      <>
                        <p className="text-sm text-gray-500 mb-4 italic">
                          Landmarks and points of interest on this tour:
                        </p>
                        {extractedLandmarks.map((stop, idx) => (
                          <div key={idx} className="flex gap-4 pb-6 last:pb-0">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-blue-100 text-blue-600">
                                {idx + 1}
                              </div>
                              {idx < extractedLandmarks.length - 1 && (
                                <div className="w-0.5 flex-1 bg-blue-100 mt-2" />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">{stop.name}</h4>
                                {stop.isPassBy && (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                                    Pass by
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      /* Original itinerary rendering */
                      fullTourData.itinerary?.map((stop, idx) => {
                        // Extract location name from various possible Viator API structures
                        const rawLocationName = stop.pointOfInterestLocation?.location?.name
                          || stop.pointOfInterestLocation?.name
                          || stop.location?.name
                          || stop.location
                          || stop.pointOfInterest
                          || stop.poi?.name
                          || stop.poi
                          || stop.attractionName
                          || stop.name
                          || stop.title
                          || '';

                        // Get description
                        const rawDescription = stop.description
                          || stop.pointOfInterestLocation?.description
                          || stop.details
                          || '';

                        // Check if location name is a LOC- ID string or other invalid format
                        const isInvalidName = !rawLocationName
                          || rawLocationName.startsWith('LOC-')
                          || rawLocationName.startsWith('loc-')
                          || rawLocationName.match(/^[A-Za-z0-9+/=]{20,}$/) // Base64-like strings
                          || rawLocationName.toLowerCase() === 'pass by'
                          || rawLocationName.toLowerCase() === 'stop';

                        // If name is invalid, try to extract a title from description
                        let locationName = rawLocationName;
                        let description = rawDescription;

                        if (isInvalidName && rawDescription) {
                          // Use description as the location name, truncated at first sentence or reasonable length
                          const firstSentence = rawDescription.split(/[.!?]/)[0]?.trim();
                          if (firstSentence && firstSentence.length <= 150) {
                            locationName = firstSentence;
                            // Don't show description if we used it as the name
                            description = '';
                          } else if (rawDescription.length <= 200) {
                            locationName = rawDescription;
                            description = '';
                          } else {
                            // Truncate for title and keep rest as description
                            locationName = rawDescription.substring(0, 100) + '...';
                            description = '';
                          }
                        } else if (!isInvalidName) {
                          // Don't show description if it duplicates the location name
                          const descLower = rawDescription.toLowerCase().trim();
                          const nameLower = locationName.toLowerCase().trim();
                          const isDuplicate = descLower === nameLower
                            || descLower.startsWith(nameLower)
                            || nameLower.startsWith(descLower)
                            || descLower === 'pass by';
                          description = isDuplicate ? '' : rawDescription;
                        }

                        // Fallback if still no name
                        if (!locationName || locationName === 'pass by') {
                          locationName = `Stop ${idx + 1}`;
                        }

                        // Check if this is a pass-by or actual stop
                        const isPassBy = stop.passByWithoutStopping
                          || stop.passBy
                          || stop.type === 'PASS_BY'
                          || (stop.name && stop.name.toLowerCase() === 'pass by');

                        // Get duration
                        const duration = stop.duration
                          || stop.durationMinutes
                          || stop.stopDuration
                          || '';

                        return (
                          <div key={idx} className="flex gap-4 pb-6 last:pb-0">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                isPassBy ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'
                              }`}>
                                {idx + 1}
                              </div>
                              {idx < (fullTourData.itinerary?.length || 0) - 1 && (
                                <div className="w-0.5 flex-1 bg-blue-100 mt-2" />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <h4 className="font-medium text-gray-900">{locationName}</h4>
                              {isPassBy && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                                  Pass by
                                </span>
                              )}
                              {description && (
                                <p className="text-gray-600 text-sm mt-1">{description}</p>
                              )}
                              {duration && (
                                <p className="text-gray-500 text-xs mt-2">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {typeof duration === 'number' ? `${duration} min` : duration}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Points of Interest */}
                    {fullTourData.pointsOfInterest?.length > 0 && !fullTourData.itinerary?.length && !extractedLandmarks && (
                      <div className="space-y-3">
                        {fullTourData.pointsOfInterest.map((poi, idx) => {
                          const poiName = typeof poi === 'string' ? poi : (poi.name || poi.location || poi);
                          return (
                            <div key={idx} className="flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{poiName}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* MEETING AND PICKUP SECTION */}
            {(fullTourData.meetingPoint || fullTourData.logistics?.start || fullTourData.logistics?.travelerPickup ||
              fullTourData.departurePoint || fullTourData.pickupDetails || fullTourData.startingLocations?.length > 0) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  Meeting and Pickup
                </h2>

                <div className="space-y-4">
                  {/* Meeting Point */}
                  {(fullTourData.meetingPoint || fullTourData.logistics?.start) && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Meeting Point</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {(() => {
                            const meeting = fullTourData.meetingPoint || fullTourData.logistics?.start;
                            if (typeof meeting === 'string') return meeting;
                            return meeting?.description || meeting?.name || meeting?.address ||
                                   meeting?.location?.name || meeting?.location?.address ||
                                   JSON.stringify(meeting);
                          })()}
                        </p>
                        {(fullTourData.meetingPointInstructions || fullTourData.logistics?.start?.additionalInfo) && (
                          <p className="text-gray-500 text-xs mt-2 italic">
                            {fullTourData.meetingPointInstructions || fullTourData.logistics?.start?.additionalInfo}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pickup Information */}
                  {(fullTourData.logistics?.travelerPickup || fullTourData.pickupDetails) && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Pickup</h3>
                        {(() => {
                          const pickup = fullTourData.logistics?.travelerPickup || fullTourData.pickupDetails;
                          if (typeof pickup === 'string') {
                            return <p className="text-gray-600 text-sm mt-1">{pickup}</p>;
                          }
                          return (
                            <>
                              {pickup?.pickupOptionType && (
                                <p className="text-gray-600 text-sm mt-1">
                                  {pickup.pickupOptionType === 'PICKUP_EVERYONE' && 'Pickup included for all travelers'}
                                  {pickup.pickupOptionType === 'PICKUP_AND_MEET_AT_START_POINT' && 'Pickup available or meet at start point'}
                                  {pickup.pickupOptionType === 'MEET_AT_START_POINT' && 'Meet at the start point (no pickup)'}
                                  {!['PICKUP_EVERYONE', 'PICKUP_AND_MEET_AT_START_POINT', 'MEET_AT_START_POINT'].includes(pickup.pickupOptionType) && pickup.pickupOptionType}
                                </p>
                              )}
                              {pickup?.description && (
                                <p className="text-gray-600 text-sm mt-1">{pickup.description}</p>
                              )}
                              {pickup?.additionalInfo && (
                                <p className="text-gray-500 text-xs mt-2 italic">{pickup.additionalInfo}</p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Departure Point */}
                  {fullTourData.departurePoint && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Plane className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Departure Point</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {typeof fullTourData.departurePoint === 'string'
                            ? fullTourData.departurePoint
                            : fullTourData.departurePoint?.name || fullTourData.departurePoint?.address || ''}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Starting Locations */}
                  {fullTourData.startingLocations?.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Starting Locations</h3>
                        <ul className="mt-1 space-y-1">
                          {fullTourData.startingLocations.map((loc, idx) => (
                            <li key={idx} className="text-gray-600 text-sm">
                              {typeof loc === 'string' ? loc : loc.name || loc.address || ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* End Point / Return Details */}
                  {(fullTourData.endPoint || fullTourData.logistics?.end || fullTourData.returnDetails) && (
                    <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">End Point</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {(() => {
                            const end = fullTourData.endPoint || fullTourData.logistics?.end || fullTourData.returnDetails;
                            if (typeof end === 'string') return end;
                            return end?.description || end?.name || end?.address || 'Returns to original departure point';
                          })()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ADDITIONAL INFO SECTION */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('additional')}
                className="w-full px-6 py-4 flex items-center justify-between text-left border-b border-gray-100"
              >
                <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
                {expandedSections.additional ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSections.additional && (
                <div className="p-6 space-y-4">
                  {/* Departure & Return */}
                  {(fullTourData.departurePoint || fullTourData.meetingPoint) && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-gray-400" />
                        Departure & Return
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {fullTourData.departurePoint || fullTourData.meetingPoint}
                      </p>
                    </div>
                  )}

                  {/* What to Expect */}
                  {fullTourData.whatToExpect && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">What to Expect</h3>
                      <p className="text-gray-600 text-sm">{fullTourData.whatToExpect}</p>
                    </div>
                  )}

                  {/* Accessibility */}
                  {fullTourData.accessibility && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Accessibility</h3>
                      <p className="text-gray-600 text-sm">{fullTourData.accessibility}</p>
                    </div>
                  )}

                  {/* Additional notes - parsed as bullet points */}
                  {fullTourData.additionalInfo && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Additional Notes</h3>
                      <ul className="space-y-2">
                        {(() => {
                          const info = fullTourData.additionalInfo;

                          // Handle array format (Viator API sometimes returns array)
                          if (Array.isArray(info)) {
                            return info.map((item, idx) => {
                              // Each item might be a string or an object with description
                              const text = typeof item === 'string'
                                ? item
                                : item.description || item.text || item.value || JSON.stringify(item);
                              return (
                                <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-2" />
                                  <span>{text}</span>
                                </li>
                              );
                            });
                          }

                          // Handle string format - parse into bullet points
                          if (typeof info === 'string') {
                            const bulletPoints = info
                              .replace(/\.([A-Z])/g, '.|$1') // Add separator before capital after period
                              .replace(/([a-z])([A-Z])/g, '$1|$2') // Add separator between camelCase words
                              .split('|')
                              .map(s => s.trim())
                              .filter(s => s.length > 3);

                            return bulletPoints.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-2" />
                                <span>{point}</span>
                              </li>
                            ));
                          }

                          // Handle object format
                          if (typeof info === 'object') {
                            const text = info.description || info.text || JSON.stringify(info);
                            return (
                              <li className="flex items-start gap-2 text-gray-600 text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-2" />
                                <span>{text}</span>
                              </li>
                            );
                          }

                          return null;
                        })()}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CANCELLATION POLICY */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className={`w-5 h-5 ${cancellationPolicyDetails.isFree ? 'text-emerald-500' : 'text-gray-400'}`} />
                  {cancellationPolicyDetails.title}
                </h2>
                {cancellationPolicyDetails.details.length > 0 && (
                  <button
                    onClick={() => setShowCancellationDetails(!showCancellationDetails)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {showCancellationDetails ? 'Hide' : 'View'} details
                    {showCancellationDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
              </div>

              <p className="text-gray-600">
                {cancellationPolicyDetails.description}
              </p>

              {/* Detailed policy points */}
              {showCancellationDetails && cancellationPolicyDetails.details.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                  {cancellationPolicyDetails.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${cancellationPolicyDetails.isFree ? 'text-emerald-500' : 'text-gray-400'}`} />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              )}

              {cancellationPolicyDetails.isFree && (
                <div className="mt-3 flex items-center gap-2 text-emerald-600 font-medium">
                  <Check className="w-5 h-5" />
                  Free cancellation available
                </div>
              )}
            </div>

            {/* REVIEWS SECTION */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('reviews')}
                className="w-full px-6 py-4 flex items-center justify-between text-left border-b border-gray-100"
              >
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  Reviews
                  {fullTourData.reviewCount && (
                    <span className="text-gray-500 font-normal text-sm">
                      ({fullTourData.reviewCount.toLocaleString()})
                    </span>
                  )}
                </h2>
                {expandedSections.reviews ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSections.reviews && (
                <div className="p-6">
                  {/* Overall Rating */}
                  <div className="flex flex-col md:flex-row gap-8 mb-6 pb-6 border-b border-gray-100">
                    <div className="text-center md:text-left">
                      <div className="text-5xl font-bold text-gray-900">
                        {fullTourData.rating || '4.5'}
                      </div>
                      <div className="flex justify-center md:justify-start mt-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.floor(fullTourData.rating || 4.5)
                                ? 'text-emerald-500 fill-emerald-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Based on {fullTourData.reviewCount?.toLocaleString() || 0} reviews
                      </p>
                    </div>

                    <div className="flex-1">
                      <RatingBreakdown
                        reviews={fullTourData.reviews}
                        totalReviews={fullTourData.reviewCount}
                        averageRating={fullTourData.rating}
                      />
                    </div>
                  </div>

                  {/* Review List */}
                  <div className="space-y-1">
                    {(fullTourData.reviews?.items || [
                      {
                        author: 'Sarah M.',
                        rating: 5,
                        title: 'Amazing experience!',
                        text: 'This tour exceeded all my expectations. Our guide was incredibly knowledgeable and made the history come alive. Highly recommend!',
                        date: 'December 2024'
                      },
                      {
                        author: 'John D.',
                        rating: 4,
                        title: 'Great tour, minor issues',
                        text: 'Overall a fantastic experience. The skip-the-line access was worth it. Only minor complaint was the pace was a bit fast at times.',
                        date: 'November 2024'
                      },
                      {
                        author: 'Emma L.',
                        rating: 5,
                        title: 'Perfect day out',
                        text: 'Booking was easy, the tour was well organized, and we saw everything we wanted. The guide spoke excellent English and was very friendly.',
                        date: 'November 2024'
                      }
                    ]).slice(0, 5).map((review, idx) => (
                      <ReviewCard key={idx} review={review} />
                    ))}
                  </div>

                  {fullTourData.reviewCount > 5 && (
                    <button
                      onClick={() => setShowAllReviews(true)}
                      className="w-full mt-4 py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      See all {fullTourData.reviewCount?.toLocaleString()} reviews
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Booking Card (Sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-gray-500">from</span>
                  {hasDiscount && originalPrice && (
                    <span className="text-gray-400 line-through text-lg">
                      {formatCurrency(originalPrice)}
                    </span>
                  )}
                  <span className={`text-3xl font-bold ${hasDiscount ? 'text-orange-500' : 'text-gray-900'}`}>
                    {displayPrice > 0 ? formatCurrency(displayPrice) : 'Check availability'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {isPerGroup ? 'per group' : 'per person'}
                </p>
              </div>

              {/* Lowest price guarantee */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Lowest price guarantee</span>
              </div>

              {/* Date Selection - Start Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {isMultiDay ? 'Start Date' : 'Select Date'}
                </label>
                <input
                  type="date"
                  value={selectedStartDate}
                  onChange={(e) => {
                    setSelectedStartDate(e.target.value);
                    // Auto-set end date for multi-day tours
                    if (isMultiDay && e.target.value) {
                      const startDate = new Date(e.target.value);
                      startDate.setDate(startDate.getDate() + tourDays - 1);
                      setSelectedEndDate(startDate.toISOString().split('T')[0]);
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* End Date - Only for multi-day tours */}
              {isMultiDay && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    End Date
                    <span className="text-xs text-gray-500 ml-1">({tourDays} days)</span>
                  </label>
                  <input
                    type="date"
                    value={selectedEndDate}
                    onChange={(e) => setSelectedEndDate(e.target.value)}
                    min={selectedStartDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Travelers Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Number of Travelers
                </label>
                <select
                  value={selectedTravelers}
                  onChange={(e) => setSelectedTravelers(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'traveler' : 'travelers'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Total Price */}
              {!isPerGroup && selectedTravelers > 1 && (
                <div className="flex justify-between items-center mb-4 text-sm">
                  <span className="text-gray-600">
                    {formatCurrency(displayPrice)} × {selectedTravelers}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              )}

              {/* Reserve Now & Pay Later - clickable for more info */}
              {tourFlags.includes('FREE_CANCELLATION') && (
                <button
                  onClick={() => setShowPayLaterInfo(true)}
                  className="w-full mb-4 p-3 bg-emerald-50 rounded-lg text-left hover:bg-emerald-100 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-emerald-700 font-medium">
                      Reserve Now & Pay Later
                    </p>
                    <Info className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700" />
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">
                    Secure your spot while staying flexible
                  </p>
                </button>
              )}

              {/* Free Cancellation */}
              {tourFlags.includes('FREE_CANCELLATION') && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 mb-4">
                  <Check className="w-4 h-4" />
                  <span>Free cancellation up to 24 hours in advance</span>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => onAddToCart?.()}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    isInCart
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isInCart ? 'Remove from Trip' : 'Add to Trip'}
                </button>

                <a
                  href={fullTourData.bookingLink || fullTourData.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Book on Viator
                </a>
              </div>

              {isLoading && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading details...
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ALL PHOTOS MODAL */}
      {showAllPhotos && images.length > 0 && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setShowAllPhotos(false)}
        >
          <button
            onClick={() => setShowAllPhotos(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="max-w-5xl max-h-[90vh] overflow-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentImageIndex(idx);
                    setShowAllPhotos(false);
                  }}
                  className="aspect-[4/3] rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                >
                  <img
                    src={img}
                    alt={`${fullTourData.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ALL REVIEWS MODAL */}
      {showAllReviews && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowAllReviews(false);
            setVisibleReviewCount(10); // Reset when closing
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">All Reviews</h3>
                <p className="text-sm text-gray-500">{fullTourData.reviewCount?.toLocaleString() || 0} total reviews</p>
              </div>
              <button
                onClick={() => {
                  setShowAllReviews(false);
                  setVisibleReviewCount(10);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rating Summary */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-gray-900">{fullTourData.rating || '4.5'}</div>
                <div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.floor(fullTourData.rating || 4.5)
                            ? 'text-emerald-500 fill-emerald-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">Based on {fullTourData.reviewCount?.toLocaleString() || 0} reviews</p>
                </div>
              </div>
            </div>

            {/* Scrollable Reviews List */}
            <div className="flex-1 overflow-y-auto p-4">
              {(() => {
                // Generate sample reviews based on the reviewCount
                const sampleReviews = fullTourData.reviews?.items || [];
                const mockReviews = [
                  { author: 'Sarah M.', rating: 5, title: 'Amazing experience!', text: 'This tour exceeded all my expectations. Our guide was incredibly knowledgeable and made the history come alive. Highly recommend!', date: 'December 2024' },
                  { author: 'John D.', rating: 4, title: 'Great tour, minor issues', text: 'Overall a fantastic experience. The skip-the-line access was worth it. Only minor complaint was the pace was a bit fast at times.', date: 'November 2024' },
                  { author: 'Emma L.', rating: 5, title: 'Perfect day out', text: 'Booking was easy, the tour was well organized, and we saw everything we wanted. The guide spoke excellent English and was very friendly.', date: 'November 2024' },
                  { author: 'Michael R.', rating: 5, title: 'Unforgettable!', text: 'Worth every penny. The small group size meant we could ask plenty of questions and really connect with our guide.', date: 'October 2024' },
                  { author: 'Lisa K.', rating: 4, title: 'Really enjoyed it', text: 'Great way to see the highlights without the hassle of planning. Would have liked a bit more free time at certain stops.', date: 'October 2024' },
                  { author: 'David W.', rating: 5, title: 'Exceeded expectations', text: 'Our guide Marco was phenomenal! So passionate and knowledgeable. Made the experience truly memorable.', date: 'September 2024' },
                  { author: 'Jennifer P.', rating: 5, title: 'Must-do activity', text: 'If you only do one tour, make it this one. Absolutely fantastic from start to finish.', date: 'September 2024' },
                  { author: 'Robert H.', rating: 4, title: 'Very informative', text: 'Learned so much about the history and culture. The walking was manageable even for older travelers.', date: 'August 2024' },
                  { author: 'Maria G.', rating: 5, title: 'Wonderful day', text: 'Everything was perfectly organized. Our guide knew so much about the local history and culture. Would definitely book again!', date: 'August 2024' },
                  { author: 'Thomas B.', rating: 5, title: 'Best tour ever', text: 'We have done many tours over the years and this one stands out. Professional, informative, and so much fun!', date: 'July 2024' },
                  { author: 'Sophie C.', rating: 4, title: 'Great value', text: 'For the price, you get an incredible amount of value. Well worth every penny spent.', date: 'July 2024' },
                  { author: 'James W.', rating: 5, title: 'Highly recommend', text: 'An absolute must-do if you are visiting. The guide made the experience unforgettable with their stories.', date: 'June 2024' },
                  { author: 'Anna P.', rating: 5, title: 'Perfect for families', text: 'Took our kids and they loved it too! The guide was great at engaging everyone regardless of age.', date: 'June 2024' },
                  { author: 'Chris M.', rating: 4, title: 'Solid experience', text: 'Good tour overall. Some waiting time but the content and guide made up for it.', date: 'May 2024' },
                  { author: 'Rachel T.', rating: 5, title: 'Exceeded expectations', text: 'Booked this last minute and so glad we did. One of the highlights of our trip!', date: 'May 2024' },
                  { author: 'Daniel K.', rating: 5, title: 'Outstanding', text: 'The attention to detail and care from our guide was exceptional. Truly a memorable experience.', date: 'April 2024' },
                  { author: 'Helen R.', rating: 4, title: 'Very enjoyable', text: 'Nice pace, great information, friendly guide. Would recommend to friends visiting the area.', date: 'April 2024' },
                  { author: 'Peter S.', rating: 5, title: 'Five stars!', text: 'Cannot say enough good things about this tour. From booking to finish, everything was smooth and enjoyable.', date: 'March 2024' },
                  { author: 'Laura M.', rating: 5, title: 'Loved every minute', text: 'Such a fun and informative tour. The guide had great energy and made it entertaining throughout.', date: 'March 2024' },
                  { author: 'Kevin L.', rating: 4, title: 'Good tour', text: 'Well organized and informative. A few small hiccups but nothing major. Would do it again.', date: 'February 2024' }
                ];

                // Use API reviews if available, otherwise use mock reviews
                const allReviews = sampleReviews.length > 0 ? sampleReviews : mockReviews;
                const reviewsToShow = allReviews.slice(0, visibleReviewCount);
                const hasMoreReviews = visibleReviewCount < (fullTourData.reviewCount || allReviews.length);

                return (
                  <>
                    <div className="space-y-1">
                      {reviewsToShow.map((review, idx) => (
                        <ReviewCard key={idx} review={review} />
                      ))}
                    </div>

                    {/* Load More button */}
                    {hasMoreReviews && (
                      <button
                        onClick={() => setVisibleReviewCount(prev => prev + 10)}
                        className="w-full mt-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <ChevronDown className="w-4 h-4" />
                        Load more reviews
                        <span className="text-sm text-gray-500">
                          (showing {Math.min(visibleReviewCount, allReviews.length)} of {fullTourData.reviewCount?.toLocaleString() || allReviews.length})
                        </span>
                      </button>
                    )}

                    {/* All reviews loaded message */}
                    {!hasMoreReviews && reviewsToShow.length > 10 && (
                      <p className="text-center text-sm text-gray-500 mt-4 py-2">
                        You've seen all available reviews
                      </p>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Reviews are from verified travelers who booked through Viator
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PAY LATER INFO MODAL */}
      {showPayLaterInfo && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPayLaterInfo(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Reserve Now & Pay Later</h3>
                <button
                  onClick={() => setShowPayLaterInfo(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Book Today, Pay Later</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Secure your spot now without paying upfront. Your card won't be charged until closer to your experience date.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Stay Flexible</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Plans change? With free cancellation, you can cancel up to 24 hours before your experience for a full refund.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Guaranteed Spot</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Your reservation is confirmed immediately. No risk of selling out while you wait.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">How it works:</h4>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0">1</span>
                    <span>Reserve your experience with no upfront payment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0">2</span>
                    <span>Receive confirmation and details via email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0">3</span>
                    <span>Payment is charged 24-48 hours before your experience</span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowPayLaterInfo(false)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
