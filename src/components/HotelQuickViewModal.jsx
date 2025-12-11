import React, { useState } from 'react';
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
  Building
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

export default function HotelQuickViewModal({ 
  hotel, 
  onClose, 
  formatCurrency, 
  onAddToTrip, 
  isInCart,
  descriptionExpanded,
  onToggleDescription
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!hotel) return null;

  // Get all available images
  const images = hotel.images && hotel.images.length > 0 
    ? hotel.images 
    : hotel.image 
      ? [{ url: hotel.image, type: 'Main' }] 
      : [];

  const hasMultipleImages = images.length > 1;

  // Handle image navigation
  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Description handling
  const description = hotel.description || '';
  const isLongDescription = description.length > 200;
  
  let displayDescription;
  if (descriptionExpanded || !isLongDescription) {
    displayDescription = description;
  } else {
    const truncateAt = 180;
    const lastSpace = description.lastIndexOf(' ', truncateAt);
    const cutPoint = lastSpace > 100 ? lastSpace : truncateAt;
    displayDescription = description.substring(0, cutPoint) + '...';
  }

  // Facilities/Amenities
  const facilities = hotel.facilities || [];

  // Star rating display
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${i < fullStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
        />
      );
    }
    return stars;
  };

  // Format dates for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image Section with Gallery */}
        <div className="relative h-52 bg-gray-200 flex-shrink-0">
          {images.length > 0 ? (
            <>
              <img 
                src={images[currentImageIndex]?.url || images[currentImageIndex]} 
                alt={`${hotel.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation Arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-colors shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-14 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-colors shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {hasMultipleImages && (
                <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-lg">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}

              {/* Thumbnail Strip */}
              {hasMultipleImages && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.slice(0, 5).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(idx);
                      }}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentImageIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Building className="w-16 h-16" />
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-colors shadow-lg"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
          
          {/* Star Rating Badge */}
          {hotel.rating && (
            <div className="absolute bottom-3 right-3 bg-white bg-opacity-95 rounded-lg px-3 py-1.5 flex items-center gap-1 shadow-lg">
              {renderStars(hotel.rating)}
            </div>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5">
            {/* Hotel Name */}
            <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
              {hotel.name}
            </h2>

            {/* Location */}
            {(hotel.location || hotel.address) && (
              <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-500" />
                <span>{hotel.address || hotel.location}</span>
              </div>
            )}

            {/* Quick Info Pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Dates */}
              {hotel.checkIn && hotel.checkOut && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-purple-50 px-3 py-1.5 rounded-full">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span>{formatDate(hotel.checkIn)} - {formatDate(hotel.checkOut)}</span>
                </div>
              )}
              
              {/* Nights */}
              {hotel.nights && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-purple-50 px-3 py-1.5 rounded-full">
                  <Bed className="w-4 h-4 text-purple-500" />
                  <span>{hotel.nights} {hotel.nights === 1 ? 'night' : 'nights'}</span>
                </div>
              )}

              {/* Room Type */}
              {hotel.roomName && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  <Bed className="w-4 h-4" />
                  <span>{hotel.roomName}</span>
                </div>
              )}

              {/* Board Type (Breakfast, etc.) */}
              {hotel.boardName && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  <Coffee className="w-4 h-4" />
                  <span>{hotel.boardName}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {description && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">About this hotel</h3>
                
                <div className="relative" key={descriptionExpanded ? 'expanded' : 'collapsed'}>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {displayDescription}
                  </p>
                  {!descriptionExpanded && isLongDescription && (
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                  )}
                </div>
                
                {isLongDescription && (
                  <button
                    type="button"
                    onClick={onToggleDescription}
                    className="mt-2 text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {descriptionExpanded ? (
                      <>
                        <span>Show less</span>
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Read more</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Amenities/Facilities */}
            {facilities.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Amenities</h3>
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

            {/* Price Breakdown */}
            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Price Details</h3>
              <div className="space-y-2">
                {hotel.pricePerNight && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {formatCurrency(parseFloat(hotel.pricePerNight))} × {hotel.nights || 1} night{(hotel.nights || 1) > 1 ? 's' : ''}
                    </span>
                    <span className="text-gray-900">{formatCurrency(hotel.price)}</span>
                  </div>
                )}
                <div className="border-t border-purple-200 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-purple-600">{formatCurrency(hotel.price)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer with Actions */}
        <div className="border-t bg-gray-50 p-4 flex gap-3 flex-shrink-0">
          {/* Add/Remove from Trip */}
          <button
            type="button"
            onClick={onAddToTrip}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
              isInCart 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isInCart ? 'Remove from Trip' : 'Add to Trip'}
          </button>

          {/* Book Now */}
          {hotel.bookingLink && (
            <a
              href={hotel.bookingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 rounded-lg font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <span>Book Now</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
