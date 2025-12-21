import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
  Loader2,
  Calendar,
  Users,
  Building,
  MapPin,
  Plane,
  ShoppingBag,
  Star,
  Wifi,
  Car,
  Coffee,
  Waves,
  Dumbbell,
  Utensils,
  Wind,
  Check
} from 'lucide-react';
import HotelCard from './HotelCard';
import HotelQuickViewModal from './HotelQuickViewModal';

// Common amenities for filtering
const COMMON_AMENITIES = [
  { key: 'wifi', label: 'Free WiFi', icon: Wifi },
  { key: 'parking', label: 'Parking', icon: Car },
  { key: 'pool', label: 'Pool', icon: Waves },
  { key: 'gym', label: 'Fitness Center', icon: Dumbbell },
  { key: 'restaurant', label: 'Restaurant', icon: Utensils },
  { key: 'breakfast', label: 'Breakfast', icon: Coffee },
  { key: 'air', label: 'Air Conditioning', icon: Wind },
];

// ============================================================================
// HOTEL RESULTS PAGE COMPONENT
// ============================================================================

export default function HotelResultsPage({
  searchParams,
  results = [],
  isLoading,
  onNewSearch,
  onBackToHome,
  cart,
  addToCart,
  removeFromCart,
  isInCart,
  formatCurrency,
  travelers: initialTravelers = 2,
  backendUrl,
  onCheckout
}) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [travelers, setTravelers] = useState(initialTravelers);

  // Search bar state
  const [searchDestination, setSearchDestination] = useState(searchParams?.destination || '');
  const [checkInDate, setCheckInDate] = useState(searchParams?.checkIn || '');
  const [checkOutDate, setCheckOutDate] = useState(searchParams?.checkOut || '');
  const [rooms, setRooms] = useState(searchParams?.rooms || 1);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [selectedDestinationCode, setSelectedDestinationCode] = useState(searchParams?.destinationCode || null);

  // UI State
  const [quickViewHotel, setQuickViewHotel] = useState(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Filtering
  const [sortBy, setSortBy] = useState('recommended');
  const [starFilter, setStarFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Refs
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const justSelectedRef = useRef(!!searchParams?.destination);

  // ============================================================================
  // PRICE RANGE CALCULATION
  // ============================================================================

  const priceRange = useMemo(() => {
    if (results.length === 0) return { min: 0, max: 1000 };
    const prices = results.map(h => parseFloat(h.totalPrice) || 0).filter(p => p > 0);
    if (prices.length === 0) return { min: 0, max: 1000 };
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    };
  }, [results]);

  // ============================================================================
  // FILTERING & SORTING
  // ============================================================================

  const filteredResults = useMemo(() => {
    let filtered = [...results];

    // Star filter
    if (starFilter) {
      const minStars = parseInt(starFilter);
      filtered = filtered.filter(hotel => (hotel.stars || 0) >= minStars);
    }

    // Price filter
    if (minPrice) {
      const min = parseFloat(minPrice);
      filtered = filtered.filter(hotel => (parseFloat(hotel.totalPrice) || 0) >= min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      filtered = filtered.filter(hotel => (parseFloat(hotel.totalPrice) || 0) <= max);
    }

    // Rating filter
    if (minRating) {
      const rating = parseFloat(minRating);
      filtered = filtered.filter(hotel => (hotel.reviewScore || 0) >= rating);
    }

    // Amenities filter
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(hotel => {
        const hotelAmenities = (hotel.amenities || hotel.facilities || [])
          .map(a => a?.toLowerCase() || '');
        return selectedAmenities.every(amenity =>
          hotelAmenities.some(a => a.includes(amenity))
        );
      });
    }

    // Sorting
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => (parseFloat(a.totalPrice) || 0) - (parseFloat(b.totalPrice) || 0));
        break;
      case 'price_high':
        filtered.sort((a, b) => (parseFloat(b.totalPrice) || 0) - (parseFloat(a.totalPrice) || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.reviewScore || 0) - (a.reviewScore || 0));
        break;
      case 'stars':
        filtered.sort((a, b) => (b.stars || 0) - (a.stars || 0));
        break;
      default:
        // recommended - keep original order
        break;
    }

    return filtered;
  }, [results, starFilter, sortBy, minPrice, maxPrice, minRating, selectedAmenities]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (starFilter) count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (minRating) count++;
    if (selectedAmenities.length > 0) count += selectedAmenities.length;
    return count;
  }, [starFilter, minPrice, maxPrice, minRating, selectedAmenities]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setStarFilter('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSelectedAmenities([]);
  }, []);

  // Toggle amenity
  const toggleAmenity = useCallback((amenityKey) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityKey)
        ? prev.filter(a => a !== amenityKey)
        : [...prev, amenityKey]
    );
  }, []);

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE);
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredResults.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredResults, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [starFilter, sortBy, minPrice, maxPrice, minRating, selectedAmenities]);

  // ============================================================================
  // CART CALCULATIONS
  // ============================================================================

  const cartItemCount = cart.hotels.length + cart.tours.length;
  const cartTotal = useMemo(() => {
    const hotelTotal = cart.hotels.reduce((sum, h) => sum + parseFloat(h.totalPrice || h.price || 0), 0);
    const tourTotal = cart.tours.reduce((sum, t) => {
      if (t.pricingType === 'group') return sum + (t.price || 0);
      return sum + (t.price || 0) * travelers;
    }, 0);
    return hotelTotal + tourTotal;
  }, [cart, travelers]);

  // ============================================================================
  // SEARCH HANDLER
  // ============================================================================

  const handleSearch = useCallback((e) => {
    e?.preventDefault();
    if (!searchDestination.trim()) return;

    setShowSuggestions(false);
    onNewSearch({
      type: 'hotels',
      destination: searchDestination.trim(),
      destinationCode: selectedDestinationCode,
      checkIn: checkInDate || undefined,
      checkOut: checkOutDate || undefined,
      guests: travelers,
      rooms: rooms
    });
  }, [searchDestination, selectedDestinationCode, checkInDate, checkOutDate, travelers, rooms, onNewSearch]);

  // ============================================================================
  // AUTOCOMPLETE
  // ============================================================================

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced autocomplete
  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    if (!searchDestination || searchDestination.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const response = await fetch(
          `${backendUrl}/api/hotels/destinations/autocomplete?q=${encodeURIComponent(searchDestination)}`,
          { signal: controller.signal }
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
          setSelectedSuggestionIndex(-1);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Autocomplete error:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSuggestions(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchDestination, backendUrl]);

  const handleSelectSuggestion = useCallback((suggestion) => {
    justSelectedRef.current = true;
    setSearchDestination(suggestion.displayName || suggestion.name);
    setSelectedDestinationCode(suggestion.code);
    setShowSuggestions(false);
    setSuggestions([]);
  }, []);

  // ============================================================================
  // QUICK VIEW
  // ============================================================================

  const openQuickView = useCallback((hotel) => {
    setQuickViewHotel(hotel);
    setDescriptionExpanded(false);
  }, []);

  const closeQuickView = useCallback(() => {
    setQuickViewHotel(null);
  }, []);

  const handleAddToTripFromModal = useCallback(() => {
    if (quickViewHotel) {
      if (isInCart('hotel', quickViewHotel.id)) {
        removeFromCart('hotel', quickViewHotel.id);
      } else {
        addToCart('hotel', quickViewHotel);
      }
    }
  }, [quickViewHotel, isInCart, addToCart, removeFromCart]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo and Back */}
            <div className="flex items-center gap-3">
              <button
                onClick={onBackToHome}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <Plane className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900 hidden sm:inline">Viaggio</span>
              </div>
            </div>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex-1 max-w-3xl flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2"
            >
              <div className="flex-1 relative" ref={searchInputRef}>
                <input
                  type="text"
                  value={searchDestination}
                  onChange={(e) => {
                    setSearchDestination(e.target.value);
                    setSelectedDestinationCode(null);
                  }}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search hotels..."
                  className="w-full bg-transparent focus:outline-none text-sm text-gray-700"
                />

                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto"
                  >
                    {suggestions.map((suggestion, index) => {
                      // Format location subtitle - prefer parentName, fallback to countryName or countryCode
                      const locationSubtitle = suggestion.parentName
                        || suggestion.countryName
                        || (suggestion.countryCode ? suggestion.countryCode : null);

                      return (
                        <button
                          key={suggestion.code || index}
                          type="button"
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                            index === selectedSuggestionIndex
                              ? 'bg-purple-50 text-purple-700'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {suggestion.displayName || suggestion.name}
                            </p>
                            {locationSubtitle && (
                              <p className="text-xs text-gray-500">{locationSubtitle}</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {loadingSuggestions && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  </div>
                )}
              </div>

              <span className="text-gray-300 hidden md:block">|</span>

              <div className="hidden md:flex items-center gap-1">
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-transparent focus:outline-none text-sm text-gray-600 w-[105px]"
                  title="Check-in"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  className="bg-transparent focus:outline-none text-sm text-gray-600 w-[105px]"
                  title="Check-out"
                />
              </div>

              <span className="text-gray-300 hidden md:block">|</span>

              <select
                value={travelers}
                onChange={(e) => setTravelers(parseInt(e.target.value))}
                className="bg-transparent focus:outline-none text-sm text-gray-600 cursor-pointer"
              >
                {[1,2,3,4,5,6,7,8].map(n => (
                  <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                ))}
              </select>

              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-colors flex-shrink-0"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Cart Button */}
            <button
              onClick={() => setCartSidebarOpen(true)}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ShoppingBag className="w-5 h-5 text-gray-600" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filter Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Price Range */}
              <div className="mb-5">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder={`$${priceRange.min}`}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <span className="text-gray-400">-</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder={`$${priceRange.max}`}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Star Rating */}
              <div className="mb-5">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Star Rating</h3>
                <div className="space-y-2">
                  {['', '3', '4', '5'].map((value) => (
                    <label key={value || 'all'} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="starFilter"
                        value={value}
                        checked={starFilter === value}
                        onChange={(e) => setStarFilter(e.target.value)}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-600">
                        {value === '' ? 'All Stars' : (
                          <span className="flex items-center gap-1">
                            {value}+ <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Minimum Rating */}
              <div className="mb-5">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Guest Rating</h3>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Any Rating</option>
                  <option value="7">7+ Good</option>
                  <option value="8">8+ Very Good</option>
                  <option value="9">9+ Excellent</option>
                </select>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Amenities</h3>
                <div className="space-y-2">
                  {COMMON_AMENITIES.map(({ key, label, icon: Icon }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(key)}
                        onChange={() => toggleAmenity(key)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Results Area */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Hotels in {searchParams?.destination || 'your destination'}
                </h1>
                <p className="text-gray-500 mt-1">
                  {filteredResults.length} {filteredResults.length === 1 ? 'hotel' : 'hotels'} found
                  {checkInDate && checkOutDate && ` • ${checkInDate} to ${checkOutDate}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowFilterPanel(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Guest Rating</option>
                  <option value="stars">Star Rating</option>
                </select>
              </div>
            </div>

            {/* Active Filters Tags */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-sm text-gray-500">Active filters:</span>
                {starFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    {starFilter}+ Stars
                    <button onClick={() => setStarFilter('')} className="hover:text-purple-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {minPrice && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    Min ${minPrice}
                    <button onClick={() => setMinPrice('')} className="hover:text-purple-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {maxPrice && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    Max ${maxPrice}
                    <button onClick={() => setMaxPrice('')} className="hover:text-purple-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {minRating && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    {minRating}+ Rating
                    <button onClick={() => setMinRating('')} className="hover:text-purple-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedAmenities.map(amenity => (
                  <span key={amenity} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full capitalize">
                    {amenity}
                    <button onClick={() => toggleAmenity(amenity)} className="hover:text-purple-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearFilters}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium underline"
                >
                  Clear all
                </button>
              </div>
            )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-16 bg-gray-200 rounded" />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-6 w-24 bg-gray-200 rounded" />
                      <div className="h-8 w-20 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && filteredResults.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hotels found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or dates
              </p>
              <button
                onClick={onBackToHome}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                New Search
              </button>
            </div>
          )}

          {/* Results Grid */}
          {!isLoading && filteredResults.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {paginatedResults.map((hotel) => (
                  <HotelCard
                    key={hotel.id || hotel.code}
                    hotel={hotel}
                    isSelected={isInCart('hotel', hotel.id)}
                    formatCurrency={formatCurrency}
                    openQuickView={openQuickView}
                    addToCart={addToCart}
                    removeFromCart={removeFromCart}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-purple-600 text-white'
                            : 'border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Panel */}
      {showFilterPanel && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowFilterPanel(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl flex flex-col animate-slide-in-left">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </h2>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Price Range */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder={`$${priceRange.min}`}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder={`$${priceRange.max}`}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Star Rating</h3>
                <div className="space-y-2">
                  {['', '3', '4', '5'].map((value) => (
                    <label key={value || 'all'} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="mobileStarFilter"
                        value={value}
                        checked={starFilter === value}
                        onChange={(e) => setStarFilter(e.target.value)}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-600">
                        {value === '' ? 'All Stars' : (
                          <span className="flex items-center gap-1">
                            {value}+ <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Guest Rating */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Guest Rating</h3>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Any Rating</option>
                  <option value="7">7+ Good</option>
                  <option value="8">8+ Very Good</option>
                  <option value="9">9+ Excellent</option>
                </select>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Amenities</h3>
                <div className="space-y-2">
                  {COMMON_AMENITIES.map(({ key, label, icon: Icon }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(key)}
                        onChange={() => toggleAmenity(key)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
              >
                Show {filteredResults.length} Hotels
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {cartSidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setCartSidebarOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl flex flex-col animate-slide-in-right">
            {/* Cart Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Your Trip</h2>
              <button
                onClick={() => setCartSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {cartItemCount === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Your trip is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Hotels */}
                  {cart.hotels.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Hotels ({cart.hotels.length})
                      </h3>
                      <div className="space-y-2">
                        {cart.hotels.map(hotel => (
                          <div key={hotel.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              {hotel.images?.[0]?.url || hotel.image ? (
                                <img
                                  src={hotel.images?.[0]?.url || hotel.image}
                                  alt={hotel.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                                  <Building className="w-6 h-6 text-purple-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{hotel.name}</p>
                              <p className="text-sm text-purple-600 font-semibold">
                                {formatCurrency(parseFloat(hotel.totalPrice || hotel.price || 0))}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart('hotel', hotel.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tours */}
                  {cart.tours.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Tours ({cart.tours.length})
                      </h3>
                      <div className="space-y-2">
                        {cart.tours.map(tour => (
                          <div key={tour.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              {tour.image ? (
                                <img src={tour.image} alt={tour.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                                  <MapPin className="w-6 h-6 text-blue-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{tour.name}</p>
                              <p className="text-sm text-blue-600 font-semibold">
                                {formatCurrency(tour.pricingType === 'group' ? tour.price : tour.price * travelers)}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart('tour', tour.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cartItemCount > 0 && (
              <div className="border-t border-gray-100 p-3 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Total</span>
                    <span className="text-xs text-gray-400 ml-1">for {travelers} guest{travelers > 1 ? 's' : ''}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(cartTotal)}</span>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Continue to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewHotel && (
        <HotelQuickViewModal
          hotel={quickViewHotel}
          onClose={closeQuickView}
          formatCurrency={formatCurrency}
          onAddToTrip={handleAddToTripFromModal}
          isInCart={isInCart('hotel', quickViewHotel.id)}
          descriptionExpanded={descriptionExpanded}
          onToggleDescription={() => setDescriptionExpanded(!descriptionExpanded)}
        />
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        @keyframes slide-in-left {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
