import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Plane,
  Hotel,
  Calendar,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle,
  Share2,
} from 'lucide-react';

export default function App() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I'm your Viaggio travel expert. I'm excited to help you plan your perfect trip! Where would you like to go?",
    },
  ]);
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
    travelers: 2,
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
  // STATIC TRAVEL DATA
  // ============================================================================

  const travelDatabase = {
    destinations: {
      florence: {
        flights: [
          {
            id: 'f1',
            airline: 'United Airlines',
            price: 1850,
            route: 'JFK → FLR',
            departure: 'Sep 15, 6:30 PM',
            arrival: 'Sep 16, 10:45 AM',
            duration: '10h 15m',
            stops: '1 stop (Frankfurt)',
            link: 'https://www.united.com/en/us/fsr/choose-flights',
          },
          {
            id: 'f2',
            airline: 'Delta',
            price: 1950,
            route: 'JFK → FLR',
            departure: 'Sep 15, 8:00 PM',
            arrival: 'Sep 16, 12:30 PM',
            duration: '10h 30m',
            stops: '1 stop (Paris)',
            link: 'https://www.delta.com/flight-search/search',
          },
        ],
        hotels: [
          {
            id: 'h1',
            name: 'Hotel Brunelleschi',
            price: 980,
            location: 'Historic Center',
            rating: 4.5,
            amenities: ['Breakfast included', 'Free WiFi', 'Rooftop terrace'],
            link: 'https://www.booking.com/hotel/it/brunelleschi.html',
          },
          {
            id: 'h2',
            name: 'Grand Hotel Cavour',
            price: 875,
            location: 'Near Duomo',
            rating: 4.3,
            amenities: ['Breakfast included', 'Free WiFi', 'Bar'],
            link: 'https://www.booking.com/hotel/it/grand-cavour.html',
          },
        ],
        tours: [
          {
            id: 't1',
            name: 'Uffizi Gallery Skip-the-Line Tour',
            price: 65,
            duration: '3 hours',
            date: 'Sep 17',
            time: '10:00 AM',
            link: 'https://www.viator.com/tours/Florence/Skip-the-Line-Uffizi-Gallery-Tour',
          },
          {
            id: 't2',
            name: 'Tuscan Cooking Class & Wine Tasting',
            price: 120,
            duration: '5 hours',
            date: 'Sep 18',
            time: '2:00 PM',
            link: 'https://www.viator.com/tours/Florence/Tuscan-Cooking-Class-and-Wine-Tasting',
          },
          {
            id: 't3',
            name: 'Day Trip to Siena & San Gimignano',
            price: 95,
            duration: '10 hours',
            date: 'Sep 20',
            time: '8:00 AM',
            link: 'https://www.viator.com/tours/Florence/Siena-San-Gimignano-Day-Trip',
          },
        ],
      },
    },
  };

  // ============================================================================
  // CHAT HANDLER
  // ============================================================================

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const response = generateResponse(input);
      setMessages((prev) => [...prev, response]);
      setLoading(false);
    }, 800);
  };

  const generateResponse = (userInput) => {
    const lower = userInput.toLowerCase();
    let response = '';
    let options = [];

    if (
      lower.includes('tour') ||
      lower.includes('activity') ||
      lower.includes('things to do') ||
      lower.includes('experience')
    ) {
      response = 'Great! Here are some amazing tours and experiences in Florence:';
      options = travelDatabase.destinations.florence.tours.map((t) => ({
        type: 'tour',
        data: t,
      }));
    } else if (
      lower.includes('hotel') ||
      lower.includes('stay') ||
      lower.includes('accommodation')
    ) {
      response =
        "Excellent! Now let's find you a perfect hotel in Florence's historic center:";
      options = travelDatabase.destinations.florence.hotels.map((h) => ({
        type: 'hotel',
        data: h,
      }));
    } else if (lower.includes('flight') || lower.includes('fly')) {
      response = 'Let me show you some great flight options:';
      options = travelDatabase.destinations.florence.flights.map((f) => ({
        type: 'flight',
        data: f,
      }));
    } else if (lower.includes('florence') || lower.includes('italy')) {
      setConversationContext((prev) => ({ ...prev, destination: 'florence' }));
      response =
        'Wonderful choice! Florence in September is absolutely magical. Let me show you some great flight options:';
      options = travelDatabase.destinations.florence.flights.map((f) => ({
        type: 'flight',
        data: f,
      }));
    } else if (cart.flights.length > 0 && cart.hotels.length === 0) {
      response =
        "Great flight selections! Now let's find you some hotels. Would you like to see hotel options?";
      options = travelDatabase.destinations.florence.hotels.map((h) => ({
        type: 'hotel',
        data: h,
      }));
    } else if (cart.hotels.length > 0 && cart.tours.length === 0) {
      response =
        "Perfect! You have your accommodations sorted. Now let's add some amazing experiences. Here are some top tours in Florence:";
      options = travelDatabase.destinations.florence.tours.map((t) => ({
        type: 'tour',
        data: t,
      }));
    } else if (lower.includes('itinerary') || lower.includes('final')) {
      setShowItinerary(true);
      response =
        "Perfect! I've put together your complete Florence itinerary. Click the button to review everything!";
    } else {
      response =
        "I'd be happy to help you plan your trip! You can ask me for:\n\n• Flights to Florence\n• Hotels in Florence\n• Tours and activities\n\nOr just say 'I want to go to Florence, Italy'";
    }

    return { role: 'assistant', content: response, options };
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

  const removeFromCart = (type, itemId) => {
    if (type === 'flight') {
      setCart((prev) => ({
        ...prev,
        flights: prev.flights.filter((f) => f.id !== itemId),
      }));
    } else if (type === 'hotel') {
      setCart((prev) => ({
        ...prev,
        hotels: prev.hotels.filter((h) => h.id !== itemId),
      }));
    } else if (type === 'tour') {
      setCart((prev) => ({
        ...prev,
        tours: prev.tours.filter((t) => t.id !== itemId),
      }));
    }
  };

  const isInCart = (type, itemId) => {
    if (type === 'flight') return cart.flights.some((f) => f.id === itemId);
    if (type === 'hotel') return cart.hotels.some((h) => h.id === itemId);
    if (type === 'tour') return cart.tours.some((t) => t.id === itemId);
    return false;
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // ============================================================================
  // HELPERS
  // ============================================================================

  const totalCost = () => {
    let total = 0;
    cart.flights.forEach((flight) => (total += flight.price));
    cart.hotels.forEach((hotel) => (total += hotel.price));
    cart.tours.forEach((tour) => (total += tour.price * 2));
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

    let shareText = '🌍 Florence, Italy Trip Itinerary\n\n';
    shareText += '📅 Dates: September 15-22, 2025\n';
    shareText += '👥 Travelers: 2 adults\n\n';

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
        shareText += `• ${tour.name} - ${formatCurrency(tour.price * 2)}\n`;
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
  // SIDEBAR CONTENT (shared desktop + mobile)
  // ============================================================================

  const renderSidebarContent = () => {
    if (
      cart.flights.length === 0 &&
      cart.hotels.length === 0 &&
      cart.tours.length === 0
    ) {
      return (
        <div className="text-center text-gray-500 text-sm mt-8">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No items selected yet</p>
          <p className="text-xs mt-2">Start planning!</p>
        </div>
      );
    }

    return (
      <>
        {/* Flights */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('flights')}
            className="w-full px-4 py-3 flex items-center justify-between bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-gray-900 text-sm">
                Flights ({cart.flights.length})
              </span>
            </div>
            {expandedSections.flights ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {expandedSections.flights && cart.flights.length > 0 && (
            <div className="p-3 space-y-2">
              {cart.flights.map((flight) => (
                <div
                  key={flight.id}
                  className="bg-blue-50 rounded-lg p-3 border border-blue-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {flight.airline}
                      </p>
                      <p className="text-xs text-gray-600">{flight.route}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {flight.departure}
                      </p>
                      <p className="text-xs font-semibold text-blue-600 mt-2">
                        {formatCurrency(flight.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart('flight', flight.id)}
                      className="text-red-600 hover:text-red-700 ml-2"
                      title="Remove flight"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hotels */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('hotels')}
            className="w-full px-4 py-3 flex items-center justify-between bg-purple-50 hover:bg-purple-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Hotel className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-gray-900 text-sm">
                Hotels ({cart.hotels.length})
              </span>
            </div>
            {expandedSections.hotels ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {expandedSections.hotels && cart.hotels.length > 0 && (
            <div className="p-3 space-y-2">
              {cart.hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-purple-50 rounded-lg p-3 border border-purple-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {hotel.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {hotel.location}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        ⭐ {hotel.rating}/5
                      </p>
                      <p className="text-xs font-semibold text-purple-600 mt-2">
                        {formatCurrency(hotel.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart('hotel', hotel.id)}
                      className="text-red-600 hover:text-red-700 ml-2"
                      title="Remove hotel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tours */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('tours')}
            className="w-full px-4 py-3 flex items-center justify-between bg-green-50 hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-gray-900 text-sm">
                Tours & Experiences ({cart.tours.length})
              </span>
            </div>
            {expandedSections.tours ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {expandedSections.tours && cart.tours.length > 0 && (
            <div className="p-3 space-y-2">
              {cart.tours.map((tour) => (
                <div
                  key={tour.id}
                  className="bg-green-50 rounded-lg p-3 border border-green-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {tour.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {tour.date} at {tour.time}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {tour.duration}
                      </p>
                      <p className="text-xs font-semibold text-green-600 mt-2">
                        {formatCurrency(tour.price * 2)} (2 people)
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart('tour', tour.id)}
                      className="text-red-600 hover:text-red-700 ml-2"
                      title="Remove tour"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total + actions */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-3 text-white">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Cost</span>
            <span className="text-xl font-bold">
              {formatCurrency(totalCost())}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowItinerary(true)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          View Full Itinerary
        </button>

        <button
          onClick={shareItinerary}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share Trip
        </button>
      </>
    );
  };

  // ============================================================================
  // BOOKING PAGE
  // ============================================================================

  if (showBookingPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Plane className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Complete Your Booking
                </h1>
              </div>
              <button
                onClick={() => setShowBookingPage(false)}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                ← Back to Chat
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-green-900 mb-2">
                  Your Itinerary is Ready!
                </h2>
                <p className="text-green-700">
                  Click the booking links below to complete your reservations.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {cart.flights.map((flight) => (
              <div
                key={flight.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Plane className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">
                        Flight
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {flight.airline}
                      </p>
                      <p className="text-sm text-gray-600">{flight.route}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(flight.price)}
                  </p>
                </div>
                <a
                  href={flight.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  Book Flight
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}

            {cart.hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Hotel className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">
                        Hotel
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {hotel.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(hotel.price)}
                  </p>
                </div>
                <a
                  href={hotel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  Book Hotel
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}

            {cart.tours.map((tour) => (
              <div
                key={tour.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">
                        {tour.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {tour.date} at {tour.time}
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(tour.price * 2)}
                  </p>
                </div>
                <a
                  href={tour.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  Book Tour
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
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
              <p className="text-xs text-blue-100 mt-1">Your selections</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {renderSidebarContent()}
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
              <div
                key={idx}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-2xl ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-2xl px-5 py-3'
                      : ''
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="space-y-3">
                      <div className="bg-white text-gray-800 shadow-md border border-gray-100 rounded-2xl px-5 py-3">
                        <p className="leading-relaxed whitespace-pre-line">
                          {msg.content}
                        </p>
                      </div>

                      {msg.options && msg.options.length > 0 && (
                        <div className="space-y-3">
                          {msg.options.map((option, optIdx) => {
                            const selected = isInCart(
                              option.type,
                              option.data.id
                            );
                            const colors = {
                              flight: {
                                border: 'border-blue-600',
                                bg: 'bg-blue-50',
                                icon: 'text-blue-600',
                                button: 'bg-blue-600 hover:bg-blue-700',
                              },
                              hotel: {
                                border: 'border-purple-600',
                                bg: 'bg-purple-50',
                                icon: 'text-purple-600',
                                button: 'bg-purple-600 hover:bg-purple-700',
                              },
                              tour: {
                                border: 'border-green-600',
                                bg: 'bg-green-50',
                                icon: 'text-green-600',
                                button: 'bg-green-600 hover:bg-green-700',
                              },
                            }[option.type];

                            return (
                              <div
                                key={optIdx}
                                className={`bg-white rounded-lg shadow-md border-2 p-4 transition-all ${
                                  selected
                                    ? `${colors.border} ${colors.bg}`
                                    : 'border-gray-200'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-start gap-3 flex-1">
                                    {option.type === 'flight' && (
                                      <Plane
                                        className={`w-5 h-5 ${colors.icon} mt-1`}
                                      />
                                    )}
                                    {option.type === 'hotel' && (
                                      <Hotel
                                        className={`w-5 h-5 ${colors.icon} mt-1`}
                                      />
                                    )}
                                    {option.type === 'tour' && (
                                      <MapPin
                                        className={`w-5 h-5 ${colors.icon} mt-1`}
                                      />
                                    )}
                                    <div className="flex-1">
                                      <h4 className="font-bold text-gray-900">
                                        {option.data.airline ||
                                          option.data.name}
                                      </h4>
                                      {option.data.route && (
                                        <p className="text-sm text-gray-600">
                                          {option.data.route}
                                        </p>
                                      )}
                                      {option.data.location && (
                                        <p className="text-sm text-gray-600">
                                          ⭐ {option.data.rating}/5 ·{' '}
                                          {option.data.location}
                                        </p>
                                      )}
                                      {option.data.date && (
                                        <p className="text-sm text-gray-600">
                                          {option.data.date} at{' '}
                                          {option.data.time}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right ml-4">
                                    <p
                                      className={`text-xl font-bold ${colors.icon}`}
                                    >
                                      {formatCurrency(
                                        option.type === 'tour'
                                          ? option.data.price * 2
                                          : option.data.price
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <a
                                    href={option.data.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors font-medium text-center flex items-center justify-center gap-1"
                                  >
                                    View Details
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                  <button
                                    onClick={() =>
                                      selected
                                        ? removeFromCart(
                                            option.type,
                                            option.data.id
                                          )
                                        : addToCart(
                                            option.type,
                                            option.data
                                          )
                                    }
                                    className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors text-white ${
                                      selected
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : colors.button
                                    }`}
                                  >
                                    {selected
                                      ? 'Remove'
                                      : option.type === 'tour'
                                      ? 'Add to Trip'
                                      : 'Select'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  {msg.role === 'user' && <p>{msg.content}</p>}
                </div>
              </div>
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
                placeholder="Type your message... (e.g., 'I want to go to Florence, Italy')"
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
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileTrip(false)}
          />
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">
                  Trip Details
                </span>
              </div>
              <button
                onClick={() => setShowMobileTrip(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {renderSidebarContent()}
            </div>
          </div>
        </div>
      )}

      {/* Full Itinerary Modal */}
      {showItinerary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl max-w-lg w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">
                  Your Florence Itinerary
                </span>
              </div>
              <button
                onClick={() => setShowItinerary(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {cart.flights.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Plane className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-semibold text-gray-900">
                      Flights
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {cart.flights.map((f) => (
                      <div key={f.id} className="text-sm text-gray-700">
                        <div className="font-medium">{f.airline}</div>
                        <div className="text-xs text-gray-500">
                          {f.route}
                        </div>
                        <div className="text-xs text-gray-500">
                          {f.departure}
                        </div>
                        <div className="text-xs font-semibold text-blue-600 mt-1">
                          {formatCurrency(f.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cart.hotels.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Hotel className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-semibold text-gray-900">
                      Hotels
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {cart.hotels.map((h) => (
                      <div key={h.id} className="text-sm text-gray-700">
                        <div className="font-medium">{h.name}</div>
                        <div className="text-xs text-gray-500">
                          ⭐ {h.rating}/5 · {h.location}
                        </div>
                        <div className="text-xs font-semibold text-purple-600 mt-1">
                          {formatCurrency(h.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cart.tours.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <h3 className="text-sm font-semibold text-gray-900">
                      Tours & Experiences
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {cart.tours.map((t) => (
                      <div key={t.id} className="text-sm text-gray-700">
                        <div className="font-medium">{t.name}</div>
                        <div className="text-xs text-gray-500">
                          {t.date} at {t.time} · {t.duration}
                        </div>
                        <div className="text-xs font-semibold text-green-600 mt-1">
                          {formatCurrency(t.price * 2)} (2 people)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">
                  Total Trip Cost
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(totalCost())}
                </span>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleBookTrip}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Continue to Booking
              </button>
              <button
                onClick={() => {
                  shareItinerary();
                  setShowItinerary(false);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Copy & Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
