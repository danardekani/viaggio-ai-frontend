import React from 'react';
import { Plane, Hotel, MapPin, ExternalLink } from 'lucide-react';

export default function OptionCard({ option, isSelected, onAdd, onRemove, formatCurrency }) {
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
            {option.data.route && (
              <p className="text-sm text-gray-600">{option.data.route}</p>
            )}
            {option.data.location && (
              <p className="text-sm text-gray-600">
                ⭐ {option.data.rating}/5 · {option.data.location}
              </p>
            )}
            {option.data.date && (
              <p className="text-sm text-gray-600">
                {option.data.date} at {option.data.time}
              </p>
            )}
          </div>
        </div>
        <div className="text-right ml-4">
          <p className={`text-xl font-bold ${colors.icon}`}>
            {formatCurrency(
              option.type === 'tour'
                ? option.data.price * 2
                : option.data.price
            )}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <a
          href={option.data.link}
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
