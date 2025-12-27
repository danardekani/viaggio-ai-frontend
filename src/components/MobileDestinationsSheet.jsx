import React, { useState } from 'react';
import { Compass, X, ArrowRight } from 'lucide-react';

export default function MobileDestinationsSheet({
  destinationsData,
  regionList,
  onCityClick,
  onCityHover,
  onClose,
}) {
  const [activeRegion, setActiveRegion] = useState('North America');
  const [expandedIdx, setExpandedIdx] = useState(null);

  const handleCityTap = (city, idx) => {
    if (expandedIdx === idx) {
      // Second tap on expanded card - trigger search
      onCityClick(city);
      onClose();
    } else {
      // First tap - expand the card
      setExpandedIdx(idx);
      onCityHover?.(city);
    }
  };

  const handleGoClick = (e, city) => {
    e.stopPropagation();
    onCityClick(city);
    onClose();
  };

  const handleRegionChange = (region) => {
    setActiveRegion(region);
    setExpandedIdx(null); // Collapse any expanded card when changing regions
  };

  return (
    <div className="sm:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl animate-slide-up">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Top Destinations</h2>
              <p className="text-xs text-gray-500">Tap to preview, tap again to explore</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Region Tabs - Horizontal Scrollable */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {regionList.map((region) => (
              <button
                key={region}
                onClick={() => handleRegionChange(region)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeRegion === region
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="px-4 py-4 max-h-[55vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {destinationsData[activeRegion]?.map((city, idx) => {
              const isExpanded = expandedIdx === idx;

              return (
                <button
                  key={idx}
                  onClick={() => handleCityTap(city, idx)}
                  className={`relative text-left transition-all duration-300 ease-out ${
                    isExpanded
                      ? 'col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg ring-2 ring-blue-200 p-4 animate-bubble'
                      : 'bg-gray-50 rounded-xl p-3 active:scale-[0.98]'
                  }`}
                >
                  <div className={`flex items-center gap-3 ${isExpanded ? 'gap-4' : ''}`}>
                    {/* Circular Image */}
                    <div className={`rounded-full overflow-hidden flex-shrink-0 ring-2 shadow-md transition-all duration-300 ${
                      isExpanded
                        ? 'w-16 h-16 ring-blue-300'
                        : 'w-12 h-12 ring-white'
                    }`}>
                      <img
                        src={city.image}
                        alt={city.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <p className={`font-bold transition-all duration-300 ${
                        isExpanded
                          ? 'text-base text-blue-800'
                          : 'text-sm text-gray-900 truncate'
                      }`}>
                        {city.name}
                      </p>
                      <p className={`transition-all duration-300 ${
                        isExpanded
                          ? 'text-sm text-gray-600 mt-0.5'
                          : 'text-xs text-gray-500 truncate'
                      }`}>
                        {isExpanded ? `Explore tours in ${city.country}` : city.country}
                      </p>

                      {/* Expanded: Show Go button */}
                      {isExpanded && (
                        <button
                          onClick={(e) => handleGoClick(e, city)}
                          className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full shadow-md transition-all active:scale-95"
                        >
                          <span>Explore {city.name}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Safe area padding for devices with home indicator */}
        <div className="h-6 bg-white" />
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }

        @keyframes bubble {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bubble {
          animation: bubble 0.3s ease-out forwards;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
