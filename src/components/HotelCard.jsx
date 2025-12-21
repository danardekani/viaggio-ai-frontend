import React, { memo, useCallback } from 'react';
import {
  Star,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Waves,
  Plus,
  Check,
  Building
} from 'lucide-react';

// Map amenity keywords to icons
const getAmenityIcon = (amenity) => {
  const lower = amenity?.toLowerCase() || '';
  if (lower.includes('wifi') || lower.includes('internet')) return Wifi;
  if (lower.includes('parking')) return Car;
  if (lower.includes('breakfast')) return Coffee;
  if (lower.includes('pool')) return Waves;
  return null;
};

const HotelCard = memo(function HotelCard({
  hotel,
  isSelected,
  formatCurrency,
  openQuickView,
  addToCart,
  removeFromCart
}) {
  const handleToggleCart = useCallback((e) => {
    e.stopPropagation();
    if (isSelected) {
      removeFromCart('hotel', hotel.id);
    } else {
      addToCart('hotel', hotel);
    }
  }, [isSelected, hotel, addToCart, removeFromCart]);

  const handleQuickView = useCallback(() => {
    openQuickView(hotel);
  }, [hotel, openQuickView]);

  // Get primary image
  const primaryImage = hotel.images?.[0]?.url || hotel.images?.[0] || hotel.image;

  // Get star rating
  const stars = hotel.stars || hotel.rating || 0;

  // Get amenities (limit to 3 with icons)
  const amenities = hotel.amenities || hotel.facilities || [];
  const displayAmenities = amenities.slice(0, 3);

  // Calculate price per night
  const totalPrice = parseFloat(hotel.totalPrice || hotel.price || 0);
  const nights = hotel.nights || 1;
  const pricePerNight = hotel.pricePerNight
    ? parseFloat(hotel.pricePerNight)
    : (totalPrice / nights);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-lg cursor-pointer flex flex-col h-full ${
        isSelected ? 'border-purple-500 border-2 ring-2 ring-purple-100' : 'border-gray-200'
      }`}
      onClick={handleQuickView}
    >
      {/* Image */}
      <div className="relative h-48 flex-shrink-0">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={hotel.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
            <Building className="w-12 h-12 text-purple-300" />
          </div>
        )}

        {/* Star Rating Badge */}
        {stars > 0 && (
          <div className="absolute top-3 left-3 flex items-center gap-0.5 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
            {[...Array(Math.floor(stars))].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            ))}
          </div>
        )}

        {/* Image count badge */}
        {hotel.images && hotel.images.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
            📷 {hotel.images.length}
          </div>
        )}

        {/* Review score badge */}
        {hotel.reviewScore && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-purple-600 text-white px-2 py-1 rounded-lg shadow-sm">
            <span className="font-semibold text-sm">{hotel.reviewScore}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Hotel Name */}
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-1 hover:text-purple-600 transition-colors">
          {hotel.name}
        </h3>

        {/* Location */}
        {(hotel.location || hotel.address) && (
          <div className="flex items-start gap-1 text-sm text-gray-500 mb-2">
            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{hotel.address || hotel.location}</span>
          </div>
        )}

        {/* Amenities */}
        {displayAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {displayAmenities.map((amenity, idx) => {
              const IconComponent = getAmenityIcon(amenity);
              return (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {IconComponent && <IconComponent className="w-3 h-3" />}
                  <span className="truncate max-w-[80px]">{amenity}</span>
                </span>
              );
            })}
            {amenities.length > 3 && (
              <span className="text-xs text-gray-400">+{amenities.length - 3} more</span>
            )}
          </div>
        )}

        {/* Room Type */}
        {hotel.roomType && (
          <p className="text-xs text-gray-500 mb-2">{hotel.roomType}</p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price and CTA Row */}
        <div className="flex items-end justify-between pt-3 border-t border-gray-100">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(pricePerNight)}
              </span>
              <span className="text-sm text-gray-500">/ night</span>
            </div>
            {nights > 1 && (
              <p className="text-xs text-gray-500">
                {formatCurrency(totalPrice)} total for {nights} nights
              </p>
            )}
          </div>

          <button
            onClick={handleToggleCart}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              isSelected
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4" />
                Added
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default HotelCard;
