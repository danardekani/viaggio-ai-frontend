import React, { useState, useEffect, memo } from 'react';
import { 
  X, 
  ExternalLink, 
  Clock, 
  Star, 
  Smartphone, 
  Globe, 
  Info,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const QuickViewModal = memo(({ 
  tour,
  onClose,
  formatCurrency,
  travelers = 1,
  onAddToTrip,
  isInCart,
  descriptionExpanded: externalDescriptionExpanded,
  onToggleDescription: externalOnToggleDescription,
  onViewFullDetails,
  isLoading
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(externalDescriptionExpanded || false);

  // Use external state if provided
  useEffect(() => {
    if (externalDescriptionExpanded !== undefined) {
      setDescriptionExpanded(externalDescriptionExpanded);
    }
  }, [externalDescriptionExpanded]);

  const handleToggleDescription = () => {
    if (externalOnToggleDescription) {
      externalOnToggleDescription();
    } else {
      setDescriptionExpanded(!descriptionExpanded);
    }
  };

  // Prepare images
  const images = tour.images || tour.thumbnails || [];
  
  // Determine pricing
  const isPerGroup = tour.pricingUnit === 'per group' || 
                     (tour.price && tour.price.toString().toLowerCase().includes('per group'));
  const displayPrice = tour.price || 0;
  const hasDiscount = tour.hasDiscount || (tour.originalPrice && tour.originalPrice > tour.price);

  // Extract tour flags
  const tourFlags = tour.flags || [];
  
  // Calculate recommendation percent
  const recommendationPercent = tour.recommendationPercent || 
    (tour.recommendationCount && tour.reviewCount 
      ? Math.round((tour.recommendationCount / tour.reviewCount) * 100)
      : null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Navigate carousel
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 leading-tight pr-8">
                {tour.name || tour.title}
              </h2>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Rating & Reviews */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
            {tour.rating && (
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(tour.rating) 
                          ? 'text-emerald-500 fill-emerald-500' 
                          : 'text-gray-300'
                      }`}
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

        {/* IMAGE GALLERY - Main Image */}
        <div className="relative bg-gray-900 flex items-center justify-center" style={{ minHeight: '280px', maxHeight: '400px' }}>
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex]}
                alt={tour.name}
                className="w-full h-full object-contain"
                style={{ maxHeight: '400px' }}
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-400">
              <Info className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* HORIZONTAL THUMBNAIL CAROUSEL - Below Main Image */}
        {images.length > 1 && (
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 overflow-x-auto">
            <div className="flex gap-2">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden transition-all border-2 ${
                    idx === currentImageIndex 
                      ? 'border-emerald-500 ring-2 ring-emerald-200' 
                      : 'border-transparent opacity-70 hover:opacity-100 hover:border-gray-300'
                  }`}
                  onClick={() => setCurrentImageIndex(idx)}
                >
                  <img 
                    src={img} 
                    alt={`Thumbnail ${idx + 1}`} 
                    loading="lazy" 
                    className="w-full h-full object-cover" 
                  />
                </button>
              ))}
            </div>
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
                {descriptionExpanded || tour.description.length <= 300
                  ? tour.description
                  : tour.description.substring(0, 300) + '...'}
              </p>
              {tour.description.length > 300 && (
                <button
                  onClick={handleToggleDescription}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  {descriptionExpanded ? (
                    <>
                      View less
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      View more
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* HORIZONTAL HIGHLIGHTS */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Highlights
            </h3>
            
            {/* Horizontal scrollable container */}
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 flex-nowrap">
                {/* Use API highlights if available */}
                {tour.highlights?.length > 0 ? (
                  tour.highlights.slice(0, 5).map((highlight, i) => (
                    <React.Fragment key={i}>
                      <div className="flex items-center gap-2 whitespace-nowrap px-2 py-1">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{highlight}</span>
                      </div>
                      {i < tour.highlights.slice(0, 5).length - 1 && (
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  /* Generate highlights from flags and features if no API highlights */
                  <>
                    {tourFlags.includes('FREE_CANCELLATION') && (
                      <>
                        <div className="flex items-center gap-2 whitespace-nowrap px-2 py-1">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Free cancellation available</span>
                        </div>
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      </>
                    )}
                    {tourFlags.includes('SKIP_THE_LINE') && (
                      <>
                        <div className="flex items-center gap-2 whitespace-nowrap px-2 py-1">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Skip-the-line access</span>
                        </div>
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      </>
                    )}
                    {tourFlags.includes('LIKELY_TO_SELL_OUT') && (
                      <>
                        <div className="flex items-center gap-2 whitespace-nowrap px-2 py-1">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Popular experience - book early!</span>
                        </div>
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      </>
                    )}
                    {tour.languages?.length > 0 && (
                      <>
                        <div className="flex items-center gap-2 whitespace-nowrap px-2 py-1">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Professional local guide</span>
                        </div>
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      </>
                    )}
                    <div className="flex items-center gap-2 whitespace-nowrap px-2 py-1">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Mobile ticket accepted</span>
                    </div>
                  </>
                )}
              </div>
            </div>
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
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {onViewFullDetails && (
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); onViewFullDetails(tour); }}
                className="flex-1 sm:flex-none px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium flex items-center justify-center gap-1.5"
              >
                <Info className="w-4 h-4" />
                Full Details
              </button>
            )}
            <a
              href={tour.bookingLink || tour.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white text-sm font-medium flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              Viator
            </a>
            <button
              onClick={(e) => { e.stopPropagation(); onAddToTrip(); }}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-lg font-medium text-sm ${
                isInCart
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {isInCart ? 'Remove' : 'Add to Trip'}
            </button>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
});

export default QuickViewModal;
