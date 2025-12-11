import React from 'react';
import { Calendar, Plane, Hotel, MapPin, X, CheckCircle, Share2 } from 'lucide-react';

export default function ItineraryModal({
  cart,
  formatCurrency,
  totalCost,
  onClose,
  onBookTrip,
  onShare,
}) {
  // ============================================================================
  // DYNAMIC TITLE GENERATION
  // ============================================================================
  
  /**
   * Extract destination names from cart items and generate a smart title
   */
  const generateItineraryTitle = () => {
    const destinations = new Set();
    
    // Extract from hotels
    cart.hotels.forEach(hotel => {
      if (hotel.city) {
        destinations.add(hotel.city);
      } else if (hotel.location) {
        // Try to extract city from location string (e.g., "Catania, Sicily" -> "Catania")
        const city = hotel.location.split(',')[0].trim();
        if (city) destinations.add(city);
      } else if (hotel.destinationName) {
        destinations.add(hotel.destinationName);
      }
    });
    
    // Extract from tours
    cart.tours.forEach(tour => {
      if (tour.destination) {
        destinations.add(tour.destination);
      } else if (tour.city) {
        destinations.add(tour.city);
      } else if (tour.location) {
        const city = tour.location.split(',')[0].trim();
        if (city) destinations.add(city);
      }
    });
    
    // Extract from flights (destination city)
    cart.flights.forEach(flight => {
      if (flight.destinationCity) {
        destinations.add(flight.destinationCity);
      } else if (flight.route) {
        // Try to extract destination from route (e.g., "JFK → FCO" or "New York to Rome")
        const parts = flight.route.split(/→|to|->|-/i);
        if (parts.length > 1) {
          const destCity = parts[parts.length - 1].trim();
          if (destCity && destCity.length > 2) {
            destinations.add(destCity);
          }
        }
      }
    });
    
    // Convert to array and clean up
    const destArray = Array.from(destinations)
      .filter(d => d && d.length > 1)
      .map(d => {
        // Capitalize first letter of each word
        return d.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      });
    
    // Generate title based on number of destinations
    if (destArray.length === 0) {
      return 'Your Trip Itinerary';
    } else if (destArray.length === 1) {
      return `Your ${destArray[0]} Itinerary`;
    } else if (destArray.length === 2) {
      return `Your ${destArray[0]} & ${destArray[1]} Trip`;
    } else {
      // 3+ destinations - show first two and indicate more
      return `Your ${destArray[0]}, ${destArray[1]} + More`;
    }
  };

  const itineraryTitle = generateItineraryTitle();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl max-w-lg w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">
              {itineraryTitle}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {cart.flights.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Plane className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">Flights</h3>
              </div>
              <div className="space-y-2">
                {cart.flights.map((f) => (
                  <div key={f.id} className="text-sm text-gray-700">
                    <div className="font-medium">{f.airline}</div>
                    <div className="text-xs text-gray-500">{f.route}</div>
                    <div className="text-xs text-gray-500">{f.departureTime}</div>
                    <div className="text-xs font-semibold text-blue-600 mt-1">
                      {formatCurrency(f.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cart.hotels.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Hotel className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900">Hotels</h3>
              </div>
              <div className="space-y-2">
                {cart.hotels.map((h) => (
                  <div key={h.id} className="text-sm text-gray-700">
                    <div className="font-medium">{h.name}</div>
                    <div className="text-xs text-gray-500">
                      {h.stars && `${'⭐'.repeat(h.stars)} · `}
                      {h.location || h.city}
                    </div>
                    {h.nights && (
                      <div className="text-xs text-gray-400">
                        {h.nights} night{h.nights > 1 ? 's' : ''}
                        {h.checkIn && h.checkOut && ` · ${h.checkIn} to ${h.checkOut}`}
                      </div>
                    )}
                    <div className="text-xs font-semibold text-purple-600 mt-1">
                      {formatCurrency(h.totalPrice || h.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cart.tours.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Tours & Experiences
                </h3>
              </div>
              <div className="space-y-2">
                {cart.tours.map((t) => (
                  <div key={t.id} className="text-sm text-gray-700">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-gray-500">
                      {t.destination && `${t.destination} · `}
                      {t.duration}
                    </div>
                    <div className="text-xs font-semibold text-green-600 mt-1">
                      {formatCurrency(t.price * 2)} (2 people)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-800">
              Total Trip Cost
            </span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(totalCost())}
            </span>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
          <button
            onClick={onBookTrip}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Continue to Booking
          </button>
          <button
            onClick={() => {
              onShare();
              onClose();
            }}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Copy & Share
          </button>
        </div>
      </div>
    </div>
  );
}
