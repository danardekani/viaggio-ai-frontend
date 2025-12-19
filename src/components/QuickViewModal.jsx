import React, { useState } from 'react';
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
  Smartphone
} from 'lucide-react';

export default function QuickViewModal({ 
  tour, 
  onClose, 
  formatCurrency, 
  travelers = 2, 
  onAddToTrip, 
  isInCart,
  isLoading = false
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  if (!tour) return null;

  // Handle images - could be array of strings or array of objects with url property
  const getImages = () => {
    if (tour.images && tour.images.length > 0) {
      return tour.images.map(img => typeof img === 'string' ? img : img.url || img);
    }
    if (tour.image) {
      return [tour.image];
    }
    return [];
  };

  const images = getImages();
  const hasMultipleImages = images.length > 1;
  const tourFlags = tour.flags || [];

  // Calculate the display price based on pricing type
  const isPerGroup = tour.pricingType === 'group';
  const displayPrice = tour.price;
  const hasDiscount = tour.hasDiscount || tourFlags.includes('SPECIAL_OFFER');
  
  // Navigation handlers
  const prevImage = () => setCurrentImageIndex(i => i === 0 ? images.length - 1 : i - 1);
  const nextImage = () => setCurrentImageIndex(i => i === images.length - 1 ? 0 : i + 1);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Title & Rating (like Viator) */}
        <div className="p-4 sm:p-5 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-2">
                {tour.name}
              </h2>
              {/* Rating row like Viator */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
                {tour.rating && tour.rating !== 'New' && (
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1,2,3,4,5].map(star => (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 ${star <= Math.floor(tour.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="font-medium text-gray-700">{tour.reviewCount?.toLocaleString() || 0} Reviews</span>
                  </div>
                )}
                {tourFlags.includes('LIKELY_TO_SELL_OUT') && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="text-green-600 font-medium">🏆 Badge of Excellence</span>
                  </>
                )}
                {tour.destination && (
                  <>
                    <span className="text-gray-300 hidden sm:inline">|</span>
                    <span className="text-gray-600 hidden sm:inline">{tour.destination}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              Loading full details...
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 bg-white hover:bg-gray-100 rounded-full shadow-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Image Gallery - Viator Style with thumbnails on LEFT */}
          <div className="flex flex-col md:flex-row bg-gray-50 border-b border-gray-100">
            {/* Thumbnail Strip - LEFT side (desktop only) - always show if we have images */}
            {images.length > 0 && (
              <div className="hidden md:flex flex-col gap-2 p-2 w-36 bg-white border-r border-gray-100 max-h-[450px] overflow-y-auto">
                {images.slice(0, 5).map((img, idx) => (
                  <button 
                    key={idx}
                    className={`flex-shrink-0 w-full aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <img
                      src={img}
                      alt={`${tour.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                {images.length > 5 && (
                  <button 
                    className="w-full aspect-[4/3] rounded-lg bg-gray-900/60 flex items-center justify-center text-sm text-white font-medium hover:bg-gray-900/70 transition-colors relative overflow-hidden"
                    onClick={() => setCurrentImageIndex(5)}
                  >
                    {images[5] && (
                      <img
                        src={images[5]}
                        alt="More"
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                      />
                    )}
                    <span className="relative z-10">See More</span>
                  </button>
                )}
              </div>
            )}

            {/* Main Image */}
            <div className="flex-1 relative bg-gray-100 min-h-[250px] sm:min-h-[300px] md:min-h-[400px] flex items-center justify-center">
              {images.length > 0 ? (
                <img
                  src={images[currentImageIndex]}
                  alt={tour.name}
                  className="w-full h-full object-cover"
                  style={{ maxHeight: '450px' }}
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-blue-300" />
                </div>
              )}
              
              {/* Badges on image */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                {hasDiscount && (
                  <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-lg">
                    <Tag className="w-3 h-3" />
                    DEAL
                  </span>
                )}
                {tourFlags.includes('LIKELY_TO_SELL_OUT') && (
                  <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow-lg">
                    🔥 Popular
                  </span>
                )}
              </div>

              {/* Navigation Arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Mobile Thumbnail Strip - below image */}
            {images.length > 1 && (
              <div className="md:hidden flex gap-2 p-2 overflow-x-auto bg-white border-t border-gray-100">
                {images.slice(0, 6).map((img, idx) => (
                  <button 
                    key={idx}
                    className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex 
                        ? 'border-blue-500' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <img
                      src={img}
                      alt={`${tour.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Key Info Row - like Viator */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 sm:px-5 py-3 border-b border-gray-100 bg-white text-sm">
            {tour.duration && (
              <div className="flex items-center gap-1.5 text-gray-700">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{tour.duration}</span>
              </div>
            )}
            {tourFlags.includes('FREE_CANCELLATION') && (
              <div className="flex items-center gap-1.5 text-gray-700">
                <Check className="w-4 h-4 text-green-500" />
                <span>Free cancellation</span>
              </div>
            )}
            {tourFlags.includes('SKIP_THE_LINE') && (
              <div className="flex items-center gap-1.5 text-gray-700">
                <span>⚡</span>
                <span>Skip the line</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-gray-700">
              <Smartphone className="w-4 h-4 text-gray-400" />
              <span>Mobile ticket</span>
            </div>
            {tour.languages && tour.languages.length > 0 && (
              <div className="flex items-center gap-1.5 text-gray-700">
                <Globe className="w-4 h-4 text-gray-400" />
                <span>Offered in: {tour.languages.slice(0, 2).join(', ')}{tour.languages.length > 2 ? ` +${tour.languages.length - 2}` : ''}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5">
            {/* Overview Section - like Viator */}
            {tour.description && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Overview</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line mb-4">
                  {tour.description}
                </p>
                
                {/* Bullet points from highlights */}
                {tour.highlights && tour.highlights.length > 0 && (
                  <ul className="space-y-2 mt-4">
                    {tour.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-gray-400 mt-1">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* What You'll See / Itinerary */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">What You'll See</h3>
                <div className="space-y-3">
                  {tour.itinerary.map((stop, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{stop.name || stop.description}</p>
                        {stop.duration && (
                          <p className="text-sm text-gray-500">{Math.round(stop.duration / 60)} min</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What's Included - Two Column Layout like Viator */}
            {((tour.inclusions && tour.inclusions.length > 0) || (tour.exclusions && tour.exclusions.length > 0)) && (
              <div className="mb-6 pt-5 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">What's Included</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  {/* Inclusions - Left */}
                  <div className="space-y-2">
                    {tour.inclusions && tour.inclusions.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-gray-700">
                        <Check className="w-4 h-4 text-gray-700 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Exclusions - Right */}
                  <div className="space-y-2">
                    {tour.exclusions && tour.exclusions.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-gray-500">
                        <X className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info */}
            {tour.additionalInfo && tour.additionalInfo.length > 0 && (
              <div className="pt-5 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Additional Information</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tour.additionalInfo.slice(0, 8).map((info, idx) => (
                    <li key={idx} className="text-gray-600 text-sm flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      {info}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cancellation Policy */}
            {tour.cancellationPolicy && (
              <div className="mt-5 bg-green-50 border border-green-100 rounded-lg p-3">
                <p className="text-sm text-green-700">
                  <span className="font-medium">✓ Free cancellation:</span> {tour.cancellationPolicy}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Price and Actions - Fixed */}
        <div className="border-t border-gray-200 bg-white px-4 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-center sm:text-left">
            {/* Deal Badge */}
            {hasDiscount && (
              <div className="flex items-center gap-1 mb-1 justify-center sm:justify-start">
                <Tag className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs font-semibold text-orange-500 uppercase">Special Offer</span>
              </div>
            )}
            
            {/* Prices */}
            <div className="flex items-baseline gap-2 justify-center sm:justify-start">
              {hasDiscount && tour.originalPrice && (
                <span className="text-gray-400 line-through text-base">
                  {formatCurrency(tour.originalPrice)}
                </span>
              )}
              <span className={`text-2xl sm:text-3xl font-bold ${hasDiscount ? 'text-orange-500' : 'text-green-600'}`}>
                {formatCurrency(displayPrice)}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {isPerGroup 
                ? `per group${tour.maxGroupSize ? ` (up to ${tour.maxGroupSize})` : ''}`
                : travelers > 1 
                  ? `per person × ${travelers} = ${formatCurrency(displayPrice * travelers)} total`
                  : 'per person'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <a
              href={tour.bookingLink || tour.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              View on Viator
            </a>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToTrip();
              }}
              className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-lg font-semibold transition-colors text-sm ${
                isInCart
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isInCart ? 'Remove from Trip' : 'Add to Trip'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
