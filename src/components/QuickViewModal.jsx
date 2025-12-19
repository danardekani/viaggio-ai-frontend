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
  Smartphone,
  Heart,
  Info
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

  // Calculate recommendation percentage (mock based on rating)
  const recommendationPercent = tour.rating ? Math.min(99, Math.round(tour.rating * 20)) : null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 bg-white hover:bg-gray-100 rounded-full shadow-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* ============================================ */}
          {/* HEADER: Title + Rating Row (like Viator) */}
          {/* ============================================ */}
          <div className="p-4 sm:p-5 pb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-2 pr-10">
              {tour.name}
            </h2>
            
            {/* Rating row - matches Viator exactly */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {/* Star Rating */}
              {tour.rating && tour.rating !== 'New' && (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[1,2,3,4,5].map(star => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= Math.floor(tour.rating) ? 'text-emerald-500 fill-emerald-500' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="font-medium text-gray-700 ml-1">
                    {tour.reviewCount?.toLocaleString() || 0} Reviews
                  </span>
                </div>
              )}
              
              {/* Recommendation Badge */}
              {recommendationPercent && (
                <>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-1 text-gray-600">
                    <span className="text-red-500">❤️</span>
                    <span>Recommended by {recommendationPercent}% of travelers</span>
                  </div>
                </>
              )}
              
              {/* Location */}
              {tour.destination && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-600">{tour.destination}</span>
                </>
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

          {/* ============================================ */}
          {/* IMAGE GALLERY: Thumbnails LEFT, Main RIGHT */}
          {/* ============================================ */}
          <div className="flex flex-col md:flex-row border-t border-b border-gray-100">
            
            {/* Thumbnail Strip - LEFT side (desktop) */}
            {images.length > 0 && (
              <div className="hidden md:flex flex-col gap-2 p-3 w-40 bg-white">
                {images.slice(0, 4).map((img, idx) => (
                  <button 
                    key={idx}
                    className={`flex-shrink-0 w-full aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex 
                        ? 'border-gray-900 shadow-md' 
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
                
                {/* See More button if more than 4 images */}
                {images.length > 4 && (
                  <button 
                    className="w-full aspect-[4/3] rounded-lg overflow-hidden relative"
                    onClick={() => setCurrentImageIndex(4)}
                  >
                    <img
                      src={images[4]}
                      alt="More images"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">See More</span>
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Main Image - RIGHT side */}
            <div className="flex-1 relative bg-gray-100 min-h-[280px] sm:min-h-[350px] md:min-h-[400px]">
              {images.length > 0 ? (
                <img
                  src={images[currentImageIndex]}
                  alt={tour.name}
                  className="w-full h-full object-cover"
                  style={{ maxHeight: '450px' }}
                />
              ) : (
                <div className="w-full h-full min-h-[300px] bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-blue-300" />
                </div>
              )}
              
              {/* Wishlist button - top right of image */}
              <button className="absolute top-3 right-3 px-3 py-2 bg-white rounded-full shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
                <Heart className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">Add to Wishlist</span>
              </button>
              
              {/* Badges on image */}
              {hasDiscount && (
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-lg">
                    <Tag className="w-3 h-3" />
                    DEAL
                  </span>
                </div>
              )}

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

            {/* Mobile Thumbnail Strip - below image on mobile */}
            {images.length > 1 && (
              <div className="md:hidden flex gap-2 p-3 overflow-x-auto bg-white">
                {images.slice(0, 6).map((img, idx) => (
                  <button 
                    key={idx}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex 
                        ? 'border-gray-900' 
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

          {/* ============================================ */}
          {/* KEY INFO BAR (Duration, Mobile Ticket, Language) */}
          {/* ============================================ */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 sm:px-5 py-4 border-b border-gray-100 bg-white">
            {/* Duration */}
            {tour.duration && (
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{tour.duration}</span>
              </div>
            )}
            
            {/* Mobile Ticket */}
            <div className="flex items-center gap-2 text-gray-700">
              <Smartphone className="w-5 h-5 text-gray-400" />
              <span>Mobile ticket</span>
            </div>
            
            {/* Languages */}
            {tour.languages && tour.languages.length > 0 && (
              <div className="flex items-center gap-2 text-gray-700">
                <Globe className="w-5 h-5 text-gray-400" />
                <span>Offered in: {tour.languages.join(', ')}</span>
              </div>
            )}
          </div>

          {/* ============================================ */}
          {/* CONTENT SECTIONS */}
          {/* ============================================ */}
          <div className="p-4 sm:p-5 space-y-6">
            
            {/* About This Tour */}
            {tour.description && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-gray-400" />
                  About this tour
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {tour.description}
                </p>
              </div>
            )}

            {/* Highlights */}
            {(tour.highlights && tour.highlights.length > 0) || tourFlags.length > 0 ? (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Highlights
                </h3>
                <ul className="space-y-2">
                  {tour.highlights?.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                  {/* Auto-generate highlights from flags if no explicit highlights */}
                  {(!tour.highlights || tour.highlights.length === 0) && (
                    <>
                      {tourFlags.includes('FREE_CANCELLATION') && (
                        <li className="flex items-start gap-3 text-gray-700">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>Free cancellation available</span>
                        </li>
                      )}
                      {tourFlags.includes('SKIP_THE_LINE') && (
                        <li className="flex items-start gap-3 text-gray-700">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>Skip-the-line access</span>
                        </li>
                      )}
                      {tourFlags.includes('LIKELY_TO_SELL_OUT') && (
                        <li className="flex items-start gap-3 text-gray-700">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>Popular experience - book early</span>
                        </li>
                      )}
                      {tour.languages && tour.languages.length > 1 && (
                        <li className="flex items-start gap-3 text-gray-700">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>Available in multiple languages</span>
                        </li>
                      )}
                    </>
                  )}
                </ul>
              </div>
            ) : null}

            {/* What's Included */}
            {((tour.inclusions && tour.inclusions.length > 0) || (tour.exclusions && tour.exclusions.length > 0)) && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-500" />
                  What's included
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  {/* Inclusions */}
                  <div className="space-y-2">
                    {tour.inclusions?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-gray-700">
                        <Check className="w-4 h-4 text-gray-700 flex-shrink-0 mt-1" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Exclusions */}
                  <div className="space-y-2">
                    {tour.exclusions?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-gray-500">
                        <X className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* What You'll See / Itinerary */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  What you'll see
                </h3>
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

            {/* Additional Info */}
            {tour.additionalInfo && tour.additionalInfo.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Additional information</h3>
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
          </div>
        </div>

        {/* ============================================ */}
        {/* FOOTER: Price + Action Buttons */}
        {/* ============================================ */}
        <div className="border-t border-gray-200 bg-white px-4 sm:px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
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
              className="flex-1 sm:flex-none px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
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
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg font-semibold transition-colors text-sm ${
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
}