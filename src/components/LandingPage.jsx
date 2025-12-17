import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Camera, 
  Tag, 
  MessageCircle, 
  Calendar,
  Users,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Send,
  ShoppingBag,
  Plane,
  Loader2,
  ChevronDown
} from 'lucide-react';

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
  const [showChatIntro, setShowChatIntro] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: "Hi there! 👋 I'm Via, your personal travel expert. I can help you discover amazing destinations, find the perfect tours, or answer any travel questions. What adventure are you dreaming of?"
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  
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
  const chatInputRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Hide intro tooltip after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChatIntro(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

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

  // Auto-resize chat textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 100);
      textarea.style.height = `${newHeight}px`;
    }
  }, [chatInput]);

  // ============================================================================
  // DESTINATION AUTOCOMPLETE
  // ============================================================================

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `${backendUrl}/api/tours/destinations/autocomplete?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Debounced autocomplete
  useEffect(() => {
    const timer = setTimeout(() => {
      if (destination.length >= 2) {
        fetchSuggestions(destination);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [destination]);

  const handleSelectSuggestion = (suggestion) => {
    setDestination(suggestion.displayName || suggestion.name);
    setSelectedDestinationId(suggestion.destinationId);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleDestinationKeyDown = (e) => {
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
  };

  // ============================================================================
  // SEARCH HANDLERS
  // ============================================================================

  const handleToursSearch = (e) => {
    e?.preventDefault();
    if (!destination.trim()) return;

    onSearch?.({
      type: 'tours',
      destination: destination.trim(),
      destinationId: selectedDestinationId,
      travelers,
      startDate: travelDates || undefined
    });
  };

  const handleDealsSearch = (cityName) => {
    onSearchDeals?.(cityName);
  };

  const handleFeaturedDealClick = (dest) => {
    handleDealsSearch(dest.name);
  };

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
  // CHAT HANDLERS
  // ============================================================================

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) throw new Error('Chat failed');

      const data = await response.json();
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || "I'm not sure how to help with that. Could you try rephrasing?"
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again in a moment."
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const tripItemCount = cart.tours.length + cart.hotels.length + cart.flights.length;

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
        <nav className="relative z-10 flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Plane className="w-6 h-6 text-white" />
            <span className="text-xl font-bold text-white tracking-tight">Viaggio</span>
          </div>

          {/* Center Tabs */}
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-full p-1">
            <button
              onClick={() => setActiveTab('tours')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'tours' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Tours & Experiences</span>
              <span className="sm:hidden">Tours</span>
            </button>
            <button
              onClick={() => setActiveTab('whereis')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'whereis' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Where is This?</span>
              <span className="sm:hidden">Identify</span>
            </button>
            <button
              onClick={() => setActiveTab('deals')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'deals' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Tag className="w-4 h-4" />
              Deals
            </button>
          </div>

          {/* My Trip Button */}
          <button 
            onClick={() => setCartSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">My Trip</span>
            {tripItemCount > 0 && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {tripItemCount}
              </span>
            )}
          </button>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full pt-4 px-4">
          {/* Tagline */}
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-2 drop-shadow-lg">
            Discover Your Next Adventure
          </h1>
          <p className="text-lg text-white/90 mb-8 drop-shadow text-center">
            Find and book amazing tours & experiences worldwide
          </p>

          {/* Search Panel */}
          <div className="w-full max-w-3xl">
            <div className="bg-white rounded-2xl shadow-2xl p-2">
              
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
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={suggestion.destinationId || index}
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
                                {suggestion.displayName || suggestion.name}
                              </p>
                              {suggestion.type && (
                                <p className="text-xs text-gray-500">{suggestion.type}</p>
                              )}
                            </div>
                          </button>
                        ))}
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
                            <p className="text-sm text-gray-500">{identifiedLocation.message}</p>
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
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={suggestion.destinationId || index}
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
                                {suggestion.displayName || suggestion.name}
                              </p>
                              {suggestion.type && (
                                <p className="text-xs text-gray-500">{suggestion.type}</p>
                              )}
                            </div>
                          </button>
                        ))}
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
      <div className="max-w-7xl mx-auto px-6 py-12 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Deals</h2>
          <div className="flex gap-2">
            <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {FEATURED_DESTINATIONS.map((dest) => (
            <div 
              key={dest.name}
              onClick={() => handleFeaturedDealClick(dest)}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={dest.image} 
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{dest.name}</h3>
                <p className="text-sm text-orange-600 font-medium">{dest.deal}</p>
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-white font-medium flex items-center gap-1">
                  View Deals <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================== */}
      {/* VIA CHAT BUBBLE */}
      {/* ================================================================== */}
      {!chatOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          {/* Intro Tooltip */}
          {showChatIntro && (
            <div className="absolute bottom-full right-0 mb-3 w-64 bg-white rounded-2xl shadow-2xl p-4 animate-fade-in">
              <button 
                onClick={() => setShowChatIntro(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">✨</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Hi, I'm Via!</p>
                  <p className="text-sm text-gray-600">Your AI travel assistant. Ask me anything about destinations, tours, or trip planning!</p>
                </div>
              </div>
              <div className="absolute bottom-0 right-8 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white" />
            </div>
          )}

          {/* Chat Bubble Button */}
          <button
            onClick={() => setChatOpen(true)}
            className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center group"
          >
            <MessageCircle className="w-7 h-7 text-white" />
            
            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-25" />
            
            {/* "Ask Via" label on hover */}
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Ask Via ✨
            </span>
          </button>
        </div>
      )}

      {/* ================================================================== */}
      {/* CHAT PANEL (When Open) */}
      {/* ================================================================== */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-lg">✨</span>
              </div>
              <div>
                <p className="font-semibold text-white">Via</p>
                <p className="text-xs text-white/80">Your AI Travel Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setChatOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {chatMessages.map((msg, index) => (
              <div 
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-2xl p-3 ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3">
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-100 flex-shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
                placeholder="Ask me anything..."
                rows={1}
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                style={{ maxHeight: '100px' }}
              />
              <button 
                onClick={handleChatSend}
                disabled={!chatInput.trim() || chatLoading}
                className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* CART SIDEBAR MODAL */}
      {/* ================================================================== */}
      {cartSidebarOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setCartSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                <ShoppingBag className="w-5 h-5" />
                My Trip ({tripItemCount})
              </h2>
              <button
                onClick={() => setCartSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {tripItemCount === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Your trip is empty</p>
                  <p className="text-sm mt-1">Add tours to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.tours.map(tour => (
                    <div key={tour.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                      {tour.image && (
                        <img src={tour.image} alt="" className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">{tour.name}</p>
                        <p className="text-sm text-green-600 font-semibold mt-1">{formatCurrency(tour.price)}</p>
                      </div>
                      {removeFromCart && (
                        <button
                          onClick={() => removeFromCart('tour', tour.id)}
                          className="text-gray-400 hover:text-red-500 flex-shrink-0 p-1"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer with Total and Checkout */}
            {tripItemCount > 0 && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-gray-700">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(cart.tours.reduce((sum, t) => sum + (t.price || 0), 0))}
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
      `}</style>
    </div>
  );
}
