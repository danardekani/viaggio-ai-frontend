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
    // For now, send a chat message (flights API not integrated yet)
    setInput(`Find flights to ${destination}`);
    // Note: handleSend would need to be called after state update
  };

  const handleWhereIsThisHotels = (destination) => {
    // For now, send a chat message (hotels API not integrated yet)
    setInput(`Find hotels in ${destination}`);
  };

  const handleWhereIsThisTours = (destination) => {
    // Trigger the tours search via SearchPanel
    handlePanelSearch({
      type: 'tours',
      destination: destination,
      travelers: conversationContext.travelers || 2
    });
  };

  // ============================================================================
  // SEARCH PANEL HANDLER
  // ============================================================================

  const handlePanelSearch = async (searchParams) => {
    setLoading(true);
    
    try {
      if (searchParams.type === 'tours') {
        // Update conversation context with the search params
        const newContext = {
          ...conversationContext,
          destination: searchParams.destination,
          travelers: searchParams.travelers,
          startDate: searchParams.startDate,
          endDate: searchParams.endDate,
          searchTerms: searchParams.searchTerms,
          sortBy: searchParams.sortBy,
          minPrice: searchParams.minPrice,
          maxPrice: searchParams.maxPrice,
          minDuration: searchParams.minDuration,
          maxDuration: searchParams.maxDuration,
          minRating: searchParams.minRating,
          flags: searchParams.flags
        };
        setConversationContext(newContext);

        // Add a user message to show what was searched
        const searchDescription = buildSearchDescription(searchParams);
        setMessages(prev => [...prev, { 
          role: 'user', 
          content: searchDescription 
        }]);

        // Call the tours API
        const toursResponse = await fetch(`${BACKEND_URL}/api/tours/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: searchParams.destination,
            searchTerms: searchParams.searchTerms || '',
            resultCount: 10,
            sortBy: searchParams.sortBy || 'popular',
            startDate: searchParams.startDate,
            endDate: searchParams.endDate,
            flags: searchParams.flags || [],
            minPrice: searchParams.minPrice,
            maxPrice: searchParams.maxPrice,
            minDuration: searchParams.minDuration,
            maxDuration: searchParams.maxDuration,
            minRating: searchParams.minRating
          })
        });

        if (toursResponse.ok) {
          const toursData = await toursResponse.json();
          const options = toursData.tours.map(t => ({ type: 'tour', data: t }));
          
          // Add assistant response with tour options
          const responseMessage = options.length > 0
            ? `Here are ${options.length} tours in ${searchParams.destination}${searchParams.searchTerms ? ` for "${searchParams.searchTerms}"` : ''}:`
            : `No tours found matching your criteria in ${searchParams.destination}. Try adjusting your filters.`;
          
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: responseMessage,
            options: options
          }]);
        } else {
          throw new Error('Failed to fetch tours');
        }
      } else if (searchParams.type === 'flights') {
        // Placeholder for flights - add user message and AI response
        setMessages(prev => [...prev, 
          { role: 'user', content: searchParams.message },
          { role: 'assistant', content: `I'd be happy to help you find flights from ${searchParams.from} to ${searchParams.to}! Flight search is coming soon. For now, I can provide general flight information and recommendations. What else would you like to know?` }
        ]);
      } else if (searchParams.type === 'hotels') {
        // Placeholder for hotels - add user message and AI response
        setMessages(prev => [...prev,
          { role: 'user', content: searchParams.message },
          { role: 'assistant', content: `I'd love to help you find hotels in ${searchParams.destination}! Hotel search is coming soon. For now, I can provide general recommendations and information about accommodations. What else would you like to know?` }
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
      // Call agentic chat API - Claude handles tool use automatically
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
      
      console.log('Agentic response:', { 
        toolsUsed: data.toolsUsed, 
        iterations: data.iterations,
        tokens: data.usage?.totalTokens,
        toursFound: data.tours?.length || 0
      });

      // Extract destination from conversation if mentioned
      const messageContent = data.message.toLowerCase();
      const destinations = ['rome', 'paris', 'london', 'tokyo', 'barcelona', 'florence', 'tuscany', 'new york', 'amsterdam'];
      for (const dest of destinations) {
        if (messageContent.includes(dest)) {
          setConversationContext(prev => ({
            ...prev,
            destination: dest.charAt(0).toUpperCase() + dest.slice(1)
          }));
          break;
        }
      }

      // Format tours as options for card display
      const options = (data.tours || []).map(tour => ({
        type: 'tour',
        data: {
          id: tour.productCode || tour.name,
          title: tour.name,
          price: tour.price,
          priceFormatted: tour.priceFormatted,
          currency: tour.currency || 'USD',
          duration: tour.duration,
          rating: tour.rating,
          reviewCount: tour.reviewCount,
          description: tour.description,
          highlights: tour.highlights || [],
          webURL: tour.bookingUrl,
          images: tour.images || []
        }
      }));

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        options: options,  // Tour cards!
        toolsUsed: data.toolsUsed
      }]);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting. Please try again."
      }]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ============================================================================
  // CART MANAGEMENT
  // ============================================================================

  const addToCart = (type, item) => {
    setCart(prev => {
      const key = type + 's';
      if (prev[key].find(x => x.id === item.id)) return prev;
      return { ...prev, [key]: [...prev[key], item] };
    });
  };

  const removeFromCart = (type, id) => {
    setCart(prev => ({
      ...prev,
      [type + 's']: prev[type + 's'].filter(x => x.id !== id)
    }));
  };

  const isInCart = (type, id) => {
    const key = type + 's';
    return cart[key]?.some(x => x.id === id) || false;
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const totalCost = () => {
    const travelers = conversationContext.travelers || 2;
    return cart.flights.reduce((sum, f) => sum + f.price, 0) +
           cart.hotels.reduce((sum, h) => sum + h.price, 0) +
           cart.tours.reduce((sum, t) => sum + t.price * travelers, 0);
  };

  const formatCurrency = (amount) =>
    amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const handleBookTrip = () => {
    setShowItinerary(false);
    setShowBookingPage(true);
  };

  const shareItinerary = () => {
    if (cart.flights.length === 0 && cart.hotels.length === 0 && cart.tours.length === 0) {
      window.alert('Please add items to your itinerary first!');
      return;
    }

    const { destination, travelers, month } = conversationContext;
    let shareText = `🌍 ${destination || 'Trip'} Itinerary\n\n`;
    shareText += `📅 ${month || 'Dates TBD'}\n`;
    shareText += `👥 ${travelers || 2} travelers\n\n`;

    if (cart.tours.length > 0) {
      shareText += '🎨 TOURS\n';
      cart.tours.forEach(t => {
        shareText += `• ${t.name} - ${formatCurrency(t.price * (travelers || 2))}\n`;
      });
    }

    shareText += `\n💰 TOTAL: ${formatCurrency(totalCost())}\n`;
    shareText += '✨ Planned with Viaggio.ai';

    navigator.clipboard.writeText(shareText)
      .then(() => window.alert('✅ Copied to clipboard!'))
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
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Desktop sidebar */}
      {sidebarOpen && (
        <div className="hidden md:flex w-80 bg-white border-r border-gray-200 shadow-lg flex-col">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Trip Details
              </h2>
              {conversationContext.destination ? (
                <p className="text-xs text-blue-100 mt-1">
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
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
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
        </div>
      )}

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="hidden md:flex fixed left-0 top-20 bg-blue-600 text-white p-2 rounded-r-lg shadow-lg hover:bg-blue-700 transition-colors z-40"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <Plane className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Viaggio.ai</h1>
                <p className="text-xs text-gray-500">Powered by Via, your AI travel expert</p>
              </div>
            </div>
          </div>
        </header>

        {/* Search Panel */}
        <SearchPanel onSearch={handlePanelSearch} isLoading={loading} backendUrl={BACKEND_URL} />

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

        <div className="border-t border-gray-200 bg-white px-4 py-4">
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
                className="px-5 py-3 bg-gray-200 text-gray-600 rounded-lg hover:bg-blue-600 hover:text-white disabled:bg-gray-100 disabled:text-gray-400 transition-colors flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Where Is This? Panel - RIGHT SIDE */}
      <WhereIsThis
        backendUrl={BACKEND_URL}
        isOpen={whereIsThisOpen}
        onToggle={() => setWhereIsThisOpen(!whereIsThisOpen)}
        onSearchFlights={handleWhereIsThisFlights}
        onSearchHotels={handleWhereIsThisHotels}
        onSearchTours={handleWhereIsThisTours}
      />

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
