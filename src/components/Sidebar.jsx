import React from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Plane,
  Hotel,
  MapPin,
  Share2,
  X,
} from 'lucide-react';

export default function Sidebar({
  cart,
  expandedSections,
  toggleSection,
  removeFromCart,
  formatCurrency,
  totalCost,
  setShowItinerary,
  shareItinerary,
  travelers = 2,
}) {
  // Helper to calculate tour price based on pricing type
  const getTourPrice = (tour) => {
    if (tour.pricingType === 'group') {
      return tour.price; // Per group - don't multiply
    }
    return tour.price * travelers; // Per person - multiply
  };

  // Helper to get price description
  const getTourPriceLabel = (tour) => {
    if (tour.pricingType === 'group') {
      return tour.maxGroupSize 
        ? `per group (up to ${tour.maxGroupSize})` 
        : 'per group';
    }
    return `${travelers} ${travelers === 1 ? 'person' : 'people'}`;
  };

  return (
    <>
      {/* Flights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <button
          onClick={() => toggleSection('flights')}
          className="w-full flex items-center justify-between p-3"
        >
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">
              Flights
            </span>
            {cart.flights.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                {cart.flights.length}
              </span>
            )}
          </div>
          {expandedSections.flights ? (
            <ChevronUp className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {expandedSections.flights && cart.flights.length > 0 && (
          <div className="p-3 space-y-2">
            {cart.flights.map((flight) => (
              <div
                key={flight.id}
                className="bg-blue-50 rounded-lg p-3 border border-blue-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {flight.airline}
                    </p>
                    <p className="text-xs text-gray-600">{flight.route}</p>
                    <p className="text-xs font-semibold text-blue-600 mt-2">
                      {formatCurrency(flight.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart('flight', flight.id)}
                    className="text-red-600 hover:text-red-700 ml-2"
                    title="Remove flight"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hotels */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <button
          onClick={() => toggleSection('hotels')}
          className="w-full flex items-center justify-between p-3"
        >
          <div className="flex items-center gap-2">
            <Hotel className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-gray-900">
              Hotels
            </span>
            {cart.hotels.length > 0 && (
              <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">
                {cart.hotels.length}
              </span>
            )}
          </div>
          {expandedSections.hotels ? (
            <ChevronUp className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {expandedSections.hotels && cart.hotels.length > 0 && (
          <div className="p-3 space-y-2">
            {cart.hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-purple-50 rounded-lg p-3 border border-purple-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {hotel.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      ⭐ {hotel.rating}/5 · {hotel.location}
                    </p>
                    <p className="text-xs font-semibold text-purple-600 mt-2">
                      {formatCurrency(hotel.price)}
                      {hotel.nights && (
                        <span className="text-gray-500 font-normal">
                          {' '}({hotel.nights} night{hotel.nights > 1 ? 's' : ''})
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart('hotel', hotel.id)}
                    className="text-red-600 hover:text-red-700 ml-2"
                    title="Remove hotel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tours */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <button
          onClick={() => toggleSection('tours')}
          className="w-full flex items-center justify-between p-3"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-gray-900">
              Tours
            </span>
            {cart.tours.length > 0 && (
              <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">
                {cart.tours.length}
              </span>
            )}
          </div>
          {expandedSections.tours ? (
            <ChevronUp className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {expandedSections.tours && cart.tours.length > 0 && (
          <div className="p-3 space-y-2">
            {cart.tours.map((tour) => (
              <div
                key={tour.id}
                className="bg-green-50 rounded-lg p-3 border border-green-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {tour.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {tour.duration}
                      {tour.date && tour.time && ` · ${tour.date} at ${tour.time}`}
                    </p>
                    <p className="text-xs font-semibold text-green-600 mt-2">
                      {formatCurrency(getTourPrice(tour))}
                      <span className="text-gray-500 font-normal"> ({getTourPriceLabel(tour)})</span>
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart('tour', tour.id)}
                    className="text-red-600 hover:text-red-700 ml-2"
                    title="Remove tour"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total + actions */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-3 text-white">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total Cost</span>
          <span className="text-xl font-bold">
            {formatCurrency(typeof totalCost === 'function' ? totalCost() : totalCost)}
          </span>
        </div>
      </div>

      <button
        onClick={() => setShowItinerary(true)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        View Full Itinerary
      </button>

      <button
        onClick={shareItinerary}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share Trip
      </button>
    </>
  );
}
