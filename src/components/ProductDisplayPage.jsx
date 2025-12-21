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
  Building
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
  const [selectedDate, setSelectedDate] = useState('');
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
          setFullTourData(prev => ({
            ...prev,
            ...(data.tour || data)
          }));
        }
      } catch (error) {
        console.error('Failed to fetch tour details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFullDetails();
  }, [tour?.productCode, tour?.id, backendUrl]);

  // Memoize images
  const images = useMemo(() => {
    if (!fullTourData) return [];
    if (fullTourData.images?.length > 0) {
      return fullTourData.images.map(img =>
        typeof img === 'string' ? img : img.url || img
      );
    }
    if (fullTourData.image) return [fullTourData.image];
    return [];
  }, [fullTourData]);

  // Memoize tour flags
  const tourFlags = useMemo(() => fullTourData?.flags || [], [fullTourData?.flags]);

  // Pricing calculations
  const { isPerGroup, displayPrice, hasDiscount, totalPrice } = useMemo(() => {
    const perGroup = fullTourData?.pricingType === 'group';
    const price = fullTourData?.price || 0;
    return {
      isPerGroup: perGroup,
      displayPrice: price,
      hasDiscount: fullTourData?.hasDiscount || tourFlags.includes('SPECIAL_OFFER'),
      totalPrice: perGroup ? price : price * selectedTravelers
    };
  }, [fullTourData, tourFlags, selectedTravelers]);

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

  // Generate cancellation policy text
  const cancellationPolicy = useMemo(() => {
    if (fullTourData?.cancellationPolicy) return fullTourData.cancellationPolicy;
    if (tourFlags.includes('FREE_CANCELLATION')) {
      return 'Free cancellation up to 24 hours before the experience starts (local time). Full refund if canceled at least 24 hours in advance.';
    }
    return 'Cancellation policies vary. Please check the booking details for specific terms.';
  }, [fullTourData?.cancellationPolicy, tourFlags]);

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
              {/* Reserve Now & Pay Later badge */}
              {tourFlags.includes('FREE_CANCELLATION') && (
                <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded mb-3">
                  Reserve Now & Pay Later
                </span>
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
              {/* Main Image */}
              <div className="relative aspect-[16/9] bg-gray-900">
                {images.length > 0 ? (
                  <img
                    src={images[currentImageIndex]}
                    alt={fullTourData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
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

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50">
                  {images.slice(0, 8).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden ${
                        idx === currentImageIndex
                          ? 'ring-2 ring-blue-500'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${fullTourData.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
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
            {(fullTourData.itinerary?.length > 0 || fullTourData.pointsOfInterest?.length > 0) && (
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
                    {fullTourData.itinerary?.map((stop, idx) => (
                      <div key={idx} className="flex gap-4 pb-6 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                            {idx + 1}
                          </div>
                          {idx < (fullTourData.itinerary?.length || 0) - 1 && (
                            <div className="w-0.5 flex-1 bg-blue-100 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <h4 className="font-medium text-gray-900">{stop.name || stop.title}</h4>
                          {stop.description && (
                            <p className="text-gray-600 text-sm mt-1">{stop.description}</p>
                          )}
                          {stop.duration && (
                            <p className="text-gray-500 text-xs mt-2">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {stop.duration}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Points of Interest */}
                    {fullTourData.pointsOfInterest?.length > 0 && !fullTourData.itinerary?.length && (
                      <div className="space-y-3">
                        {fullTourData.pointsOfInterest.map((poi, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{poi}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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

                  {/* Additional notes */}
                  {fullTourData.additionalInfo && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Additional Notes</h3>
                      <p className="text-gray-600 text-sm whitespace-pre-line">
                        {fullTourData.additionalInfo}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CANCELLATION POLICY */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                Cancellation Policy
              </h2>
              <p className="text-gray-600">
                {cancellationPolicy}
              </p>
              {tourFlags.includes('FREE_CANCELLATION') && (
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
                    <button className="w-full mt-4 py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
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
                  {hasDiscount && fullTourData.originalPrice && (
                    <span className="text-gray-400 line-through text-lg">
                      {formatCurrency(fullTourData.originalPrice)}
                    </span>
                  )}
                  <span className={`text-3xl font-bold ${hasDiscount ? 'text-orange-500' : 'text-gray-900'}`}>
                    {formatCurrency(displayPrice)}
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

              {/* Date Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

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

              {/* Reserve Now & Pay Later */}
              {tourFlags.includes('FREE_CANCELLATION') && (
                <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-emerald-700 font-medium">
                    Reserve Now & Pay Later
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    Secure your spot while staying flexible
                  </p>
                </div>
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
    </div>
  );
}
