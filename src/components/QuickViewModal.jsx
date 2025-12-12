import React from 'react';
import { X, Star, Clock, MapPin, Users, CheckCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export default function QuickViewModal({ 
  tour, 
  onClose, 
  formatCurrency, 
  travelers = 2, 
  onAddToTrip, 
  isInCart,
  descriptionExpanded,
  onToggleDescription
}) {
  if (!tour) return null;

  const description = tour.description || '';
  const isLongDescription = description.length > 150;
  
  // Get display text based on expanded state
  let displayDescription;
  if (descriptionExpanded || !isLongDescription) {
    displayDescription = description;
  } else {
    const truncateAt = 100;
    let cutPoint = truncateAt;
    const lastSpace = description.lastIndexOf(' ', truncateAt);
    if (lastSpace > 50) {
      cutPoint = lastSpace;
    }
    displayDescription = description.substring(0, cutPoint) + '...';
  }

  // Parse highlights from description if available
  const getHighlights = () => {
    if (tour.highlights && Array.isArray(tour.highlights)) {
      return tour.highlights;
    }
    if (description) {
      const sentences = description.split(/[.!]/).filter(s => s.trim().length > 20);
      return sentences.slice(0, 4).map(s => s.trim());
    }
    return [];
  };

  const highlights = getHighlights();

  // Calculate the display price based on pricing type
  const isPerGroup = tour.pricingType === 'group';
  const displayPrice = isPerGroup ? tour.price : tour.price * travelers;
  
  // Build the price description text
  const getPriceDescription = () => {
    if (isPerGroup) {
      let text = 'per group';
      if (tour.maxGroupSize) {
        text += ` (up to ${tour.maxGroupSize} people)`;
      }
      return text;
    } else {
      return `Total for ${travelers} ${travelers === 1 ? 'person' : 'people'} (${formatCurrency(tour.price)}/person)`;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image - Fixed Height */}
        <div className="relative h-44 bg-gray-200 flex-shrink-0">
          {tour.image ? (
            <img 
              src={tour.image} 
              alt={tour.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <MapPin className="w-16 h-16" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-colors shadow-lg"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
          
          {/* Rating Badge */}
          {tour.rating && tour.rating !== 'New' && (
            <div className="absolute bottom-3 left-3 bg-white bg-opacity-95 rounded-lg px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-gray-900">{tour.rating}</span>
              {tour.reviewCount > 0 && (
                <span className="text-gray-500 text-sm">({tour.reviewCount.toLocaleString()} reviews)</span>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5">
            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
              {tour.name}
            </h2>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-2 mb-4">
              {tour.duration && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4" />
                  <span>{tour.duration}</span>
                </div>
              )}
              {tour.destination && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  <MapPin className="w-4 h-4" />
                  <span>{tour.destination}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                <Users className="w-4 h-4" />
                <span>{travelers} {travelers === 1 ? 'person' : 'people'}</span>
              </div>
            </div>

            {/* Description - Expandable */}
            {description && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">About this experience</h3>
                
                <div className="relative" key={descriptionExpanded ? 'expanded' : 'collapsed'}>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {displayDescription}
                  </p>
                  {!descriptionExpanded && isLongDescription && (
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                  )}
                </div>
                
                {/* Read More / Read Less Toggle */}
                {isLongDescription && (
                  <button
                    type="button"
                    onClick={onToggleDescription}
                    className="mt-2 text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {descriptionExpanded ? (
                      <>
                        <span>Show less</span>
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Read more</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Highlights</h3>
                <ul className="space-y-2">
                  {highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What's Included - if available */}
            {tour.inclusions && tour.inclusions.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">What's included</h3>
                <ul className="space-y-1.5">
                  {tour.inclusions.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What's Not Included - if available */}
            {tour.exclusions && tour.exclusions.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">What's not included</h3>
                <ul className="space-y-1.5">
                  {tour.exclusions.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-500">
                      <X className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags/Categories */}
            {tour.tags && tour.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tour.tags.slice(0, 6).map((tag, idx) => (
                  <span 
                    key={idx}
                    className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Cancellation Policy */}
            {tour.cancellationPolicy && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Cancellation:</span> {tour.cancellationPolicy}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Price and Actions - Fixed */}
        <div className="border-t border-gray-200 bg-gray-50 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(displayPrice)}
            </p>
            <p className="text-xs text-gray-500">
              {getPriceDescription()}
            </p>
          </div>
          
          <div className="flex gap-2">
            <a
              href={tour.bookingLink || tour.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center gap-1.5"
            >
              Full Details
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToTrip();
                onClose();
              }}
              className={`px-4 py-2.5 text-sm rounded-lg font-medium transition-colors ${
                isInCart
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isInCart ? 'Remove from Trip' : 'Add to Trip'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
