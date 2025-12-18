import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle, 
  ChevronLeft,
  ChevronRight,
  ExternalLink, 
  Tag,
  Globe,
  Info,
  Check,
  Shield,
  Loader2
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

  const images = tour.images && tour.images.length > 0 ? tour.images : (tour.image ? [tour.image] : []);
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Title & Rating */}
        <div className="p-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-start justify-between gap-4 pr-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2 leading-tight">
              {tourFlags.includes('LIKELY_TO_SELL_OUT') && (
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              )}
              {tour.name}
            </h2>
            {tour.rating && tour.rating !== 'New' && (
              <div className="flex items-center gap-1.5 flex-shrink-0 bg-green-50 px-3 py-1.5 rounded-lg">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-gray-900 text-lg">{tour.rating}</span>
                {tour.reviewCount > 0 && (
                  <span className="text-gray-500">({tour.reviewCount.toLocaleString()})</span>
                )}
              </div>
            )}
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
          className="absolute top-4 right-4 z-20 p-2 bg-white hover:bg-gray-100 rounded-full shadow-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Image Gallery - Viator Style */}
          <div className="flex flex-col md:flex-row bg-gray-50">
            {/* Thumbnail Strip - LEFT side (desktop only) */}
            {hasMultipleImages && (
              <div className="hidden md:flex flex-col gap-2 p-3 w-28 bg-white border-r border-gray-100 max-h-[400px] overflow-y-auto">
                {images.slice(0, 5).map((img, idx) => (
                  <button 
                    key={idx}
                    className={`flex-shrink-0 w-full aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-transparent hover:border-gray-300'
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
                  <div className="w-full aspect-[4/3] rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium cursor-pointer hover:bg-gray-300 transition-colors">
                    +{images.length - 5} more
                  </div>
                )}
              </div>
            )}

            {/* Main Image */}
            <div className="flex-1 relative bg-gray-100 min-h-[280px] md:min-h-[400px] flex items-center justify-center">
              {images.length > 0 ? (
                <img
                  src={images[currentImageIndex]}
                  alt={tour.name}
                  className="w-full h-full object-cover max-h-[400px]"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-blue-300" />
                </div>
              )}
              
              {/* Badges on image */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {hasDiscount && (
                  <span className="px-3 py-1.5 bg-orange-500 text-white text-sm font-semibold rounded-full flex items-center gap-1 shadow-lg">
                    <Tag className="w-4 h-4" />
                    DEAL
                  </span>
                )}
                {tourFlags.includes('LIKELY_TO_SELL_OUT') && (
                  <span className="px-3 py-1.5 bg-red-500 text-white text-sm font-semibold rounded-full shadow-lg">
                    🔥 Popular
                  </span>
                )}
              </div>

              {/* Navigation Arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  {/* Image counter */}
                  <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 text-white text-sm rounded-full">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Thumbnail Strip - below image */}
            {hasMultipleImages && (
              <div className="md:hidden flex gap-2 p-3 overflow-x-auto bg-white border-t border-gray-100">
                {images.slice(0, 6).map((img, idx) => (
                  <button 
                    key={idx}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex 
                        ? 'border-blue-500' 
                        : 'border-transparent'
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
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 border-b border-gray-100 bg-white">
            {tour.duration && (
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{tour.duration}</span>
              </div>
            )}
            {tourFlags.includes('FREE_CANCELLATION') && (
              <div className="flex items-center gap-2 text-green-700">
                <Check className="w-5 h-5" />
                <span className="font-medium">Free cancellation</span>
              </div>
            )}
            {tourFlags.includes('SKIP_THE_LINE') && (
              <div className="flex items-center gap-2 text-blue-700">
                <span>⚡</span>
                <span className="font-medium">Skip the line</span>
              </div>
            )}
            {tour.languages && tour.languages.length > 0 && (
              <div className="flex items-center gap-2 text-gray-700">
                <Globe className="w-5 h-5 text-gray-400" />
                <span>Offered in: <span className="font-medium">{tour.languages.slice(0, 2).join(', ')}</span>
                {tour.languages.length > 2 && <span className="text-blue-600"> +{tour.languages.length - 2} more</span>}
                </span>
              </div>
            )}
          </div>

          {/* Content - Two Columns */}
          <div className="p-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - About */}
              <div>
                {tour.description && (
                  <div className="mb-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-500" />
                      About this tour
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                      {tour.description}
                    </p>
                  </div>
                )}

                {/* Itinerary / What You'll See */}
                {tour.itinerary && tour.itinerary.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      What you'll see
                    </h3>
                    <div className="space-y-2">
                      {tour.itinerary.map((stop, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{stop.name || stop.description}</p>
                            {stop.duration && (
                              <p className="text-xs text-gray-500">{Math.round(stop.duration / 60)} min</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Highlights & Inclusions */}
              <div>
                {/* Highlights */}
                <div className="mb-5">
                  <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Highlights
                  </h3>
                  <ul className="space-y-2">
                    {tourFlags.includes('FREE_CANCELLATION') && (
                      <li className="flex items-start gap-2 text-gray-700 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Free cancellation up to 24 hours before</span>
                      </li>
                    )}
                    {tourFlags.includes('SKIP_THE_LINE') && (
                      <li className="flex items-start gap-2 text-gray-700 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Skip-the-line access included</span>
                      </li>
                    )}
                    {tourFlags.includes('LIKELY_TO_SELL_OUT') && (
                      <li className="flex items-start gap-2 text-gray-700 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Highly rated and popular experience</span>
                      </li>
                    )}
                    {tour.isPrivateTour && (
                      <li className="flex items-start gap-2 text-gray-700 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Private tour - just you and your group</span>
                      </li>
                    )}
                    {tour.duration && (
                      <li className="flex items-start gap-2 text-gray-700 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{tour.duration} experience</span>
                      </li>
                    )}
                    {tour.languages && tour.languages.length > 0 && (
                      <li className="flex items-start gap-2 text-gray-700 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Available in {tour.languages.length} language{tour.languages.length > 1 ? 's' : ''}</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* What's Included */}
                {tour.inclusions && tour.inclusions.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      What's included
                    </h3>
                    <ul className="space-y-1.5">
                      {tour.inclusions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What's Not Included */}
                {tour.exclusions && tour.exclusions.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <X className="w-5 h-5 text-red-500" />
                      Not included
                    </h3>
                    <ul className="space-y-1.5">
                      {tour.exclusions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-500 text-sm">
                          <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            {tour.additionalInfo && tour.additionalInfo.length > 0 && (
              <div className="mt-5 pt-5 border-t border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Info className="w-5 h-5 text-gray-500" />
                  Additional information
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tour.additionalInfo.slice(0, 6).map((info, idx) => (
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
              <div className="mt-5 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Cancellation:</span> {tour.cancellationPolicy}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Price and Actions - Fixed */}
        <div className="border-t border-gray-200 bg-white px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
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
                <span className="text-gray-400 line-through text-lg">
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
          
          <div className="flex items-center gap-3">
            <a
              href={tour.bookingLink || tour.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
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
              className={`px-5 py-2.5 rounded-lg font-semibold transition-colors ${
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
