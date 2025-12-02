import React from 'react';
import { Plane, Hotel, MapPin, ExternalLink, Star, Clock } from 'lucide-react';

export default function OptionCard({ option, isSelected, onAdd, onRemove, formatCurrency, travelers = 2 }) {
  const colors = {
    flight: {
      border: 'border-blue-600',
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
    hotel: {
      border: 'border-purple-600',
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      button: 'bg-purple-600 hover:bg-purple-700',
    },
    tour: {
      border: 'border-green-600',
      bg: 'bg-green-50',
      icon: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700',
    },
  }[option.type];

  // Handle both 'link' (static data) and 'bookingLink' (Viator API)
  const bookingUrl = option.data.bookingLink || option.data.link;

  return (
    <div
      className={`bg-white rounded-lg shadow-md border-2 p-4 transition-all ${
        isSelected ? `${colors.border} ${colors.bg}` : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          {option.type === 'flight' && (
            <Plane className={`w-5 h-5 ${colors.icon} mt-1`} />
          )}
          {option.type === 'hotel' && (
            <Hotel className={`w-5 h-5 ${colors.icon} mt-1`} />
          )}
          {option.type === 'tour' && (
            <MapPin className={`w-5 h-5 ${colors.icon} mt-1`} />
          )}
          <div className="flex-1">
            <h4 className="font-bold text-gray-900">
              {option.data.airline || option.data.name}
            </h4>
            
            {/* Flight info */}
            {option.data.route && (
              <p className="text-sm text-gray-600">{option.data.route}</p>
            )}
            
            {/* Hotel info */}
            {option.data.location && (
              <p className="text-sm text-gray-600">
                ⭐ {option.data.rating}/5 · {option.data.location}
              </p>
            )}
            
            {/* Tour info - enhanced for Viator data */}
            {option.type === 'tour' && (
              <>
                {option.data.duration && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {option.data.duration}
                  </p>
                )}
                {option.data.rating && option.data.rating !== 'New' && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {option.data.rating}/5
                    {option.data.reviewCount > 0 && (
                      <span className="text-gray-400">
                        ({option.data.reviewCount.toLocaleString()} reviews)
                      </span>
                    )}
                  </p>
                )}
                {option.data.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {option.data.description}
                  </p>
                )}
              </>
            )}
            
            {/* Date/time for static tour data */}
            {option.data.date && option.data.time && option.type === 'tour' && !option.data.description && (
              <p className="text-sm text-gray-600">
                {option.data.date} at {option.data.time}
              </p>
            )}
          </div>
        </div>
        <div className="text-right ml-4">
          {/* Tour image from Viator */}
          {option.type === 'tour' && option.data.image && (
            <img 
              src={option.data.image} 
              alt={option.data.name}
              className="w-20 h-20 object-cover rounded-lg mb-2"
            />
          )}
          <p className={`text-xl font-bold ${colors.icon}`}>
            {formatCurrency(
              option.type === 'tour'
                ? option.data.price * travelers
                : option.data.price
            )}
          </p>
          {option.type === 'tour' && (
            <p className="text-xs text-gray-500">for {travelers} {travelers === 1 ? 'person' : 'people'}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors font-medium text-center flex items-center justify-center gap-1"
        >
          View Details
          <ExternalLink className="w-3 h-3" />
        </a>
        <button
          onClick={() =>
            isSelected ? onRemove(option.type, option.data.id) : onAdd(option.type, option.data)
          }
          className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors text-white ${
            isSelected ? 'bg-red-600 hover:bg-red-700' : colors.button
          }`}
        >
          {isSelected
            ? 'Remove'
            : option.type === 'tour'
            ? 'Add to Trip'
            : 'Select'}
        </button>
      </div>
    </div>
  );
}
