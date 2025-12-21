import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import {
  Plane,
  Hotel,
  MapPin,
  ChevronDown,
  ChevronUp,
  Search,
  Calendar,
  Users,
  SlidersHorizontal,
  X,
  Loader2,
  Building
} from 'lucide-react';
import DealsDiscovery from './DealsDiscovery';

// Debounce hook for autocomplete
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const SearchPanel = memo(function SearchPanel({ onSearch, isLoading, backendUrl }) {
  const [activeTab, setActiveTab] = useState('tours');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // ==================== TOURS AUTOCOMPLETE STATE ====================
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedDestinationId, setSelectedDestinationId] = useState(null);
  const destinationInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // ==================== HOTELS AUTOCOMPLETE STATE ====================
  const [hotelSuggestions, setHotelSuggestions] = useState([]);
  const [showHotelSuggestions, setShowHotelSuggestions] = useState(false);
  const [loadingHotelSuggestions, setLoadingHotelSuggestions] = useState(false);
  const [hotelSelectedIndex, setHotelSelectedIndex] = useState(-1);
  const [selectedHotelDestination, setSelectedHotelDestination] = useState(null);
  const hotelDestinationInputRef = useRef(null);
  const hotelSuggestionsRef = useRef(null);
  
  // Tours filter state
  const [toursFilters, setToursFilters] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 2,
    searchTerms: '',
    sortBy: 'popular',
    minPrice: '',
    maxPrice: '',
    minDuration: '',
    maxDuration: '',
    minRating: '',
    flags: {
      FREE_CANCELLATION: false,
      SKIP_THE_LINE: false,
      PRIVATE_TOUR: false,
      LIKELY_TO_SELL_OUT: false,
      SPECIAL_OFFER: false
    }
  });

  // Flights filter state (placeholder for future)
  const [flightsFilters, setFlightsFilters] = useState({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: 1,
    cabinClass: 'economy',
    tripType: 'roundtrip'
  });

  // Hotels filter state
  const [hotelsFilters, setHotelsFilters] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1,
    starRating: ''
  });

  // ==================== TOURS AUTOCOMPLETE ====================
  const debouncedDestination = useDebounce(toursFilters.destination, 300);

  // Fetch tours autocomplete suggestions with AbortController
  useEffect(() => {
    if (!debouncedDestination || debouncedDestination.length < 2 || selectedDestinationId) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();

    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const response = await fetch(
          `${backendUrl}/api/tours/destinations/autocomplete?q=${encodeURIComponent(debouncedDestination)}&limit=8`,
          { signal: controller.signal }
        );
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Autocomplete error:', error);
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSuggestions(false);
        }
      }
    };

    fetchSuggestions();

    return () => controller.abort();
  }, [debouncedDestination, selectedDestinationId, backendUrl]);

  // Close tours suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        destinationInputRef.current && 
        !destinationInputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==================== HOTELS AUTOCOMPLETE ====================
  const debouncedHotelDestination = useDebounce(hotelsFilters.destination, 300);

  // Fetch hotels autocomplete suggestions with AbortController
  useEffect(() => {
    if (!debouncedHotelDestination || debouncedHotelDestination.length < 2 || selectedHotelDestination) {
      setHotelSuggestions([]);
      return;
    }

    const controller = new AbortController();

    const fetchHotelSuggestions = async () => {
      setLoadingHotelSuggestions(true);
      try {
        const response = await fetch(
          `${backendUrl}/api/hotels/destinations/autocomplete?q=${encodeURIComponent(debouncedHotelDestination)}&limit=8`,
          { signal: controller.signal }
        );
        const data = await response.json();
        setHotelSuggestions(data.suggestions || []);
        setShowHotelSuggestions(true);
        setHotelSelectedIndex(-1);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Hotel autocomplete error:', error);
          setHotelSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingHotelSuggestions(false);
        }
      }
    };

    fetchHotelSuggestions();

    return () => controller.abort();
  }, [debouncedHotelDestination, selectedHotelDestination, backendUrl]);

  // Close hotels suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        hotelDestinationInputRef.current && 
        !hotelDestinationInputRef.current.contains(event.target) &&
        hotelSuggestionsRef.current &&
        !hotelSuggestionsRef.current.contains(event.target)
      ) {
        setShowHotelSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==================== TOURS HANDLERS ====================
  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setToursFilters(prev => ({ ...prev, destination: value }));
    setSelectedDestinationId(null);
    if (value.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setToursFilters(prev => ({ ...prev, destination: suggestion.displayName }));
    setSelectedDestinationId(suggestion.destinationId);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleDestinationKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && toursFilters.destination) {
        e.preventDefault();
        handleToursSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else {
          handleToursSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // ==================== HOTELS HANDLERS ====================
  const handleHotelDestinationChange = (e) => {
    const value = e.target.value;
    setHotelsFilters(prev => ({ ...prev, destination: value }));
    setSelectedHotelDestination(null);
    if (value.length >= 2) {
      setShowHotelSuggestions(true);
    }
  };

  const handleSelectHotelSuggestion = (suggestion) => {
    setHotelsFilters(prev => ({ ...prev, destination: suggestion.displayName || suggestion.name }));
    setSelectedHotelDestination(suggestion.code);
    setHotelSuggestions([]);
    setShowHotelSuggestions(false);
    setHotelSelectedIndex(-1);
  };

  const handleHotelDestinationKeyDown = (e) => {
    if (!showHotelSuggestions || hotelSuggestions.length === 0) {
      if (e.key === 'Enter' && hotelsFilters.destination) {
        e.preventDefault();
        handleHotelsSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHotelSelectedIndex(prev => 
          prev < hotelSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHotelSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (hotelSelectedIndex >= 0) {
          handleSelectHotelSuggestion(hotelSuggestions[hotelSelectedIndex]);
        } else {
          handleHotelsSearch();
        }
        break;
      case 'Escape':
        setShowHotelSuggestions(false);
        setHotelSelectedIndex(-1);
        break;
    }
  };

  // ==================== SEARCH HANDLERS ====================
  const handleToursSearch = () => {
    if (!toursFilters.destination) return;
    
    const activeFlags = Object.entries(toursFilters.flags)
      .filter(([_, active]) => active)
      .map(([flag]) => flag);

    onSearch({
      type: 'tours',
      destination: toursFilters.destination,
      destinationId: selectedDestinationId,
      startDate: toursFilters.startDate || undefined,
      endDate: toursFilters.endDate || undefined,
      travelers: toursFilters.travelers,
      searchTerms: toursFilters.searchTerms || undefined,
      sortBy: toursFilters.sortBy,
      minPrice: toursFilters.minPrice ? parseFloat(toursFilters.minPrice) : undefined,
      maxPrice: toursFilters.maxPrice ? parseFloat(toursFilters.maxPrice) : undefined,
      minDuration: toursFilters.minDuration ? parseInt(toursFilters.minDuration) : undefined,
      maxDuration: toursFilters.maxDuration ? parseInt(toursFilters.maxDuration) : undefined,
      minRating: toursFilters.minRating ? parseFloat(toursFilters.minRating) : undefined,
      flags: activeFlags.length > 0 ? activeFlags : undefined
    });
  };

  const handleHotelsSearch = () => {
    if (!hotelsFilters.destination) return;
    
    onSearch({
      type: 'hotels',
      destination: hotelsFilters.destination,
      destinationCode: selectedHotelDestination,
      checkIn: hotelsFilters.checkIn || undefined,
      checkOut: hotelsFilters.checkOut || undefined,
      guests: hotelsFilters.guests,
      rooms: hotelsFilters.rooms,
      starRating: hotelsFilters.starRating ? parseInt(hotelsFilters.starRating) : undefined
    });
  };

  const handleFlightsSearch = () => {
    if (!flightsFilters.from || !flightsFilters.to) return;
    
    onSearch({
      type: 'flights',
      from: flightsFilters.from,
      to: flightsFilters.to,
      departDate: flightsFilters.departDate,
      returnDate: flightsFilters.tripType === 'roundtrip' ? flightsFilters.returnDate : undefined,
      passengers: flightsFilters.passengers,
      cabinClass: flightsFilters.cabinClass,
      tripType: flightsFilters.tripType
    });
  };

  // Handle deals search from DealsDiscovery component
  const handleDealsSearch = (cityName) => {
    // Update the destination filter to show the city
    setToursFilters(prev => ({
      ...prev,
      destination: cityName,
      flags: {
        ...prev.flags,
        SPECIAL_OFFER: true // Enable deals filter
      }
    }));
    
    // Clear any previous destination ID since we're searching by name
    setSelectedDestinationId(null);
    
    // Trigger the search with SPECIAL_OFFER flag
    onSearch({
      type: 'tours',
      destination: cityName,
      destinationId: null,
      travelers: toursFilters.travelers,
      sortBy: 'popular',
      flags: ['SPECIAL_OFFER']
    });
  };

  // Toggle filter flags
  const toggleFlag = (flag) => {
    setToursFilters(prev => ({
      ...prev,
      flags: {
        ...prev.flags,
        [flag]: !prev.flags[flag]
      }
    }));
  };

  // Clear tours filters
  const clearToursFilters = () => {
    setToursFilters(prev => ({
      ...prev,
      searchTerms: '',
      minPrice: '',
      maxPrice: '',
      minDuration: '',
      maxDuration: '',
      minRating: '',
      flags: {
        FREE_CANCELLATION: false,
        SKIP_THE_LINE: false,
        PRIVATE_TOUR: false,
        LIKELY_TO_SELL_OUT: false,
        SPECIAL_OFFER: false
      }
    }));
  };

  // Memoize filter count calculation
  const filterCount = useMemo(() => {
    let count = 0;
    if (toursFilters.searchTerms) count++;
    if (toursFilters.minPrice) count++;
    if (toursFilters.maxPrice) count++;
    if (toursFilters.minDuration) count++;
    if (toursFilters.maxDuration) count++;
    if (toursFilters.minRating) count++;
    Object.values(toursFilters.flags).forEach(v => { if (v) count++; });
    return count;
  }, [toursFilters]);

  // Memoize destination type map for performance
  const destinationTypeMap = useMemo(() => ({
    'CITY': { label: 'City', color: 'bg-blue-100 text-blue-700' },
    'REGION': { label: 'Region', color: 'bg-green-100 text-green-700' },
    'COUNTRY': { label: 'Country', color: 'bg-purple-100 text-purple-700' },
    'DISTRICT': { label: 'District', color: 'bg-orange-100 text-orange-700' },
    'NATIONAL_PARK': { label: 'National Park', color: 'bg-emerald-100 text-emerald-700' },
    'STATE': { label: 'State', color: 'bg-indigo-100 text-indigo-700' },
    'PROVINCE': { label: 'Province', color: 'bg-indigo-100 text-indigo-700' },
    'ISLAND': { label: 'Island', color: 'bg-cyan-100 text-cyan-700' },
    'TOWN': { label: 'Town', color: 'bg-sky-100 text-sky-700' },
    'VILLAGE': { label: 'Village', color: 'bg-sky-100 text-sky-700' },
    'NEIGHBORHOOD': { label: 'Neighborhood', color: 'bg-amber-100 text-amber-700' },
    'AIRPORT': { label: 'Airport', color: 'bg-slate-100 text-slate-700' },
    'ATTRACTION': { label: 'Attraction', color: 'bg-pink-100 text-pink-700' },
    'LANDMARK': { label: 'Landmark', color: 'bg-rose-100 text-rose-700' },
    'DESTINATION': { label: 'Destination', color: 'bg-teal-100 text-teal-700' },
  }), []);

  // Get destination type info for display - use memoized map
  const getDestinationType = useCallback((type) => {
    if (destinationTypeMap[type]) {
      return destinationTypeMap[type];
    }
    // Format unknown types: SOME_TYPE -> Some Type
    const formatted = type
      ? type.split('_').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ')
      : 'Place';
    return { label: formatted, color: 'bg-gray-100 text-gray-700' };
  }, [destinationTypeMap]);

  return (
    <>
      {/* Collapsed Toggle Button - Always in DOM, fades in/out */}
      <button
        onClick={() => setIsExpanded(true)}
        className={`fixed top-20 left-1/2 -translate-x-1/2 z-30 bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2 hover:shadow-xl transition-all duration-300 ${
          isExpanded ? 'opacity-0 pointer-events-none -translate-y-4' : 'opacity-100 translate-y-0'
        }`}
      >
        <Search className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Search</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {/* Search Panel - Always in DOM, animates height */}
      <div 
        className={`bg-white border-b border-gray-200 shadow-sm transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[500px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 border-b-0 overflow-hidden'
        }`}
      >
      <div className="max-w-5xl mx-auto px-4 py-3">
        {/* Tab Headers */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[
                { id: 'tours', label: 'Tours', icon: MapPin, color: 'green' },
                { id: 'hotels', label: 'Hotels', icon: Hotel, color: 'purple' },
                // MVP: Flights disabled for initial launch
                // { id: 'flights', label: 'Flights', icon: Plane, color: 'blue' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? `bg-${tab.color}-100 text-${tab.color}-700`
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Deals Discovery Button */}
            <div className="border-l border-gray-200 pl-3">
              <DealsDiscovery 
                onSearchDeals={handleDealsSearch}
                isLoading={isLoading}
              />
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>

        {/* Tours Tab */}
        {activeTab === 'tours' && (
          <form onSubmit={(e) => { e.preventDefault(); handleToursSearch(); }}>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Destination with Autocomplete */}
              <div className="relative flex-1 min-w-[200px]" ref={destinationInputRef}>
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  id="tours-destination"
                  name="tours-destination"
                  placeholder="Where to? (start typing...)"
                  autoComplete="off"
                  value={toursFilters.destination}
                  onChange={handleDestinationChange}
                  onKeyDown={handleDestinationKeyDown}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  className="w-full pl-8 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                
                {/* Loading Indicator */}
                {loadingSuggestions && (
                  <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}
                
                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                  >
                    {suggestions.map((suggestion, index) => {
                      const typeInfo = getDestinationType(suggestion.type);
                      return (
                        <button
                          key={suggestion.destinationId || index}
                          type="button"
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                            index === selectedIndex ? 'bg-green-50' : ''
                          } ${index === 0 ? 'rounded-t-lg' : ''} ${
                            index === suggestions.length - 1 ? 'rounded-b-lg' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-900">{suggestion.displayName}</span>
                          </div>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  id="tours-start-date"
                  name="tours-start-date"
                  value={toursFilters.startDate}
                  onChange={(e) => setToursFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-[130px]"
                />
              </div>

              <select
                id="tours-travelers"
                name="tours-travelers"
                value={toursFilters.travelers}
                onChange={(e) => setToursFilters(prev => ({ ...prev, travelers: parseInt(e.target.value) }))}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white pr-8"
              >
                {[1,2,3,4,5,6,7,8].map(n => (
                  <option key={n} value={n}>{n} traveler{n > 1 ? 's' : ''}</option>
                ))}
              </select>

              <select
                id="tours-sort"
                name="tours-sort"
                value={toursFilters.sortBy}
                onChange={(e) => setToursFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
              >
                <option value="popular">Most Popular</option>
                <option value="reviews">Most Reviews</option>
                <option value="rating">Top Rated</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  showFilters || filterCount > 0
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {filterCount > 0 && (
                  <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">{filterCount}</span>
                )}
              </button>

              <button
                type="submit"
                disabled={!toursFilters.destination || isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>

            {/* Advanced Filters (Collapsible) */}
            {showFilters && (
              <div className="bg-gray-50 rounded-lg p-3 mt-3 space-y-3">
                <div className="flex flex-wrap gap-2 items-center">
                  <input
                    type="text"
                    id="tours-activity"
                    name="tours-activity"
                    placeholder="Activity (food, history...)"
                    autoComplete="off"
                    value={toursFilters.searchTerms}
                    onChange={(e) => setToursFilters(prev => ({ ...prev, searchTerms: e.target.value }))}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-[160px]"
                  />

                  <input
                    type="number"
                    id="tours-min-price"
                    name="tours-min-price"
                    placeholder="Min $"
                    value={toursFilters.minPrice}
                    onChange={(e) => setToursFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-[80px]"
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input
                    type="number"
                    id="tours-max-price"
                    name="tours-max-price"
                    placeholder="Max $"
                    value={toursFilters.maxPrice}
                    onChange={(e) => setToursFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-[80px]"
                  />

                  <select
                    id="tours-min-rating"
                    name="tours-min-rating"
                    value={toursFilters.minRating}
                    onChange={(e) => setToursFilters(prev => ({ ...prev, minRating: e.target.value }))}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
                  >
                    <option value="">Any Rating</option>
                    <option value="3">3+ ★</option>
                    <option value="3.5">3.5+ ★</option>
                    <option value="4">4+ ★</option>
                    <option value="4.5">4.5+ ★</option>
                  </select>

                  {filterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearToursFilters}
                      className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: 'FREE_CANCELLATION', label: 'Free Cancel' },
                    { key: 'SKIP_THE_LINE', label: 'Skip Line' },
                    { key: 'PRIVATE_TOUR', label: 'Private' },
                    { key: 'LIKELY_TO_SELL_OUT', label: 'Popular' },
                    { key: 'SPECIAL_OFFER', label: 'Deals' }
                  ].map(flag => (
                    <button
                      key={flag.key}
                      type="button"
                      onClick={() => toggleFlag(flag.key)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        toursFilters.flags[flag.key]
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-600 border border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {flag.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        )}

        {/* Hotels Tab */}
        {activeTab === 'hotels' && (
          <form onSubmit={(e) => { e.preventDefault(); handleHotelsSearch(); }}>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Destination with Autocomplete */}
              <div className="relative flex-1 min-w-[180px]" ref={hotelDestinationInputRef}>
                <Hotel className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  id="hotels-destination"
                  name="hotels-destination"
                  placeholder="City (start typing...)"
                  autoComplete="off"
                  value={hotelsFilters.destination}
                  onChange={handleHotelDestinationChange}
                  onKeyDown={handleHotelDestinationKeyDown}
                  onFocus={() => {
                    if (hotelSuggestions.length > 0) setShowHotelSuggestions(true);
                  }}
                  className="w-full pl-8 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                
                {/* Loading Indicator */}
                {loadingHotelSuggestions && (
                  <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}
                
                {/* Autocomplete Dropdown */}
                {showHotelSuggestions && hotelSuggestions.length > 0 && (
                  <div 
                    ref={hotelSuggestionsRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                  >
                    {hotelSuggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.code || index}
                        type="button"
                        onClick={() => handleSelectHotelSuggestion(suggestion)}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                          index === hotelSelectedIndex ? 'bg-purple-50' : ''
                        } ${index === 0 ? 'rounded-t-lg' : ''} ${
                          index === hotelSuggestions.length - 1 ? 'rounded-b-lg' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-900">{suggestion.displayName || suggestion.name}</span>
                        </div>
                        {suggestion.countryCode && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                            {suggestion.countryCode}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="date"
                id="hotels-checkin"
                name="hotels-checkin"
                value={hotelsFilters.checkIn}
                onChange={(e) => setHotelsFilters(prev => ({ ...prev, checkIn: e.target.value }))}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-[130px]"
                placeholder="Check-in"
              />

              <input
                type="date"
                id="hotels-checkout"
                name="hotels-checkout"
                value={hotelsFilters.checkOut}
                onChange={(e) => setHotelsFilters(prev => ({ ...prev, checkOut: e.target.value }))}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-[130px]"
                placeholder="Check-out"
              />

              <select
                id="hotels-guests"
                name="hotels-guests"
                value={hotelsFilters.guests}
                onChange={(e) => setHotelsFilters(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
              >
                {[1,2,3,4,5,6].map(n => (
                  <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                ))}
              </select>

              <select
                id="hotels-rooms"
                name="hotels-rooms"
                value={hotelsFilters.rooms}
                onChange={(e) => setHotelsFilters(prev => ({ ...prev, rooms: parseInt(e.target.value) }))}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
              >
                {[1,2,3,4].map(n => (
                  <option key={n} value={n}>{n} room{n > 1 ? 's' : ''}</option>
                ))}
              </select>

              <button
                type="submit"
                disabled={!hotelsFilters.destination || isLoading}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </form>
        )}

        {/* MVP: Flights Tab - disabled for initial launch */}
        {false && activeTab === 'flights' && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex gap-1 mr-2">
                {['roundtrip', 'oneway'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFlightsFilters(prev => ({ ...prev, tripType: type }))}
                    className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                      flightsFilters.tripType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'roundtrip' ? 'Round Trip' : 'One Way'}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 min-w-[120px]">
                <Plane className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  id="flights-from"
                  name="flights-from"
                  placeholder="From"
                  autoComplete="off"
                  value={flightsFilters.from}
                  onChange={(e) => setFlightsFilters(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative flex-1 min-w-[120px]">
                <Plane className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90" />
                <input
                  type="text"
                  id="flights-to"
                  name="flights-to"
                  placeholder="To"
                  autoComplete="off"
                  value={flightsFilters.to}
                  onChange={(e) => setFlightsFilters(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <input
                type="date"
                id="flights-depart"
                name="flights-depart"
                value={flightsFilters.departDate}
                onChange={(e) => setFlightsFilters(prev => ({ ...prev, departDate: e.target.value }))}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-[130px]"
              />

              {flightsFilters.tripType === 'roundtrip' && (
                <input
                  type="date"
                  id="flights-return"
                  name="flights-return"
                  value={flightsFilters.returnDate}
                  onChange={(e) => setFlightsFilters(prev => ({ ...prev, returnDate: e.target.value }))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-[130px]"
                />
              )}

              <select
                id="flights-passengers"
                name="flights-passengers"
                value={flightsFilters.passengers}
                onChange={(e) => setFlightsFilters(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                {[1,2,3,4,5,6].map(n => (
                  <option key={n} value={n}>{n} passenger{n > 1 ? 's' : ''}</option>
                ))}
              </select>

              <button
                type="button"
                disabled={true}
                className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                Coming Soon
              </button>
            </div>
            
            <p className="text-xs text-gray-500 italic">
              Flight search is coming soon! For now, ask the AI assistant.
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
});

export default SearchPanel;
