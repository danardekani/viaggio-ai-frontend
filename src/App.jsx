import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Plane,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import ChatMessage from './components/ChatMessage';
import Sidebar from './components/Sidebar';
import BookingPage from './components/BookingPage';
import ItineraryModal from './components/ItineraryModal';
import MobileTripSheet from './components/MobileTripSheet';
import SearchPanel from './components/SearchPanel';
import WhereIsThis from './components/WhereIsThis';

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi, I'm Via, your personal travel expert at Viaggio! ✈️\n\nI'm here to help you plan an amazing trip. I can search for tours and experiences, give you destination tips, and help you build the perfect itinerary.\n\nTell me - where are you dreaming of going? Or if you're not sure yet, I'd love to help you discover somewhere new!",
    },
  ]);
  
  const BACKEND_URL = 'https://viaggio-ai-backend-production.up.railway.app';
  
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ============================================================================
  // "WHERE IS THIS?" HANDLERS
  // ============================================================================
  
  const handleWhereIsThisFlights = (destination) => {
    const message = `I'd like to find flights to ${destination}`;
    setInput(message);
    // Auto-send
    setTimeout(() => {
      document.getElementById('chat-input')?.form?.requestSubmit();
    }, 100);
  };

  const handleWhereIsThisHotels = (destination) => {
    const message = `Find me hotels in ${destination}`;
    setInput(message);
    setTimeout(() => {
      document.getElementById('chat-input')?.form?.requestSubmit();
    }, 100);
  };

  const handleWhereIsThisTours = (destination) => {
    const message = `What tours and activities are available in ${destination}?`;
    setInput(message);
    setTimeout(() => {
      document.getElementById('chat-input')?.form?.requestSubmit();
    }, 100);
  };

  // ============================================================================
  // CART FUNCTIONS
  // ============================================================================

  const addToCart = (type, item) => {
    setCart((prev) => {
      const key = type === 'flight' ? 'flights' : type === 'hotel' ? 'hotels' : 'tours';
      if (prev[key].find((i) => i.id === item.id)) return prev;
      return { ...prev, [key]: [...prev[key], item] };
    });
  };

  const removeFromCart = (type, itemId) => {
    setCart((prev) => {
      const key = type === 'flight' ? 'flights' : type === 'hotel' ? 'hotels' : 'tours';
      return { ...prev, [key]: prev[key].filter((i) => i.id !== itemId) };
    });
  };

  const isInCart = (type, itemId) => {
    const key = type === 'flight' ? 'flights' : type === 'hotel' ? 'hotels' : 'tours';
    return cart[key].some((i) => i.id === itemId);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const totalCost =
    cart.flights.reduce((sum, f) => sum + (f.price || 0), 0) +
    cart.hotels.reduce((sum, h) => sum + (h.price || 0), 0) +
    cart.tours.reduce((sum, t) => sum + ((t.price || 0) * (conversationContext.travelers || 2)), 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

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

        // Add user message showing what was searched
        const searchDescription = buildSearchDescription(searchParams);
        setMessages(prev => [...prev, { role: 'user', content: searchDescription }]);

        // Call the API
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

          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `I found ${tours.length} great tours in ${searchParams.destination}! Here are some options:`,
            options
          }]);
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `I couldn't find any tours matching your criteria in ${searchParams.destination}. Try adjusting your filters or searching for a different location.`
          }]);
        }
      } else if (searchParams.type === 'hotels') {
        // Update context
        setConversationContext(prev => ({
          ...prev,
          destination: searchParams.destination,
        }));

        // Add user message
        let searchMsg = `Search for hotels in ${searchParams.destination}`;
        if (searchParams.checkIn && searchParams.checkOut) {
          searchMsg += ` from ${searchParams.checkIn} to ${searchParams.checkOut}`;
        }
        if (searchParams.guests) {
          searchMsg += ` for ${searchParams.guests} guest${searchParams.guests > 1 ? 's' : ''}`;
        }
        setMessages(prev => [...prev, { role: 'user', content: searchMsg }]);

        // Call the hotels API
        const response = await fetch(`${BACKEND_URL}/api/hotels/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: searchParams.destination,
            checkIn: searchParams.checkIn,
            checkOut: searchParams.checkOut,
            adults: searchParams.guests || 2,
            rooms: searchParams.rooms || 1
          })
        });

        if (!response.ok) throw new Error('Hotel search failed');

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
        setMessages(prev => [...prev, 
          { role: 'user', content: `Search for flights from ${searchParams.from} to ${searchParams.to}` },
          { role: 'assistant', content: `Flight search is coming soon! For now, I can provide general recommendations and information about flights. What else would you like to know?` }
        ]);
      }
    } catch (error) {
      console.error('Panel search error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error while searching. Please try again or use the chat to describe what you\'re looking for.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Build a human-readable search description
  const buildSearchDescription = (params) => {
    let description = `Search for tours in ${params.destination}`;
    
    if (params.searchTerms) {
      description += ` - ${params.searchTerms}`;
    }
    
    const details = [];
    if (params.startDate && params.endDate) {
      details.push(`${params.startDate} to ${params.endDate}`);
    }
    if (params.travelers && params.travelers !== 2) {
      details.push(`${params.travelers} travelers`);
    }
    if (params.minPrice || params.maxPrice) {
      if (params.minPrice && params.maxPrice) {
        details.push(`$${params.minPrice}-$${params.maxPrice}`);
      } else if (params.maxPrice) {
        details.push(`under $${params.maxPrice}`);
      } else {
        details.push(`over $${params.minPrice}`);
      }
    }
    if (params.flags && params.flags.length > 0) {
      const flagLabels = {
        'FREE_CANCELLATION': 'free cancellation',
        'SKIP_THE_LINE': 'skip the line',
        'PRIVATE_TOUR': 'private',
        'LIKELY_TO_SELL_OUT': 'popular',
        'SPECIAL_OFFER': 'deals'
      };
      const flagNames = params.flags.map(f => flagLabels[f] || f).join(', ');
      details.push(flagNames);
    }
    
    if (details.length > 0) {
      description += ` (${details.join(', ')})`;
    }
    
    return description;
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
      const response = await fetch(`${BACKEND_URL}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      // Update context if provided
      if (data.context) {
        setConversationContext(prev => ({
          ...prev,
          ...data.context
        }));
      }

      // Build assistant message with options
      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        options: []
      };

      // Add tour options if present
      if (data.tours && data.tours.length > 0) {
        assistantMessage.options.push(...data.tours.map(tour => ({
          type: 'tour',
          data: tour
        })));
      }

      // Add hotel options if present
      if (data.hotels && data.hotels.length > 0) {
        assistantMessage.options.push(...data.hotels.map(hotel => ({
          type: 'hotel',
          data: hotel
        })));
      }

      // Add flight options if present
      if (data.flights && data.flights.length > 0) {
        assistantMessage.options.push(...data.flights.map(flight => ({
          type: 'flight',
          data: flight
        })));
      }

      setMessages(prev => [...prev, assistantMessage]);

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
    const text = `My Viaggio Trip:\n${cart.tours.map(t => `- ${t.name}`).join('\n')}`;
    navigator.clipboard.writeText(text)
      .then(() => window.alert('Itinerary copied!'))
      .catch(() => window.alert('Unable to copy.'));
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (showBookingPage) {
    return (
      <BookingPage
        cart={cart}
        formatCurrency={formatCurrency}
        onBack={() => setShowBookingPage(false)}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      
      {/* ================================================================== */}
      {/* LEFT SIDEBAR - Trip Details */}
      {/* ================================================================== */}
      <div 
        className={`hidden md:flex flex-col bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-80' : 'w-0'
        }`}
      >
        {sidebarOpen && (
          <>
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
              />
            </div>
          </>
        )}
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
              <Plane className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-gray-900">Viaggio.ai</h1>
                <p className="text-xs text-gray-500">Powered by Via, your AI travel expert</p>
              </div>
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
              className="flex gap-3"
            >
              <input
                type="text"
                id="chat-input"
                name="chat-input"
                autoComplete="off"
                aria-label="Tell us about your trip"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Chat with Via about your trip..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="px-5 py-3 bg-gray-200 text-gray-600 rounded-lg hover:bg-blue-600 hover:text-white disabled:bg-gray-100 disabled:text-gray-400 transition-colors flex items-center justify-center flex-shrink-0"
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
        onSearchFlights={handleWhereIsThisFlights}
        onSearchHotels={handleWhereIsThisHotels}
        onSearchTours={handleWhereIsThisTours}
      />

      {/* ================================================================== */}
      {/* MOBILE COMPONENTS */}
      {/* ================================================================== */}
      {(cart.flights.length > 0 || cart.hotels.length > 0 || cart.tours.length > 0) && (
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
        />
      )}

      {showItinerary && (
        <ItineraryModal
          cart={cart}
          formatCurrency={formatCurrency}
          totalCost={totalCost}
          onClose={() => setShowItinerary(false)}
          onBookTrip={handleBookTrip}
          onShare={shareItinerary}
        />
      )}
    </div>
  );
}
