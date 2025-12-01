import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Plane,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Import components
import ChatMessage from './components/ChatMessage';
import Sidebar from './components/Sidebar';
import BookingPage from './components/BookingPage';
import ItineraryModal from './components/ItineraryModal';
import MobileTripSheet from './components/MobileTripSheet';

export default function App() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I'm your Viaggio travel expert. I'm excited to help you plan your perfect trip! Tell me:\n\n• Where would you like to go?\n• When are you planning to travel?\n• How many people will be traveling?",
    },
  ]);
  
  const BACKEND_URL = 'https://viaggio-ai-backend-production.up.railway.app';
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showBookingPage, setShowBookingPage] = useState(false);
  const [showMobileTrip, setShowMobileTrip] = useState(false);

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
    startDate: null,
    endDate: null,
  });

  const messagesEndRef = useRef(null);

  // ============================================================================
  // UTILITY
  // ============================================================================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ============================================================================
  // CHAT HANDLER
  // ============================================================================

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call backend chat API
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: conversationContext
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Update context from backend
      setConversationContext(data.context);

      // Determine what options to show based on command
      let options = [];
      
      if (data.command === 'SHOW_TOURS') {
        // Fetch real tours from Viator API
        const destination = data.context?.destination || conversationContext.destination;
        
        if (destination) {
          try {
            console.log(`Fetching tours for: ${destination}`);
            
            const toursResponse = await fetch(`${BACKEND_URL}/api/tours/search`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                destination: destination,
                startDate: data.context?.startDate,
                endDate: data.context?.endDate,
                adults: data.context?.travelers || 2
              })
            });

            if (toursResponse.ok) {
              const toursData = await toursResponse.json();
              options = toursData.tours.map(t => ({ type: 'tour', data: t }));
              console.log(`Fetched ${options.length} real tours from Viator`);
            } else {
              console.error('Tours API error:', toursResponse.status);
            }
          } catch (tourError) {
            console.error('Tour fetch error:', tourError);
          }
        }
      } else if (data.command === 'SHOW_FLIGHTS') {
        // Flights API not yet integrated
        console.log('Flights requested - API not yet integrated');
      } else if (data.command === 'SHOW_HOTELS') {
        // Hotels API not yet integrated
        console.log('Hotels requested - API not yet integrated');
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        options: options
      }]);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to the server right now. Please try again in a moment."
      }]);
    }

    setLoading(false);
  };

  // Handle Enter key press to send message
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
    if (type === 'flight') {
      setCart((prev) => ({
        ...prev,
        flights: prev.flights.find((f) => f.id === item.id)
          ? prev.flights
          : [...prev.flights, item],
      }));
    } else if (type === 'hotel') {
      setCart((prev) => ({
        ...prev,
        hotels: prev.hotels.find((h) => h.id === item.id)
          ? prev.hotels
          : [...prev.hotels, item],
      }));
    } else if (type === 'tour') {
      setCart((prev) => ({
        ...prev,
        tours: prev.tours.find((t) => t.id === item.id)
          ? prev.tours
          : [...prev.tours, item],
      }));
    }
  };

  const removeFromCart = (type, id) => {
    if (type === 'flight') {
      setCart((prev) => ({
        ...prev,
        flights: prev.flights.filter((f) => f.id !== id),
      }));
    } else if (type === 'hotel') {
      setCart((prev) => ({
        ...prev,
        hotels: prev.hotels.filter((h) => h.id !== id),
      }));
    } else if (type === 'tour') {
      setCart((prev) => ({
        ...prev,
        tours: prev.tours.filter((t) => t.id !== id),
      }));
    }
  };

  const isInCart = (type, id) => {
    if (type === 'flight') return cart.flights.some((f) => f.id === id);
    if (type === 'hotel') return cart.hotels.some((h) => h.id === id);
    if (type === 'tour') return cart.tours.some((t) => t.id === id);
    return false;
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const totalCost = () => {
    let total = 0;
    const travelers = conversationContext.travelers || 2;
    cart.flights.forEach((flight) => (total += flight.price));
    cart.hotels.forEach((hotel) => (total += hotel.price));
    cart.tours.forEach((tour) => (total += tour.price * travelers));
    return total;
  };

  const formatCurrency = (amount) =>
    amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const handleBookTrip = () => {
    setShowItinerary(false);
    setShowBookingPage(true);
  };

  const shareItinerary = () => {
    if (
      cart.flights.length === 0 &&
      cart.hotels.length === 0 &&
      cart.tours.length === 0
    ) {
      window.alert('Please add some items to your itinerary before sharing!');
      return;
    }

    const destination = conversationContext.destination || 'your destination';
    const travelers = conversationContext.travelers || 2;
    const dates = conversationContext.startDate && conversationContext.endDate 
      ? `${conversationContext.startDate} to ${conversationContext.endDate}`
      : 'Dates TBD';

    let shareText = `🌍 ${destination} Trip Itinerary\n\n`;
    shareText += `📅 Dates: ${dates}\n`;
    shareText += `👥 Travelers: ${travelers} ${travelers === 1 ? 'person' : 'people'}\n\n`;

    if (cart.flights.length > 0) {
      shareText += '✈️ FLIGHTS\n';
      cart.flights.forEach((flight) => {
        shareText += `${flight.airline} - ${flight.route}\n`;
        shareText += `Price: ${formatCurrency(flight.price)}\n\n`;
      });
    }

    if (cart.hotels.length > 0) {
      shareText += '🏨 HOTELS\n';
      cart.hotels.forEach((hotel) => {
        shareText += `${hotel.name}\n`;
        shareText += `Price: ${formatCurrency(hotel.price)}\n\n`;
      });
    }

    if (cart.tours.length > 0) {
      shareText += '🎨 TOURS & EXPERIENCES\n';
      cart.tours.forEach((tour) => {
        shareText += `• ${tour.name} - ${formatCurrency(tour.price * travelers)}\n`;
      });
      shareText += '\n';
    }

    shareText += `💰 TOTAL: ${formatCurrency(totalCost())}\n\n`;
    shareText += '✨ Planned with Viaggio.ai';

    navigator.clipboard
      .writeText(shareText)
      .then(() => window.alert('✅ Itinerary copied to clipboard!'))
      .catch(() => window.alert('Unable to copy. Please try again.'));
  };

  // ============================================================================
  // RENDER BOOKING PAGE
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

  // ============================================================================
  // MAIN APP
  // ============================================================================

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
              {conversationContext.destination && (
                <p className="text-xs text-blue-100 mt-1">
                  {conversationContext.destination} • {conversationContext.travelers || 2} travelers
                </p>
              )}
              {!conversationContext.destination && (
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

      {/* Desktop sidebar toggle */}
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
                <p className="text-xs text-gray-500">Your AI Travel Expert</p>
              </div>
            </div>
          </div>
        </header>

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
              />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-5 py-3 shadow-md">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-gray-200 bg-white px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tell me about your trip plans..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center gap-2 font-medium"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile "View Trip" button */}
      {(cart.flights.length > 0 ||
        cart.hotels.length > 0 ||
        cart.tours.length > 0) && (
        <button
          onClick={() => setShowMobileTrip(true)}
          className="md:hidden fixed bottom-24 right-4 px-4 py-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-semibold z-40"
        >
          <Calendar className="w-4 h-4" />
          View Trip
        </button>
      )}

      {/* Mobile bottom sheet */}
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

      {/* Full Itinerary Modal */}
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
