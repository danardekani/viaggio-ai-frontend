import React from 'react';
import { Calendar, X } from 'lucide-react';
import Sidebar from './Sidebar';

export default function MobileTripSheet({
  cart,
  expandedSections,
  toggleSection,
  removeFromCart,
  formatCurrency,
  totalCost,
  setShowItinerary,
  shareItinerary,
  onClose,
  travelers = 2,
}) {
  return (
    <div className="md:hidden fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">
              Trip Details
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <Sidebar
            cart={cart}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            removeFromCart={removeFromCart}
            formatCurrency={formatCurrency}
            totalCost={totalCost}
            setShowItinerary={setShowItinerary}
            shareItinerary={shareItinerary}
            travelers={travelers}
          />
        </div>
      </div>
    </div>
  );
}
