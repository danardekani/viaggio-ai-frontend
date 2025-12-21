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
                        ? 'bg-white w-4'
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                  />
                ))}
                {images.length > 5 && (
                  <span className="text-white text-xs ml-1">+{images.length - 5}</span>
                )}
              </div>
            )}
            {/* Navigation arrows - visible on hover */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-4 h-4 text-gray-700" />
                </button>
              </>
            )}
          </>
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
        {/* Rating badge on image */}
        {tour.rating && tour.rating !== 'New' && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold text-gray-900 text-sm">{tour.rating}</span>
          </div>
        )}
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
    timeOfDay: [], // morning, afternoon, evening, night
    freeCancel: false,
    skipLine: false,
    privateTour: false,
    likelyToSellOut: false,
    specialOffer: searchParams?.prefilter === 'SPECIAL_OFFER' || searchParams?.flags?.includes('SPECIAL_OFFER') || false,
    // New Viator-compliant filters
    kidFriendly: false,
    multiDay: false,
    // Category filters using Viator tag IDs
    categories: []
  });

  // Time of day options
  const timeOfDayOptions = [
    { key: 'morning', label: 'Morning', emoji: '🌅', hours: [6, 12] },
    { key: 'afternoon', label: 'Afternoon', emoji: '☀️', hours: [12, 17] },
    { key: 'evening', label: 'Evening', emoji: '🌆', hours: [17, 21] },
    { key: 'night', label: 'Night', emoji: '🌙', hours: [21, 6] }
  ];

  // Viator-compliant category tags (approved for front-end display)
  // These use actual Viator tag IDs for proper filtering
  const viatorCategories = [
    { key: 'sightseeing', label: 'Tours & Sightseeing', emoji: '🏛️', tagIds: [21913, 21725], keywords: ['tour', 'sightseeing', 'cruise'] },
    { key: 'food', label: 'Food & Drink', emoji: '🍴', tagIds: [11910, 11965], keywords: ['food', 'drink', 'culinary', 'wine', 'dining', 'tasting'] },
    { key: 'outdoor', label: 'Outdoor Activities', emoji: '🏞️', tagIds: [11926], keywords: ['outdoor', 'hiking', 'nature', 'adventure'] },
    { key: 'art', label: 'Art & Culture', emoji: '🎨', tagIds: [21911], keywords: ['art', 'culture', 'museum', 'gallery', 'history'] },
    { key: 'water', label: 'Water Sports', emoji: '🌊', tagIds: [11917], keywords: ['water', 'boat', 'cruise', 'kayak', 'snorkel', 'diving'] },
    { key: 'walking', label: 'Walking & Bike Tours', emoji: '🚶', tagIds: [11918, 13018], keywords: ['walking', 'bike', 'bicycle', 'cycling'] },
    { key: 'daytrip', label: 'Day Trips', emoji: '🚌', tagIds: [11915], keywords: ['day trip', 'excursion', 'full day'] },
    { key: 'classes', label: 'Classes & Workshops', emoji: '👨‍🍳', tagIds: [11912], keywords: ['class', 'workshop', 'lesson', 'cooking'] },
    { key: 'shows', label: 'Shows & Entertainment', emoji: '🎭', tagIds: [21765, 18953], keywords: ['show', 'entertainment', 'performance', 'theater', 'concert'] },
    { key: 'tickets', label: 'Tickets & Passes', emoji: '🎟️', tagIds: [11919], keywords: ['ticket', 'pass', 'admission', 'entry'] }
  ];

  // Special product feature tags (Viator-compliant)
  const VIATOR_TAGS = {
    KID_FRIENDLY: 11819,
    ADULTS_ONLY: 18884,
    MULTI_DAY: 11922,
    SKIP_THE_LINE: 12074,
    FREE_CANCELLATION: 'FREE_CANCELLATION', // This is a flag, not a tag ID
    PRIVATE_TOUR: 'PRIVATE_TOUR', // This is a flag
    SPECIAL_OFFER: 'SPECIAL_OFFER', // This is a flag
    LIKELY_TO_SELL_OUT: 'LIKELY_TO_SELL_OUT' // This is a flag (use carefully per guidelines)
  };
  
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

  // Function to open QuickView with full details - memoized with useCallback
  const openQuickView = useCallback(async (tour) => {
    // Cancel any pending request
    if (quickViewAbortController.current) {
      quickViewAbortController.current.abort();
    }
    quickViewAbortController.current = new AbortController();

    // Show modal immediately with basic info
    setQuickViewTour(tour);
    setQuickViewLoading(true);

    try {
      // Fetch full tour details for more images and info
      const response = await fetch(`${backendUrl}/api/tours/${tour.productCode || tour.id}`, {
        signal: quickViewAbortController.current.signal
      });
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
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch tour details:', error);
      }
      // Keep showing the basic tour info
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
  const [searchStartDate, setSearchStartDate] = useState(searchParams?.startDate || '');
  const [searchEndDate, setSearchEndDate] = useState(searchParams?.endDate || '');

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [selectedDestinationId, setSelectedDestinationId] = useState(null);

  // Refs
  const chatMessagesRef = useRef(null);
  const textareaRef = useRef(null);
  const suggestionsRef = useRef(null);
  const searchInputRef = useRef(null);
  // If we have a pre-filled destination from searchParams, treat it as "just selected"
  // to prevent autocomplete from opening on initial load
  const justSelectedRef = useRef(!!searchParams?.destination);

  // ============================================================================
  // FILTERING & SORTING - Memoized for performance
  // ============================================================================

  // Helper to check if tour matches a Viator category (using tag IDs and keywords)
  const tourMatchesCategory = useCallback((tour, categoryKey) => {
    const category = viatorCategories.find(c => c.key === categoryKey);
    if (!category) return false;

    // Get tour's tag IDs (from API response)
    const tourTagIds = tour.tags || [];

    // First, check if tour has any of the category's tag IDs
    const hasMatchingTag = category.tagIds.some(tagId =>
      tourTagIds.includes(tagId) || tourTagIds.includes(String(tagId))
    );
    if (hasMatchingTag) return true;

    // Fallback: check keywords in tour name, description, and categories
    const searchText = [
      tour.name || '',
      tour.description || '',
      ...(tour.categories || [])
    ].join(' ').toLowerCase();

    return category.keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
  }, [viatorCategories]);

  // Helper to check if tour has a specific Viator tag ID
  const tourHasTag = useCallback((tour, tagId) => {
    const tourTagIds = tour.tags || [];
    return tourTagIds.includes(tagId) || tourTagIds.includes(String(tagId));
  }, []);

  // Memoize filtered results to avoid recalculating on every render
  const filteredResults = useMemo(() => {
    return results.filter(tour => {
      // Price filter
      if (filters.minPrice && tour.price < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && tour.price > parseFloat(filters.maxPrice)) return false;

      // Rating filter
      if (filters.minRating && tour.rating < parseFloat(filters.minRating)) return false;

      // Duration filter (assuming duration is in hours or "X hours" format)
      const durationHours = parseDuration(tour.duration);
      if (filters.minDuration && durationHours < parseFloat(filters.minDuration)) return false;
      if (filters.maxDuration && durationHours > parseFloat(filters.maxDuration)) return false;

      // Flag-based filters
      const tourFlags = tour.flags || [];
      if (filters.freeCancel && !tourFlags.includes('FREE_CANCELLATION')) return false;
      if (filters.skipLine && !tourFlags.includes('SKIP_THE_LINE')) return false;
      if (filters.privateTour && !tourFlags.includes('PRIVATE_TOUR')) return false;
      if (filters.likelyToSellOut && !tourFlags.includes('LIKELY_TO_SELL_OUT')) return false;
      if (filters.specialOffer && !tourFlags.includes('SPECIAL_OFFER')) return false;

      // Tag-based filters (Viator compliant)
      if (filters.kidFriendly) {
        // Check for kid-friendly tag or keywords
        const hasKidTag = tourHasTag(tour, VIATOR_TAGS.KID_FRIENDLY);
        const tourText = ((tour.name || '') + ' ' + (tour.description || '')).toLowerCase();
        const hasKidKeyword = tourText.includes('kid') || tourText.includes('child') || tourText.includes('family') || tourText.includes('families');
        if (!hasKidTag && !hasKidKeyword) return false;
      }

      if (filters.multiDay) {
        // Check for multi-day tag or duration
        const hasMultiDayTag = tourHasTag(tour, VIATOR_TAGS.MULTI_DAY);
        const tourText = ((tour.name || '') + ' ' + (tour.duration || '')).toLowerCase();
        const isMultiDay = tourText.includes('multi-day') || tourText.includes('multiday') ||
                          tourText.includes('days') || durationHours >= 24;
        if (!hasMultiDayTag && !isMultiDay) return false;
      }

      // Time of day filter - filter by tour start time or keywords in name/description
      if (filters.timeOfDay.length > 0) {
        const tourText = (tour.name || '').toLowerCase() + ' ' + (tour.description || '').toLowerCase();
        const matchesTimeOfDay = filters.timeOfDay.some(time => {
          // Check for explicit time keywords in tour name/description
          if (time === 'morning' && (tourText.includes('morning') || tourText.includes('sunrise') || tourText.includes('breakfast'))) return true;
          if (time === 'afternoon' && (tourText.includes('afternoon') || tourText.includes('lunch'))) return true;
          if (time === 'evening' && (tourText.includes('evening') || tourText.includes('sunset') || tourText.includes('dinner'))) return true;
          if (time === 'night' && (tourText.includes('night') || tourText.includes('after dark') || tourText.includes('nocturnal') || tourText.includes('stargazing'))) return true;
          // If tour has startTime, check it
          if (tour.startTime) {
            const hour = parseInt(tour.startTime.split(':')[0]);
            if (time === 'morning' && hour >= 6 && hour < 12) return true;
            if (time === 'afternoon' && hour >= 12 && hour < 17) return true;
            if (time === 'evening' && hour >= 17 && hour < 21) return true;
            if (time === 'night' && (hour >= 21 || hour < 6)) return true;
          }
          return false;
        });
        if (!matchesTimeOfDay) return false;
      }

      // Category filters - tour must match at least one selected category
      if (filters.categories.length > 0) {
        const matchesAnyCategory = filters.categories.some(categoryKey =>
          tourMatchesCategory(tour, categoryKey)
        );
        if (!matchesAnyCategory) return false;
      }

      return true;
    });
  }, [results, filters, tourMatchesCategory, tourHasTag]);

  // Memoize sorted results to avoid re-sorting on every render
  const sortedResults = useMemo(() => {
    return [...filteredResults].sort((a, b) => {
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
  }, [filteredResults, sortBy]);

  // Memoize pagination
  const totalPages = useMemo(() =>
    Math.ceil(sortedResults.length / resultsPerPage),
    [sortedResults.length, resultsPerPage]
  );

  const paginatedResults = useMemo(() =>
    sortedResults.slice(
      (currentPage - 1) * resultsPerPage,
      currentPage * resultsPerPage
    ),
    [sortedResults, currentPage, resultsPerPage]
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
  };

  // Toggle category filter (Viator-compliant)
  const toggleCategory = (categoryKey) => {
    setFilters(f => ({
      ...f,
      categories: f.categories.includes(categoryKey)
        ? f.categories.filter(c => c !== categoryKey)
        : [...f.categories, categoryKey]
    }));
  };

  // Toggle time of day filter
  const toggleTimeOfDay = (timeKey) => {
    setFilters(f => ({
      ...f,
      timeOfDay: f.timeOfDay.includes(timeKey)
        ? f.timeOfDay.filter(t => t !== timeKey)
        : [...f.timeOfDay, timeKey]
    }));
  };

  const hasActiveFilters = Object.entries(filters).some(([key, v]) => {
    if (key === 'categories' || key === 'timeOfDay') return v.length > 0;
    return v !== '' && v !== false;
  });

  // ============================================================================
  // SEARCH HANDLER - Memoized with useCallback
  // ============================================================================

  const handleSearch = useCallback((e) => {
    e?.preventDefault();
    if (!searchDestination.trim()) return;

    setShowSuggestions(false);
    onNewSearch({
      type: 'tours',
      destination: searchDestination.trim(),
      destinationId: selectedDestinationId,
      travelers: travelers,
      startDate: searchStartDate || undefined,
      endDate: searchEndDate || undefined,
      sortBy
    });
  }, [searchDestination, selectedDestinationId, travelers, searchStartDate, searchEndDate, sortBy, onNewSearch]);

  // ============================================================================
  // AUTOCOMPLETE - Debounced with AbortController
  // ============================================================================

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced autocomplete with AbortController
  useEffect(() => {
    // Skip if a suggestion was just selected
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
          `${backendUrl}/api/tours/destinations/autocomplete?q=${encodeURIComponent(searchDestination)}`,
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
    setSelectedDestinationId(suggestion.destinationId);
    setShowSuggestions(false);
    setSuggestions([]);
  }, []);

  const handleSearchKeyDown = useCallback((e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, [showSuggestions, suggestions, selectedSuggestionIndex, handleSelectSuggestion]);

  // ============================================================================
  // CHAT HANDLERS - Memoized with useCallback
  // ============================================================================

  const handleChatSend = useCallback(async () => {
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

      // Extract tours from various possible response formats
      const tours = data.tours || data.results || data.data?.tours || [];

      // Debug logging
      console.log('Chat API Response:', data);
      console.log('Extracted tours:', tours);
      console.log('Tours count:', tours.length);

      // Store message along with any tours found
      setChatMessages(prev => {
        const newMessages = [...prev, {
          role: 'assistant',
          content: data.message || "I'm not sure how to help with that. Could you try rephrasing?",
          tours: tours,  // Store tours for display
          searchDestination: data.searchDestination || data.destination || null  // For "View more" navigation
        }];
        console.log('Updated chat messages:', newMessages);
        return newMessages;
      });
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again."
      }]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, chatMessages, backendUrl, searchParams?.destination, results.length]);

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
  // CART HELPERS - Memoized calculations
  // ============================================================================

  const cartItemCount = useMemo(() =>
    cart.tours.length + cart.hotels.length + cart.flights.length,
    [cart.tours.length, cart.hotels.length, cart.flights.length]
  );

  // Calculate cart total with proper pricing (per-person × travelers, or per-group as-is)
  const cartTotal = useMemo(() =>
    cart.tours.reduce((sum, t) => {
      const price = t.price || 0;
      // Per-group pricing doesn't multiply by travelers
      if (t.pricingType === 'group') {
        return sum + price;
      }
      // Per-person pricing multiplies by travelers
      return sum + (price * travelers);
    }, 0),
    [cart.tours, travelers]
  );

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

            {/* Desktop: Full Search Form with Autocomplete */}
            <form onSubmit={handleSearch} className="hidden sm:flex flex-1 items-center gap-2 bg-gray-100 rounded-full px-4 py-2 relative">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 relative min-w-0">
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
                  className="w-full bg-transparent focus:outline-none text-sm"
                  autoComplete="off"
                />
                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 max-h-64 overflow-y-auto"
                    style={{ minWidth: '280px' }}
                  >
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.destinationId || index}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                          index === selectedSuggestionIndex
                            ? 'bg-blue-50 text-blue-700'
                            : 'hover:bg-gray-50'
                        } ${index === 0 ? 'rounded-t-xl' : ''} ${
                          index === suggestions.length - 1 ? 'rounded-b-xl' : ''
                        }`}
                      >
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
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
                  value={searchStartDate}
                  onChange={(e) => setSearchStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-transparent focus:outline-none text-sm text-gray-600 w-[105px]"
                  title="Start date"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={searchEndDate}
                  onChange={(e) => setSearchEndDate(e.target.value)}
                  min={searchStartDate || new Date().toISOString().split('T')[0]}
                  className="bg-transparent focus:outline-none text-sm text-gray-600 w-[105px]"
                  title="End date"
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

            {/* Time of Day */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Time of day</h3>
              <div className="flex flex-wrap gap-2">
                {timeOfDayOptions.map(time => (
                  <button
                    key={time.key}
                    onClick={() => toggleTimeOfDay(time.key)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                      filters.timeOfDay.includes(time.key)
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                  >
                    <span>{time.emoji}</span>
                    <span>{time.label}</span>
                  </button>
                ))}
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

            {/* Specials / Tour Features (Viator-compliant) */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Specials</h3>
              <div className="space-y-2">
                {[
                  { key: 'freeCancel', label: 'Free cancellation', icon: '✓' },
                  { key: 'skipLine', label: 'Skip the line', icon: '⚡' },
                  { key: 'privateTour', label: 'Private tour', icon: '👤' },
                  { key: 'specialOffer', label: 'Deals & discounts', icon: '🏷️' },
                  { key: 'likelyToSellOut', label: 'Likely to sell out', icon: '🔥' }
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

            {/* Target Audience (Viator-compliant tags) */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Good for</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.kidFriendly}
                    onChange={(e) => setFilters(f => ({ ...f, kidFriendly: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    👨‍👩‍👧 Kid-friendly
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.multiDay}
                    onChange={(e) => setFilters(f => ({ ...f, multiDay: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    🗓️ Multi-day tours
                  </span>
                </label>
              </div>
            </div>

            {/* Categories (Viator-compliant tag IDs) */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {viatorCategories.map(category => (
                  <button
                    key={category.key}
                    onClick={() => toggleCategory(category.key)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                      filters.categories.includes(category.key)
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

            {/* Loading State - Skeleton Cards */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                    {/* Image skeleton */}
                    <div className="aspect-[4/3] bg-gray-200" />
                    {/* Content skeleton */}
                    <div className="p-4 space-y-3">
                      {/* Title */}
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-16 bg-gray-200 rounded" />
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                      </div>
                      {/* Duration */}
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                      {/* Price */}
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

            {/* Results Grid - 3 columns on desktop, 2 on tablet, 1 on mobile */}
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
              <div className="relative">
                <label className="text-xs text-gray-500 font-medium">Destination</label>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2.5 mt-1 relative">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchDestination}
                    onChange={(e) => {
                      setSearchDestination(e.target.value);
                      setSelectedDestinationId(null);
                    }}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Where to?"
                    className="flex-1 bg-transparent focus:outline-none text-sm"
                    autoFocus
                    autoComplete="off"
                  />
                  {loadingSuggestions && (
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  )}
                </div>
                {/* Mobile Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 max-h-48 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.destinationId || index}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                          index === selectedSuggestionIndex
                            ? 'bg-blue-50 text-blue-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
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
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Dates</label>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2.5 mt-1">
                  <input
                    type="date"
                    value={searchStartDate}
                    onChange={(e) => setSearchStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="date"
                    value={searchEndDate}
                    onChange={(e) => setSearchEndDate(e.target.value)}
                    min={searchStartDate || new Date().toISOString().split('T')[0]}
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                  />
                </div>
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

              {/* Activity Types */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Activity type</h3>
                <div className="flex flex-wrap gap-2">
                  {activityTypes.map(activity => (
                    <button
                      key={activity.key}
                      onClick={() => toggleActivity(activity.key)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                        filters.activities.includes(activity.key)
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
            {chatMessages.map((msg, index) => {
              // Debug: log each message being rendered
              if (msg.role === 'assistant') {
                console.log(`Rendering message ${index}:`, { content: msg.content?.substring(0, 50), tours: msg.tours, toursLength: msg.tours?.length });
              }
              return (
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

                      {/* DEBUG: Show tour count - remove after debugging */}
                      {msg.tours !== undefined && (
                        <div className="text-xs text-red-500 bg-red-50 p-1 rounded">
                          DEBUG: tours={msg.tours?.length || 0}
                        </div>
                      )}

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
                                  {(tour.image || tour.images?.[0]?.url || tour.images?.[0]) ? (
                                    <img
                                      src={tour.image || tour.images?.[0]?.url || tour.images?.[0]}
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
            );
            })}
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
          onViewFullDetails={onOpenProductPage}
        />
      )}
    </div>
  );
}