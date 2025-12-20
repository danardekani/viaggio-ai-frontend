import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  MapPin
} from 'lucide-react';

// ============================================================================
// VIA CHAT COMPONENT - Reusable chat widget with tour card display
// ============================================================================

export default function ViaChat({
  backendUrl,
  onSearch,
  travelers = 2,
  initialMessage = "Hi there! 👋 I'm Via, your personal travel expert. I can help you discover amazing destinations, find the perfect tours, or answer any travel questions. What adventure are you dreaming of?"
}) {
  const [showChatIntro, setShowChatIntro] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: initialMessage
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Hide intro tooltip after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChatIntro(false);
    }, 6000);
    return () => clearTimeout(timer);
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

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ============================================================================
  // CHAT HANDLERS
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
          }))
        })
      });

      if (!response.ok) throw new Error('Chat failed');

      const data = await response.json();

      // Extract tours from various possible response formats
      const tours = data.tours || data.results || data.data?.tours || [];
      console.log('ViaChat API Response:', data);
      console.log('ViaChat Extracted tours:', tours);

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || "I'm not sure how to help with that. Could you try rephrasing?",
        tours: tours,
        searchDestination: data.searchDestination || data.destination || null
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
  }, [chatInput, chatLoading, chatMessages, backendUrl]);

  const handleChatKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  }, [handleChatSend]);

  const handleTourClick = useCallback((tour, searchDestination) => {
    // Navigate to results page with this destination
    if (searchDestination || tour.destination) {
      onSearch?.({
        type: 'tours',
        destination: searchDestination || tour.destination,
        travelers
      });
    }
  }, [onSearch, travelers]);

  const handleViewAllTours = useCallback((searchDestination) => {
    if (searchDestination) {
      onSearch?.({
        type: 'tours',
        destination: searchDestination,
        travelers
      });
    }
  }, [onSearch, travelers]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      {/* Chat Bubble Button (when closed) */}
      {!chatOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          {/* Intro Tooltip */}
          {showChatIntro && (
            <div className="absolute bottom-full right-0 mb-3 w-56 sm:w-64 bg-white rounded-2xl shadow-2xl p-3 sm:p-4 animate-fade-in">
              <button
                onClick={() => setShowChatIntro(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm sm:text-lg">✨</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Hi, I'm Via!</p>
                  <p className="text-xs sm:text-sm text-gray-600">Your AI travel assistant. Ask me anything!</p>
                </div>
              </div>
              <div className="absolute bottom-0 right-8 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white" />
            </div>
          )}

          {/* Chat Bubble Button */}
          <button
            onClick={() => setChatOpen(true)}
            className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center group"
          >
            <MessageCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white" />

            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-25" />

            {/* "Ask Via" label on hover */}
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block">
              Ask Via ✨
            </span>
          </button>
        </div>
      )}

      {/* Chat Panel (when open) */}
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
                <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'w-full'}`}>
                  <div className={`rounded-2xl p-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Tour cards if available */}
                  {msg.tours && msg.tours.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-gray-500 px-1">Found {msg.tours.length} tour{msg.tours.length > 1 ? 's' : ''}:</p>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {msg.tours.slice(0, 5).map((tour, tourIndex) => (
                          <div
                            key={tour.id || tour.productCode || tourIndex}
                            className="bg-white border border-gray-200 rounded-xl p-2 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleTourClick(tour, msg.searchDestination)}
                          >
                            <div className="flex gap-2">
                              {(tour.image || tour.images?.[0]?.url || tour.images?.[0]) ? (
                                <img
                                  src={tour.image || tour.images?.[0]?.url || tour.images?.[0]}
                                  alt={tour.name || tour.title}
                                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <MapPin className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                                  {tour.name || tour.title}
                                </p>
                                {(tour.rating || tour.averageRating) && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className="text-yellow-500 text-xs">★</span>
                                    <span className="text-xs text-gray-600">
                                      {tour.rating || tour.averageRating}
                                    </span>
                                    {(tour.reviewCount || tour.totalReviews) && (
                                      <span className="text-xs text-gray-400">
                                        ({tour.reviewCount || tour.totalReviews})
                                      </span>
                                    )}
                                  </div>
                                )}
                                {(tour.price || tour.retailPrice) && (
                                  <p className="text-sm font-semibold text-green-600 mt-1">
                                    ${(tour.price || tour.retailPrice).toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {msg.tours.length > 5 && (
                        <button
                          onClick={() => handleViewAllTours(msg.searchDestination)}
                          className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
                        >
                          View all {msg.tours.length} tours →
                        </button>
                      )}
                    </div>
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
            <div ref={messagesEndRef} />
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

      {/* Animation Styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
