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
  
  // ============================================================================
  // NEW: Tour Preloading State
  // ============================================================================
  const [preloadedTours, setPreloadedTours] = useState(null);
  const [isPreloadingTours, setIsPreloadingTours] = useState(false);
  
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
  // NEW: Preload tours when location is identified
  // ============================================================================
  useEffect(() => {
    // Only preload if we have a successful identification and haven't already preloaded
    if (identifiedLocation?.destination && !identifiedLocation?.error && !preloadedTours && !isPreloadingTours) {
      const preloadTours = async () => {
        setIsPreloadingTours(true);
        try {
          const destName = typeof identifiedLocation.destination === 'object' 
            ? (identifiedLocation.destination.fullName || identifiedLocation.destination.name)
            : identifiedLocation.destination;
          
          console.log(`Preloading tours for ${destName}...`);
          
          const response = await fetch(`${backendUrl}/api/tours/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              destination: destName,
              destinationId: identifiedLocation.viatorDestinationId || null,
              resultCount: 100,
              sortBy: 'popular'
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            setPreloadedTours({
              tours: data.tours || [],
              totalCount: data.totalCount || 0,
              destination: destName,
              destinationId: identifiedLocation.viatorDestinationId
            });
            console.log(`✓ Preloaded ${data.tours?.length || 0} tours for ${destName}`);
          }
        } catch (err) {
          console.error('Tour preload failed:', err);
          // Not critical - user can still click Find Tours and it will fetch
        } finally {
          setIsPreloadingTours(false);
        }
      };
      
      preloadTours();
    }
  }, [identifiedLocation, backendUrl, preloadedTours, isPreloadingTours]);

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
    setPreloadedTours(null); // Clear previous preloaded tours
    
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
      // Preloading will start automatically via useEffect
      
    } catch (error) {
      console.error('Location identification error:', error);
      setIdentifiedLocation({ error: true, message: 'Could not identify location. Try another image.' });
    } finally {
      setIdentifyingLocation(false);
    }
  };

  // ============================================================================
  // UPDATED: Handle search with preloaded tours and viatorDestinationId
  // ============================================================================
  const handleSearchIdentifiedLocation = () => {
    if (identifiedLocation?.destination) {
      const destName = typeof identifiedLocation.destination === 'object' 
        ? (identifiedLocation.destination.fullName || identifiedLocation.destination.name)
        : identifiedLocation.destination;
      
      // Pass preloaded tours if available for instant results
      onSearch?.({
        type: 'tours',
        destination: destName,
        destinationId: identifiedLocation.viatorDestinationId || null,
        travelers,
        preloadedTours: preloadedTours // Pass preloaded data for instant display
      });
    }
  };

  // ============================================================================
  // UPDATED: Reset also clears preloaded tours
  // ============================================================================
  const resetWhereIsThis = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setIdentifiedLocation(null);
    setPreloadedTours(null);
    setIsPreloadingTours(false);
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
      <div className="relative">
        {/* Hero Image */}
        <div className="absolute inset-0 h-[400px] md:h-[500px]">
          <img 
            src={HERO_IMAGE} 
            alt="Beautiful beach destination" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-gray-50" />
        </div>

        {/* Header */}
        <div className="relative z-10 px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-7 h-7 text-white" />
            <span className="text-xl font-bold text-white">Viaggio.ai</span>
          </div>
          
          {/* Cart Button */}
          <button
            onClick={() => setCartSidebarOpen(true)}
            className="relative p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-colors"
          >
            <ShoppingBag className="w-5 h-5 text-white" />
            {tripItemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {tripItemCount}
              </span>
            )}
          </button>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 px-4 pt-8 md:pt-16 pb-24 md:pb-32 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
            <span className="italic">Discover Your Next Adventure</span>
          </h1>
          <p className="text-lg text-white/90 drop-shadow">
            Find and book amazing tours & experiences worldwide
          </p>
        </div>

        {/* ================================================================== */}
        {/* SEARCH BOX */}
        {/* ================================================================== */}
        <div className="relative z-20 px-4 -mt-12 md:-mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {[
                { id: 'tours', label: 'Tours', icon: MapPin },
                { id: 'whereis', label: 'Where Is This?', icon: Camera },
                { id: 'deals', label: 'Deals', icon: Tag }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === tab.id 
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tours Tab */}
            {activeTab === 'tours' && (
              <form onSubmit={handleToursSearch} className="flex flex-col sm:flex-row items-stretch">
                {/* Destination Input */}
                <div className="flex-1 relative" ref={destinationInputRef}>
                  <div className="flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-100">
                    <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">Where to?</p>
                      <input 
                        type="text"
                        placeholder="Search destinations..."
                        value={destination}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          setSelectedDestinationId(null);
                        }}
                        onKeyDown={handleDestinationKeyDown}
                        className="w-full text-gray-900 font-medium focus:outline-none placeholder:text-gray-400 placeholder:font-normal"
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
                      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-xl shadow-lg z-50 max-h-64 overflow-y-auto"
                    >
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={suggestion.destinationId || index}
                          type="button"
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                            index === selectedIndex ? 'bg-blue-50' : ''
                          }`}
                        >
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900">{suggestion.displayName || suggestion.name}</p>
                            {suggestion.type && (
                              <p className="text-xs text-gray-500 capitalize">{suggestion.type}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-100">
                  <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">When?</p>
                    <input 
                      type="date"
                      value={travelDates}
                      onChange={(e) => setTravelDates(e.target.value)}
                      className="w-full text-gray-900 font-medium focus:outline-none"
                    />
                  </div>
                </div>

                {/* Travelers */}
                <div className="flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-100">
                  <Users className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Travelers</p>
                    <div className="relative">
                      <select
                        value={travelers}
                        onChange={(e) => setTravelers(parseInt(e.target.value))}
                        className="w-full text-gray-900 font-medium focus:outline-none appearance-none bg-transparent pr-6 cursor-pointer"
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
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
                          {/* Preloading status */}
                          {isPreloadingTours && (
                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Loading tours...
                            </p>
                          )}
                          {preloadedTours && !isPreloadingTours && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ {preloadedTours.tours.length} tours ready
                            </p>
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
                    
                    {/* Action Button - UPDATED with preload status */}
                    {identifiedLocation?.destination && !identifiedLocation.error && (
                      <button
                        onClick={handleSearchIdentifiedLocation}
                        disabled={isPreloadingTours}
                        className={`px-6 py-3 rounded-xl transition-colors font-medium flex items-center gap-2 whitespace-nowrap ${
                          preloadedTours 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } ${isPreloadingTours ? 'opacity-75' : ''}`}
                      >
                        {isPreloadingTours ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Loading...
                          </>
                        ) : preloadedTours ? (
                          <>
                            <Search className="w-5 h-5" />
                            Find {preloadedTours.tours.length} Tours
                          </>
                        ) : (
                          <>
                            <Search className="w-5 h-5" />
                            Find Tours
                          </>
                        )}
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
                          // Submit on Enter if no suggestion selected
                          if (e.key === 'Enter' && destination.trim()) {
                            e.preventDefault();
                            handleDealsSearch(destination.trim());
                          }
                        }}
                        className="w-full text-gray-900 font-medium focus:outline-none placeholder:text-gray-400 placeholder:font-normal"
                      />
                    </div>
                    {loadingSuggestions && (
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    )}
                  </div>
                  
                  {/* Autocomplete Dropdown for Deals */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div 
                      ref={suggestionsRef}
                      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-xl shadow-lg z-50 max-h-64 overflow-y-auto"
                    >
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={suggestion.destinationId || index}
                          type="button"
                          onClick={() => {
                            handleSelectSuggestion(suggestion);
                            // Auto-search for deals after selecting
                            setTimeout(() => handleDealsSearch(suggestion.displayName || suggestion.name), 100);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                            index === selectedIndex ? 'bg-orange-50' : ''
                          }`}
                        >
                          <Tag className="w-4 h-4 text-orange-400 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900">{suggestion.displayName || suggestion.name}</p>
                            {suggestion.type && (
                              <p className="text-xs text-gray-500 capitalize">{suggestion.type}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Search Deals Button */}
                <button
                  onClick={() => destination.trim() && handleDealsSearch(destination.trim())}
                  disabled={!destination.trim() || isLoading}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white p-4 rounded-xl transition-colors m-1 flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* FEATURED DESTINATIONS */}
      {/* ================================================================== */}
      <div className="px-4 py-12 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured Deals</h2>
            <p className="text-gray-500 text-sm mt-1">Special offers on popular destinations</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {FEATURED_DESTINATIONS.map((dest, index) => (
            <button
              key={dest.name}
              onClick={() => handleFeaturedDealClick(dest)}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <img 
                src={dest.image} 
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                <p className="text-white font-bold text-lg">{dest.name}</p>
                <p className="text-white/80 text-xs">{dest.country}</p>
                <div className="mt-2 inline-flex items-center gap-1 bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                  <Tag className="w-3 h-3" />
                  {dest.deal}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================== */}
      {/* FLOATING CHAT BUTTON */}
      {/* ================================================================== */}
      {!chatOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          {/* Intro Tooltip */}
          {showChatIntro && (
            <div className="absolute bottom-full right-0 mb-3 animate-fade-in">
              <div className="bg-white rounded-xl shadow-lg p-3 max-w-[200px] relative">
                <button 
                  onClick={() => setShowChatIntro(false)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-gray-600" />
                </button>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Need help planning?</span> Chat with Via, your AI travel assistant! ✨
                </p>
                <div className="absolute bottom-0 right-6 translate-y-full">
                  <div className="w-3 h-3 bg-white transform rotate-45 -translate-y-1.5 shadow-lg" />
                </div>
              </div>
            </div>
          )}
          
          {/* Chat Button */}
          <button
            onClick={() => {
              setChatOpen(true);
              setShowChatIntro(false);
            }}
            className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
          >
            <span className="text-2xl">✨</span>
          </button>
          
          {/* Label */}
          <button
            onClick={() => {
              setChatOpen(true);
              setShowChatIntro(false);
            }}
            className="absolute -left-20 top-1/2 -translate-y-1/2 bg-white px-3 py-1.5 rounded-full shadow-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            Ask Via ✨
          </button>
        </div>
      )}

      {/* ================================================================== */}
      {/* CHAT PANEL (When Open) */}
      {/* ================================================================== */}
      {chatOpen && (
        <div className="fixed inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96 sm:h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
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
                          <img src={tour.image} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
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
