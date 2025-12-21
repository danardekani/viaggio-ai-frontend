import React, { useMemo } from 'react';
import {
  Plane,
  MapPin,
  ExternalLink,
  ChevronLeft,
  Clock,
  Star,
  Users,
  ShoppingBag,
  Trash2,
  Tag
} from 'lucide-react';

export default function CheckoutPage({
  cart,
  formatCurrency,
  onBack,
  removeFromCart,
  travelers = 2
}) {
  // Calculate price for a tour based on pricing type
  const getTourPrice = (tour) => {
    if (tour.pricingType === 'group') {
      return tour.price || 0;
    }
    return (tour.price || 0) * travelers;
  };

  // Calculate total cost
  const totalCost = useMemo(() =>
    cart.tours.reduce((sum, tour) => sum + getTourPrice(tour), 0),
    [cart.tours, travelers]
  );

  // Generate Viator booking URL
  const getViatorUrl = (tour) => {
    // Use existing booking link if available
    if (tour.bookingLink) return tour.bookingLink;
    if (tour.link) return tour.link;

    // Fallback: construct Viator URL from product code
    if (tour.productCode) {
      return `https://www.viator.com/tours/${tour.productCode}`;
    }

    // Last resort: search on Viator
    return `https://www.viator.com/searchResults/all?text=${encodeURIComponent(tour.name)}`;
  };

  const isEmpty = cart.tours.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <Plane className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Viaggio</span>
              </div>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Checkout</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {isEmpty ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your trip is empty</h2>
            <p className="text-gray-500 mb-6">Add some tours to get started planning your adventure!</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse Tours
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Tours List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900">
                  Your Tours ({cart.tours.length})
                </h2>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{travelers} {travelers === 1 ? 'traveler' : 'travelers'}</span>
                </div>
              </div>

              {cart.tours.map((tour) => {
                const tourTotal = getTourPrice(tour);
                const hasDiscount = tour.hasDiscount || tour.flags?.includes('SPECIAL_OFFER');

                return (
                  <div
                    key={tour.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Tour Image */}
                      <div className="sm:w-40 h-32 sm:h-auto flex-shrink-0">
                        {tour.image ? (
                          <img
                            src={tour.image}
                            alt={tour.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                            <MapPin className="w-8 h-8 text-blue-300" />
                          </div>
                        )}
                      </div>

                      {/* Tour Details */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                              {tour.name}
                            </h3>

                            {/* Meta info */}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
                              {tour.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {tour.duration}
                                </span>
                              )}
                              {tour.rating && tour.rating !== 'New' && (
                                <span className="flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  {tour.rating}
                                  {tour.reviewCount && (
                                    <span className="text-gray-400">
                                      ({tour.reviewCount.toLocaleString()})
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1.5">
                              {hasDiscount && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                  <Tag className="w-3 h-3" />
                                  Deal
                                </span>
                              )}
                              {tour.flags?.includes('FREE_CANCELLATION') && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                  Free cancellation
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => removeFromCart('tour', tour.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Remove tour"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-100">
                          <div>
                            <p className="text-sm text-gray-500">
                              {tour.pricingType === 'group'
                                ? 'Per group'
                                : `${formatCurrency(tour.price)} × ${travelers} ${travelers === 1 ? 'person' : 'people'}`
                              }
                            </p>
                          </div>
                          <p className={`text-lg font-bold ${hasDiscount ? 'text-orange-600' : 'text-gray-900'}`}>
                            {formatCurrency(tourTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

                {/* Items breakdown */}
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  {cart.tours.map((tour) => (
                    <div key={tour.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate pr-2 flex-1">
                        {tour.name.length > 30 ? tour.name.substring(0, 30) + '...' : tour.name}
                      </span>
                      <span className="text-gray-900 font-medium flex-shrink-0">
                        {formatCurrency(getTourPrice(tour))}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-4">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalCost)}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  For {travelers} {travelers === 1 ? 'traveler' : 'travelers'}. Taxes and fees may apply at checkout.
                </p>

                {/* Viator Booking Links */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    Complete your booking on Viator:
                  </p>
                  {cart.tours.map((tour) => (
                    <a
                      key={tour.id}
                      href={getViatorUrl(tour)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors group"
                    >
                      <span className="truncate pr-2">
                        {tour.name.length > 25 ? tour.name.substring(0, 25) + '...' : tour.name}
                      </span>
                      <ExternalLink className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  ))}
                </div>

                {/* Viator info */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 text-center">
                    You'll be redirected to Viator to complete each booking.
                    Viator is our trusted partner for tours and experiences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
