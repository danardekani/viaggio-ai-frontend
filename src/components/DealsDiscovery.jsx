import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  ChevronRight,
  X,
  Loader2,
  Tag,
  TrendingUp
} from 'lucide-react';

// Popular destinations for deal browsing
const POPULAR_DESTINATIONS = [
  { name: 'Paris', country: 'France', emoji: '🇫🇷' },
  { name: 'Rome', country: 'Italy', emoji: '🇮🇹' },
  { name: 'Barcelona', country: 'Spain', emoji: '🇪🇸' },
  { name: 'London', country: 'UK', emoji: '🇬🇧' },
  { name: 'New York', country: 'USA', emoji: '🇺🇸' },
  { name: 'Tokyo', country: 'Japan', emoji: '🇯🇵' },
  { name: 'Amsterdam', country: 'Netherlands', emoji: '🇳🇱' },
  { name: 'Dubai', country: 'UAE', emoji: '🇦🇪' },
  { name: 'Cancun', country: 'Mexico', emoji: '🇲🇽' },
  { name: 'Bali', country: 'Indonesia', emoji: '🇮🇩' },
  { name: 'Sydney', country: 'Australia', emoji: '🇦🇺' },
  { name: 'Las Vegas', country: 'USA', emoji: '🇺🇸' },
  { name: 'Miami', country: 'USA', emoji: '🇺🇸' },
  { name: 'Lisbon', country: 'Portugal', emoji: '🇵🇹' },
  { name: 'Prague', country: 'Czechia', emoji: '🇨🇿' },
];

export default function DealsDiscovery({ onSearchDeals, isLoading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchingCity, setSearchingCity] = useState(null);

  const handleCityClick = async (destination) => {
    setSearchingCity(destination.name);
    await onSearchDeals(destination.name);
    setSearchingCity(null);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Deals Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
      >
        <Sparkles className="w-4 h-4" />
        <span>Browse Deals</span>
        <Tag className="w-3.5 h-3.5" />
      </button>

      {/* Deals Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">Hot Deals by City</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* City Grid */}
            <div className="p-3 max-h-80 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_DESTINATIONS.map((dest) => (
                  <button
                    key={dest.name}
                    onClick={() => handleCityClick(dest)}
                    disabled={isLoading || searchingCity}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all ${
                      searchingCity === dest.name
                        ? 'bg-orange-100 border-2 border-orange-400'
                        : 'bg-gray-50 hover:bg-orange-50 border-2 border-transparent hover:border-orange-200'
                    } ${isLoading || searchingCity ? 'opacity-60 cursor-wait' : ''}`}
                  >
                    <span className="text-lg">{dest.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {dest.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {dest.country}
                      </p>
                    </div>
                    {searchingCity === dest.name ? (
                      <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                🔥 Click a city to see current special offers
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
