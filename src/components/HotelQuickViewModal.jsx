import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  X,
  Star,
  MapPin,
  Calendar,
  Bed,
  Coffee,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Wifi,
  Car,
  Dumbbell,
  Waves,
  Utensils,
  Wind,
  Tv,
  ShowerHead,
  Building,
  Heart,
  Info
} from 'lucide-react';

// Map common facility keywords to icons
const getFacilityIcon = (facility) => {
  const lowerFacility = facility?.toLowerCase() || '';

  if (lowerFacility.includes('wifi') || lowerFacility.includes('internet')) return Wifi;
  if (lowerFacility.includes('parking') || lowerFacility.includes('car')) return Car;
  if (lowerFacility.includes('gym') || lowerFacility.includes('fitness')) return Dumbbell;
  if (lowerFacility.includes('pool') || lowerFacility.includes('swimming')) return Waves;
  if (lowerFacility.includes('restaurant') || lowerFacility.includes('dining')) return Utensils;
  if (lowerFacility.includes('air') || lowerFacility.includes('conditioning')) return Wind;
  if (lowerFacility.includes('tv') || lowerFacility.includes('television')) return Tv;
  if (lowerFacility.includes('shower') || lowerFacility.includes('bath')) return ShowerHead;

  return CheckCircle; // Default icon
};

const HotelQuickViewModal = memo(function HotelQuickViewModal({
  hotel,
  onClose,
  formatCurrency,
  onAddToTrip,
  isInCart,
  descriptionExpanded,
  onToggleDescription
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [localDescExpanded, setLocalDescExpanded] = useState(descriptionExpanded || false);

  // Memoize images array
  const images = useMemo(() => {
    if (!hotel) return [];
    if (hotel.images && hotel.images.length > 0) {
      return hotel.images.map(img => typeof img === 'string' ? img : img.url || img);
    }
    if (hotel.image) {
      return [hotel.image];
    }
    return [];
  }, [hotel]);

  const hasMultipleImages = images.length > 1;

  // Memoize navigation handlers
  const prevImage = useCallback((e) => {
    e?.stopPropagation();
    setCurrentImageIndex(i => i === 0 ? images.length - 1 : i - 1);
  }, [images.length]);

  const nextImage = useCallback((e) => {
    e?.stopPropagation();
    setCurrentImageIndex(i => i === images.length - 1 ? 0 : i + 1);
  }, [images.length]);

  // Description handling
  const description = hotel?.description || '';
  const isLongDescription = description.length > 300;
  const displayDescription = useMemo(() => {
    if (localDescExpanded || !isLongDescription) return description;
    return description.substring(0, 300) + '...';
  }, [description, localDescExpanded, isLongDescription]);

  const handleToggleDesc = useCallback(() => {
    setLocalDescExpanded(prev => !prev);
    onToggleDescription?.();
  }, [onToggleDescription]);

  // Facilities/Amenities
  const facilities = useMemo(() =>
    hotel?.amenities || hotel?.facilities || [],
    [hotel?.amenities, hotel?.facilities]
  );

  // Star rating display
  const starRatings = useMemo(() => [1, 2, 3, 4, 5], []);
  const hotelStars = hotel?.stars || hotel?.rating || 0;

  // Format dates for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Price calculations
  const { totalPrice, pricePerNight, nights } = useMemo(() => {
    const total = parseFloat(hotel?.totalPrice || hotel?.price || 0);
    const n = hotel?.nights || 1;
    const perNight = hotel?.pricePerNight
      ? parseFloat(hotel.pricePerNight)
      : (total / n);
    return { totalPrice: total, pricePerNight: perNight, nights: n };
  }, [hotel?.totalPrice, hotel?.price, hotel?.nights, hotel?.pricePerNight]);

  if (!hotel) return null;

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
              {hotel.name}
            </h2>

            {/* Rating row */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {hotelStars > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {starRatings.map(star => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= Math.floor(hotelStars) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 ml-1">
                    {hotel.stars ? `${hotel.stars}-star hotel` : ''}
                  </span>
                </div>
              )}

              {hotel.reviewScore && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-600">
                    <span className="font-semibold text-purple-600">{hotel.reviewScore}</span> rating
                  </span>
                </>
              )}
            </div>

            {/* Location */}
            {(hotel.location || hotel.address) && (
              <div className="flex items-start gap-2 text-sm text-gray-600 mt-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-500" />
                <span>{hotel.address || hotel.location}</span>
              </div>
            )}
          </div>

          {/* IMAGE GALLERY - Matching Tours style */}
          <div className="flex border-t border-b border-gray-100">

            {/* Thumbnails - LEFT side */}
            {images.length > 0 && (
              <div className="hidden sm:flex flex-col gap-1.5 p-2 w-28 flex-shrink-0 bg-gray-50">
                {images.slice(0, 5).map((img, idx) => (
                  <button
                    key={idx}
                    className={`w-full aspect-[4/3] rounded overflow-hidden transition-all ${
                      idx === currentImageIndex
                        ? 'ring-2 ring-purple-500'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <img
                      src={img}
                      alt={`${hotel.name} ${idx + 1}`}
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
                  alt={hotel.name}
                  className="max-w-full max-h-[350px] w-auto h-auto object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50" style={{ height: '280px' }}>
                  <Building className="w-12 h-12 text-purple-300" />
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
                    idx === currentImageIndex ? 'ring-2 ring-purple-500' : 'opacity-70'
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
            {hotel.checkIn && hotel.checkOut && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span>{formatDate(hotel.checkIn)} - {formatDate(hotel.checkOut)}</span>
              </div>
            )}
            {nights > 0 && (
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-purple-500" />
                <span>{nights} {nights === 1 ? 'night' : 'nights'}</span>
              </div>
            )}
            {hotel.roomType && (
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-gray-400" />
                <span>{hotel.roomType}</span>
              </div>
            )}
            {hotel.boardType && (
              <div className="flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-gray-400" />
                <span>{hotel.boardType}</span>
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div className="p-4 space-y-5">

            {/* About */}
            {description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-gray-400" />
                  About this hotel
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {displayDescription}
                </p>
                {isLongDescription && (
                  <button
                    onClick={handleToggleDesc}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                  >
                    {localDescExpanded ? (
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

            {/* Amenities */}
            {facilities.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-purple-500" />
                  Amenities
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {facilities.filter(f => f).slice(0, 8).map((facility, idx) => {
                    const IconComponent = getFacilityIcon(facility);
                    return (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <IconComponent className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span className="truncate">{facility}</span>
                      </div>
                    );
                  })}
                </div>
                {facilities.length > 8 && (
                  <p className="text-xs text-gray-400 mt-2">+ {facilities.length - 8} more amenities</p>
                )}
              </div>
            )}

          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <div className="flex items-baseline gap-2 justify-center sm:justify-start">
              <span className="text-2xl font-bold text-purple-600">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {formatCurrency(pricePerNight)} per night × {nights} night{nights > 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {hotel.bookingLink && (
              <a
                href={hotel.bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white text-sm font-medium flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                Book Now
              </a>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onAddToTrip(); }}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-lg font-medium text-sm ${
                isInCart
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
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

export default HotelQuickViewModal;
