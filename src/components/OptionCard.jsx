import React, { useState } from 'react';
import { Plane, Hotel, MapPin, ExternalLink, Star, Clock, Eye } from 'lucide-react';
import QuickViewModal from './QuickViewModal';

export default function OptionCard({ option, isSelected, onAdd, onRemove, formatCurrency, travelers = 2 }) {
  const [showQuickView, setShowQuickView] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  
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

  const bookingUrl = option.data.bookingLink || option.data.link;

  const handleAddRemove = () => {
    isSelected ? onRemove(option.type, option.data.id) : onAdd(option.type, option.data);
  };

  const handleOpenQuickView = () => {
    setDescriptionExpanded(false); // Reset when opening
    setShowQuickView(true);
  };

  const handleCloseQuickView = () => {
    setShowQuickView(false);
    setDescriptionExpanded(false); // Reset when closing
  };

  const handleToggleDescription = () => {
    console.log('Toggle clicked! Current state:', descriptionExpanded);
    setDescriptionExpanded(prev => {
      console.log('Setting new state:', !prev);
      return !prev;
    });
  };

  return (
    <>
      <div
        className={`bg-white rounded-lg shadow-sm border transition-all hover:shadow-md ${
          isSelected ? `${colors.border} ${colors.bg} border-2` : 'border-gray-200'
        }`}
      >
        <div className="flex items-center gap-3 p-3">
          {/* Image - Compact Square */}
          {option.type === 'tour' && option.data.image ? (
            <img 
              src={option.data.image} 
              alt={option.data.name}
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
              {option.type === 'flight' && <Plane className={`w-6 h-6 ${colors.icon}`} />}
              {option.type === 'hotel' && <Hotel className={`w-6 h-6 ${colors.icon}`} />}
              {option.type === 'tour' && <MapPin className={`w-6 h-6 ${colors.icon}`} />}
            </div>
          )}

          {/* Content - Middle Section */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
              {option.data.airline || option.data.name}
            </h4>
            
            {/* Flight info */}
            {option.data.route && (
              <p className="text-xs text-gray-500 mt-0.5">{option.data.route}</p>
            )}
            
            {/* Hotel info */}
            {option.data.location && (
              <p className="text-xs text-gray-500 mt-0.5">
                ⭐ {option.data.rating}/5 · {option.data.location}
              </p>
            )}
            
            {/* Tour info - compact */}
            {option.type === 'tour' && (
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                {option.data.duration && (
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {option.data.duration}
                  </span>
                )}
                {option.data.rating && option.data.rating !== 'New' && (
                  <span className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {option.data.rating}
                    {option.data.reviewCount > 0 && (
                      <span className="text-gray-400">({option.data.reviewCount.toLocaleString()})</span>
                    )}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Price - Right Side */}
          <div className="text-right flex-shrink-0">
            <p className={`text-lg font-bold ${colors.icon}`}>
              {formatCurrency(
                option.type === 'tour'
                  ? option.data.price * travelers
                  : option.data.price
              )}
            </p>
            {option.type === 'tour' && (
              <p className="text-[10px] text-gray-400">{travelers} {travelers === 1 ? 'person' : 'people'}</p>
            )}
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex gap-1.5 flex-shrink-0">
            {/* Quick View - Tour only */}
            {option.type === 'tour' && (
              <button
                type="button"
                onClick={handleOpenQuickView}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                title="Quick View"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            
            {/* View Details */}
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              title="View Details"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            
            {/* Add/Remove */}
            <button
              type="button"
              onClick={handleAddRemove}
              className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors text-white whitespace-nowrap ${
                isSelected ? 'bg-red-600 hover:bg-red-700' : colors.button
              }`}
            >
              {isSelected ? 'Remove' : 'Add'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && option.type === 'tour' && (
        <QuickViewModal
          tour={option.data}
          onClose={handleCloseQuickView}
          formatCurrency={formatCurrency}
          travelers={travelers}
          onAddToTrip={handleAddRemove}
          isInCart={isSelected}
          descriptionExpanded={descriptionExpanded}
          onToggleDescription={handleToggleDescription}
        />
      )}
    </>
  );
}
