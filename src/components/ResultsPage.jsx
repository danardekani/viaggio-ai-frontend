import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import {
  Search,
  MapPin,
  Filter,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Tag,
  SlidersHorizontal,
  MessageCircle,
  Send,
  Loader2,
  ShoppingBag,
  Plane,
  ExternalLink,
  Check,
  Info,
  Globe,
  Users,
  Calendar,
  Shield,
  Eye,
  Home
} from 'lucide-react';
import QuickViewModal from './QuickViewModal';

// Memoized TourCard component - Vertical card layout for grid display
const TourCard = memo(function TourCard({
  tour,
  isSelected,
  hasDiscount,
  tourFlags,
  formatCurrency,
  travelers,
  openQuickView,
  addToCart,
  removeFromCart
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get all images array
  const images = useMemo(() => {
    if (tour.images && tour.images.length > 0) {
      return tour.images.map(img => typeof img === 'string' ? img : img.url || img);
    }
    if (tour.image) return [tour.image];
    return [];
  }, [tour.images, tour.image]);

  const handleToggleCart = useCallback((e) => {
    e.stopPropagation();
    if (isSelected) {
      removeFromCart('tour', tour.id);
    } else {
      addToCart('tour', tour);
    }
  }, [isSelected, tour, addToCart, removeFromCart]);

  const handleQuickView = useCallback(() => {
    openQuickView(tour);
  }, [tour, openQuickView]);

  const handlePrevImage = useCallback((e) => {
    e.stopPropagation();
    setCurrentImageIndex(i => i === 0 ? images.length - 1 : i - 1);
  }, [images.length]);

  const handleNextImage = useCallback((e) => {
    e.stopPropagation();
    setCurrentImageIndex(i => i === images.length - 1 ? 0 : i + 1);
  }, [images.length]);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-lg cursor-pointer flex flex-col h-full ${
        isSelected ? 'border-green-500 border-2 ring-2 ring-green-100' : 'border-gray-200'
      }`}
      onClick={handleQuickView}
    >
      {/* Image Carousel */}
      <div className="relative h-48 flex-shrink-0 group">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={tour.name}
              loading="lazy"
              className="w-full h-full object-cover transition-opacity"
            />
            {/* Horizontal dots indicator */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.slice(0, 5).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? 'bg-white scale-110'
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
            {/* Arrow navigation (show on hover) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-gray-300" />
          </div>
        )}

        {/* Rating badge (top left) */}
        {tour.rating && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-gray-900">{tour.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Discount badge (top right) */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
            SALE
          </div>
        )}

        {/* Source badge */}
        <div className="absolute bottom-3 left-3">
          {tour.source === 'hotelbeds' ? (
            <span className="px-2 py-0.5 bg-[#FF6B00] text-white text-xs font-medium rounded">
              Hotelbeds
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-[#16A34A] text-white text-xs font-medium rounded">
              Viator
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-2 hover:text-blue-600 transition-colors">
          {tour.name}
        </h3>

        {/* Key Info Row */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tour.duration && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              <Clock className="w-3 h-3" />
              {tour.duration}
            </span>
          )}
          {tour.reviewCount > 0 && (
            <span className="text-xs text-gray-500">
              ({tour.reviewCount.toLocaleString()} reviews)
            </span>
          )}
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tourFlags.includes('FREE_CANCELLATION') && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
              <Check className="w-3 h-3" />
              Free cancel
            </span>
          )}
          {tourFlags.includes('SKIP_THE_LINE') && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
              ⚡ Skip line
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price & Actions Row */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-end justify-between mb-3">
            <div>
              {hasDiscount && tour.originalPrice && (
                <span className="text-gray-400 line-through text-sm block">
                  {formatCurrency(tour.originalPrice)}
                </span>
              )}
              <span className={`text-xl font-bold ${hasDiscount ? 'text-orange-600' : 'text-green-600'}`}>
                {formatCurrency(tour.price)}
              </span>
              <span className="text-gray-500 text-xs ml-1">
                {tour.pricingType === 'group' ? '/group' : '/person'}
              </span>
            </div>
            {travelers > 1 && tour.pricingType !== 'group' && (
              <span className="text-sm text-gray-500">
                Total: {formatCurrency(tour.price * travelers)}
              </span>
            )}
          </div>

          {/* Add/Remove Button */}
          <button
            onClick={handleToggleCart}
            className={`w-full py-2.5 rounded-lg font-semibold transition-colors text-sm ${
              isSelected
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isSelected ? 'Remove from Trip' : 'Add to Trip'}
          </button>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// RESULTS PAGE COMPONENT
// ============================================================================

export default function ResultsPage({
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
  onCheckout,
  onOpenProductPage
}) {
  // ============================================================================
  // STATE
  // ============================================================================
  
  // Travelers (editable)
  const [travelers, setTravelers] = useState(initialTravelers);

  // Filters - check prefilter for initial state (not flags, since we want all results)
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minRating: '',
    minDuration: '',
    maxDuration: '',
    timeOfDay: [],
    freeCancel: false,
    skipLine: false,
    privateTour: false,
    likelyToSellOut: false,
    specialOffer: searchParams?.prefilter === 'SPECIAL_OFFER' || searchParams?.flags?.includes('SPECIAL_OFFER') || false,
    kidFriendly: false,
    multiDay: false,
    categories: []
  });

  // Time of day options
  const timeOfDayOptions = [
    { key: 'morning', label: 'Morning', emoji: '🌅', hours: [6, 12] },
    { key: 'afternoon', label: 'Afternoon', emoji: '☀️', hours: [12, 17] },
    { key: 'evening', label: 'Evening', emoji: '🌆', hours: [17, 21] },
    { key: 'night', label: 'Night', emoji: '🌙', hours: [21, 6] }
  ];

  // Viator-compliant category tags
  const categoryOptions = [
    { id: 21483, label: 'Food & Drink', emoji: '🍽️' },
    { id: 21511, label: 'Walking Tours', emoji: '🚶' },
    { id: 11926, label: 'Day Trips', emoji: '🌅' },
    { id: 21480, label: 'Museums', emoji: '🏛️' },
    { id: 21567, label: 'Photography', emoji: '📸' },
    { id: 21485, label: 'Adventure', emoji: '🎯' },
  ];
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState(searchParams?.sortBy || 'popular');
  const resultsPerPage = 12;
  
  // UI State
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(true);
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  // QuickView Modal State
  const [quickViewTour, setQuickViewTour] = useState(null);
  const [quickViewLoading, setQuickViewLoading] = useState(false);
  const quickViewAbortController = useRef(null);

  // Search form state
  const [searchDestination, setSearchDestination] = useState(searchParams?.destination || '');
  const [selectedDestinationId, setSelectedDestinationId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: `I found ${results.length} tours in ${searchParams?.destination || 'your destination'}! Need help narrowing down your options?`
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatMessagesEndRef = useRef(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const cartItemCount = useMemo(() => {
    return (cart?.tours?.length || 0) + (cart?.hotels?.length || 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    let total = 0;
    cart?.tours?.forEach(tour => {
      const price = tour.price || 0;
      total += tour.pricingType === 'group' ? price : price * travelers;
    });
    cart?.hotels?.forEach(hotel => {
      total += hotel.price || 0;
    });
    return total;
  }, [cart, travelers]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.minPrice !== '' ||
      filters.maxPrice !== '' ||
      filters.minRating !== '' ||
      filters.minDuration !== '' ||
      filters.maxDuration !== '' ||
      filters.timeOfDay.length > 0 ||
      filters.freeCancel ||
      filters.skipLine ||
      filters.privateTour ||
      filters.likelyToSellOut ||
      filters.specialOffer ||
      filters.kidFriendly ||
      filters.multiDay ||
      filters.categories.length > 0
    );
  }, [filters]);

  // Filter and sort results
  const sortedResults = useMemo(() => {
    let filtered = [...results];

    // Apply filters
    if (filters.minPrice) {
      filtered = filtered.filter(t => t.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(t => t.price <= parseFloat(filters.maxPrice));
    }
    if (filters.minRating) {
      filtered = filtered.filter(t => t.rating >= parseFloat(filters.minRating));
    }
    if (filters.freeCancel) {
      filtered = filtered.filter(t => t.flags?.includes('FREE_CANCELLATION'));
    }
    if (filters.skipLine) {
      filtered = filtered.filter(t => t.flags?.includes('SKIP_THE_LINE'));
    }
    if (filters.privateTour) {
      filtered = filtered.filter(t => t.flags?.includes('PRIVATE_TOUR'));
    }
    if (filters.likelyToSellOut) {
      filtered = filtered.filter(t => t.flags?.includes('LIKELY_TO_SELL_OUT'));
    }
    if (filters.specialOffer) {
      filtered = filtered.filter(t => t.flags?.includes('SPECIAL_OFFER') || t.hasDiscount);
    }
    if (filters.kidFriendly) {
      filtered = filtered.filter(t => t.flags?.includes('KID_FRIENDLY'));
    }
    if (filters.categories.length > 0) {
      filtered = filtered.filter(t => {
        const tourTags = t.tags || t.tagIds || [];
        return filters.categories.some(catId => tourTags.includes(catId));
      });
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'reviews':
        filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      default:
        // Keep original order (popular/relevance)
        break;
    }

    return filtered;
  }, [results, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedResults.length / resultsPerPage);
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * resultsPerPage;
    return sortedResults.slice(start, start + resultsPerPage);
  }, [sortedResults, currentPage, resultsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // Function to open QuickView with full details
  const openQuickView = useCallback(async (tour) => {
    if (quickViewAbortController.current) {
      quickViewAbortController.current.abort();
    }
    quickViewAbortController.current = new AbortController();

    setQuickViewTour(tour);
    setQuickViewLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/tours/${tour.productCode || tour.id}`, {
        signal: quickViewAbortController.current.signal
      });
      if (response.ok) {
        const data = await response.json();
        const fullDetails = data.tour || data;
        setQuickViewTour(prev => ({
          ...prev,
          ...fullDetails,
          price: fullDetails.price || prev.price,
          originalPrice: fullDetails.originalPrice || prev.originalPrice,
          hasDiscount: fullDetails.hasDiscount ?? prev.hasDiscount
        }));
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch tour details:', error);
      }
    } finally {
      setQuickViewLoading(false);
    }
  }, [backendUrl]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (quickViewAbortController.current) {
        quickViewAbortController.current.abort();
      }
    };
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minRating: '',
      minDuration: '',
      maxDuration: '',
      timeOfDay: [],
      freeCancel: false,
      skipLine: false,
      privateTour: false,
      likelyToSellOut: false,
      specialOffer: false,
      kidFriendly: false,
      multiDay: false,
      categories: []
    });
  }, []);

  const handleSearch = useCallback((e) => {
    e?.preventDefault();
    if (searchDestination.trim()) {
      onNewSearch({
        type: 'tours',
        destination: searchDestination,
        destinationId: selectedDestinationId,
        travelers
      });
    }
  }, [searchDestination, selectedDestinationId, travelers, onNewSearch]);

  const handleSearchKeyDown = useCallback((e) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const suggestion = suggestions[selectedIndex];
        setSearchDestination(suggestion.displayName || suggestion.name);
        setSelectedDestinationId(suggestion.destinationId);
        setShowSuggestions(false);
      }
    }
  }, [showSuggestions, suggestions, selectedIndex]);

  // Fetch destination suggestions
  useEffect(() => {
    if (!searchDestination || searchDestination.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const response = await fetch(
          `${backendUrl}/api/destinations/autocomplete?query=${encodeURIComponent(searchDestination)}`
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.destinations || []);
          setShowSuggestions(true);
          setSelectedIndex(-1);
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchDestination, backendUrl]);

  // Chat handlers
  const handleChatSend = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: {
            destination: searchParams?.destination,
            resultCount: results.length,
            travelers
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message || data.response || "I'm here to help!",
          tours: data.tours
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I had trouble processing that. Please try again."
      }]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, backendUrl, searchParams, results.length, travelers]);

  // Scroll chat to bottom
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Logo / Back */}
            <button
              onClick={onBackToHome}
              className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600 transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
              <Plane className="w-5 h-5 hidden sm:block" />
              <span className="font-semibold hidden md:inline">Viaggio</span>
            </button>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 max-w-xl">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchDestination}
                onChange={(e) => {
                  setSearchDestination(e.target.value);
                  setSelectedDestinationId(null);
                }}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Where to?"
                className="flex-1 bg-transparent border-none outline-none text-sm min-w-0"
              />
              <select
                value={travelers}
                onChange={(e) => setTravelers(parseInt(e.target.value))}
                className="bg-transparent border-none outline-none text-sm text-gray-600 cursor-pointer"
              >
                {[1,2,3,4,5,6,7,8].map(n => (
                  <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors flex-shrink-0"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Cart Button */}
            <button
              onClick={() => setCartSidebarOpen(!cartSidebarOpen)}
              className="relative flex items-center gap-2 p-2 sm:px-3 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
            >
              <ShoppingBag className="w-5 h-5 text-gray-600" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute left-1/2 -translate-x-1/2 w-full max-w-xl bg-white rounded-xl shadow-lg border border-gray-200 mt-1 overflow-hidden z-50"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.destinationId || index}
                type="button"
                onClick={() => {
                  setSearchDestination(suggestion.displayName || suggestion.name);
                  setSelectedDestinationId(suggestion.destinationId);
                  setShowSuggestions(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                  index === selectedIndex ? 'bg-blue-50' : ''
                }`}
              >
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {suggestion.displayName || suggestion.name}
                  </p>
                  {suggestion.parentName && (
                    <p className="text-xs text-gray-500">{suggestion.parentName}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ================================================================== */}
      {/* MAIN CONTENT */}
      {/* ================================================================== */}
      <div className="flex-1 flex">
        {/* ============================================================== */}
        {/* LEFT SIDEBAR - FILTERS */}
        {/* ============================================================== */}
        <aside className={`hidden lg:block w-72 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 transition-all duration-300 ${
          filterSidebarOpen ? '' : 'lg:w-0 lg:overflow-hidden'
        }`}>
          <div className="p-5">
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by:
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Your budget</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Minimum rating</h3>
              <div className="flex gap-2">
                {[3, 3.5, 4, 4.5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilters(f => ({ ...f, minRating: f.minRating === rating.toString() ? '' : rating.toString() }))}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                      filters.minRating === rating.toString()
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {rating}+
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Filters */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Features</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.freeCancel}
                    onChange={(e) => setFilters(f => ({ ...f, freeCancel: e.target.checked }))}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Free cancellation</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.skipLine}
                    onChange={(e) => setFilters(f => ({ ...f, skipLine: e.target.checked }))}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Skip the line</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.privateTour}
                    onChange={(e) => setFilters(f => ({ ...f, privateTour: e.target.checked }))}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Private tour</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.specialOffer}
                    onChange={(e) => setFilters(f => ({ ...f, specialOffer: e.target.checked }))}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Special offers</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.kidFriendly}
                    onChange={(e) => setFilters(f => ({ ...f, kidFriendly: e.target.checked }))}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Kid-friendly</span>
                </label>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setFilters(f => ({
                      ...f,
                      categories: f.categories.includes(category.id)
                        ? f.categories.filter(id => id !== category.id)
                        : [...f.categories, category.id]
                    }))}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                      filters.categories.includes(category.id)
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                  >
                    <span>{category.emoji}</span>
                    <span>{category.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* MAIN RESULTS AREA */}
        {/* ============================================================== */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4 overflow-x-auto whitespace-nowrap">
              <button
                onClick={onBackToHome}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </button>
              <span className="text-gray-300">/</span>
              {searchParams?.destination && (
                <>
                  <span className="text-gray-600">{searchParams.destination.split(',')[0]}</span>
                  <span className="text-gray-300">/</span>
                </>
              )}
              <span className="text-gray-400">Tours & Activities</span>
            </nav>

            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {searchParams?.destination ? `Top ${searchParams.destination} Tours` : 'Tours'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {sortedResults.length} {sortedResults.length === 1 ? 'tour' : 'tours'} available
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="bg-blue-600 text-white text-xs px-1.5 rounded-full">
                      {Object.values(filters).filter(v => v === true || (Array.isArray(v) && v.length > 0) || (typeof v === 'string' && v !== '')).length}
                    </span>
                  )}
                </button>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most Reviews</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-16 bg-gray-200 rounded" />
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                      </div>
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                      <div className="flex justify-between items-center pt-2">
                        <div className="h-6 w-20 bg-gray-200 rounded" />
                        <div className="h-8 w-24 bg-gray-200 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && sortedResults.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tours found</h3>
                <p className="text-gray-500 mb-4">
                  {hasActiveFilters 
                    ? 'Try adjusting your filters to see more results.'
                    : 'Try searching for a different destination.'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && paginatedResults.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {paginatedResults.map((tour) => (
                    <TourCard
                      key={tour.id || tour.productCode}
                      tour={tour}
                      isSelected={isInCart('tour', tour.id)}
                      hasDiscount={tour.hasDiscount || tour.flags?.includes('SPECIAL_OFFER')}
                      tourFlags={tour.flags || []}
                      formatCurrency={formatCurrency}
                      travelers={travelers}
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
                              ? 'bg-blue-600 text-white'
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
          </div>
        </main>
      </div>

      {/* ================================================================== */}
      {/* FLOATING CART PANEL - WITH CLICKABLE ITEMS */}
      {/* ================================================================== */}
      {cartSidebarOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/30"
            onClick={() => setCartSidebarOpen(false)}
          />
          
          {/* Floating Panel */}
          <div className="absolute right-4 top-4 bottom-4 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                My Trip ({cartItemCount})
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
              {cartItemCount === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Your trip is empty</p>
                  <p className="text-xs mt-1">Add tours to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* CLICKABLE CART ITEMS */}
                  {cart.tours.map(tour => {
                    const isGroupPricing = tour.pricingType === 'group';
                    const itemTotal = isGroupPricing ? tour.price : (tour.price * travelers);
                    return (
                      <div key={tour.id} className="flex gap-2.5 p-2.5 bg-gray-50 rounded-xl group">
                        <div 
                          className="flex gap-2.5 flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            setCartSidebarOpen(false);
                            onOpenProductPage?.(tour);
                          }}
                        >
                          {tour.image && (
                            <img 
                              src={tour.image} 
                              alt="" 
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0 group-hover:ring-2 group-hover:ring-blue-400 transition-all" 
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{tour.name}</p>
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
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart('tour', tour.id);
                          }}
                          className="text-gray-400 hover:text-red-500 flex-shrink-0 p-1"
                          aria-label="Remove from cart"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Footer with Total and Checkout */}
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
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Continue to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MOBILE FILTERS MODAL */}
      {/* ================================================================== */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl flex flex-col animate-slide-in-left">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h2>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Your budget</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Feature Filters */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Features</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.freeCancel}
                      onChange={(e) => setFilters(f => ({ ...f, freeCancel: e.target.checked }))}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm text-gray-600">Free cancellation</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.skipLine}
                      onChange={(e) => setFilters(f => ({ ...f, skipLine: e.target.checked }))}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm text-gray-600">Skip the line</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.specialOffer}
                      onChange={(e) => setFilters(f => ({ ...f, specialOffer: e.target.checked }))}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm text-gray-600">Special offers</span>
                  </label>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => setFilters(f => ({
                        ...f,
                        categories: f.categories.includes(activity.id)
                          ? f.categories.filter(id => id !== activity.id)
                          : [...f.categories, activity.id]
                      }))}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                        filters.categories.includes(activity.id)
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-400'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <span>{activity.emoji}</span>
                      <span>{activity.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
            
            {/* Fixed Footer */}
            <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold"
              >
                Show {sortedResults.length} results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* CHAT BUBBLE */}
      {/* ================================================================== */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
        </button>
      )}

      {/* ================================================================== */}
      {/* CHAT PANEL */}
      {/* ================================================================== */}
      {chatOpen && (
        <div className="fixed inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96 sm:h-[500px] sm:max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Via</p>
                <p className="text-white/70 text-xs">Travel Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-2xl rounded-br-none p-3'
                    : 'space-y-2'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <>
                      <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none p-3">
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>

                      {/* Tour cards if available */}
                      {msg.tours && msg.tours.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {msg.tours.slice(0, 5).map((tour, tourIndex) => (
                            <div 
                              key={tour.productCode || tourIndex}
                              className="bg-white border border-gray-200 rounded-xl p-2.5 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => openQuickView(tour)}
                            >
                              <div className="flex gap-2.5">
                                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                  {(tour.image || tour.images?.[0]?.url || tour.images?.[0]) ? (
                                    <img
                                      src={tour.image || tour.images?.[0]?.url || tour.images?.[0]}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <MapPin className="w-6 h-6 text-gray-300" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{tour.name}</p>
                                  <p className="text-sm text-green-600 font-semibold mt-1">
                                    {formatCurrency(tour.price)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
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
            <div ref={chatMessagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-100 flex-shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSend();
                  }
                }}
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
      {/* QUICKVIEW MODAL */}
      {/* ================================================================== */}
      {quickViewTour && (
        <QuickViewModal
          tour={quickViewTour}
          onClose={() => setQuickViewTour(null)}
          formatCurrency={formatCurrency}
          travelers={travelers}
          onAddToTrip={() => {
            if (isInCart('tour', quickViewTour.id)) {
              removeFromCart('tour', quickViewTour.id);
            } else {
              addToCart('tour', quickViewTour);
            }
          }}
          isInCart={isInCart('tour', quickViewTour?.id)}
          isLoading={quickViewLoading}
          onViewFullDetails={onOpenProductPage}
        />
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s ease-out;
        }
        @keyframes slide-in-left {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.25s ease-out;
        }
        @keyframes slide-down {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slide-down 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
