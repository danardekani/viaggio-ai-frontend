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
  Sparkles,
  SlidersHorizontal,
  LayoutGrid,
  List,
  MessageCircle,
  Send,
  Loader2,
  ShoppingBag,
  Calendar,
  Users,
  Plane,
  ArrowLeft,
  Heart,
  DollarSign
} from 'lucide-react';
import OptionCard from './OptionCard';

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
  travelers,
  backendUrl,
  onCheckout
}) {
  // ============================================================================
  // STATE
  // ============================================================================
  
  // Filters
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
    specialOffer: searchParams?.flags?.includes('SPECIAL_OFFER') || false
  });
  
  // View & Pagination
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState(searchParams?.sortBy || 'popular');
  const resultsPerPage = 12;
  
  // UI State
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(true);
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
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
  const [searchTravelers, setSearchTravelers] = useState(travelers || 2);
  
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
      travelers: searchTravelers,
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
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || "I'm not sure how to help with that. Could you try rephrasing?"
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
  const cartTotal = cart.tours.reduce((sum, t) => sum + (t.price || 0), 0);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ================================================================== */}
      {/* TOP SEARCH BAR */}
      {/* ================================================================== */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Logo / Back */}
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Plane className="w-6 h-6 text-blue-600" />
              <span className="font-bold text-gray-900 hidden sm:inline">Viaggio</span>
            </button>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
                placeholder="Where to?"
                className="flex-1 bg-transparent focus:outline-none text-sm min-w-0"
              />
              <span className="text-gray-300">|</span>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="bg-transparent focus:outline-none text-sm text-gray-600 w-28"
              />
              <span className="text-gray-300">|</span>
              <select
                value={searchTravelers}
                onChange={(e) => setSearchTravelers(parseInt(e.target.value))}
                className="bg-transparent focus:outline-none text-sm text-gray-600"
              >
                {[1,2,3,4,5,6,7,8].map(n => (
                  <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Cart Button */}
            <button
              onClick={() => setCartSidebarOpen(!cartSidebarOpen)}
              className="relative flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
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
        <aside className={`hidden lg:block w-64 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 transition-all duration-300 ${
          filterSidebarOpen ? '' : 'lg:w-0 lg:overflow-hidden'
        }`}>
          <div className="w-64 p-4">
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-4">
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
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <span className="text-gray-400 self-center">-</span>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Duration (hours)</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minDuration}
                  onChange={(e) => setFilters(f => ({ ...f, minDuration: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400 self-center">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxDuration}
                  onChange={(e) => setFilters(f => ({ ...f, maxDuration: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Minimum rating</h3>
              <div className="flex gap-2">
                {[3, 3.5, 4, 4.5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setFilters(f => ({ 
                      ...f, 
                      minRating: f.minRating === rating.toString() ? '' : rating.toString() 
                    }))}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
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
          <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {searchParams?.destination || 'Tours'}
                </h1>
                <p className="text-sm text-gray-500">
                  {sortedResults.length} {sortedResults.length === 1 ? 'tour' : 'tours'} available
                  {hasActiveFilters && ` (filtered from ${results.length})`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
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
                    className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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

                {/* View Mode Toggle */}
                <div className="hidden sm:flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
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

            {/* Results Grid/List */}
            {!isLoading && paginatedResults.length > 0 && (
              <>
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-4'
                }>
                  {paginatedResults.map((tour) => (
                    <OptionCard
                      key={tour.id || tour.productCode}
                      option={{ type: 'tour', data: tour }}
                      isSelected={isInCart('tour', tour.id)}
                      onAdd={addToCart}
                      onRemove={removeFromCart}
                      formatCurrency={formatCurrency}
                      travelers={travelers}
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

        {/* ============================================================== */}
        {/* RIGHT SIDEBAR - CART */}
        {/* ============================================================== */}
        <aside className={`hidden xl:block bg-white border-l border-gray-200 overflow-y-auto flex-shrink-0 transition-all duration-300 ${
          cartSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
        }`}>
          <div className="w-80 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                My Trip ({cartItemCount})
              </h2>
              <button
                onClick={() => setCartSidebarOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            {/* Simple Cart Items List */}
            {cartItemCount === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Your trip is empty</p>
                <p className="text-xs mt-1">Add tours to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.tours.map(tour => (
                  <div key={tour.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    {tour.image && (
                      <img src={tour.image} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{tour.name}</p>
                      <p className="text-sm text-green-600 font-semibold mt-1">{formatCurrency(tour.price)}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart('tour', tour.id)}
                      className="text-gray-400 hover:text-red-500 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {/* Total */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(cartTotal)}</span>
                  </div>
                </div>
              </div>
            )}
            
            {cartItemCount > 0 && (
              <button
                onClick={onCheckout}
                className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
              >
                Continue to Checkout
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* ================================================================== */}
      {/* MOBILE FILTERS MODAL */}
      {/* ================================================================== */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-full bg-white shadow-xl overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-900">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {/* Same filter content as desktop sidebar */}
            <div className="p-4">
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Your budget</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <span className="text-gray-400 self-center">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              
              {/* More filters... abbreviated for mobile */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tour features</h3>
                <div className="space-y-2">
                  {[
                    { key: 'freeCancel', label: 'Free cancellation' },
                    { key: 'skipLine', label: 'Skip the line' },
                    { key: 'specialOffer', label: 'Special offer' }
                  ].map(feature => (
                    <label key={feature.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters[feature.key]}
                        onChange={(e) => setFilters(f => ({ ...f, [feature.key]: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white">
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
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
        </button>
      )}

      {/* ================================================================== */}
      {/* CHAT PANEL */}
      {/* ================================================================== */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
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
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div ref={chatMessagesRef} className="flex-1 p-4 overflow-y-auto space-y-3">
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
    </div>
  );
}
