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
  Plane,
  ShoppingBag,
  Eye,
  Ticket
} from 'lucide-react';

// ============================================================================
// BREADCRUMB COMPONENT
// ============================================================================
const Breadcrumb = ({ destination, onNavigate }) => {
  const parts = useMemo(() => {
    const result = [{ label: 'Home', path: 'home' }];
    if (destination) {
      const destParts = destination.split(',').map(p => p.trim());
      if (destParts.length >= 2) {
        result.push({ label: destParts[1], path: 'country' });
        result.push({ label: destParts[0], path: 'city' });
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
  const distribution = useMemo(() => {
    if (reviews?.distribution) return reviews.distribution;
    const avg = averageRating || 4.5;
    const total = totalReviews || 100;
    return {
      5: Math.round(total * (avg > 4.5 ? 0.65 : avg > 4 ? 0.5 : 0.35)),
      4: Math.round(total * (avg > 4 ? 0.2 : 0.25)),
      3: Math.round(total * 0.08),
      2: Math.round(total * 0.04),
      1: Math.round(total * 0.03)
    };
  }, [reviews, totalReviews, averageRating]);

  const maxCount = Math.max(...Object.values(distribution));

  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map(rating => (
        <div key={rating} className="flex items-center gap-2">
          <span className="text-sm text-gray-600 w-12">{rating} star</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full transition-all"
              style={{ width: `${(distribution[rating] / maxCount) * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-500 w-10 text-right">{distribution[rating]}</span>
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
    <div className="border-b border-gray-100 pb-4 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {review.author?.[0]?.toUpperCase() || 'A'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">{review.author || 'Anonymous'}</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < (review.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                />
              ))}
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-1">
            {expanded || !review.text || review.text.length <= 200
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
  searchParams,
  cart = { tours: [], hotels: [], flights: [] },
  removeFromCart,
  onOpenProductPage
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
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);

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

          setFullTourData(prev => {
            const merged = { ...prev, ...fetchedData };
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

  // Helper to get optimized image URL
  const getOptimizedImageUrl = useCallback((imageUrl, size = 'large') => {
    if (!imageUrl || typeof imageUrl !== 'string') return imageUrl;
    return imageUrl;
  }, []);

  // Get images array
  const images = useMemo(() => {
    const rawImages = fullTourData?.images || [];
    if (rawImages.length > 0) {
      return rawImages.map(img => {
        if (typeof img === 'string') return getOptimizedImageUrl(img);
        return getOptimizedImageUrl(img.url || img.src || img);
      }).filter(Boolean);
    }
    if (fullTourData?.image) return [getOptimizedImageUrl(fullTourData.image)];
    return [];
  }, [fullTourData, getOptimizedImageUrl]);

  // Tour flags
  const tourFlags = useMemo(() => {
    return fullTourData?.flags || [];
  }, [fullTourData]);

  // Pricing logic
  const isPerGroup = fullTourData?.pricingType === 'group' || 
    fullTourData?.pricingUnit === 'per group';
  
  const displayPrice = fullTourData?.price || fullTourData?.fromPrice || 0;
  const totalPrice = isPerGroup ? displayPrice : displayPrice * selectedTravelers;
  const hasDiscount = fullTourData?.hasDiscount || 
    (fullTourData?.originalPrice && fullTourData.originalPrice > displayPrice);

  // Toggle section
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Cart item count
  const cartItemCount = useMemo(() => {
    return (cart?.tours?.length || 0) + (cart?.hotels?.length || 0);
  }, [cart]);

  // Cart total
  const cartTotal = useMemo(() => {
    let total = 0;
    cart?.tours?.forEach(t => {
      const price = t.price || 0;
      total += t.pricingType === 'group' ? price : price * selectedTravelers;
    });
    cart?.hotels?.forEach(hotel => {
      total += hotel.price || 0;
    });
    return total;
  }, [cart, selectedTravelers]);

  // Reviews
  const reviews = useMemo(() => {
    return fullTourData?.reviews || [];
  }, [fullTourData]);

  // Itinerary items
  const itineraryItems = useMemo(() => {
    const raw = fullTourData?.itinerary || fullTourData?.itineraryItems || [];
    if (!raw.length) return [];
    
    return raw.map((item, idx) => {
      if (typeof item === 'string') {
        return { title: `Stop ${idx + 1}`, description: item };
      }
      return {
        title: item.title || item.name || item.stopName || `Stop ${idx + 1}`,
        description: item.description || item.details || item.text || '',
        duration: item.duration,
        admissionIncluded: item.admissionIncluded
      };
    });
  }, [fullTourData]);

  // What's included/excluded
  const inclusions = useMemo(() => {
    return fullTourData?.inclusions || fullTourData?.included || [];
  }, [fullTourData]);

  const exclusions = useMemo(() => {
    return fullTourData?.exclusions || fullTourData?.excluded || [];
  }, [fullTourData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Back</span>
              </button>
              <div className="hidden sm:flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Viaggio</span>
              </div>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setCartSidebarOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ShoppingBag className="w-5 h-5 text-gray-600" />
              <span className="hidden sm:inline text-sm font-medium text-gray-700">My Trip</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ================================================================== */}
      {/* MAIN CONTENT */}
      {/* ================================================================== */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Breadcrumb
          destination={searchParams?.destination || fullTourData?.destination}
          onNavigate={(path) => path === 'home' && onBack?.()}
        />

        <div className="grid lg:grid-cols-3 gap-8 mt-4">
          {/* ============================================================ */}
          {/* LEFT COLUMN - Main Content */}
          {/* ============================================================ */}
          <div className="lg:col-span-2 space-y-6">
            {/* IMAGE GALLERY */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Main Image */}
              <div className="relative aspect-[16/9] bg-gray-100">
                {images.length > 0 ? (
                  <img
                    src={images[currentImageIndex]}
                    alt={fullTourData?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-300" />
                  </div>
                )}

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(i => i === 0 ? images.length - 1 : i - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(i => i === images.length - 1 ? 0 : i + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-700" />
                    </button>
                  </>
                )}

                {/* View All Photos Button */}
                {images.length > 1 && (
                  <button
                    onClick={() => setShowAllPhotos(true)}
                    className="absolute bottom-4 right-4 px-3 py-2 bg-white/90 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    {images.length} photos
                  </button>
                )}

                {/* Source Badge */}
                <div className="absolute top-4 left-4">
                  {fullTourData?.source === 'hotelbeds' ? (
                    <span className="px-3 py-1 bg-[#FF6B00] text-white text-sm font-medium rounded-full">
                      Hotelbeds
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-[#16A34A] text-white text-sm font-medium rounded-full">
                      Viator
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.slice(0, 8).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
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

            {/* TITLE & RATING */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {fullTourData?.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                {fullTourData?.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{fullTourData.rating.toFixed(1)}</span>
                    {fullTourData.reviewCount && (
                      <span className="text-gray-500">
                        ({fullTourData.reviewCount.toLocaleString()} reviews)
                      </span>
                    )}
                  </div>
                )}

                {fullTourData?.duration && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{fullTourData.duration}</span>
                  </div>
                )}

                {fullTourData?.destination && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{fullTourData.destination}</span>
                  </div>
                )}
              </div>

              {/* Feature Badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                {tourFlags.includes('FREE_CANCELLATION') && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                    <Check className="w-4 h-4" />
                    Free cancellation
                  </span>
                )}
                {tourFlags.includes('SKIP_THE_LINE') && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    ⚡ Skip the line
                  </span>
                )}
                {tourFlags.includes('LIKELY_TO_SELL_OUT') && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                    🔥 Likely to sell out
                  </span>
                )}
              </div>
            </div>

            {/* KEY INFO BAR */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex flex-wrap gap-6">
                {fullTourData?.duration && (
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

                {fullTourData?.languages?.length > 0 && (
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
                <div className="px-6 py-4">
                  <p className="text-gray-600 whitespace-pre-line">
                    {fullTourData?.description || fullTourData?.shortDescription || 'No description available.'}
                  </p>
                </div>
              )}
            </div>

            {/* WHAT'S INCLUDED */}
            {(inclusions.length > 0 || exclusions.length > 0) && (
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
                  <div className="px-6 py-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      {inclusions.length > 0 && (
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-500" />
                            Included
                          </h3>
                          <ul className="space-y-2">
                            {inclusions.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>{typeof item === 'string' ? item : item.description || item.name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {exclusions.length > 0 && (
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <X className="w-5 h-5 text-red-500" />
                            Not Included
                          </h3>
                          <ul className="space-y-2">
                            {exclusions.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                                <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <span>{typeof item === 'string' ? item : item.description || item.name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ITINERARY */}
            {itineraryItems.length > 0 && (
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
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      {itineraryItems.map((item, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                              {idx + 1}
                            </div>
                            {idx < itineraryItems.length - 1 && (
                              <div className="w-0.5 flex-1 bg-blue-100 mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <h3 className="font-medium text-gray-900">{item.title}</h3>
                            {item.duration && (
                              <p className="text-xs text-gray-500 mt-1">{item.duration}</p>
                            )}
                            {item.description && (
                              <p className="text-gray-600 text-sm mt-2">{item.description}</p>
                            )}
                            {item.admissionIncluded && (
                              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                <Ticket className="w-3 h-3" />
                                Admission included
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* REVIEWS */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleSection('reviews')}
                  className="w-full px-6 py-4 flex items-center justify-between text-left border-b border-gray-100"
                >
                  <h2 className="text-lg font-semibold text-gray-900">
                    Reviews ({fullTourData?.reviewCount || reviews.length})
                  </h2>
                  {expandedSections.reviews ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {expandedSections.reviews && (
                  <div className="px-6 py-4">
                    {/* Rating Summary */}
                    <div className="flex items-start gap-8 mb-6 pb-6 border-b border-gray-100">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900">
                          {fullTourData?.rating?.toFixed(1) || '4.5'}
                        </div>
                        <div className="flex items-center gap-0.5 justify-center mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < Math.round(fullTourData?.rating || 4.5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {fullTourData?.reviewCount || reviews.length} reviews
                        </p>
                      </div>

                      <div className="flex-1">
                        <RatingBreakdown
                          reviews={fullTourData?.reviews}
                          totalReviews={fullTourData?.reviewCount}
                          averageRating={fullTourData?.rating}
                        />
                      </div>
                    </div>

                    {/* Review List */}
                    <div className="space-y-4">
                      {reviews.slice(0, visibleReviewCount).map((review, idx) => (
                        <ReviewCard key={idx} review={review} />
                      ))}
                    </div>

                    {reviews.length > visibleReviewCount && (
                      <button
                        onClick={() => setVisibleReviewCount(prev => prev + 10)}
                        className="w-full mt-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Show more reviews
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN - Booking Panel */}
          {/* ============================================================ */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  {hasDiscount && fullTourData?.originalPrice && (
                    <span className="text-gray-400 line-through text-lg">
                      {formatCurrency(fullTourData.originalPrice)}
                    </span>
                  )}
                  <span className={`text-3xl font-bold ${hasDiscount ? 'text-orange-600' : 'text-gray-900'}`}>
                    {formatCurrency(displayPrice)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {isPerGroup ? 'per group' : 'per person'}
                </p>
              </div>

              {/* Travelers Selector */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Travelers</label>
                <select
                  value={selectedTravelers}
                  onChange={(e) => setSelectedTravelers(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'traveler' : 'travelers'}
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

              {/* Reserve Now & Pay Later */}
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
                  href={fullTourData?.bookingLink || fullTourData?.link}
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

      {/* ================================================================== */}
      {/* FLOATING CART PANEL - WITH CLICKABLE ITEMS */}
      {/* ================================================================== */}
      {cartSidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/30"
            onClick={() => setCartSidebarOpen(false)}
          />
          
          <div className="absolute right-4 top-4 bottom-4 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                My Trip ({cartItemCount})
              </h2>
              <button
                onClick={() => setCartSidebarOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3">
              {cartItemCount === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Your trip is empty</p>
                  <p className="text-xs mt-1">Add tours to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.tours.map(cartTour => {
                    const isGroupPricing = cartTour.pricingType === 'group';
                    const itemTotal = isGroupPricing ? cartTour.price : (cartTour.price * selectedTravelers);
                    const isCurrentTour = cartTour.id === tour.id || cartTour.productCode === tour.productCode;
                    
                    return (
                      <div key={cartTour.id} className={`flex gap-2.5 p-2.5 rounded-xl group ${isCurrentTour ? 'bg-blue-50 ring-2 ring-blue-200' : 'bg-gray-50'}`}>
                        <div 
                          className={`flex gap-2.5 flex-1 min-w-0 ${isCurrentTour ? 'cursor-default' : 'cursor-pointer'}`}
                          onClick={() => {
                            if (!isCurrentTour) {
                              setCartSidebarOpen(false);
                              onOpenProductPage?.(cartTour);
                            }
                          }}
                        >
                          {cartTour.image && (
                            <img 
                              src={cartTour.image} 
                              alt="" 
                              className={`w-16 h-16 object-cover rounded-lg flex-shrink-0 transition-all ${!isCurrentTour ? 'group-hover:ring-2 group-hover:ring-blue-400' : ''}`}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium line-clamp-2 leading-tight transition-colors ${isCurrentTour ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-600'}`}>
                              {cartTour.name}
                              {isCurrentTour && <span className="text-xs text-blue-500 ml-1">(viewing)</span>}
                            </p>
                            <div className="mt-1">
                              <span className="text-sm text-green-600 font-semibold">
                                {formatCurrency(itemTotal)}
                              </span>
                              {!isGroupPricing && selectedTravelers > 1 && (
                                <span className="text-xs text-gray-500 ml-1">
                                  ({formatCurrency(cartTour.price)} × {selectedTravelers})
                                </span>
                              )}
                              {isGroupPricing && (
                                <span className="text-xs text-gray-500 ml-1">per group</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {removeFromCart && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromCart('tour', cartTour.id);
                            }}
                            className="text-gray-400 hover:text-red-500 flex-shrink-0 p-1"
                            aria-label="Remove from cart"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {cartItemCount > 0 && (
              <div className="border-t border-gray-100 p-3 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Total</span>
                    <span className="text-xs text-gray-400 ml-1">for {selectedTravelers} guest{selectedTravelers > 1 ? 's' : ''}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(cartTotal)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* PAY LATER INFO MODAL */}
      {showPayLaterInfo && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPayLaterInfo(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Reserve Now & Pay Later</h3>
              <button
                onClick={() => setShowPayLaterInfo(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3 text-gray-600">
              <p>
                Secure your spot today without paying upfront. You'll only be charged closer to your experience date.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>No payment required today</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Free cancellation up to 24 hours before</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Guaranteed availability once reserved</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => setShowPayLaterInfo(false)}
              className="w-full mt-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
