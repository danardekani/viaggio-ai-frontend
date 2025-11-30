import React from 'react';
import { Plane, Hotel, MapPin, ExternalLink, CheckCircle } from 'lucide-react';

export default function BookingPage({ cart, formatCurrency, onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plane className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Complete Your Booking
              </h1>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
            >
              ← Back to Chat
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-green-900 mb-2">
                Your Itinerary is Ready!
              </h2>
              <p className="text-green-700">
                Click the booking links below to complete your reservations.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {cart.flights.map((flight) => (
            <div
              key={flight.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Plane className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Flight</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {flight.airline}
                    </p>
                    <p className="text-sm text-gray-600">{flight.route}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(flight.price)}
                </p>
              </div>
              <a
                href={flight.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                Book Flight
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}

          {cart.hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Hotel className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Hotel</h4>
                    <p className="text-sm text-gray-600 mt-1">{hotel.name}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(hotel.price)}
                </p>
              </div>
              <a
                href={hotel.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                Book Hotel
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}

          {cart.tours.map((tour) => (
            <div
              key={tour.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {tour.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {tour.date} at {tour.time}
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(tour.price * 2)}
                </p>
              </div>
              <a
                href={tour.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                Book Tour
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
