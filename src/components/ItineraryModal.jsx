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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl max-w-lg w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">
              Your Florence Itinerary
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
                    <div className="text-xs text-gray-500">{f.departure}</div>
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
                      ⭐ {h.rating}/5 · {h.location}
                    </div>
                    <div className="text-xs font-semibold text-purple-600 mt-1">
                      {formatCurrency(h.price)}
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
                      {t.date} at {t.time} · {t.duration}
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
