import React, { useState } from 'react';
import { MapPin, X, ChevronRight } from 'lucide-react';

export default function MobileDestinationsSheet({
  destinationsData,
  regionList,
  onCityClick,
  onCityHover,
  onClose,
}) {
  const [activeRegion, setActiveRegion] = useState('North America');

  const handleCitySelect = (city) => {
    onCityClick(city);
    onClose();
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
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Top Destinations</h2>
              <p className="text-xs text-gray-500">Explore popular tours worldwide</p>
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
                onClick={() => setActiveRegion(region)}
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
            {destinationsData[activeRegion]?.map((city, idx) => (
              <button
                key={idx}
                onClick={() => handleCitySelect(city)}
                onMouseEnter={() => onCityHover?.(city)}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 hover:shadow-md transition-all group text-left active:scale-[0.98]"
              >
                {/* Circular Image */}
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white shadow-md group-hover:ring-blue-200 transition-all">
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Text */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700 truncate">
                    {city.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {city.country}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
              </button>
            ))}
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
      `}</style>
    </div>
  );
}
