import React, { useState, useCallback, useMemo, memo } from 'react';
import { Plane, Hotel, MapPin, ExternalLink, Star, Clock, Eye, Bed, Coffee, Tag } from 'lucide-react';
import QuickViewModal from './QuickViewModal';
import HotelQuickViewModal from './HotelQuickViewModal';

const OptionCard = memo(function OptionCard({ option, isSelected, onAdd, onRemove, formatCurrency, travelers = 2 }) {
  const [showQuickView, setShowQuickView] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // Memoize colors based on option type
  const colors = useMemo(() => {
    const colorMap = {
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
    };
    return colorMap[option.type];
  }, [option.type]);

  const bookingUrl = option.data.bookingLink || option.data.link;

  // Memoize handlers with useCallback
  const handleAddRemove = useCallback(() => {
    isSelected ? onRemove(option.type, option.data.id) : onAdd(option.type, option.data);
  }, [isSelected, onRemove, onAdd, option.type, option.data]);

  const handleOpenQuickView = useCallback(() => {
    setDescriptionExpanded(false);
    setShowQuickView(true);
  }, []);

  const handleCloseQuickView = useCallback(() => {
    setShowQuickView(false);
    setDescriptionExpanded(false);
  }, []);

  const handleToggleDescription = useCallback(() => {
    setDescriptionExpanded(prev => !prev);
  }, []);

  // Memoize derived values
  const hasImage = useMemo(() =>
    (option.type === 'tour' || option.type === 'hotel') && option.data.image,
    [option.type, option.data.image]
  );

  // Memoize star array for hotel ratings
  const starArray = useMemo(() =>
    option.data.rating ? [...Array(Math.min(option.data.rating, 5))] : [],
    [option.data.rating]
  );

  return (
    <>
      <div
        className={`bg-white rounded-lg shadow-sm border transition-all hover:shadow-md ${
          isSelected ? `${colors.border} ${colors.bg} border-2` : 'border-gray-200'
        }`}
      >
        <div className="flex items-center gap-3 p-3">
          {/* Image - Show for tours AND hotels if available */}
          {hasImage ? (
            <img
              src={option.data.image}
              alt={option.data.name}
              loading="lazy"
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
            
            {/* Hotel info - Enhanced */}
            {option.type === 'hotel' && (
              <div className="mt-1 space-y-0.5">
                {/* Star rating and location */}
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  {option.data.rating && (
                    <>
                      <span className="flex items-center">
                        {starArray.map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </span>
                      <span className="mx-1">·</span>
                    </>
                  )}
                  <span className="truncate">{option.data.location}</span>
                </p>
                {/* Room type and board */}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {option.data.roomType && (
                    <span className="flex items-center gap-0.5">
                      <Bed className="w-3 h-3" />
                      <span className="truncate max-w-[80px]">{option.data.roomType}</span>
                    </span>
                  )}
                  {option.data.boardType && option.data.boardType !== 'Room Only' && (
                    <span className="flex items-center gap-0.5">
                      <Coffee className="w-3 h-3" />
                      <span className="truncate max-w-[80px]">{option.data.boardType}</span>
                    </span>
                  )}
                </div>
              </div>
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
            {/* Deal Badge - Show when tour has discount */}
            {option.type === 'tour' && option.data.hasDiscount && (
              <div className="flex items-center justify-end gap-1 mb-0.5">
                <Tag className="w-3 h-3 text-orange-500" />
                <span className="text-[10px] font-semibold text-orange-500 uppercase">Deal</span>
              </div>
            )}
            
            {/* Original Price (strikethrough) - Only for tours with discounts */}
            {option.type === 'tour' && option.data.hasDiscount && option.data.originalPrice && (
              <p className="text-sm text-gray-400 line-through">
                {formatCurrency(
                  option.data.pricingType === 'group' 
                    ? option.data.originalPrice 
                    : option.data.originalPrice * travelers
                )}
              </p>
            )}
            
            <p className={`text-lg font-bold ${option.type === 'tour' && option.data.hasDiscount ? 'text-orange-500' : colors.icon}`}>
              {formatCurrency(
                option.type === 'tour'
                  ? (option.data.pricingType === 'group' 
                      ? option.data.price  // Per group - don't multiply
                      : option.data.price * travelers)  // Per person - multiply
                  : option.type === 'hotel'
                    ? parseFloat(option.data.totalPrice || option.data.price || 0)  // Hotels use totalPrice (string)
                    : option.data.price
              )}
            </p>
            {option.type === 'tour' && (
              <p className="text-[10px] text-gray-400">
                {option.data.pricingType === 'group' 
                  ? `per group${option.data.maxGroupSize ? ` (up to ${option.data.maxGroupSize})` : ''}`
                  : `${travelers} ${travelers === 1 ? 'person' : 'people'}`
                }
              </p>
            )}
            {option.type === 'hotel' && option.data.nights && (
              <p className="text-[10px] text-gray-400">{option.data.nights} night{option.data.nights > 1 ? 's' : ''}</p>
            )}
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex gap-1.5 flex-shrink-0">
            {/* Quick View - Now for TOURS AND HOTELS */}
            {(option.type === 'tour' || option.type === 'hotel') && (
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
            {bookingUrl && (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                title="View Details"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            
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

      {/* Quick View Modal - Tours */}
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

      {/* Quick View Modal - Hotels */}
      {showQuickView && option.type === 'hotel' && (
        <HotelQuickViewModal
          hotel={option.data}
          onClose={handleCloseQuickView}
          formatCurrency={formatCurrency}
          onAddToTrip={handleAddRemove}
          isInCart={isSelected}
          descriptionExpanded={descriptionExpanded}
          onToggleDescription={handleToggleDescription}
        />
      )}
    </>
  );
});

export default OptionCard;
