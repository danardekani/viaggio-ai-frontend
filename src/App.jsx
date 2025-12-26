import React, { useState, useRef, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import {
  Send,
  Plane,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

import ChatMessage from './components/ChatMessage';
import Sidebar from './components/Sidebar';
import MobileTripSheet from './components/MobileTripSheet';
import SearchPanel from './components/SearchPanel';
import WhereIsThis from './components/WhereIsThis';
import { getCachedSearch, setCachedSearch, prewarmDestinations } from './utils/searchCache';

// Lazy load larger components for code splitting
const CheckoutPage = lazy(() => import('./components/CheckoutPage'));
const ItineraryModal = lazy(() => import('./components/ItineraryModal'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const ResultsPage = lazy(() => import('./components/ResultsPage'));
const HotelResultsPage = lazy(() => import('./components/HotelResultsPage'));
const ProductDisplayPage = lazy(() => import('./components/ProductDisplayPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi, I'm Via, your personal travel expert at Viaggio! ✈️\n\nI'm here to help you plan an amazing trip. I can search for tours and experiences, give you destination tips, and help you build the perfect itinerary.\n\nTell me - where are you dreaming of going? Or if you're not sure yet, I'd love to help you discover somewhere new!",
    },
  ]);
  
  const BACKEND_URL = 'https://viaggio-ai-backend-production.up.railway.app';
  
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showResultsPage, setShowResultsPage] = useState(false);
  const [showHotelResultsPage, setShowHotelResultsPage] = useState(false);
  const [showProductPage, setShowProductPage] = useState(false);
  const [selectedProductTour, setSelectedProductTour] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [hotelSearchResults, setHotelSearchResults] = useState([]);
  const [currentSearchParams, setCurrentSearchParams] = useState(null);
  const [currentHotelSearchParams, setCurrentHotelSearchParams] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showBookingPage, setShowBookingPage] = useState(false);
  const [showMobileTrip, setShowMobileTrip] = useState(false);
  const [whereIsThisOpen, setWhereIsThisOpen] = useState(true);

  const [cart, setCart] = useState({
    flights: [],
    hotels: [],
    tours: [],
  });

  const [expandedSections, setExpandedSections] = useState({
    flights: true,
    hotels: true,
    tours: true,
  });

  const [conversationContext, setConversationContext] = useState({
    destination: null,
    travelers: null,
    month: null,
    searchTerms: null,
    sortBy: null,
    resultCount: 10,
  });

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get correct scrollHeight
      textarea.style.height = 'auto';
      // Set new height (max 150px for ~5 lines)
      const newHeight = Math.min(textarea.scrollHeight, 150);
      textarea.style.height = `${newHeight}px`;
    }
  }, [input]);

  // ============================================================================
  // PRE-WARM CACHE FOR FEATURED DESTINATIONS
  // ============================================================================

  useEffect(() => {
    // Pre-warm cache for featured destinations on app load
    // This runs once and fetches popular destinations in the background
    const featuredDestinations = [
      { name: 'Paris', destinationId: null },
      { name: 'Rome', destinationId: null },
      { name: 'Tokyo', destinationId: null },
      { name: 'Barcelona', destinationId: null },
      { name: 'New York', destinationId: null },
      { name: 'London', destinationID: null },
      { name: 'Lisbon', destinationID: null },
      { name: 'Bangkok', destinationID: null },
      { name: 'Santorini', destinationID: null }
    ];

    // Start pre-warm after a brief delay to let critical resources load first
    // Using requestIdleCallback for better performance, with setTimeout fallback
    if ('requestIdleCallback' in window) {
      const idleId = requestIdleCallback(() => {
        prewarmDestinations(BACKEND_URL, featuredDestinations);
      }, { timeout: 1000 });
      return () => cancelIdleCallback(idleId);
    } else {
      // Fallback: start after 500ms (faster than before)
      const timer = setTimeout(() => {
        prewarmDestinations(BACKEND_URL, featuredDestinations);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []); // Run once on mount

  // ============================================================================
  // "WHERE IS THIS?" HANDLERS
  // ============================================================================
  
  /* MVP: Flights disabled for initial launch
  const handleWhereIsThisFlights = (destination) => {
    const message = `I'd like to find flights to ${destination}`;
    setInput(message);
    // Auto-send
    setTimeout(() => {
      document.getElementById('chat-input')?.form?.requestSubmit();
    }, 100);
  };
  */

  /* MVP: Hotels disabled for initial launch
  const handleWhereIsThisHotels = (destination) => {
    const message = `Find me hotels in ${destination}`;
    setInput(message);
    setTimeout(() => {
      document.getElementById('chat-input')?.form?.requestSubmit();
    }, 100);
  };
  */

  const handleWhereIsThisTours = (destination, viatorDestinationId = null, preloadedData = null) => {
  // If we have preloaded tours from WhereIsThis, use them directly (INSTANT!)
  if (preloadedData?.tours?.length > 0) {
    console.log(`Using ${preloadedData.tours.length} preloaded tours for ${destination}`);
    
    // Set results directly without making another API call
    setSearchResults(preloadedData.tours);
    setCurrentSearchParams({
      type: 'tours',
      destination: destination,
      destinationId: viatorDestinationId,
      travelers: conversationContext.travelers || 2
    });
    
    // Update context
    setConversationContext(prev => ({
      ...prev,
      destination: destination,
      travelers: prev.travelers || 2
    }));
    
    // Show results page immediately
    setShowLandingPage(false);
    setShowResultsPage(true);
    setWhereIsThisOpen(false);
    setLoading(false);
    return;
  }
  
  // Fallback: No preloaded data, use the results page search
  // Close WhereIsThis panel and navigate to results
  setWhereIsThisOpen(false);
  
  handleResultsPageSearch({
    type: 'tours',
    destination: destination,
    destinationId: viatorDestinationId,
    travelers: conversationContext.travelers || 2,
    sortBy: 'popular'
  });
};

  // ============================================================================
  // CART FUNCTIONS
  // ============================================================================

  // Memoize cart functions with useCallback
  const addToCart = useCallback((type, item) => {
    setCart((prev) => {
      const key = type === 'flight' ? 'flights' : type === 'hotel' ? 'hotels' : 'tours';
      if (prev[key].find((i) => i.id === item.id)) return prev;
      return { ...prev, [key]: [...prev[key], item] };
    });
  }, []);

  const removeFromCart = useCallback((type, itemId) => {
    setCart((prev) => {
      const key = type === 'flight' ? 'flights' : type === 'hotel' ? 'hotels' : 'tours';
      return { ...prev, [key]: prev[key].filter((i) => i.id !== itemId) };
    });
  }, []);

  const isInCart = useCallback((type, itemId) => {
    const key = type === 'flight' ? 'flights' : type === 'hotel' ? 'hotels' : 'tours';
    return cart[key].some((i) => i.id === itemId);
  }, [cart]);

  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  // Helper to calculate tour price based on pricing type
  const getTourPrice = (tour) => {
    if (tour.pricingType === 'group') {
      return tour.price || 0; // Per group - don't multiply
    }
    return (tour.price || 0) * (conversationContext.travelers || 2); // Per person - multiply
  };

  // Memoize total cost calculation
  const totalCost = useMemo(() =>
    cart.tours.reduce((sum, t) => sum + getTourPrice(t), 0),
    [cart.tours, conversationContext.travelers]
  );

  // Memoize formatCurrency function
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }, []);

  // ============================================================================
  // SEARCH PANEL HANDLER
  // ============================================================================

  const handlePanelSearch = async (searchParams) => {
    setLoading(true);
    
    try {
      if (searchParams.type === 'tours') {
        // Update context
        setConversationContext(prev => ({
          ...prev,
          destination: searchParams.destination,
          travelers: searchParams.travelers || prev.travelers,
          searchTerms: searchParams.searchTerms || null,
          sortBy: searchParams.sortBy || 'popular'
        }));

        // Call the API directly (no user message added to chat)
        const response = await fetch(`${BACKEND_URL}/api/tours/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: searchParams.destination,
            destinationId: searchParams.destinationId,
            searchTerms: searchParams.searchTerms,
            resultCount: 10,
            sortBy: searchParams.sortBy || 'popular',
            startDate: searchParams.startDate,
            endDate: searchParams.endDate,
            flags: searchParams.flags,
            minPrice: searchParams.minPrice,
            maxPrice: searchParams.maxPrice,
            minDuration: searchParams.minDuration,
            maxDuration: searchParams.maxDuration,
            minRating: searchParams.minRating
          })
        });

        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();
        const tours = data.tours || [];

        if (tours.length > 0) {
          const options = tours.map(tour => ({
            type: 'tour',
            data: tour
          }));

          // Check if this was a deals search
          const isDealsSearch = searchParams.flags?.includes('SPECIAL_OFFER');
          
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: isDealsSearch 
              ? `🏷️ Great news! I found ${tours.length} tours on sale in ${searchParams.destination}! These have special discounts available right now:`
              : `I found ${tours.length} great tours in ${searchParams.destination}! Here are some options:`,
            options
          }]);
        } else {
          // Check if this was a deals search
          const isDealsSearch = searchParams.flags?.includes('SPECIAL_OFFER');
          
          if (isDealsSearch) {
            // Special message for no deals found
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `😕 No deals available in ${searchParams.destination} right now. Special offers change frequently, so check back soon!\n\nIn the meantime, try browsing deals in another city like Paris, Rome, or Barcelona - or I can search for all tours in ${searchParams.destination} (not just discounted ones). Would you like me to do that?`
            }]);
          } else {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `I couldn't find any tours matching your criteria in ${searchParams.destination}. Try adjusting your filters or searching for a different location.`
            }]);
          }
        }
      }
      /* MVP: Hotels search disabled for initial launch
      else if (searchParams.type === 'hotels') {
        // Update context
        setConversationContext(prev => ({
          ...prev,
          destination: searchParams.destination,
        }));

        // Call the hotels API directly (no user message added to chat)
        const response = await fetch(`${BACKEND_URL}/api/hotels/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: searchParams.destination,
            destinationCode: searchParams.destinationCode,  // Pass the code from autocomplete
            checkIn: searchParams.checkIn,
            checkOut: searchParams.checkOut,
            adults: searchParams.guests || 2,
            rooms: searchParams.rooms || 1
          })
        });

        if (!response.ok) {
          // Try to get the error message from the API response
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || 'Hotel search failed');
        }

        const data = await response.json();
        const hotels = data.hotels || [];

        if (hotels.length > 0) {
          const options = hotels.map(hotel => ({
            type: 'hotel',
            data: hotel
          }));

          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `I found ${hotels.length} hotels in ${searchParams.destination}! Here are your options:`,
            options
          }]);
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `I couldn't find any hotels in ${searchParams.destination} for your dates. Try different dates or check the spelling of the destination.`
          }]);
        }
      } else if (searchParams.type === 'flights') {
        // Flights not yet implemented
        setMessages(prev => [...prev, {
          role: 'assistant', 
          content: `Flight search is coming soon! For now, I can provide general recommendations and information about flights. What else would you like to know?`
        }]);
      }
      */
    } catch (error) {
      console.error('Panel search error:', error);
      // Show the actual error message if available
      const errorMessage = error.message && error.message !== 'Hotel search failed' && error.message !== 'Search failed'
        ? error.message
        : 'Sorry, I encountered an error while searching. Please try again or use the chat to describe what you\'re looking for.';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage
      }]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // GET DISPLAYED RESULTS - Extract current results for AI context
  // ============================================================================
  
  const getDisplayedResults = () => {
    // Find the most recent message with options (search results)
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].options && messages[i].options.length > 0) {
        return {
          tours: messages[i].options
            .filter(o => o.type === 'tour')
            .map(o => ({
              name: o.data.name,
              price: o.data.price,
              duration: o.data.duration,
              rating: o.data.rating,
              reviewCount: o.data.reviewCount,
              description: o.data.description?.substring(0, 200)
            })),
          hotels: messages[i].options
            .filter(o => o.type === 'hotel')
            .map(o => ({
              name: o.data.name,
              price: o.data.price,
              rating: o.data.rating,
              location: o.data.location
            }))
        };
      }
    }
    return { tours: [], hotels: [] };
  };

  // ============================================================================
  // CHAT HANDLER - AGENTIC VERSION
  // ============================================================================

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build messages with context about displayed results
      const messagesWithContext = [...messages, userMessage].map(m => {
        // If this message has options (tour/hotel results), include them as context
        if (m.options && m.options.length > 0) {
          const resultsContext = m.options.map((opt, i) => {
            if (opt.type === 'tour') {
              const t = opt.data;
              return `${i + 1}. "${t.name}" - $${t.price}, ${t.duration}, ${t.rating}★ (${t.reviewCount} reviews)`;
            } else if (opt.type === 'hotel') {
              const h = opt.data;
              return `${i + 1}. "${h.name}" - $${h.price}/night, ${h.rating}★`;
            }
            return null;
          }).filter(Boolean).join('\n');
          
          // Append results context to the message content
          return {
            role: m.role,
            content: `${m.content}\n\n[DISPLAYED RESULTS:\n${resultsContext}]`
          };
        }
        
        return {
          role: m.role,
          content: m.content
        };
      });

      const response = await fetch(`${BACKEND_URL}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesWithContext,
          currentResults: getDisplayedResults() // Also send structured data
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      console.log('Agentic response:', { 
        toolsUsed: data.toolsUsed, 
        iterations: data.iterations,
        tokens: data.usage?.totalTokens,
        toursFound: data.tours?.length || 0
      });

      // Update context if provided
      if (data.context) {
        setConversationContext(prev => ({
          ...prev,
          ...data.context
        }));
      }

      // Extract destination from conversation if mentioned
      const messageContent = (data.message || '').toLowerCase();
      const destinations = ['rome', 'paris', 'london', 'tokyo', 'barcelona', 'florence', 'tuscany', 'new york', 'amsterdam', 'philadelphia'];
      for (const dest of destinations) {
        if (messageContent.includes(dest)) {
          setConversationContext(prev => ({
            ...prev,
            destination: dest.charAt(0).toUpperCase() + dest.slice(1)
          }));
          break;
        }
      }

      // Build options array from tours/hotels/flights
      const options = [];

      // Add tour options if present
      if (data.tours && data.tours.length > 0) {
        options.push(...data.tours.map(tour => ({
          type: 'tour',
          data: tour
        })));
      }

      // Add hotel options if present
      if (data.hotels && data.hotels.length > 0) {
        options.push(...data.hotels.map(hotel => ({
          type: 'hotel',
          data: hotel
        })));
      }

      // Add flight options if present
      if (data.flights && data.flights.length > 0) {
        options.push(...data.flights.map(flight => ({
          type: 'flight',
          data: flight
        })));
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || "I found some options for you!",  // Use data.message, not data.response
        options: options,
        toolsUsed: data.toolsUsed
      }]);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // BOOKING HANDLER
  // ============================================================================

  const handleBookTrip = () => {
    setShowItinerary(false);
    setShowBookingPage(true);
  };

  const shareItinerary = () => {
    const travelers = conversationContext.travelers || 2;
    const { destination } = conversationContext;
    
    let text = `🌍 My Viaggio Trip${destination ? ` to ${destination}` : ''}\n`;
    text += `👥 ${travelers} traveler${travelers === 1 ? '' : 's'}\n\n`;
    
    if (cart.flights.length > 0) {
      text += `✈️ FLIGHTS\n`;
      cart.flights.forEach(f => {
        text += `• ${f.airline} - ${formatCurrency(f.price)}\n`;
      });
      text += '\n';
    }
    
    if (cart.hotels.length > 0) {
      text += `🏨 HOTELS\n`;
      cart.hotels.forEach(h => {
        text += `• ${h.name} - ${formatCurrency(h.price)}\n`;
      });
      text += '\n';
    }
    
    if (cart.tours.length > 0) {
      text += `🎯 TOURS & EXPERIENCES\n`;
      cart.tours.forEach(t => {
        const tourPrice = getTourPrice(t);
        const priceLabel = t.pricingType === 'group' ? 'per group' : `${travelers} people`;
        text += `• ${t.name} - ${formatCurrency(tourPrice)} (${priceLabel})\n`;
      });
      text += '\n';
    }
    
    text += `💰 TOTAL: ${formatCurrency(totalCost)}\n`;
    text += `✨ Planned with Viaggio.ai`;
    
    navigator.clipboard.writeText(text)
      .then(() => window.alert('✅ Itinerary copied to clipboard!'))
      .catch(() => window.alert('Unable to copy.'));
  };

  // ============================================================================
  // LANDING PAGE HANDLERS
  // ============================================================================

  // ============================================================================
  // RESULTS PAGE SEARCH HANDLER
  // ============================================================================

  const handleResultsPageSearch = async (searchParams) => {
    setCurrentSearchParams(searchParams);

    // Check cache first (stale-while-revalidate pattern)
    const cacheOptions = {
      destinationId: searchParams.destinationId,
      sortBy: searchParams.sortBy,
      searchTerms: searchParams.searchTerms
    };
    const cached = await getCachedSearch(searchParams.destination, cacheOptions);

    if (cached) {
      // Show cached results immediately
      console.log(`⚡ Using cached results for "${searchParams.destination}" (${cached.isFresh ? 'fresh' : 'stale'})`);
      setSearchResults(cached.data.tours || []);
      setConversationContext(prev => ({
        ...prev,
        destination: searchParams.destination,
        travelers: searchParams.travelers || prev.travelers,
        searchTerms: searchParams.searchTerms || null,
        sortBy: searchParams.sortBy || 'popular'
      }));
      setShowLandingPage(false);
      setShowResultsPage(true);

      // If cache is fresh, we're done
      if (cached.isFresh) {
        setLoading(false);
        return;
      }

      // If stale, continue to fetch fresh data in background (don't show loading)
      console.log(`🔄 Refreshing stale cache for "${searchParams.destination}"...`);
    } else {
      // No cache - show loading state
      setLoading(true);
      setShowLandingPage(false);
      setShowResultsPage(true);
    }

    // Fetch fresh data
    try {
      const response = await fetch(`${BACKEND_URL}/api/tours/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: searchParams.destination,
          destinationId: searchParams.destinationId,
          searchTerms: searchParams.searchTerms,
          resultCount: 100,
          sortBy: searchParams.sortBy || 'popular',
          startDate: searchParams.startDate,
          endDate: searchParams.endDate,
          flags: searchParams.flags,
          minPrice: searchParams.minPrice,
          maxPrice: searchParams.maxPrice,
          minDuration: searchParams.minDuration,
          maxDuration: searchParams.maxDuration,
          minRating: searchParams.minRating
        })
      });

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      const tours = data.tours || [];

      // Update cache
      setCachedSearch(searchParams.destination, cacheOptions, data);

      // Update results (this will refresh if we showed stale data)
      setSearchResults(tours);
      setConversationContext(prev => ({
        ...prev,
        destination: searchParams.destination,
        travelers: searchParams.travelers || prev.travelers,
        searchTerms: searchParams.searchTerms || null,
        sortBy: searchParams.sortBy || 'popular'
      }));

    } catch (error) {
      console.error('Search error:', error);
      // Only clear results if we didn't have cached data
      if (!cached) {
        setSearchResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // HOTEL SEARCH HANDLER
  // ============================================================================

  const handleHotelSearch = async (searchParams) => {
    setCurrentHotelSearchParams(searchParams);
    setLoading(true);
    setShowLandingPage(false);
    setShowResultsPage(false);
    setShowHotelResultsPage(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/hotels/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: searchParams.destination,
          destinationCode: searchParams.destinationCode,
          checkIn: searchParams.checkIn,
          checkOut: searchParams.checkOut,
          adults: searchParams.guests || 2,
          rooms: searchParams.rooms || 1
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Hotel search failed');
      }

      const data = await response.json();
      const hotels = data.hotels || [];
      setHotelSearchResults(hotels);

    } catch (error) {
      console.error('Hotel search error:', error);
      setHotelSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLandingPageSearch = (searchParams) => {
    if (searchParams.type === 'hotels') {
      handleHotelSearch(searchParams);
    } else {
      handleResultsPageSearch(searchParams);
    }
  };

  const handleLandingPageDeals = (cityName) => {
    // Search for ALL tours in the city, but pre-select the Special Offer filter
    // This allows users to uncheck it and see all tours
    handleResultsPageSearch({
      type: 'tours',
      destination: cityName,
      prefilter: 'SPECIAL_OFFER'  // This tells ResultsPage to pre-check the filter, but API gets all results
    });
  };

  const handleBackToHome = () => {
    setShowLandingPage(true);
    setShowResultsPage(false);
    setShowHotelResultsPage(false);
    setSearchResults([]);
    setHotelSearchResults([]);
    setCurrentSearchParams(null);
    setCurrentHotelSearchParams(null);
  };

  const handleOpenWhereIsThis = () => {
    setShowLandingPage(false);
    setShowResultsPage(false);
    setWhereIsThisOpen(true);
  };

  const handleOpenTripBuilder = () => {
    setShowLandingPage(false);
    setShowResultsPage(false);
    setSidebarOpen(true);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Show Landing Page - wrapped in Suspense for code splitting
  if (showLandingPage) {
    return (
      <Suspense fallback={<PageLoader />}>
        <LandingPage
          onSearch={handleLandingPageSearch}
          onSearchDeals={handleLandingPageDeals}
          onOpenWhereIsThis={handleOpenWhereIsThis}
          onOpenTripBuilder={handleOpenTripBuilder}
          cart={cart}
          removeFromCart={removeFromCart}
          formatCurrency={formatCurrency}
          onCheckout={() => {
            setShowLandingPage(false);
            setShowBookingPage(true);
          }}
          isLoading={loading}
          backendUrl={BACKEND_URL}
        />
      </Suspense>
    );
  }

  // Show Product Display Page (full tour details) - wrapped in Suspense
  if (showProductPage && selectedProductTour) {
    return (
      <Suspense fallback={<PageLoader />}>
        <ProductDisplayPage
          tour={selectedProductTour}
          onBack={() => {
            setShowProductPage(false);
            setSelectedProductTour(null);
          }}
          onAddToCart={() => {
            if (isInCart('tour', selectedProductTour.id)) {
              removeFromCart('tour', selectedProductTour.id);
            } else {
              addToCart('tour', selectedProductTour);
            }
          }}
          isInCart={isInCart('tour', selectedProductTour.id)}
          formatCurrency={formatCurrency}
          travelers={conversationContext.travelers || 2}
          backendUrl={BACKEND_URL}
          searchParams={currentSearchParams}
        />
      </Suspense>
    );
  }

  // Show Results Page - wrapped in Suspense for code splitting
  if (showResultsPage) {
    return (
      <Suspense fallback={<PageLoader />}>
        <ResultsPage
          searchParams={currentSearchParams}
          results={searchResults}
          isLoading={loading}
          onNewSearch={handleResultsPageSearch}
          onBackToHome={handleBackToHome}
          cart={cart}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          isInCart={isInCart}
          formatCurrency={formatCurrency}
          travelers={conversationContext.travelers || 2}
          backendUrl={BACKEND_URL}
          onCheckout={() => {
            setShowResultsPage(false);
            setShowBookingPage(true);
          }}
          onOpenProductPage={(tour) => {
            setSelectedProductTour(tour);
            setShowProductPage(true);
          }}
        />
      </Suspense>
    );
  }

  // Show Hotel Results Page - wrapped in Suspense for code splitting
  if (showHotelResultsPage) {
    return (
      <Suspense fallback={<PageLoader />}>
        <HotelResultsPage
          searchParams={currentHotelSearchParams}
          results={hotelSearchResults}
          isLoading={loading}
          onNewSearch={handleHotelSearch}
          onBackToHome={handleBackToHome}
          cart={cart}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          isInCart={isInCart}
          formatCurrency={formatCurrency}
          travelers={conversationContext.travelers || 2}
          backendUrl={BACKEND_URL}
          onCheckout={() => {
            setShowHotelResultsPage(false);
            setShowBookingPage(true);
          }}
        />
      </Suspense>
    );
  }

  // Show Checkout Page - wrapped in Suspense for code splitting
  if (showBookingPage) {
    return (
      <Suspense fallback={<PageLoader />}>
        <CheckoutPage
          cart={cart}
          formatCurrency={formatCurrency}
          onBack={() => {
            setShowBookingPage(false);
            // Return to the page we came from
            if (hotelSearchResults.length > 0) {
              setShowHotelResultsPage(true);
            } else {
              setShowResultsPage(true);
            }
          }}
          removeFromCart={removeFromCart}
          travelers={conversationContext.travelers || 2}
        />
      </Suspense>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      
      {/* ================================================================== */}
      {/* LEFT SIDEBAR - Trip Details */}
      {/* ================================================================== */}
      <div 
        className={`hidden md:flex flex-col bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 ${
          sidebarOpen ? 'w-80' : 'w-0 border-r-0'
        }`}
      >
        <div className="w-80 flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between flex-shrink-0">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">Trip Details</span>
              </h2>
              {conversationContext.destination ? (
                <p className="text-xs text-blue-100 mt-1 truncate">
                  {conversationContext.destination}
                  {conversationContext.travelers && ` • ${conversationContext.travelers} travelers`}
                  {conversationContext.month && ` • ${conversationContext.month}`}
                </p>
              ) : (
                <p className="text-xs text-blue-100 mt-1">Your selections</p>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition-colors flex-shrink-0 ml-2"
              aria-label="Close sidebar"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <Sidebar
              cart={cart}
              expandedSections={expandedSections}
              toggleSection={toggleSection}
              removeFromCart={removeFromCart}
              formatCurrency={formatCurrency}
              totalCost={totalCost}
              setShowItinerary={setShowItinerary}
              shareItinerary={shareItinerary}
              travelers={conversationContext.travelers || 2}
            />
          </div>
        </div>
      </div>

      {/* Left Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className={`hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-r-lg shadow-lg hover:bg-blue-700 transition-all duration-300 z-40 ${
          sidebarOpen ? 'opacity-0 pointer-events-none -translate-x-full' : 'opacity-100 translate-x-0'
        }`}
        aria-label="Open trip details"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* ================================================================== */}
      {/* MAIN CONTENT AREA */}
      {/* ================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLandingPage(true)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                title="Back to Home"
              >
                <Plane className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div className="min-w-0 text-left">
                  <h1 className="text-2xl font-bold text-gray-900">Viaggio.ai</h1>
                  <p className="text-xs text-gray-500">Powered by Via, your AI travel expert</p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Search Panel */}
        <SearchPanel onSearch={handlePanelSearch} isLoading={loading} backendUrl={BACKEND_URL} />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, idx) => (
              <ChatMessage
                key={idx}
                message={msg}
                isInCart={isInCart}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
                formatCurrency={formatCurrency}
                travelers={conversationContext.travelers || 2}
              />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-5 py-3 shadow-md">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input */}
        <div className="border-t border-gray-200 bg-white px-4 py-4 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-3 items-end"
            >
              <textarea
                ref={textareaRef}
                id="chat-input"
                name="chat-input"
                autoComplete="off"
                aria-label="Tell us about your trip"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  // Submit on Enter (without Shift)
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() && !loading) {
                      handleSend();
                    }
                  }
                }}
                placeholder="Chat with Via about your trip..."
                rows={1}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden leading-normal"
                style={{ minHeight: '48px', maxHeight: '150px' }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="px-5 py-3 bg-gray-200 text-gray-600 rounded-lg hover:bg-blue-600 hover:text-white disabled:bg-gray-100 disabled:text-gray-400 transition-colors flex items-center justify-center flex-shrink-0"
                style={{ height: '48px' }}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* RIGHT SIDEBAR - Where Is This? */}
      {/* ================================================================== */}
      <WhereIsThis
        backendUrl={BACKEND_URL}
        isOpen={whereIsThisOpen}
        onToggle={() => setWhereIsThisOpen(!whereIsThisOpen)}
        // MVP: Flights and Hotels disabled for initial launch
        // onSearchFlights={handleWhereIsThisFlights}
        // onSearchHotels={handleWhereIsThisHotels}
        onSearchTours={handleWhereIsThisTours}
      />

      {/* ================================================================== */}
      {/* MOBILE COMPONENTS */}
      {/* ================================================================== */}
      {/* MVP: Only check tours for mobile trip button */}
      {cart.tours.length > 0 && (
        <button
          onClick={() => setShowMobileTrip(true)}
          className="md:hidden fixed bottom-24 right-4 px-4 py-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-semibold z-40"
        >
          <Calendar className="w-4 h-4" />
          View Trip
        </button>
      )}

      {showMobileTrip && (
        <MobileTripSheet
          cart={cart}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          removeFromCart={removeFromCart}
          formatCurrency={formatCurrency}
          totalCost={totalCost}
          setShowItinerary={setShowItinerary}
          shareItinerary={shareItinerary}
          onClose={() => setShowMobileTrip(false)}
          travelers={conversationContext.travelers || 2}
        />
      )}

      {showItinerary && (
        <Suspense fallback={null}>
          <ItineraryModal
            cart={cart}
            formatCurrency={formatCurrency}
            totalCost={totalCost}
            onClose={() => setShowItinerary(false)}
            onBookTrip={handleBookTrip}
            onShare={shareItinerary}
            travelers={conversationContext.travelers || 2}
          />
        </Suspense>
      )}
    </div>
  );
}
