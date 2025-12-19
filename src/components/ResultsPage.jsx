import React, { useState, useEffect, useRef } from 'react';
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
  Eye
} from 'lucide-react';
import QuickViewModal from './QuickViewModal';

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
  onCheckout
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
    freeCancel: false,
    skipLine: false,
    privateTour: false,
    likelyToSellOut: false,
    specialOffer: searchParams?.prefilter === 'SPECIAL_OFFER' || searchParams?.flags?.includes('SPECIAL_OFFER') || false
  });
  
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
  
  // Function to open QuickView with full details
  const openQuickView = async (tour) => {
    // Show modal immediately with basic info
    setQuickViewTour(tour);
    setQuickViewLoading(true);
    
    try {
      // Fetch full tour details for more images and info
      const response = await fetch(`${backendUrl}/api/tours/${tour.productCode || tour.id}`);
      if (response.ok) {
        const data = await response.json();
        const fullDetails = data.tour || data; // Handle both { tour: {...} } and direct response
        // Merge full details with existing tour data
        setQuickViewTour(prev => ({
          ...prev,
          ...fullDetails,
          // Keep original price info if full details don't have it
          price: fullDetails.price || prev.price,
          originalPrice: fullDetails.originalPrice || prev.originalPrice,
          hasDiscount: fullDetails.hasDiscount ?? prev.hasDiscount
        }));
      }
    } catch (error) {
      console.error('Failed to fetch tour details:', error);
      // Keep showing the basic tour info
    } finally {
      setQuickViewLoading(false);
    }
  };
  
  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: `I found ${results.length} tours in ${searchParams?.destination || 'your destination'}! Need help narrowing down your options? Just ask!`
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  
  // Search bar state
  const [searchDestination, setSearchDestination] = useState(searchParams?.destination || '');
  const [searchDate, setSearchDate] = useState(searchParams?.startDate || '');
  
  // Refs
  const chatMessagesRef = useRef(null);
  const textareaRef = useRef(null);

  // ============================================================================
  // FILTERING & SORTING
  // ============================================================================

  const filteredResults = results.filter(tour => {
    // Price filter
    if (filters.minPrice && tour.price < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && tour.price > parseFloat(filters.maxPrice)) return false;
    
    // Rating filter
    if (filters.minRating && tour.rating < parseFloat(filters.minRating)) return false;
    
    // Duration filter (assuming duration is in hours or "X hours" format)
    const durationHours = parseDuration(tour.duration);
    if (filters.minDuration && durationHours < parseFloat(filters.minDuration)) return false;
    if (filters.maxDuration && durationHours > parseFloat(filters.maxDuration)) return false;
    
    // Flag filters
    const tourFlags = tour.flags || [];
    if (filters.freeCancel && !tourFlags.includes('FREE_CANCELLATION')) return false;
    if (filters.skipLine && !tourFlags.includes('SKIP_THE_LINE')) return false;
    if (filters.privateTour && !tourFlags.includes('PRIVATE_TOUR')) return false;
    if (filters.likelyToSellOut && !tourFlags.includes('LIKELY_TO_SELL_OUT')) return false;
    if (filters.specialOffer && !tourFlags.includes('SPECIAL_OFFER')) return false;
    
    return true;
  });

  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return (a.price || 0) - (b.price || 0);
      case 'price_high':
        return (b.price || 0) - (a.price || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'reviews':
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      case 'duration_short':
        return parseDuration(a.duration) - parseDuration(b.duration);
      case 'duration_long':
        return parseDuration(b.duration) - parseDuration(a.duration);
      default: // 'popular'
        return (b.reviewCount || 0) - (a.reviewCount || 0);
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedResults.length / resultsPerPage);
  const paginatedResults = sortedResults.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  // ============================================================================
  // HELPERS
  // ============================================================================

  function parseDuration(duration) {
    if (!duration) return 0;
    if (typeof duration === 'number') return duration;
    
    const str = duration.toString().toLowerCase();
    const hours = str.match(/(\d+)\s*h/);
    const minutes = str.match(/(\d+)\s*m/);
    
    let total = 0;
    if (hours) total += parseInt(hours[1]);
    if (minutes) total += parseInt(minutes[1]) / 60;
    
    return total || parseFloat(str) || 0;
  }

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minRating: '',
      minDuration: '',
      maxDuration: '',
      freeCancel: false,
      skipLine: false,
      privateTour: false,
      likelyToSellOut: false,
      specialOffer: false
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== false);

  // ============================================================================
  // SEARCH HANDLER
  // ============================================================================

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!searchDestination.trim()) return;
    
    onNewSearch({
      type: 'tours',
      destination: searchDestination.trim(),
      travelers: travelers,
      startDate: searchDate || undefined,
      sortBy
    });
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
          })),
          context: {
            destination: searchParams?.destination,
            currentResults: results.length
          }
        })
      });

      if (!response.ok) throw new Error('Chat failed');

      const data = await response.json();
      
      // Store message along with any tours found
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || "I'm not sure how to help with that. Could you try rephrasing?",
        tours: data.tours || [],  // Store tours for display
        searchDestination: data.searchDestination || null  // For "View more" navigation
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again."
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
    }
  }, [chatInput]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // ============================================================================
  // CART HELPERS
  // ============================================================================

  const cartItemCount = cart.tours.length + cart.hotels.length + cart.flights.length;
  
  // Calculate cart total with proper pricing (per-person × travelers, or per-group as-is)
  const cartTotal = cart.tours.reduce((sum, t) => {
    const price = t.price || 0;
    // Per-group pricing doesn't multiply by travelers
    if (t.pricingType === 'group') {
      return sum + price;
    }
    // Per-person pricing multiplies by travelers
    return sum + (price * travelers);
  }, 0);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ================================================================== */}
      {/* TOP SEARCH BAR */}
      {/* ================================================================== */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Logo / Back */}
            <button
              onClick={onBackToHome}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
            >
              <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <span className="font-bold text-gray-900 hidden sm:inline">Viaggio</span>
            </button>

            {/* Mobile: Simplified Search Button */}
            <button
              onClick={() => setShowMobileSearch(true)}
              className="sm:hidden flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 text-left"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 truncate">{searchDestination || 'Search...'}</span>
              <span className="text-xs text-gray-400 ml-auto flex-shrink-0">{travelers} guest{travelers > 1 ? 's' : ''}</span>
            </button>

            {/* Desktop: Full Search Form */}
            <form onSubmit={handleSearch} className="hidden sm:flex flex-1 items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
                placeholder="Where to?"
                className="flex-1 bg-transparent focus:outline-none text-sm min-w-0"
              />
              <span className="text-gray-300 hidden md:block">|</span>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="hidden md:block bg-transparent focus:outline-none text-sm text-gray-600 w-28"
              />
              <span className="text-gray-300">|</span>
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
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400 flex-shrink-0">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Duration */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Duration (hours)</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minDuration}
                  onChange={(e) => setFilters(f => ({ ...f, minDuration: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400 flex-shrink-0">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxDuration}
                  onChange={(e) => setFilters(f => ({ ...f, maxDuration: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Minimum rating</h3>
              <div className="flex flex-wrap gap-2">
                {[3, 3.5, 4, 4.5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setFilters(f => ({ 
                      ...f, 
                      minRating: f.minRating === rating.toString() ? '' : rating.toString() 
                    }))}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                      filters.minRating === rating.toString()
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                  >
                    <Star className="w-3 h-3 fill-current" />
                    {rating}+
                  </button>
                ))}
              </div>
            </div>

            {/* Tour Features */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Tour features</h3>
              <div className="space-y-2">
                {[
                  { key: 'freeCancel', label: 'Free cancellation', icon: '✓' },
                  { key: 'skipLine', label: 'Skip the line', icon: '⚡' },
                  { key: 'privateTour', label: 'Private tour', icon: '👤' },
                  { key: 'likelyToSellOut', label: 'Likely to sell out', icon: '🔥' },
                  { key: 'specialOffer', label: 'Special offer', icon: '🏷️' }
                ].map(feature => (
                  <label
                    key={feature.key}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={filters[feature.key]}
                      onChange={(e) => setFilters(f => ({ ...f, [feature.key]: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      {feature.icon} {feature.label}
                    </span>
                  </label>
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
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {searchParams?.destination || 'Tours'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {sortedResults.length} {sortedResults.length === 1 ? 'tour' : 'tours'} available
                  {hasActiveFilters && ` (filtered from ${results.length})`}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden xs:inline">Filters</span>
                  {hasActiveFilters && (
                    <span className="bg-blue-600 text-white text-xs px-1.5 rounded-full">
                      {Object.values(filters).filter(v => v !== '' && v !== false).length}
                    </span>
                  )}
                </button>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 rounded-lg px-3 sm:px-4 py-2 pr-8 sm:pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most Reviews</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="duration_short">Duration: Short to Long</option>
                    <option value="duration_long">Duration: Long to Short</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Searching for tours...</p>
                </div>
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

            {/* Results List */}
            {!isLoading && paginatedResults.length > 0 && (
              <>
                <div className="space-y-4">
                  {paginatedResults.map((tour) => {
                    const isSelected = isInCart('tour', tour.id);
                    const hasDiscount = tour.hasDiscount || tour.flags?.includes('SPECIAL_OFFER');
                    const tourFlags = tour.flags || [];
                    
                    return (
                      <div
                        key={tour.id || tour.productCode}
                        className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${
                          isSelected ? 'border-green-500 border-2 ring-2 ring-green-100' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Image */}
                          <div 
                            className="md:w-72 lg:w-80 flex-shrink-0 cursor-pointer"
                            onClick={() => openQuickView(tour)}
                          >
                            <div className="relative h-48 md:h-full min-h-[200px]">
                              {tour.image ? (
                                <img
                                  src={tour.image}
                                  alt={tour.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                  <MapPin className="w-12 h-12 text-blue-300" />
                                </div>
                              )}
                              {/* Badges on image */}
                              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                                {hasDiscount && (
                                  <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    DEAL
                                  </span>
                                )}
                                {tourFlags.includes('LIKELY_TO_SELL_OUT') && (
                                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                                    🔥 Popular
                                  </span>
                                )}
                              </div>
                              {/* Image count badge */}
                              {tour.images && tour.images.length > 1 && (
                                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                                  📷 {tour.images.length}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-3 sm:p-5 flex flex-col">
                            {/* Title & Rating Row */}
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <h3 
                                className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 cursor-pointer hover:text-blue-600"
                                onClick={() => openQuickView(tour)}
                              >
                                {tour.name}
                              </h3>
                              {tour.rating && tour.rating !== 'New' && (
                                <div className="flex items-center gap-1 flex-shrink-0 bg-green-50 px-2 py-1 rounded-lg">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span className="font-semibold text-gray-900">{tour.rating}</span>
                                  {tour.reviewCount > 0 && (
                                    <span className="text-gray-500 text-sm">({tour.reviewCount.toLocaleString()})</span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            {tour.description && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {tour.description}
                              </p>
                            )}

                            {/* Features/Flags Row 1 - Key Info */}
                            <div className="flex flex-wrap gap-2 mb-2">
                              {tour.duration && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                                  <Clock className="w-3.5 h-3.5" />
                                  {tour.duration}
                                </span>
                              )}
                              {tour.languages && tour.languages.length > 0 && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                                  <Globe className="w-3.5 h-3.5" />
                                  {tour.languages.slice(0, 2).join(', ')}{tour.languages.length > 2 ? ` +${tour.languages.length - 2}` : ''}
                                </span>
                              )}
                              {tour.maxGroupSize && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                                  <Users className="w-3.5 h-3.5" />
                                  Up to {tour.maxGroupSize}
                                </span>
                              )}
                            </div>
                            
                            {/* Features/Flags Row 2 - Highlights */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {tourFlags.includes('FREE_CANCELLATION') && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                  <Check className="w-3.5 h-3.5" />
                                  Free cancellation
                                </span>
                              )}
                              {tourFlags.includes('SKIP_THE_LINE') && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                  ⚡ Skip the line
                                </span>
                              )}
                              {tourFlags.includes('PRIVATE_TOUR') && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                  👤 Private tour
                                </span>
                              )}
                              {tour.pricingType === 'group' && !tourFlags.includes('PRIVATE_TOUR') && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                                  👥 Per group
                                </span>
                              )}
                            </div>

                            {/* Inclusions Preview */}
                            {tour.inclusions && tour.inclusions.length > 0 && (
                              <div className="text-xs text-gray-500 mb-3">
                                <span className="font-medium text-gray-600">Includes:</span>{' '}
                                {tour.inclusions.slice(0, 3).join(' • ')}
                                {tour.inclusions.length > 3 && ` +${tour.inclusions.length - 3} more`}
                              </div>
                            )}

                            {/* Spacer */}
                            <div className="flex-1" />

                            {/* Price & Actions Row */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div>
                                {hasDiscount && tour.originalPrice && (
                                  <span className="text-gray-400 line-through text-sm mr-2">
                                    {formatCurrency(tour.originalPrice)}
                                  </span>
                                )}
                                <span className={`text-xl sm:text-2xl font-bold ${hasDiscount ? 'text-orange-600' : 'text-green-600'}`}>
                                  {formatCurrency(tour.price)}
                                </span>
                                <span className="text-gray-500 text-xs sm:text-sm ml-1">
                                  {tour.pricingType === 'group' 
                                    ? 'per group' 
                                    : travelers > 1 ? `× ${travelers} = ${formatCurrency(tour.price * travelers)}` : 'per person'
                                  }
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Quick View Button */}
                                <button
                                  onClick={() => openQuickView(tour)}
                                  className="p-2 sm:px-3 sm:py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
                                  title="Quick view"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span className="hidden sm:inline">Quick View</span>
                                </button>

                                {/* Add/Remove Button */}
                                <button
                                  onClick={() => isSelected 
                                    ? removeFromCart('tour', tour.id) 
                                    : addToCart('tour', tour)
                                  }
                                  className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                                    isSelected
                                      ? 'bg-red-500 hover:bg-red-600 text-white'
                                      : 'bg-green-500 hover:bg-green-600 text-white'
                                  }`}
                                >
                                  {isSelected ? 'Remove' : 'Add'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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

        {/* Note: Cart is now a floating panel, not an inline sidebar */}
      </div>

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
                        <button
                          onClick={() => removeFromCart('tour', tour.id)}
                          className="text-gray-400 hover:text-red-500 flex-shrink-0"
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

      {/* Animation Styles */}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s ease-out;
        }
        @keyframes slide-down {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slide-down 0.25s ease-out;
        }
      `}</style>

      {/* ================================================================== */}
      {/* MOBILE SEARCH MODAL */}
      {/* ================================================================== */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileSearch(false)} />
          <div className="absolute inset-x-0 top-0 bg-white shadow-xl rounded-b-2xl p-4 animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Search Tours</h2>
              <button onClick={() => setShowMobileSearch(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={(e) => { handleSearch(e); setShowMobileSearch(false); }} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Destination</label>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2.5 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchDestination}
                    onChange={(e) => setSearchDestination(e.target.value)}
                    placeholder="Where to?"
                    className="flex-1 bg-transparent focus:outline-none text-sm"
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Date</label>
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Guests</label>
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(parseInt(e.target.value))}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MOBILE FILTERS MODAL */}
      {/* ================================================================== */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-y-0 left-0 w-[85vw] max-w-sm bg-white shadow-xl flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h2 className="font-semibold text-gray-900">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* Scrollable Filter Content */}
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
                    className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <span className="text-gray-400 flex-shrink-0">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                    className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              
              {/* Tour features - ALL filters */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Tour features</h3>
                <div className="space-y-3">
                  {[
                    { key: 'freeCancel', label: 'Free cancellation', icon: '✓' },
                    { key: 'skipLine', label: 'Skip the line', icon: '⚡' },
                    { key: 'privateTour', label: 'Private tour', icon: '👤' },
                    { key: 'likelyToSellOut', label: 'Likely to sell out', icon: '🔥' },
                    { key: 'specialOffer', label: 'Special offer', icon: '🏷️' }
                  ].map(feature => (
                    <label key={feature.key} className="flex items-center gap-3 py-1">
                      <input
                        type="checkbox"
                        checked={filters[feature.key]}
                        onChange={(e) => setFilters(f => ({ ...f, [feature.key]: e.target.checked }))}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700">{feature.icon} {feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Rating</h3>
                <div className="flex flex-wrap gap-2">
                  {['', '3', '4', '4.5'].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setFilters(f => ({ ...f, minRating: f.minRating === rating ? '' : rating }))}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filters.minRating === rating
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {rating === '' ? 'Any' : `${rating}+ ★`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={() => setFilters({
                    minPrice: '',
                    maxPrice: '',
                    minRating: '',
                    minDuration: '',
                    maxDuration: '',
                    freeCancel: false,
                    skipLine: false,
                    privateTour: false,
                    likelyToSellOut: false,
                    specialOffer: false
                  })}
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-lg">✨</span>
              </div>
              <div>
                <p className="font-semibold text-white">Via</p>
                <p className="text-xs text-white/80">AI Travel Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Chat Messages */}
          <div ref={chatMessagesRef} className="flex-1 p-4 overflow-y-auto space-y-3">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-2xl rounded-br-none p-3'
                    : 'space-y-2'
                }`}>
                  {/* Text message */}
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
                              onClick={() => setQuickViewTour(tour)}
                            >
                              <div className="flex gap-2.5">
                                {/* Tour image */}
                                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                  {tour.images?.[0]?.url ? (
                                    <img 
                                      src={tour.images[0].url} 
                                      alt={tour.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <MapPin className="w-6 h-6" />
                                    </div>
                                  )}
                                </div>
                                
                                {/* Tour info */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight">
                                    {tour.name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    {tour.rating && (
                                      <div className="flex items-center gap-0.5">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        <span className="text-xs text-gray-600">{tour.rating}</span>
                                      </div>
                                    )}
                                    {tour.price && (
                                      <span className="text-xs font-semibold text-blue-600">
                                        ${tour.price}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {/* View more button */}
                          {msg.tours.length > 5 && (
                            <button
                              onClick={() => {
                                // Close chat and show all results
                                setChatOpen(false);
                                // If we have a destination from the search, trigger a new search
                                if (msg.searchDestination || searchParams?.destination) {
                                  onNewSearch({
                                    type: 'tours',
                                    destination: msg.searchDestination || searchParams?.destination,
                                    travelers: travelers
                                  });
                                }
                              }}
                              className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-1"
                            >
                              View all {msg.tours.length} results
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* View more even if 5 or fewer but tours exist */}
                          {msg.tours.length > 0 && msg.tours.length <= 5 && (
                            <button
                              onClick={() => {
                                setChatOpen(false);
                                if (msg.searchDestination || searchParams?.destination) {
                                  onNewSearch({
                                    type: 'tours',
                                    destination: msg.searchDestination || searchParams?.destination,
                                    travelers: travelers
                                  });
                                }
                              }}
                              className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-1"
                            >
                              Search for more in this area
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
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
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-100 flex-shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
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
        />
      )}
    </div>
  );
}