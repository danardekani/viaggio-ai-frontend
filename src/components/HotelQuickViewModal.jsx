import React from 'react';
import { 
  X, 
  Star, 
  MapPin, 
  Users, 
  CheckCircle, 
  ExternalLink,
  Wifi,
  Car,
  Coffee,
  Waves,
  Calendar,
  DollarSign
} from 'lucide-react';

export default function HotelQuickViewModal({ 
  hotel, 
  onClose, 
  formatCurrency, 
  onAddToTrip, 
  isInCart
}) {
  if (!hotel) return null;

  // Parse star rating
  const stars = hotel.stars || parseStarRating(hotel.categoryCode);
  
  // Get amenities icons
  const getAmenityIcon = (amenity) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi') || lower.includes('internet')) return Wifi;
    if (lower.includes('parking')) return Car;
    if (lower.includes('breakfast') || lower.includes('restaurant')) return Coffee;
    if (lower.includes('pool') || lower.includes('swimming')) return Waves;
    return CheckCircle;
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
        {/* Header Image */}
        <div className="relative h-48 bg-gradient-to-br from-purple-100 to-purple-200 flex-shrink-0">
          {hotel.image ? (
            <img 
              src={hotel.image} 
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-purple-300">
              <MapPin className="w-20 h-20" />
            </div>
          )}
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-colors shadow-lg"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
          
          {/* Star Rating Badge */}
          {stars && (
            <div className="absolute bottom-3 left-3 bg-white bg-opacity-95 rounded-lg px-3 py-1.5 flex items-center gap-1 shadow-lg">
              {[...Array(stars)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          )}

          {/* Price Badge */}
          {hotel.pricePerNight && (
            <div className="absolute bottom-3 right-3 bg-purple-600 text-white rounded-lg px-3 py-1.5 shadow-lg">
              <span className="font-bold">{formatCurrency(hotel.pricePerNight)}</span>
              <span className="text-purple-200 text-sm">/night</span>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5">
            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
              {hotel.name}
            </h2>

            {/* Location */}
            {hotel.location && (
              <div className="flex items-center gap-1.5 text-gray-600 mb-4">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{hotel.location}</span>
              </div>
            )}

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-2 mb-4">
              {hotel.nights && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  <Calendar className="w-4 h-4" />
                  <span>{hotel.nights} night{hotel.nights > 1 ? 's' : ''}</span>
                </div>
              )}
              {hotel.roomType && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  <Users className="w-4 h-4" />
                  <span>{hotel.roomType}</span>
                </div>
              )}
              {hotel.boardType && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-purple-100 px-3 py-1.5 rounded-full text-purple-700">
                  <Coffee className="w-4 h-4" />
                  <span>{hotel.boardType}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {hotel.description && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">About this hotel</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {hotel.description.length > 300 
                    ? hotel.description.substring(0, 300) + '...' 
                    : hotel.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {hotel.amenities.slice(0, 6).map((amenity, idx) => {
                    const IconComponent = getAmenityIcon(amenity);
                    return (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <IconComponent className="w-4 h-4 text-purple-500" />
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Check-in/Check-out */}
            {(hotel.checkIn || hotel.checkOut) && (
              <div className="mb-4 bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Stay Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {hotel.checkIn && (
                    <div>
                      <span className="text-gray-500">Check-in:</span>
                      <span className="ml-2 font-medium">{hotel.checkIn}</span>
                    </div>
                  )}
                  {hotel.checkOut && (
                    <div>
                      <span className="text-gray-500">Check-out:</span>
                      <span className="ml-2 font-medium">{hotel.checkOut}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cancellation Policy */}
            {hotel.cancellationPolicy && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Cancellation:</span> {hotel.cancellationPolicy}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Price and Actions */}
        <div className="border-t border-gray-200 bg-gray-50 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(hotel.totalPrice || hotel.price)}
            </p>
            <p className="text-xs text-gray-500">
              Total for {hotel.nights || 1} night{(hotel.nights || 1) > 1 ? 's' : ''}
              {hotel.pricePerNight && (
                <span className="ml-1">({formatCurrency(hotel.pricePerNight)}/night)</span>
              )}
            </p>
          </div>
          
          <div className="flex gap-2">
            {hotel.bookingLink && (
              <a
                href={hotel.bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center gap-1.5"
              >
                Full Details
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToTrip();
                onClose();
              }}
              className={`px-4 py-2.5 text-sm rounded-lg font-medium transition-colors ${
                isInCart
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
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

// Helper function to parse star rating from category code
function parseStarRating(categoryCode) {
  if (!categoryCode) return null;
  const match = categoryCode.match(/^(\d)/);
  return match ? parseInt(match[1]) : null;
}
