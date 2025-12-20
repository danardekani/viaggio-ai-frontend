import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import {
  Search,
  MapPin,
  Camera,
  Tag,
  Calendar,
  Users,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  ShoppingBag,
  Plane,
  Loader2,
  ChevronDown
} from 'lucide-react';
import ViaChat from './ViaChat';

// ============================================================================
// CONSTANTS
// ============================================================================

const HERO_IMAGE = 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920&q=80';

const FEATURED_DESTINATIONS = [
  { 
    name: 'Paris', 
    country: 'France', 
    deal: 'Up to 20% off tours', 
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80'
  },
  { 
    name: 'Rome', 
    country: 'Italy', 
    deal: 'Save on Colosseum tours', 
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80'
  },
  { 
    name: 'Tokyo', 
    country: 'Japan', 
    deal: 'Special winter offers', 
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80'
  },
  { 
    name: 'Barcelona', 
    country: 'Spain', 
    deal: '15% off experiences', 
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&q=80'
  },
  { 
    name: 'New York', 
    country: 'USA', 
    deal: 'Broadway & more deals', 
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80'
  },
];

// ============================================================================
// LANDING PAGE COMPONENT
// ============================================================================

export default function LandingPage({ 
  onSearch,
  onSearchDeals,
  onOpenWhereIsThis,
  onOpenChat,
  onOpenTripBuilder,
  cart = { tours: [], hotels: [], flights: [] },
  removeFromCart,
  formatCurrency = (amount) => `$${(amount || 0).toFixed(2)}`,
  onCheckout,
  isLoading = false,
  backendUrl
}) {
  const [activeTab, setActiveTab] = useState('tours');
  const [destination, setDestination] = useState('');
  const [travelDates, setTravelDates] = useState('');
  const [travelers, setTravelers] = useState(2);
  
  // Cart sidebar state
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedDestinationId, setSelectedDestinationId] = useState(null);
  
  // Where Is This state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [identifyingLocation, setIdentifyingLocation] = useState(false);
  const [identifiedLocation, setIdentifiedLocation] = useState(null);
  
  const destinationInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const fileInputRef = useRef(null);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        destinationInputRef.current && 
        !destinationInputRef.current.contains(e.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================================================
  // DESTINATION AUTOCOMPLETE - With AbortController for cleanup
  // ============================================================================

  // Debounced autocomplete with AbortController
  useEffect(() => {
    if (!destination || destination.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const response = await fetch(
          `${backendUrl}/api/tours/destinations/autocomplete?q=${encodeURIComponent(destination)}`,
          { signal: controller.signal }
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
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
  }, [destination, backendUrl]);

  const handleSelectSuggestion = useCallback((suggestion) => {
    setDestination(suggestion.displayName || suggestion.name);
    setSelectedDestinationId(suggestion.destinationId);
    setShowSuggestions(false);
    setSuggestions([]);
  }, []);

  const handleDestinationKeyDown = useCallback((e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, [showSuggestions, suggestions, selectedIndex, handleSelectSuggestion]);

  // ============================================================================
  // SEARCH HANDLERS - Memoized with useCallback
  // ============================================================================

  const handleToursSearch = useCallback((e) => {
    e?.preventDefault();
    if (!destination.trim()) return;

    onSearch?.({
      type: 'tours',
      destination: destination.trim(),
      destinationId: selectedDestinationId,
      travelers,
      startDate: travelDates || undefined
    });
  }, [destination, selectedDestinationId, travelers, travelDates, onSearch]);

  const handleDealsSearch = useCallback((cityName) => {
    onSearchDeals?.(cityName);
  }, [onSearchDeals]);

  const handleFeaturedDealClick = useCallback((dest) => {
    onSearchDeals?.(dest.name);
  }, [onSearchDeals]);

  // ============================================================================
  // WHERE IS THIS - IMAGE UPLOAD HANDLERS
  // ============================================================================

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  const processImageFile = async (file) => {
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    setUploadedImage(file);
    setIdentifiedLocation(null);
    
    // Auto-identify after upload
    await identifyLocation(file);
  };

  const identifyLocation = async (file) => {
    setIdentifyingLocation(true);
    
    try {
      // Convert file to base64
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      const response = await fetch(`${backendUrl}/api/identify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      });

      if (!response.ok) throw new Error('Identification failed');

      const data = await response.json();
      setIdentifiedLocation(data);
      
    } catch (error) {
      console.error('Location identification error:', error);
      setIdentifiedLocation({ error: true, message: 'Could not identify location. Try another image.' });
    } finally {
      setIdentifyingLocation(false);
    }
  };

  const handleSearchIdentifiedLocation = () => {
    if (identifiedLocation?.destination) {
      // destination can be an object with fullName/name or a string
      const destName = typeof identifiedLocation.destination === 'object' 
        ? (identifiedLocation.destination.fullName || identifiedLocation.destination.name)
        : identifiedLocation.destination;
      
      onSearch?.({
        type: 'tours',
        destination: destName,
        travelers
      });
    }
  };

  const resetWhereIsThis = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setIdentifiedLocation(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ============================================================================
  // COMPUTED VALUES - Memoized
  // ============================================================================

  const tripItemCount = useMemo(() =>
    cart.tours.length + cart.hotels.length + cart.flights.length,
    [cart.tours.length, cart.hotels.length, cart.flights.length]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================================================================== */}
      {/* HERO SECTION */}
      {/* ================================================================== */}
      <div className="relative h-[70vh] min-h-[550px]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
        </div>

        {/* Top Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
          {/* Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <span className="text-lg sm:text-xl font-bold text-white tracking-tight">Viaggio</span>
          </div>

          {/* Center Tabs - scrollable on mobile */}
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-full p-0.5 sm:p-1 mx-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('tours')}
              className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'tours' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Tours & Experiences</span>
              <span className="sm:hidden">Tours</span>
            </button>
            <button
              onClick={() => setActiveTab('whereis')}
              className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'whereis' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Where is This?</span>
              <span className="sm:hidden">Identify</span>
            </button>
            <button
              onClick={() => setActiveTab('deals')}
              className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'deals' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Deals
            </button>
          </div>

          {/* My Trip Button */}
          <button 
            onClick={() => setCartSidebarOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all flex-shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">My Trip</span>
            {tripItemCount > 0 && (
              <span className="bg-green-500 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                {tripItemCount}
              </span>
            )}
          </button>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full pt-2 sm:pt-4 px-3 sm:px-4">
          {/* Tagline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-1 sm:mb-2 drop-shadow-lg">
            Discover Your Next Adventure
          </h1>
          <p className="text-sm sm:text-lg text-white/90 mb-4 sm:mb-8 drop-shadow text-center">
            Find and book amazing tours & experiences worldwide
          </p>

          {/* Search Panel */}
          <div className="w-full max-w-3xl">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-1.5 sm:p-2">
              
              {/* Tours Search Tab */}
              {activeTab === 'tours' && (
                <form onSubmit={handleToursSearch} className="flex flex-col sm:flex-row items-stretch">
                  {/* Destination */}
                  <div className="flex-1 relative" ref={destinationInputRef}>
                    <div className="flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-200">
                      <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">Where</p>
                        <input 
                          type="text"
                          placeholder="Search destination"
                          value={destination}
                          onChange={(e) => {
                            setDestination(e.target.value);
                            setSelectedDestinationId(null);
                          }}
                          onKeyDown={handleDestinationKeyDown}
                          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                          className="w-full text-gray-900 placeholder-gray-400 focus:outline-none"
                          autoComplete="off"
                        />
                      </div>
                      {loadingSuggestions && (
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      )}
                    </div>

                    {/* Autocomplete Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div 
                        ref={suggestionsRef}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto"
                      >
                        {suggestions.map((suggestion, index) => {
                          // Safely extract display values (handle edge cases)
                          const displayName = typeof suggestion?.displayName === 'string' 
                            ? suggestion.displayName 
                            : (typeof suggestion?.name === 'string' ? suggestion.name : 'Unknown');
                          const destType = typeof suggestion?.type === 'string' 
                            ? suggestion.type.toLowerCase().replace('_', ' ') 
                            : null;
                          
                          return (
                            <button
                              key={suggestion?.destinationId || index}
                              type="button"
                              onClick={() => handleSelectSuggestion(suggestion)}
                              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                                index === selectedIndex ? 'bg-blue-50' : ''
                              } ${index === 0 ? 'rounded-t-xl' : ''} ${
                                index === suggestions.length - 1 ? 'rounded-b-xl' : ''
                              }`}
                            >
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {displayName}
                                </p>
                                {destType && (
                                  <p className="text-xs text-gray-500 capitalize">{destType}</p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Dates */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-200">
                    <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Dates</p>
                      <input
                        type="date"
                        value={travelDates}
                        onChange={(e) => setTravelDates(e.target.value)}
                        className="text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                        placeholder="Add dates"
                      />
                    </div>
                  </div>
                  
                  {/* Travelers */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Travelers</p>
                      <div className="relative">
                        <select
                          value={travelers}
                          onChange={(e) => setTravelers(parseInt(e.target.value))}
                          className="text-gray-900 focus:outline-none bg-transparent appearance-none pr-6 cursor-pointer"
                        >
                          {[1,2,3,4,5,6,7,8].map(n => (
                            <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Search Button */}
                  <button 
                    type="submit"
                    disabled={!destination.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-4 rounded-xl transition-colors m-1 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </button>
                </form>
              )}

              {/* Where Is This Tab */}
              {activeTab === 'whereis' && (
                <div className="p-4">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {!imagePreview ? (
                    /* Upload Zone */
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        isDragging 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                          isDragging ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Camera className={`w-8 h-8 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">
                            {isDragging ? 'Drop your image here!' : 'Upload a photo to identify the location'}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Drag & drop or click to browse
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Image Preview & Results */
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      {/* Image Preview */}
                      <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={imagePreview} 
                          alt="Uploaded" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={resetWhereIsThis}
                          className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      
                      {/* Status / Results */}
                      <div className="flex-1 text-center sm:text-left">
                        {identifyingLocation ? (
                          <div className="flex items-center gap-3 justify-center sm:justify-start">
                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                            <div>
                              <p className="text-gray-900 font-medium">Identifying location...</p>
                              <p className="text-sm text-gray-500">Analyzing your image</p>
                            </div>
                          </div>
                        ) : identifiedLocation?.error ? (
                          <div>
                            <p className="text-gray-900 font-medium">Couldn't identify location</p>
                            <p className="text-sm text-gray-500">{identifiedLocation.message || 'Unable to recognize this location'}</p>
                            <button
                              onClick={resetWhereIsThis}
                              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Try another image
                            </button>
                          </div>
                        ) : identifiedLocation?.destination ? (
                          <div>
                            <p className="text-sm text-gray-500">We found it!</p>
                            <p className="text-xl font-bold text-gray-900">
                              {typeof identifiedLocation.destination === 'object' 
                                ? (identifiedLocation.destination.fullName || identifiedLocation.destination.name)
                                : identifiedLocation.destination}
                            </p>
                            {identifiedLocation.landmark && (
                              <p className="text-sm text-gray-600">📍 {identifiedLocation.landmark}</p>
                            )}
                            {identifiedLocation.confidence && (
                              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                                identifiedLocation.confidence === 'high' ? 'bg-green-100 text-green-700' :
                                identifiedLocation.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {identifiedLocation.confidence} confidence
                              </span>
                            )}
                          </div>
                        ) : identifiedLocation ? (
                          // Fallback: API returned something but no destination
                          <div>
                            <p className="text-gray-900 font-medium">Location not recognized</p>
                            <p className="text-sm text-gray-500">We couldn't identify a specific destination in this image. Try a photo of a famous landmark or tourist attraction.</p>
                            <button
                              onClick={resetWhereIsThis}
                              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Try another image
                            </button>
                          </div>
                        ) : null}
                      </div>
                      
                      {/* Action Button */}
                      {identifiedLocation?.destination && !identifiedLocation.error && (
                        <button
                          onClick={handleSearchIdentifiedLocation}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
                        >
                          <Search className="w-5 h-5" />
                          Find Tours
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Deals Tab */}
              {activeTab === 'deals' && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 relative" ref={destinationInputRef}>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Tag className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">Find Deals In</p>
                        <input 
                          type="text"
                          placeholder="Enter a city to find deals..."
                          value={destination}
                          onChange={(e) => {
                            setDestination(e.target.value);
                            setSelectedDestinationId(null);
                          }}
                          onKeyDown={(e) => {
                            // Handle autocomplete navigation
                            if (showSuggestions && suggestions.length > 0) {
                              if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                                return;
                              } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                setSelectedIndex(prev => Math.max(prev - 1, -1));
                                return;
                              } else if (e.key === 'Enter' && selectedIndex >= 0) {
                                e.preventDefault();
                                handleSelectSuggestion(suggestions[selectedIndex]);
                                return;
                              } else if (e.key === 'Escape') {
                                setShowSuggestions(false);
                                return;
                              }
                            }
                            // Handle search on Enter
                            if (e.key === 'Enter' && destination.trim()) {
                              handleDealsSearch(destination.trim());
                            }
                          }}
                          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                          className="w-full text-gray-900 placeholder-gray-400 focus:outline-none"
                          autoComplete="off"
                        />
                      </div>
                      {loadingSuggestions && (
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      )}
                    </div>

                    {/* Autocomplete Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div 
                        ref={suggestionsRef}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto"
                      >
                        {suggestions.map((suggestion, index) => {
                          // Safely extract display values (handle edge cases)
                          const displayName = typeof suggestion?.displayName === 'string' 
                            ? suggestion.displayName 
                            : (typeof suggestion?.name === 'string' ? suggestion.name : 'Unknown');
                          const destType = typeof suggestion?.type === 'string' 
                            ? suggestion.type.toLowerCase().replace('_', ' ') 
                            : null;
                          
                          return (
                            <button
                              key={suggestion?.destinationId || index}
                              type="button"
                              onClick={() => handleSelectSuggestion(suggestion)}
                              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                                index === selectedIndex ? 'bg-orange-50' : ''
                              } ${index === 0 ? 'rounded-t-xl' : ''} ${
                                index === suggestions.length - 1 ? 'rounded-b-xl' : ''
                              }`}
                            >
                              <MapPin className="w-4 h-4 text-orange-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {displayName}
                                </p>
                                {destType && (
                                  <p className="text-xs text-gray-500 capitalize">{destType}</p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => destination.trim() && handleDealsSearch(destination.trim())}
                    disabled={!destination.trim() || isLoading}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-300 text-white px-6 py-4 rounded-xl transition-colors font-medium flex items-center justify-center gap-2 m-1"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Find Deals
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Photo Credit */}
        <div className="absolute bottom-4 right-4 text-white/60 text-xs">
          📍 Maldives
        </div>
      </div>

      {/* ================================================================== */}
      {/* FEATURED DESTINATIONS */}
      {/* ================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 mt-4 sm:mt-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Featured Deals</h2>
          <div className="flex gap-2">
            <button className="p-1.5 sm:p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
            <button className="p-1.5 sm:p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {FEATURED_DESTINATIONS.map((dest) => (
            <div 
              key={dest.name}
              onClick={() => handleFeaturedDealClick(dest)}
              className="group relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  loading="lazy"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-2.5 sm:p-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{dest.name}</h3>
                <p className="text-xs sm:text-sm text-orange-600 font-medium">{dest.deal}</p>
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 sm:p-4">
                <span className="text-white font-medium flex items-center gap-1 text-sm sm:text-base">
                  View Deals <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================== */}
      {/* VIA CHAT - Reusable Component */}
      {/* ================================================================== */}
      <ViaChat
        backendUrl={backendUrl}
        onSearch={onSearch}
        travelers={travelers}
      />

      {/* ================================================================== */}
      {/* FLOATING CART PANEL */}
      {/* ================================================================== */}
      {cartSidebarOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/30"
            onClick={() => setCartSidebarOpen(false)}
          />
          
          {/* Floating Panel */}
          <div className="absolute right-4 top-4 bottom-4 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                My Trip ({tripItemCount})
              </h2>
              <button
                onClick={() => setCartSidebarOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {tripItemCount === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Your trip is empty</p>
                  <p className="text-xs mt-1">Add tours to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.tours.map(tour => {
                    const isGroupPricing = tour.pricingType === 'group';
                    const itemTotal = isGroupPricing ? tour.price : (tour.price * travelers);
                    return (
                      <div key={tour.id} className="flex gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                        {tour.image && (
                          <img src={tour.image} alt="" loading="lazy" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">{tour.name}</p>
                          <div className="mt-1">
                            <span className="text-sm text-green-600 font-semibold">
                              {formatCurrency(itemTotal)}
                            </span>
                            {!isGroupPricing && travelers > 1 && (
                              <span className="text-xs text-gray-500 ml-1">
                                ({formatCurrency(tour.price)} × {travelers})
                              </span>
                            )}
                            {isGroupPricing && (
                              <span className="text-xs text-gray-500 ml-1">per group</span>
                            )}
                          </div>
                        </div>
                        {removeFromCart && (
                          <button
                            onClick={() => removeFromCart('tour', tour.id)}
                            className="text-gray-400 hover:text-red-500 flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Footer with Total and Checkout */}
            {tripItemCount > 0 && (
              <div className="border-t border-gray-100 p-3 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Total</span>
                    <span className="text-xs text-gray-400 ml-1">for {travelers} guest{travelers > 1 ? 's' : ''}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(cart.tours.reduce((sum, t) => {
                      const price = t.price || 0;
                      return sum + (t.pricingType === 'group' ? price : price * travelers);
                    }, 0))}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCartSidebarOpen(false);
                    if (onCheckout) onCheckout();
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Continue to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
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
