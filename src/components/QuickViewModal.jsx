import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  X,
  Star,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Tag,
  Globe,
  Check,
  Loader2,
  Smartphone,
  Heart,
  Info
} from 'lucide-react';

const QuickViewModal = memo(function QuickViewModal({
  tour,
  onClose,
  formatCurrency,
  travelers = 2,
  onAddToTrip,
  isInCart,
  isLoading = false
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Memoize images array
  const images = useMemo(() => {
    if (!tour) return [];
    if (tour.images && tour.images.length > 0) {
      return tour.images.map(img => typeof img === 'string' ? img : img.url || img);
    }
    if (tour.image) {
      return [tour.image];
    }
    return [];
  }, [tour]);

  // Memoize derived values
  const hasMultipleImages = images.length > 1;
  const tourFlags = useMemo(() => tour?.flags || [], [tour?.flags]);

  // Memoize pricing calculations
  const { isPerGroup, displayPrice, hasDiscount } = useMemo(() => ({
    isPerGroup: tour?.pricingType === 'group',
    displayPrice: tour?.price,
    hasDiscount: tour?.hasDiscount || tourFlags.includes('SPECIAL_OFFER')
  }), [tour?.pricingType, tour?.price, tour?.hasDiscount, tourFlags]);

  // Memoize navigation handlers
  const prevImage = useCallback(() =>
    setCurrentImageIndex(i => i === 0 ? images.length - 1 : i - 1),
    [images.length]
  );

  const nextImage = useCallback(() =>
    setCurrentImageIndex(i => i === images.length - 1 ? 0 : i + 1),
    [images.length]
  );

  // Memoize recommendation percentage
  const recommendationPercent = useMemo(() =>
    tour?.rating ? Math.min(99, Math.round(tour.rating * 20)) : null,
    [tour?.rating]
  );

  // Memoize star rating array
  const starRatings = useMemo(() => [1, 2, 3, 4, 5], []);

  if (!tour) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 bg-white hover:bg-gray-100 rounded-full shadow-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* HEADER: Title + Rating */}
          <div className="p-4 pb-3 pr-12">
            <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">
              {tour.name}
            </h2>
            
            {/* Rating row */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {tour.rating && tour.rating !== 'New' && (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {starRatings.map(star => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= Math.floor(tour.rating) ? 'text-emerald-500 fill-emerald-500' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 ml-1">
                    {tour.reviewCount?.toLocaleString() || 0} Reviews
                  </span>
                </div>
              )}
              
              {recommendationPercent && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-600">
                    <span className="text-red-500">❤️</span> Recommended by {recommendationPercent}% of travelers
                  </span>
                </>
              )}
            </div>
            
            {isLoading && (
              <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading details...
              </div>
            )}
          </div>

          {/* IMAGE GALLERY */}
          <div className="flex border-t border-b border-gray-100">
            
            {/* Thumbnails - LEFT side */}
            {images.length > 0 && (
              <div className="hidden sm:flex flex-col gap-1.5 p-2 w-28 flex-shrink-0 bg-gray-50">
                {images.slice(0, 5).map((img, idx) => (
                  <button 
                    key={idx}
                    className={`w-full aspect-[4/3] rounded overflow-hidden transition-all ${
                      idx === currentImageIndex 
                        ? 'ring-2 ring-emerald-500' 
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <img
                      src={img}
                      alt={`${tour.name} ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                
                {images.length > 5 && (
                  <button 
                    className="w-full aspect-[4/3] rounded overflow-hidden relative"
                    onClick={() => setCurrentImageIndex(5)}
                  >
                    <img src={images[5]} alt="More" loading="lazy" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">See More</span>
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Main Image */}
            <div className="flex-1 relative bg-gray-900 flex items-center justify-center" style={{ minHeight: '280px', maxHeight: '350px' }}>
              {images.length > 0 ? (
                <img
                  src={images[currentImageIndex]}
                  alt={tour.name}
                  className="max-w-full max-h-[350px] w-auto h-auto object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50" style={{ height: '280px' }}>
                  <MapPin className="w-12 h-12 text-blue-300" />
                </div>
              )}
              
              {/* Wishlist button */}
              <button className="absolute top-3 right-3 px-3 py-1.5 bg-white rounded-full shadow flex items-center gap-1.5 hover:bg-gray-50 text-sm">
                <Heart className="w-4 h-4 text-gray-500" />
                <span className="hidden md:inline text-gray-600">Add to Wishlist</span>
              </button>

              {/* Navigation Arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              
              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>
          </div>

          {/* Mobile thumbnails */}
          {images.length > 1 && (
            <div className="sm:hidden flex gap-1.5 p-2 overflow-x-auto bg-gray-50">
              {images.slice(0, 6).map((img, idx) => (
                <button 
                  key={idx}
                  className={`flex-shrink-0 w-14 h-14 rounded overflow-hidden ${
                    idx === currentImageIndex ? 'ring-2 ring-emerald-500' : 'opacity-70'
                  }`}
                  onClick={() => setCurrentImageIndex(idx)}
                >
                  <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* KEY INFO BAR */}
          <div className="flex flex-wrap items-center gap-4 px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
            {tour.duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{tour.duration}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-gray-400" />
              <span>Mobile ticket</span>
            </div>
            {tour.languages && tour.languages.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-gray-400" />
                <span>Offered in: {tour.languages.slice(0, 2).join(', ')}</span>
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div className="p-4 space-y-5">
            
            {/* About */}
            {tour.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-gray-400" />
                  About this tour
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {tour.description.length > 400 
                    ? tour.description.substring(0, 400) + '...' 
                    : tour.description}
                </p>
              </div>
            )}

            {/* Highlights */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Highlights
              </h3>
              <ul className="space-y-1.5">
                {/* Use API highlights if available */}
                {tour.highlights?.length > 0 ? (
                  tour.highlights.slice(0, 5).map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))
                ) : (
                  /* Generate highlights from flags and features if no API highlights */
                  <>
                    {tourFlags.includes('FREE_CANCELLATION') && (
                      <li className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>Free cancellation available</span>
                      </li>
                    )}
                    {tourFlags.includes('SKIP_THE_LINE') && (
                      <li className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>Skip-the-line access</span>
                      </li>
                    )}
                    {tourFlags.includes('LIKELY_TO_SELL_OUT') && (
                      <li className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>Popular experience - book early!</span>
                      </li>
                    )}
                    {tour.languages?.length > 0 && (
                      <li className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>Professional local guide</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>Mobile ticket accepted</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* What's Included */}
            {((tour.inclusions && tour.inclusions.length > 0) || (tour.exclusions && tour.exclusions.length > 0)) && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  What's included
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                  {tour.inclusions?.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                  {tour.exclusions?.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                      <X className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Itinerary */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  What you'll see
                </h3>
                <div className="space-y-2">
                  {tour.itinerary.slice(0, 5).map((stop, idx) => (
                    <div key={idx} className="flex gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-gray-600">{stop.name || stop.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <div className="flex items-baseline gap-2 justify-center sm:justify-start">
              {hasDiscount && tour.originalPrice && (
                <span className="text-gray-400 line-through text-sm">
                  {formatCurrency(tour.originalPrice)}
                </span>
              )}
              <span className={`text-2xl font-bold ${hasDiscount ? 'text-orange-500' : 'text-emerald-600'}`}>
                {formatCurrency(displayPrice)}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {isPerGroup 
                ? 'per group'
                : travelers > 1 
                  ? `per person × ${travelers} = ${formatCurrency(displayPrice * travelers)} total`
                  : 'per person'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={tour.bookingLink || tour.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white text-sm font-medium flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              View on Viator
            </a>
            <button
              onClick={(e) => { e.stopPropagation(); onAddToTrip(); }}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-lg font-medium text-sm ${
                isInCart
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {isInCart ? 'Remove from Trip' : 'Add to Trip'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default QuickViewModal;