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
  SlidersHorizontal,
  X
} from 'lucide-react';

export default function SearchPanel({ onSearch, isLoading }) {
  const [activeTab, setActiveTab] = useState('tours');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
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
    starRating: ''
  });

  const tabs = [
    { id: 'flights', label: 'Flights', icon: Plane, color: 'blue' },
    { id: 'hotels', label: 'Hotels', icon: Hotel, color: 'purple' },
    { id: 'tours', label: 'Tours', icon: MapPin, color: 'green' }
  ];

  const handleToursSearch = () => {
    const flags = Object.entries(toursFilters.flags)
      .filter(([_, enabled]) => enabled)
      .map(([flag, _]) => flag);

    onSearch({
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
    });
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
    setToursFilters(prev => ({
      ...prev,
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
    }));
  };

  const toggleFlag = (flag) => {
    setToursFilters(prev => ({
      ...prev,
      flags: { ...prev.flags, [flag]: !prev.flags[flag] }
    }));
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (toursFilters.searchTerms) count++;
    if (toursFilters.minPrice || toursFilters.maxPrice) count++;
    if (toursFilters.minDuration || toursFilters.maxDuration) count++;
    if (toursFilters.minRating) count++;
    if (toursFilters.sortBy !== 'popular') count++;
    count += Object.values(toursFilters.flags).filter(v => v).length;
    return count;
  };

  const filterCount = activeFiltersCount();

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      {/* Compact Tab Header */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between py-1">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const colorClasses = {
                blue: isActive ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-gray-500 hover:bg-gray-50',
                purple: isActive ? 'bg-purple-50 text-purple-600 border-purple-200' : 'text-gray-500 hover:bg-gray-50',
                green: isActive ? 'bg-green-50 text-green-600 border-green-200' : 'text-gray-500 hover:bg-gray-50'
              };
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    isActive ? colorClasses[tab.color] : 'border-transparent ' + colorClasses[tab.color]
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-3">
            
            {/* Tours Tab */}
            {activeTab === 'tours' && (
              <div className="space-y-2">
                {/* Primary Row */}
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative flex-1 min-w-[160px]">
                    <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      id="tours-destination"
                      name="tours-destination"
                      placeholder="Where to?"
                      autoComplete="off"
                      value={toursFilters.destination}
                      onChange={(e) => setToursFilters(prev => ({ ...prev, destination: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      id="tours-start-date"
                      name="tours-start-date"
                      value={toursFilters.startDate}
                      onChange={(e) => setToursFilters(prev => ({ ...prev, startDate: e.target.value }))}
                      className="pl-8 pr-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-[130px]"
                    />
                  </div>

                  <span className="text-gray-400 text-sm">to</span>

                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      id="tours-end-date"
                      name="tours-end-date"
                      value={toursFilters.endDate}
                      onChange={(e) => setToursFilters(prev => ({ ...prev, endDate: e.target.value }))}
                      className="pl-8 pr-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-[130px]"
                    />
                  </div>

                  <div className="relative">
                    <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      id="tours-travelers"
                      name="tours-travelers"
                      value={toursFilters.travelers}
                      onChange={(e) => setToursFilters(prev => ({ ...prev, travelers: parseInt(e.target.value) }))}
                      className="pl-8 pr-6 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  {/* More Filters Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
                      showFilters || filterCount > 0
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Filters</span>
                    {filterCount > 0 && (
                      <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">{filterCount}</span>
                    )}
                  </button>

                  <button
                    onClick={handleToursSearch}
                    disabled={!toursFilters.destination || isLoading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                </div>

                {/* Advanced Filters (Collapsible) */}
                {showFilters && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                    <div className="flex flex-wrap gap-2 items-center">
                      {/* Activity Type */}
                      <input
                        type="text"
                        id="tours-activity"
                        name="tours-activity"
                        placeholder="Activity (food, history...)"
                        autoComplete="off"
                        value={toursFilters.searchTerms}
                        onChange={(e) => setToursFilters(prev => ({ ...prev, searchTerms: e.target.value }))}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-[160px]"
                      />

                      {/* Sort */}
                      <select
                        id="tours-sort"
                        name="tours-sort"
                        value={toursFilters.sortBy}
                        onChange={(e) => setToursFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
                      >
                        <option value="popular">Most Popular</option>
                        <option value="reviews">Most Reviews</option>
                        <option value="rating">Highest Rated</option>
                        <option value="price_low">Price: Low → High</option>
                        <option value="price_high">Price: High → Low</option>
                        <option value="newest">Newest</option>
                        <option value="duration_short">Shortest</option>
                        <option value="duration_long">Longest</option>
                      </select>

                      {/* Price Range */}
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 text-sm">$</span>
                        <input
                          type="number"
                          id="tours-min-price"
                          name="tours-min-price"
                          placeholder="Min"
                          value={toursFilters.minPrice}
                          onChange={(e) => setToursFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                          className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                          type="number"
                          id="tours-max-price"
                          name="tours-max-price"
                          placeholder="Max"
                          value={toursFilters.maxPrice}
                          onChange={(e) => setToursFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                          className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      {/* Duration */}
                      <select
                        id="tours-duration"
                        name="tours-duration"
                        value={toursFilters.maxDuration}
                        onChange={(e) => setToursFilters(prev => ({ ...prev, maxDuration: e.target.value }))}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
                      >
                        <option value="">Any Duration</option>
                        <option value="60">≤ 1 hour</option>
                        <option value="120">≤ 2 hours</option>
                        <option value="240">≤ 4 hours</option>
                        <option value="480">≤ 8 hours</option>
                      </select>

                      {/* Rating */}
                      <select
                        id="tours-rating"
                        name="tours-rating"
                        value={toursFilters.minRating}
                        onChange={(e) => setToursFilters(prev => ({ ...prev, minRating: e.target.value }))}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
                      >
                        <option value="">Any Rating</option>
                        <option value="3">3+ ★</option>
                        <option value="3.5">3.5+ ★</option>
                        <option value="4">4+ ★</option>
                        <option value="4.5">4.5+ ★</option>
                      </select>

                      {/* Clear */}
                      {filterCount > 0 && (
                        <button
                          onClick={clearToursFilters}
                          className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Compact Flag Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { key: 'FREE_CANCELLATION', label: 'Free Cancel' },
                        { key: 'SKIP_THE_LINE', label: 'Skip Line' },
                        { key: 'PRIVATE_TOUR', label: 'Private' },
                        { key: 'LIKELY_TO_SELL_OUT', label: 'Popular' },
                        { key: 'SPECIAL_OFFER', label: 'Deals' }
                      ].map(flag => (
                        <button
                          key={flag.key}
                          onClick={() => toggleFlag(flag.key)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            toursFilters.flags[flag.key]
                              ? 'bg-green-600 text-white'
                              : 'bg-white text-gray-600 border border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {flag.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Flights Tab */}
            {activeTab === 'flights' && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 items-center">
                  {/* Trip Type Pills */}
                  <div className="flex gap-1 mr-2">
                    {['roundtrip', 'oneway'].map(type => (
                      <button
                        key={type}
                        onClick={() => setFlightsFilters(prev => ({ ...prev, tripType: type }))}
                        className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                          flightsFilters.tripType === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {type === 'roundtrip' ? 'Round Trip' : 'One Way'}
                      </button>
                    ))}
                  </div>

                  <div className="relative flex-1 min-w-[120px]">
                    <Plane className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      id="flights-from"
                      name="flights-from"
                      placeholder="From"
                      autoComplete="off"
                      value={flightsFilters.from}
                      onChange={(e) => setFlightsFilters(prev => ({ ...prev, from: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="relative flex-1 min-w-[120px]">
                    <Plane className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90" />
                    <input
                      type="text"
                      id="flights-to"
                      name="flights-to"
                      placeholder="To"
                      autoComplete="off"
                      value={flightsFilters.to}
                      onChange={(e) => setFlightsFilters(prev => ({ ...prev, to: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <input
                    type="date"
                    id="flights-depart"
                    name="flights-depart"
                    value={flightsFilters.departDate}
                    onChange={(e) => setFlightsFilters(prev => ({ ...prev, departDate: e.target.value }))}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-[130px]"
                  />

                  {flightsFilters.tripType === 'roundtrip' && (
                    <input
                      type="date"
                      id="flights-return"
                      name="flights-return"
                      value={flightsFilters.returnDate}
                      onChange={(e) => setFlightsFilters(prev => ({ ...prev, returnDate: e.target.value }))}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-[130px]"
                    />
                  )}

                  <select
                    id="flights-passengers"
                    name="flights-passengers"
                    value={flightsFilters.passengers}
                    onChange={(e) => setFlightsFilters(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    {[1,2,3,4,5,6].map(n => (
                      <option key={n} value={n}>{n} pax</option>
                    ))}
                  </select>

                  <button
                    onClick={handleFlightsSearch}
                    disabled={!flightsFilters.from || !flightsFilters.to || isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                </div>
                
                <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg inline-block">
                  ✈️ Flight search coming soon! For now, ask the AI assistant.
                </p>
              </div>
            )}

            {/* Hotels Tab */}
            {activeTab === 'hotels' && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative flex-1 min-w-[180px]">
                    <Hotel className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      id="hotels-destination"
                      name="hotels-destination"
                      placeholder="City or hotel name"
                      autoComplete="off"
                      value={hotelsFilters.destination}
                      onChange={(e) => setHotelsFilters(prev => ({ ...prev, destination: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <input
                    type="date"
                    id="hotels-checkin"
                    name="hotels-checkin"
                    value={hotelsFilters.checkIn}
                    onChange={(e) => setHotelsFilters(prev => ({ ...prev, checkIn: e.target.value }))}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-[130px]"
                    placeholder="Check-in"
                  />

                  <input
                    type="date"
                    id="hotels-checkout"
                    name="hotels-checkout"
                    value={hotelsFilters.checkOut}
                    onChange={(e) => setHotelsFilters(prev => ({ ...prev, checkOut: e.target.value }))}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-[130px]"
                    placeholder="Check-out"
                  />

                  <select
                    id="hotels-guests"
                    name="hotels-guests"
                    value={hotelsFilters.guests}
                    onChange={(e) => setHotelsFilters(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
                  >
                    {[1,2,3,4,5,6].map(n => (
                      <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>

                  {/* Star Rating Pills */}
                  <div className="flex gap-1">
                    {['', '3', '4', '5'].map(stars => (
                      <button
                        key={stars || 'any'}
                        onClick={() => setHotelsFilters(prev => ({ ...prev, starRating: stars }))}
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          hotelsFilters.starRating === stars
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {stars ? `${stars}★` : 'Any'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleHotelsSearch}
                    disabled={!hotelsFilters.destination || isLoading}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                </div>
                
                <p className="text-xs text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg inline-block">
                  🏨 Hotel search coming soon! For now, ask the AI assistant.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
