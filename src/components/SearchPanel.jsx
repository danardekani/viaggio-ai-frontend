import React, { useState } from 'react';
import { 
  Plane, 
  Hotel, 
  MapPin, 
  ChevronDown, 
  ChevronUp,
  Search,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Star,
  X,
  Filter
} from 'lucide-react';

export default function SearchPanel({ onSearch, isLoading }) {
  const [activeTab, setActiveTab] = useState('tours');
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Tours filter state
  const [toursFilters, setToursFilters] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 2,
    searchTerms: '',
    sortBy: 'popular',
    minPrice: '',
    maxPrice: '',
    minDuration: '',
    maxDuration: '',
    minRating: '',
    flags: {
      FREE_CANCELLATION: false,
      SKIP_THE_LINE: false,
      PRIVATE_TOUR: false,
      LIKELY_TO_SELL_OUT: false,
      SPECIAL_OFFER: false
    }
  });

  // Flights filter state (placeholder for future)
  const [flightsFilters, setFlightsFilters] = useState({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: 1,
    cabinClass: 'economy',
    tripType: 'roundtrip'
  });

  // Hotels filter state (placeholder for future)
  const [hotelsFilters, setHotelsFilters] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1,
    minPrice: '',
    maxPrice: '',
    starRating: ''
  });

  const tabs = [
    { id: 'flights', label: 'Flights', icon: Plane, color: 'blue' },
    { id: 'hotels', label: 'Hotels', icon: Hotel, color: 'purple' },
    { id: 'tours', label: 'Tours & Experiences', icon: MapPin, color: 'green' }
  ];

  const handleToursSearch = () => {
    // Build the search parameters
    const flags = Object.entries(toursFilters.flags)
      .filter(([_, enabled]) => enabled)
      .map(([flag, _]) => flag);

    const searchParams = {
      type: 'tours',
      destination: toursFilters.destination,
      startDate: toursFilters.startDate || undefined,
      endDate: toursFilters.endDate || undefined,
      travelers: toursFilters.travelers,
      searchTerms: toursFilters.searchTerms || undefined,
      sortBy: toursFilters.sortBy,
      minPrice: toursFilters.minPrice ? parseFloat(toursFilters.minPrice) : undefined,
      maxPrice: toursFilters.maxPrice ? parseFloat(toursFilters.maxPrice) : undefined,
      minDuration: toursFilters.minDuration ? parseInt(toursFilters.minDuration) : undefined,
      maxDuration: toursFilters.maxDuration ? parseInt(toursFilters.maxDuration) : undefined,
      minRating: toursFilters.minRating ? parseFloat(toursFilters.minRating) : undefined,
      flags: flags.length > 0 ? flags : undefined
    };

    onSearch(searchParams);
  };

  const handleFlightsSearch = () => {
    onSearch({
      type: 'flights',
      ...flightsFilters,
      message: `Search for flights from ${flightsFilters.from} to ${flightsFilters.to}`
    });
  };

  const handleHotelsSearch = () => {
    onSearch({
      type: 'hotels',
      ...hotelsFilters,
      message: `Search for hotels in ${hotelsFilters.destination}`
    });
  };

  const clearToursFilters = () => {
    setToursFilters({
      destination: '',
      startDate: '',
      endDate: '',
      travelers: 2,
      searchTerms: '',
      sortBy: 'popular',
      minPrice: '',
      maxPrice: '',
      minDuration: '',
      maxDuration: '',
      minRating: '',
      flags: {
        FREE_CANCELLATION: false,
        SKIP_THE_LINE: false,
        PRIVATE_TOUR: false,
        LIKELY_TO_SELL_OUT: false,
        SPECIAL_OFFER: false
      }
    });
  };

  const toggleFlag = (flag) => {
    setToursFilters(prev => ({
      ...prev,
      flags: {
        ...prev.flags,
        [flag]: !prev.flags[flag]
      }
    }));
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (toursFilters.minPrice || toursFilters.maxPrice) count++;
    if (toursFilters.minDuration || toursFilters.maxDuration) count++;
    if (toursFilters.minRating) count++;
    count += Object.values(toursFilters.flags).filter(v => v).length;
    return count;
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      {/* Tab Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const colorClasses = {
                  blue: isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600',
                  purple: isActive ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-purple-600',
                  green: isActive ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-green-600'
                };
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${colorClasses[tab.color]}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Collapse Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm hidden sm:inline">{isExpanded ? 'Collapse' : 'Expand'}</span>
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {isExpanded && (
        <div className="max-w-5xl mx-auto px-4 py-4">
          {/* Tours & Experiences Tab */}
          {activeTab === 'tours' && (
            <div className="space-y-4">
              {/* Primary Search Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Destination */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Where to?"
                    value={toursFilters.destination}
                    onChange={(e) => setToursFilters(prev => ({ ...prev, destination: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Date Range */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={toursFilters.startDate}
                    onChange={(e) => setToursFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={toursFilters.endDate}
                    onChange={(e) => setToursFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Travelers */}
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={toursFilters.travelers}
                    onChange={(e) => setToursFilters(prev => ({ ...prev, travelers: parseInt(e.target.value) }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Traveler' : 'Travelers'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Secondary Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {/* Activity Type */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Activity type (food, history...)"
                    value={toursFilters.searchTerms}
                    onChange={(e) => setToursFilters(prev => ({ ...prev, searchTerms: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Sort By */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={toursFilters.sortBy}
                    onChange={(e) => setToursFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="reviews">Most Reviews</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                    <option value="duration_short">Shortest Duration</option>
                    <option value="duration_long">Longest Duration</option>
                  </select>
                </div>

                {/* Price Range */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      placeholder="Min $"
                      value={toursFilters.minPrice}
                      onChange={(e) => setToursFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                      className="w-full pl-8 pr-2 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      placeholder="Max $"
                      value={toursFilters.maxPrice}
                      onChange={(e) => setToursFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                      className="w-full pl-8 pr-2 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Duration */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={toursFilters.maxDuration}
                      onChange={(e) => setToursFilters(prev => ({ ...prev, maxDuration: e.target.value }))}
                      className="w-full pl-8 pr-2 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white text-sm"
                    >
                      <option value="">Any Duration</option>
                      <option value="60">Up to 1 hour</option>
                      <option value="120">Up to 2 hours</option>
                      <option value="240">Up to 4 hours</option>
                      <option value="480">Up to 8 hours</option>
                    </select>
                  </div>
                </div>

                {/* Rating */}
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={toursFilters.minRating}
                    onChange={(e) => setToursFilters(prev => ({ ...prev, minRating: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">Any Rating</option>
                    <option value="3">3+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>
              </div>

              {/* Flag Filters */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'FREE_CANCELLATION', label: 'Free Cancellation', icon: '✓' },
                  { key: 'SKIP_THE_LINE', label: 'Skip the Line', icon: '⚡' },
                  { key: 'PRIVATE_TOUR', label: 'Private Tour', icon: '🔒' },
                  { key: 'LIKELY_TO_SELL_OUT', label: 'Likely to Sell Out', icon: '🔥' },
                  { key: 'SPECIAL_OFFER', label: 'Special Offers', icon: '💰' }
                ].map(flag => (
                  <button
                    key={flag.key}
                    onClick={() => toggleFlag(flag.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      toursFilters.flags[flag.key]
                        ? 'bg-green-100 text-green-700 border-2 border-green-500'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    <span>{flag.icon}</span>
                    <span>{flag.label}</span>
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={clearToursFilters}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                  {activeFiltersCount() > 0 && (
                    <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs ml-1">
                      {activeFiltersCount()}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={handleToursSearch}
                  disabled={!toursFilters.destination || isLoading}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Search Tours
                </button>
              </div>
            </div>
          )}

          {/* Flights Tab */}
          {activeTab === 'flights' && (
            <div className="space-y-4">
              {/* Trip Type */}
              <div className="flex gap-4 mb-2">
                {['roundtrip', 'oneway', 'multicity'].map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tripType"
                      value={type}
                      checked={flightsFilters.tripType === type}
                      onChange={(e) => setFlightsFilters(prev => ({ ...prev, tripType: e.target.value }))}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium capitalize">
                      {type === 'roundtrip' ? 'Round Trip' : type === 'oneway' ? 'One Way' : 'Multi-City'}
                    </span>
                  </label>
                ))}
              </div>

              {/* Search Fields */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="relative">
                  <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="From where?"
                    value={flightsFilters.from}
                    onChange={(e) => setFlightsFilters(prev => ({ ...prev, from: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rotate-90" />
                  <input
                    type="text"
                    placeholder="To where?"
                    value={flightsFilters.to}
                    onChange={(e) => setFlightsFilters(prev => ({ ...prev, to: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={flightsFilters.departDate}
                    onChange={(e) => setFlightsFilters(prev => ({ ...prev, departDate: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {flightsFilters.tripType === 'roundtrip' && (
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={flightsFilters.returnDate}
                      onChange={(e) => setFlightsFilters(prev => ({ ...prev, returnDate: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={flightsFilters.passengers}
                    onChange={(e) => setFlightsFilters(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    {[1,2,3,4,5,6,7,8,9].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Passenger' : 'Passengers'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cabin Class */}
              <div className="flex gap-2">
                {['economy', 'premium', 'business', 'first'].map(cabin => (
                  <button
                    key={cabin}
                    onClick={() => setFlightsFilters(prev => ({ ...prev, cabinClass: cabin }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                      flightsFilters.cabinClass === cabin
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    {cabin === 'premium' ? 'Premium Economy' : cabin === 'first' ? 'First Class' : cabin}
                  </button>
                ))}
              </div>

              {/* Search Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleFlightsSearch}
                  disabled={!flightsFilters.from || !flightsFilters.to || isLoading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Search Flights
                </button>
              </div>

              {/* Coming Soon Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-blue-700 text-sm">
                  ✈️ Flight search coming soon! For now, ask the AI assistant about flights.
                </p>
              </div>
            </div>
          )}

          {/* Hotels Tab */}
          {activeTab === 'hotels' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="relative md:col-span-2">
                  <Hotel className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="City, hotel, or neighborhood"
                    value={hotelsFilters.destination}
                    onChange={(e) => setHotelsFilters(prev => ({ ...prev, destination: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    placeholder="Check-in"
                    value={hotelsFilters.checkIn}
                    onChange={(e) => setHotelsFilters(prev => ({ ...prev, checkIn: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    placeholder="Check-out"
                    value={hotelsFilters.checkOut}
                    onChange={(e) => setHotelsFilters(prev => ({ ...prev, checkOut: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={hotelsFilters.guests}
                    onChange={(e) => setHotelsFilters(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                  >
                    {[1,2,3,4,5,6].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Star Rating Filter */}
              <div className="flex gap-2">
                {['any', '3', '4', '5'].map(stars => (
                  <button
                    key={stars}
                    onClick={() => setHotelsFilters(prev => ({ ...prev, starRating: stars === 'any' ? '' : stars }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                      (stars === 'any' && !hotelsFilters.starRating) || hotelsFilters.starRating === stars
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    {stars === 'any' ? 'Any Stars' : (
                      <>
                        {stars}
                        <Star className="w-4 h-4 fill-current" />
                      </>
                    )}
                  </button>
                ))}
              </div>

              {/* Search Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleHotelsSearch}
                  disabled={!hotelsFilters.destination || isLoading}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Search Hotels
                </button>
              </div>

              {/* Coming Soon Notice */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                <p className="text-purple-700 text-sm">
                  🏨 Hotel search coming soon! For now, ask the AI assistant about hotels.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
