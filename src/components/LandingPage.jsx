import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import {
  Search,
  MapPin,
  Camera,
  Tag,
  Calendar,
  Users,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  ShoppingBag,
  Plane,
  Loader2,
  ChevronDown,
  Hotel,
  Building
} from 'lucide-react';
import ViaChat from './ViaChat';
import MobileDestinationsSheet from './MobileDestinationsSheet';
import { prewarmDestination } from '../utils/searchCache';

// ============================================================================
// CONSTANTS
// ============================================================================

const HERO_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920&q=80',
    location: 'Maldives'
  },
  {
    url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1920&q=80',
    location: 'Banff, Canada'
  },
  {
    url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1920&q=80',
    location: 'Amalfi Coast, Italy'
  },
  {
    url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1920&q=80',
    location: 'Bali, Indonesia'
  },
  {
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80',
    location: 'Swiss Alps'
  }
];

const FEATURED_DESTINATIONS = [
  { 
    name: 'Paris', 
    country: 'France', 
    deal: 'Up to 20% off tours', 
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80'
  },
  { 
    name: 'Rome', 
    country: 'Italy', 
    deal: 'Save on Colosseum tours', 
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80'
  },
  { 
    name: 'Tokyo', 
    country: 'Japan', 
    deal: 'Special winter offers', 
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80'
  },
  { 
    name: 'Barcelona', 
    country: 'Spain', 
    deal: '15% off experiences', 
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&q=80'
  },
  { 
    name: 'New York', 
    country: 'USA', 
    deal: 'Broadway & more deals', 
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80'
  },
  { 
    name: 'London', 
    country: 'United Kingdom', 
    deal: 'Royal palaces & more', 
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80'
  },
  { 
    name: 'Lisbon', 
    country: 'Portugal', 
    deal: 'Coastal adventures', 
    image: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=400&q=80'
  },
  { 
    name: 'Bangkok', 
    country: 'Thailand', 
    deal: 'Temples & street food', 
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&q=80'
  },
  { 
    name: 'Santorini', 
    country: 'Greece', 
    deal: 'Stunning island views', 
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&q=80'
  },
];

// ============================================================================
// TOP DESTINATIONS DATA - Organized by region with 15 cities each (3x5 grid)
// ============================================================================

const TOP_DESTINATIONS_DATA = {
  'North America': [
    { name: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=100&h=100&fit=crop&q=80' },
    { name: 'Los Angeles', country: 'USA', image: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=100&h=100&fit=crop&q=80' },
    { name: 'Miami', country: 'USA', image: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=100&h=100&fit=crop&q=80' },
    { name: 'Las Vegas', country: 'USA', image: 'https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?w=100&h=100&fit=crop&q=80' },
    { name: 'San Francisco', country: 'USA', image: 'https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=100&h=100&fit=crop&q=80' },
    { name: 'Chicago', country: 'USA', image: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=100&h=100&fit=crop&q=80' },
    { name: 'New Orleans', country: 'USA', image: 'https://images.unsplash.com/photo-1571893544028-06b07af6dade?w=100&h=100&fit=crop&q=80' },
    { name: 'Toronto', country: 'Canada', image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=100&h=100&fit=crop&q=80' },
    { name: 'Vancouver', country: 'Canada', image: 'https://images.unsplash.com/photo-1560813962-ff3d8fcf59ba?w=100&h=100&fit=crop&q=80' },
    { name: 'Montreal', country: 'Canada', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&q=80' },
    { name: 'Cancun', country: 'Mexico', image: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=100&h=100&fit=crop&q=80' },
    { name: 'Mexico City', country: 'Mexico', image: 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=100&h=100&fit=crop&q=80' },
    { name: 'Honolulu', country: 'USA', image: 'https://images.unsplash.com/photo-1598135753163-6167c1a1ad65?w=100&h=100&fit=crop&q=80' },
    { name: 'Orlando', country: 'USA', image: 'https://images.unsplash.com/photo-1597466599360-3b9775841aec?w=100&h=100&fit=crop&q=80' },
    { name: 'Washington DC', country: 'USA', image: 'https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=100&h=100&fit=crop&q=80' },
  ],
  'Europe': [
    { name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=100&h=100&fit=crop&q=80' },
    { name: 'London', country: 'UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=100&h=100&fit=crop&q=80' },
    { name: 'Rome', country: 'Italy', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=100&h=100&fit=crop&q=80' },
    { name: 'Barcelona', country: 'Spain', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=100&h=100&fit=crop&q=80' },
    { name: 'Amsterdam', country: 'Netherlands', image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=100&h=100&fit=crop&q=80' },
    { name: 'Prague', country: 'Czech Republic', image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=100&h=100&fit=crop&q=80' },
    { name: 'Lisbon', country: 'Portugal', image: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=100&h=100&fit=crop&q=80' },
    { name: 'Vienna', country: 'Austria', image: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=100&h=100&fit=crop&q=80' },
    { name: 'Berlin', country: 'Germany', image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=100&h=100&fit=crop&q=80' },
    { name: 'Athens', country: 'Greece', image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=100&h=100&fit=crop&q=80' },
    { name: 'Dublin', country: 'Ireland', image: 'https://images.unsplash.com/photo-1549918864-48ac978761a4?w=100&h=100&fit=crop&q=80' },
    { name: 'Florence', country: 'Italy', image: 'https://images.unsplash.com/photo-1543429257-3eb0b65d9c58?w=100&h=100&fit=crop&q=80' },
    { name: 'Venice', country: 'Italy', image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=100&h=100&fit=crop&q=80' },
    { name: 'Santorini', country: 'Greece', image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=100&h=100&fit=crop&q=80' },
    { name: 'Edinburgh', country: 'Scotland', image: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=100&h=100&fit=crop&q=80' },
  ],
  'Africa': [
    { name: 'Marrakech', country: 'Morocco', image: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=100&h=100&fit=crop&q=80' },
    { name: 'Cape Town', country: 'South Africa', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=100&h=100&fit=crop&q=80' },
    { name: 'Cairo', country: 'Egypt', image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=100&h=100&fit=crop&q=80' },
    { name: 'Nairobi', country: 'Kenya', image: 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=100&h=100&fit=crop&q=80' },
    { name: 'Casablanca', country: 'Morocco', image: 'https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=100&h=100&fit=crop&q=80' },
    { name: 'Johannesburg', country: 'South Africa', image: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=100&h=100&fit=crop&q=80' },
    { name: 'Zanzibar', country: 'Tanzania', image: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=100&h=100&fit=crop&q=80' },
    { name: 'Victoria Falls', country: 'Zimbabwe', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=100&h=100&fit=crop&q=80' },
    { name: 'Luxor', country: 'Egypt', image: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=100&h=100&fit=crop&q=80' },
    { name: 'Fes', country: 'Morocco', image: 'https://images.unsplash.com/photo-1579017331263-ef82f0bbc748?w=100&h=100&fit=crop&q=80' },
    { name: 'Kruger Park', country: 'South Africa', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=100&h=100&fit=crop&q=80' },
    { name: 'Serengeti', country: 'Tanzania', image: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=100&h=100&fit=crop&q=80' },
    { name: 'Accra', country: 'Ghana', image: 'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?w=100&h=100&fit=crop&q=80' },
    { name: 'Dakar', country: 'Senegal', image: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=100&h=100&fit=crop&q=80' },
    { name: 'Kigali', country: 'Rwanda', image: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=100&h=100&fit=crop&q=80' },
  ],
  'Central & South America': [
    { name: 'Rio de Janeiro', country: 'Brazil', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=100&h=100&fit=crop&q=80' },
    { name: 'Buenos Aires', country: 'Argentina', image: 'https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=100&h=100&fit=crop&q=80' },
    { name: 'Lima', country: 'Peru', image: 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=100&h=100&fit=crop&q=80' },
    { name: 'Cusco', country: 'Peru', image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=100&h=100&fit=crop&q=80' },
    { name: 'Cartagena', country: 'Colombia', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=100&h=100&fit=crop&q=80' },
    { name: 'Bogota', country: 'Colombia', image: 'https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?w=100&h=100&fit=crop&q=80' },
    { name: 'Santiago', country: 'Chile', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=100&h=100&fit=crop&q=80' },
    { name: 'Medellin', country: 'Colombia', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=100&h=100&fit=crop&q=80' },
    { name: 'Sao Paulo', country: 'Brazil', image: 'https://images.unsplash.com/photo-1554168848-228452c09d60?w=100&h=100&fit=crop&q=80' },
    { name: 'Montevideo', country: 'Uruguay', image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=100&h=100&fit=crop&q=80' },
    { name: 'San Jose', country: 'Costa Rica', image: 'https://images.unsplash.com/photo-1580977276076-ae4b8c219b8e?w=100&h=100&fit=crop&q=80' },
    { name: 'Panama City', country: 'Panama', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop&q=80' },
    { name: 'Quito', country: 'Ecuador', image: 'https://images.unsplash.com/photo-1501761095094-94d36f57edbb?w=100&h=100&fit=crop&q=80' },
    { name: 'Havana', country: 'Cuba', image: 'https://images.unsplash.com/photo-1500759285222-a95626b934cb?w=100&h=100&fit=crop&q=80' },
    { name: 'Galapagos', country: 'Ecuador', image: 'https://images.unsplash.com/photo-1544979590-37e9b47eb705?w=100&h=100&fit=crop&q=80' },
  ],
  'Asia': [
    { name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=100&h=100&fit=crop&q=80' },
    { name: 'Bangkok', country: 'Thailand', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=100&h=100&fit=crop&q=80' },
    { name: 'Singapore', country: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=100&h=100&fit=crop&q=80' },
    { name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=100&h=100&fit=crop&q=80' },
    { name: 'Hong Kong', country: 'China', image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=100&h=100&fit=crop&q=80' },
    { name: 'Seoul', country: 'South Korea', image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=100&h=100&fit=crop&q=80' },
    { name: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100&h=100&fit=crop&q=80' },
    { name: 'Phuket', country: 'Thailand', image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=100&h=100&fit=crop&q=80' },
    { name: 'Hanoi', country: 'Vietnam', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=100&h=100&fit=crop&q=80' },
    { name: 'Kyoto', country: 'Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=100&h=100&fit=crop&q=80' },
    { name: 'Mumbai', country: 'India', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=100&h=100&fit=crop&q=80' },
    { name: 'Beijing', country: 'China', image: 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?w=100&h=100&fit=crop&q=80' },
    { name: 'Kuala Lumpur', country: 'Malaysia', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=100&h=100&fit=crop&q=80' },
    { name: 'Siem Reap', country: 'Cambodia', image: 'https://images.unsplash.com/photo-1600481176431-47ad2ab2745d?w=100&h=100&fit=crop&q=80' },
    { name: 'Taipei', country: 'Taiwan', image: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=100&h=100&fit=crop&q=80' },
  ],
  'Australia & The Pacific': [
    { name: 'Sydney', country: 'Australia', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=100&q=80' },
    { name: 'Melbourne', country: 'Australia', image: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=100&q=80' },
    { name: 'Queenstown', country: 'New Zealand', image: 'https://images.unsplash.com/photo-1469521669194-babb45599def?w=100&q=80' },
    { name: 'Brisbane', country: 'Australia', image: 'https://images.unsplash.com/photo-1566734904496-9309bb1798ae?w=100&q=80' },
    { name: 'Gold Coast', country: 'Australia', image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=100&q=80' },
    { name: 'Cairns', country: 'Australia', image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=100&q=80' },
    { name: 'Great Barrier Reef', country: 'Australia', image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=100&q=80' },
    { name: 'Bora Bora', country: 'French Polynesia', image: 'https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?w=100&q=80' },
    { name: 'Adelaide', country: 'Australia', image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=100&q=80' },
    { name: 'Auckland', country: 'New Zealand', image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=100&h=100&fit=crop&q=80' },
    { name: 'Fiji', country: 'Fiji', image: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=100&h=100&fit=crop&q=80' },
    { name: 'Perth', country: 'Australia', image: 'https://images.unsplash.com/photo-1517821362941-f7f753200fef?w=100&h=100&fit=crop&q=80' },
    { name: 'Cairns', country: 'Australia', image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=100&h=100&fit=crop&q=80' },
    { name: 'Rotorua', country: 'New Zealand', image: 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=100&h=100&fit=crop&q=80' },
    { name: 'Tahiti', country: 'French Polynesia', image: 'https://images.unsplash.com/photo-1516815231560-8f41ec531527?w=100&h=100&fit=crop&q=80' }
  ],
};

const REGION_LIST = [
  'North America',
  'Europe', 
  'Africa',
  'Central & South America',
  'Asia',
  'Australia & The Pacific',
];

// ============================================================================
// LANDING PAGE COMPONENT
// ============================================================================

export default function LandingPage({ 
  onSearch,
  onSearchDeals,
  onOpenWhereIsThis,
  onOpenChat,
  onOpenTripBuilder,
  onOpenProductPage,
  cart = { tours: [], hotels: [], flights: [] },
  removeFromCart,
  formatCurrency = (amount) => `$${(amount || 0).toFixed(2)}`,
  onCheckout,
  isLoading = false,
  backendUrl
}) {
  const [activeTab, setActiveTab] = useState('tours');
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState(2);

  // Hotel-specific state
  const [hotelDestination, setHotelDestination] = useState('');
  const [hotelCheckIn, setHotelCheckIn] = useState('');
  const [hotelCheckOut, setHotelCheckOut] = useState('');
  const [hotelGuests, setHotelGuests] = useState(2);
  const [hotelRooms, setHotelRooms] = useState(1);
  const [hotelSuggestions, setHotelSuggestions] = useState([]);
  const [showHotelSuggestions, setShowHotelSuggestions] = useState(false);
  const [loadingHotelSuggestions, setLoadingHotelSuggestions] = useState(false);
  const [hotelSelectedIndex, setHotelSelectedIndex] = useState(-1);
  const [selectedHotelDestinationCode, setSelectedHotelDestinationCode] = useState(null);
  const hotelDestinationInputRef = useRef(null);
  const hotelSuggestionsRef = useRef(null);
  const justSelectedHotelRef = useRef(false);
  const carouselRef = useRef(null);

  // Cart sidebar state
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  
  // Top Destinations mega menu state
  const [showDestinationsMenu, setShowDestinationsMenu] = useState(false);
  const [activeRegion, setActiveRegion] = useState(null);
  const [showMobileDestinations, setShowMobileDestinations] = useState(false);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedDestinationId, setSelectedDestinationId] = useState(null);
  
  // Where Is This state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [identifyingLocation, setIdentifyingLocation] = useState(false);
  const [identifiedLocation, setIdentifiedLocation] = useState(null);
  
  const destinationInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const fileInputRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const justSelectedRef = useRef(false);

  // Prefetch on hover - start loading after 200ms hover
  const handleDestinationHover = useCallback((destName) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      console.log(`🎯 Hover prefetch triggered for "${destName}"`);
      prewarmDestination(backendUrl, destName);
    }, 200);
  }, [backendUrl]);

  // Hero carousel auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000); // Change every 6 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleDestinationHoverEnd = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        destinationInputRef.current && 
        !destinationInputRef.current.contains(e.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================================================
  // DESTINATION AUTOCOMPLETE
  // ============================================================================

  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    if (!destination || destination.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const response = await fetch(
          `${backendUrl}/api/tours/destinations/autocomplete?q=${encodeURIComponent(destination)}`,
          { signal: controller.signal }
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
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
  }, [destination, backendUrl]);

  const handleSelectSuggestion = useCallback((suggestion) => {
    justSelectedRef.current = true;
    setDestination(suggestion.displayName || suggestion.name);
    setSelectedDestinationId(suggestion.destinationId);
    setShowSuggestions(false);
    setSuggestions([]);
  }, []);

  // ============================================================================
  // HOTEL DESTINATION AUTOCOMPLETE
  // ============================================================================

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        hotelDestinationInputRef.current &&
        !hotelDestinationInputRef.current.contains(e.target) &&
        hotelSuggestionsRef.current &&
        !hotelSuggestionsRef.current.contains(e.target)
      ) {
        setShowHotelSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (justSelectedHotelRef.current) {
      justSelectedHotelRef.current = false;
      return;
    }

    if (!hotelDestination || hotelDestination.length < 2) {
      setHotelSuggestions([]);
      setShowHotelSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoadingHotelSuggestions(true);
      try {
        const response = await fetch(
          `${backendUrl}/api/hotels/destinations/autocomplete?q=${encodeURIComponent(hotelDestination)}`,
          { signal: controller.signal }
        );
        if (response.ok) {
          const data = await response.json();
          setHotelSuggestions(data.suggestions || []);
          setShowHotelSuggestions(true);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Hotel autocomplete error:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingHotelSuggestions(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [hotelDestination, backendUrl]);

  const handleSelectHotelSuggestion = useCallback((suggestion) => {
    justSelectedHotelRef.current = true;
    setHotelDestination(suggestion.displayName || suggestion.name);
    setSelectedHotelDestinationCode(suggestion.code);
    setShowHotelSuggestions(false);
    setHotelSuggestions([]);
  }, []);

  const handleHotelDestinationKeyDown = useCallback((e) => {
    if (!showHotelSuggestions || hotelSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHotelSelectedIndex(prev => Math.min(prev + 1, hotelSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHotelSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && hotelSelectedIndex >= 0) {
      e.preventDefault();
      handleSelectHotelSuggestion(hotelSuggestions[hotelSelectedIndex]);
    } else if (e.key === 'Escape') {
      setShowHotelSuggestions(false);
    }
  }, [showHotelSuggestions, hotelSuggestions, hotelSelectedIndex, handleSelectHotelSuggestion]);

  const handleDestinationKeyDown = useCallback((e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, [showSuggestions, suggestions, selectedIndex, handleSelectSuggestion]);

  // ============================================================================
  // TOP DESTINATIONS MEGA MENU HANDLERS
  // ============================================================================

  // Handle city hover - prewarm cache
  const handleCityHover = useCallback((city) => {
    const destinationString = `${city.name}, ${city.country}`;
    console.log(`Prewarming cache for: ${destinationString}`);
    prewarmDestination(backendUrl, destinationString);
  }, [backendUrl]);

  // Handle city click - search and navigate to SDP
  const handleCityClick = useCallback((city) => {
    const destinationString = `${city.name}, ${city.country}`;
    setShowDestinationsMenu(false);
    setActiveRegion(null);
    
    // Trigger the search
    onSearch?.({
      type: 'tours',
      destination: destinationString,
      travelers: travelers
    });
  }, [onSearch, travelers]);

  // ============================================================================
  // SEARCH HANDLERS
  // ============================================================================

  const handleToursSearch = useCallback((e) => {
    e?.preventDefault();
    if (!destination.trim()) return;

    let validStartDate = startDate;
    let validEndDate = endDate;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);

      if (start < today || end < start || start > maxDate) {
        console.warn('Dates invalid or too far out, searching without date filter');
        validStartDate = undefined;
        validEndDate = undefined;
      }
    }

    onSearch?.({
      type: 'tours',
      destination: destination.trim(),
      destinationId: selectedDestinationId,
      travelers,
      ...(validStartDate && validEndDate 
        ? { startDate: validStartDate, endDate: validEndDate } 
        : {})
    });
  }, [destination, selectedDestinationId, travelers, startDate, endDate, onSearch]);

  const scrollCarousel = useCallback((direction) => {
    if (!carouselRef.current) return;
    
    const container = carouselRef.current;
    const cardWidth = container.querySelector('div[data-card]')?.offsetWidth || 280;
    const gap = 16;
    const scrollAmount = (cardWidth + gap) * 2;
    
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }, []);

  const handleHotelsSearch = useCallback((e) => {
    e?.preventDefault();
    if (!hotelDestination.trim() || !hotelCheckIn || !hotelCheckOut) return;

    onSearch?.({
      type: 'hotels',
      destination: hotelDestination.trim(),
      destinationCode: selectedHotelDestinationCode,
      checkIn: hotelCheckIn,
      checkOut: hotelCheckOut,
      guests: hotelGuests,
      rooms: hotelRooms
    });
  }, [hotelDestination, selectedHotelDestinationCode, hotelCheckIn, hotelCheckOut, hotelGuests, hotelRooms, onSearch]);

  const handleDealsSearch = useCallback((cityName) => {
    onSearchDeals?.(cityName);
  }, [onSearchDeals]);

  const handleFeaturedDealClick = useCallback((dest) => {
    onSearchDeals?.(dest.name);
  }, [onSearchDeals]);

  // ============================================================================
  // WHERE IS THIS - IMAGE UPLOAD HANDLERS
  // ============================================================================

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  const processImageFile = async (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    setUploadedImage(file);
    setIdentifiedLocation(null);
    
    await identifyLocation(file);
  };

  const identifyLocation = async (file) => {
    setIdentifyingLocation(true);
    
    try {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      const response = await fetch(`${backendUrl}/api/identify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      });

      if (!response.ok) throw new Error('Identification failed');

      const data = await response.json();
      setIdentifiedLocation(data);
      
    } catch (error) {
      console.error('Location identification error:', error);
      setIdentifiedLocation({ error: true, message: 'Could not identify location. Try another image.' });
    } finally {
      setIdentifyingLocation(false);
    }
  };

  const handleSearchIdentifiedLocation = () => {
    if (identifiedLocation?.destination) {
      const destName = typeof identifiedLocation.destination === 'object'
        ? (identifiedLocation.destination.fullName || identifiedLocation.destination.name)
        : identifiedLocation.destination;

      onSearch?.({
        type: 'tours',
        destination: destName,
        travelers
      });
    }
  };

  const handleSearchIdentifiedLocationHotels = () => {
    if (identifiedLocation?.destination) {
      const destName = typeof identifiedLocation.destination === 'object'
        ? (identifiedLocation.destination.fullName || identifiedLocation.destination.name)
        : identifiedLocation.destination;

      onSearch?.({
        type: 'hotels',
        destination: destName,
        guests: hotelGuests,
        rooms: hotelRooms
      });
    }
  };

  const resetWhereIsThis = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setIdentifiedLocation(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const tripItemCount = useMemo(() =>
    cart.tours.length + cart.hotels.length + cart.flights.length,
    [cart.tours.length, cart.hotels.length, cart.flights.length]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================================================================== */}
      {/* HERO SECTION */}
      {/* ================================================================== */}
      <div className="relative h-[70vh] min-h-[550px] overflow-hidden">
        {/* Background Images - Carousel */}
        {HERO_IMAGES.map((hero, index) => (
          <div
            key={hero.location}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              index === currentHeroIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${hero.url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
          </div>
        ))}

        {/* Top Navigation */}
        <nav className={`relative flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 ${showDestinationsMenu ? 'z-50' : 'z-10'}`}>
          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <span className="text-lg sm:text-xl font-bold text-white tracking-tight">Viaggio</span>
            </div>

            {/* Mobile Top Destinations Button */}
            <button
              onClick={() => setShowMobileDestinations(true)}
              className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm font-medium"
            >
              <MapPin className="w-4 h-4" />
              <span>Explore</span>
            </button>

            {/* Top Destinations Dropdown - Desktop only */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => {
                  setShowDestinationsMenu(!showDestinationsMenu);
                  if (!showDestinationsMenu) {
                    setActiveRegion('North America');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm font-medium"
              >
                Top Destinations
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDestinationsMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega Menu Dropdown */}
              {showDestinationsMenu && (
                <>
                  {/* Invisible overlay to catch outside clicks */}
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => {
                      setShowDestinationsMenu(false);
                      setActiveRegion(null);
                    }}
                  />
                  
                  {/* The actual dropdown menu */}
                  <div className="absolute top-full left-0 mt-2 flex bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in z-50">
                    {/* Regions List */}
                    <div className="w-60 bg-white border-r border-gray-100">
                      <div className="px-5 py-4 border-b border-gray-100">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                          Top Destinations
                        </h3>
                      </div>
                      <div className="py-2">
                        {REGION_LIST.map((region) => (
                          <button
                            key={region}
                            onClick={() => setActiveRegion(region)}
                            onMouseEnter={() => setActiveRegion(region)}
                            className={`w-full px-5 py-3 text-left text-[15px] transition-colors flex items-center justify-between ${
                              activeRegion === region
                                ? 'text-blue-600 font-bold bg-blue-50/50'
                                : 'text-gray-700 hover:text-gray-900 font-semibold hover:bg-gray-50'
                            }`}
                          >
                            <span>{region}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cities Grid Panel with Images */}
                    {activeRegion && (
                      <div className="w-[720px] p-5 bg-gray-50/50">
                        <div className="grid grid-cols-3 gap-x-6 gap-y-3">
                          {TOP_DESTINATIONS_DATA[activeRegion]?.map((city, idx) => (
                            <button
                              key={idx}
                              onMouseEnter={() => handleCityHover(city)}
                              onClick={() => handleCityClick(city)}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all group text-left"
                            >
                              {/* Circular Image */}
                              <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all">
                                <img
                                  src={city.image}
                                  alt={city.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              {/* Text */}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-blue-700 group-hover:text-blue-800">
                                  {city.name} Tours
                                </p>
                                <p className="text-xs text-gray-500 font-medium">
                                  Destination in {city.country}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => setCartSidebarOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all flex-shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">My Trip</span>
            {tripItemCount > 0 && (
              <span className="bg-green-500 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                {tripItemCount}
              </span>
            )}
          </button>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full pt-2 sm:pt-4 px-3 sm:px-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-1 sm:mb-2 drop-shadow-lg">
            Discover Your Next Adventure
          </h1>
          <p className="text-sm sm:text-lg text-white/90 mb-4 sm:mb-8 drop-shadow text-center">
            Find and book amazing tours & experiences worldwide
          </p>

          {/* Search Panel with Integrated Tabs */}
          <div className="w-full max-w-3xl">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl">
              {/* Tab Navigation */}
              <div className="flex items-center justify-center gap-1 px-2 pt-3 pb-2 border-b border-gray-100 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveTab('tours')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === 'tours'
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <MapPin className={`w-4 h-4 transition-colors duration-300 ${activeTab === 'tours' ? 'text-blue-500' : ''}`} />
                  <span className="hidden sm:inline">Tours & Experiences</span>
                  <span className="sm:hidden">Tours</span>
                </button>
                <button
                  onClick={() => setActiveTab('hotels')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === 'hotels'
                      ? 'bg-purple-50 text-purple-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Hotel className={`w-4 h-4 transition-colors duration-300 ${activeTab === 'hotels' ? 'text-purple-500' : ''}`} />
                  Hotels
                </button>
                <button
                  onClick={() => setActiveTab('whereis')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === 'whereis'
                      ? 'bg-cyan-50 text-cyan-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Camera className={`w-4 h-4 transition-colors duration-300 ${activeTab === 'whereis' ? 'text-cyan-500' : ''}`} />
                  <span className="hidden sm:inline">Where is This?</span>
                  <span className="sm:hidden">Identify</span>
                </button>
                <button
                  onClick={() => setActiveTab('deals')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === 'deals'
                      ? 'bg-orange-50 text-orange-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Tag className={`w-4 h-4 transition-colors duration-300 ${activeTab === 'deals' ? 'text-orange-500' : ''}`} />
                  Deals
                </button>
              </div>

              {/* Tab Content */}
              <div className="relative p-1.5 sm:p-2">
                {/* Tours Search Tab */}
                <div className={`transition-all duration-300 ease-in-out ${
                  activeTab === 'tours'
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 absolute inset-0 pointer-events-none translate-y-2'
                }`}>
                  {activeTab === 'tours' && (
                    <form onSubmit={handleToursSearch} className="flex flex-col sm:flex-row items-stretch">
                      <div className="flex-1 relative" ref={destinationInputRef}>
                        <div className="flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-200">
                          <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium">Where</p>
                            <input 
                              type="text"
                              placeholder="Search destination"
                              value={destination}
                              onChange={(e) => {
                                setDestination(e.target.value);
                                setSelectedDestinationId(null);
                              }}
                              onKeyDown={handleDestinationKeyDown}
                              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                              className="w-full text-gray-900 placeholder-gray-400 focus:outline-none"
                              autoComplete="off"
                            />
                          </div>
                          {loadingSuggestions && (
                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                          )}
                        </div>

                        {showSuggestions && suggestions.length > 0 && (
                          <div
                            ref={suggestionsRef}
                            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto"
                          >
                            {suggestions.map((suggestion, index) => {
                              const displayName = typeof suggestion?.displayName === 'string'
                                ? suggestion.displayName
                                : (typeof suggestion?.name === 'string' ? suggestion.name : 'Unknown');
                              const parentName = suggestion?.parentName || null;

                              return (
                                <button
                                  key={suggestion?.destinationId || index}
                                  type="button"
                                  onClick={() => handleSelectSuggestion(suggestion)}
                                  className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                                    index === selectedIndex ? 'bg-blue-50' : ''
                                  } ${index === 0 ? 'rounded-t-xl' : ''} ${
                                    index === suggestions.length - 1 ? 'rounded-b-xl' : ''
                                  }`}
                                >
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{displayName}</p>
                                    {parentName && (
                                      <p className="text-xs text-gray-500">{parentName}</p>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-200">
                        <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">Dates (optional)</p>
                          <div className="flex items-center gap-1">
                            <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="text-gray-900 focus:outline-none bg-transparent text-sm w-[110px]"
                            />
                            <span className="text-gray-400 text-sm">-</span>
                            <input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              min={startDate || new Date().toISOString().split('T')[0]}
                              className="text-gray-900 focus:outline-none bg-transparent text-sm w-[110px]"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Travelers</p>
                          <div className="relative">
                            <select
                              value={travelers}
                              onChange={(e) => setTravelers(parseInt(e.target.value))}
                              className="text-gray-900 focus:outline-none bg-transparent appearance-none pr-6 cursor-pointer"
                            >
                              {[1,2,3,4,5,6,7,8].map(n => (
                                <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={!destination.trim() || isLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-4 rounded-xl transition-colors m-1 flex items-center justify-center"
                        title={!destination.trim() ? 'Please enter a destination' : ''}
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Search className="w-5 h-5" />
                        )}
                      </button>
                    </form>
                  )}
                </div>

                {/* Hotels Search Tab */}
                <div className={`transition-all duration-300 ease-in-out ${
                  activeTab === 'hotels'
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 absolute inset-0 pointer-events-none translate-y-2'
                }`}>
                  {activeTab === 'hotels' && (
                    <form onSubmit={handleHotelsSearch} className="flex flex-col sm:flex-row items-stretch">
                      <div className="flex-1 relative" ref={hotelDestinationInputRef}>
                        <div className="flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-200">
                          <Hotel className="w-5 h-5 text-purple-500 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium">Destination</p>
                            <input
                              type="text"
                              placeholder="City or hotel name"
                              value={hotelDestination}
                              onChange={(e) => {
                                setHotelDestination(e.target.value);
                                setSelectedHotelDestinationCode(null);
                              }}
                              onKeyDown={handleHotelDestinationKeyDown}
                              onFocus={() => hotelSuggestions.length > 0 && setShowHotelSuggestions(true)}
                              className="w-full text-gray-900 placeholder-gray-400 focus:outline-none"
                              autoComplete="off"
                            />
                          </div>
                          {loadingHotelSuggestions && (
                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                          )}
                        </div>

                        {showHotelSuggestions && hotelSuggestions.length > 0 && (
                          <div
                            ref={hotelSuggestionsRef}
                            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto"
                          >
                            {hotelSuggestions.map((suggestion, index) => {
                              const locationSubtitle = suggestion.parentName
                                || suggestion.countryName
                                || (suggestion.countryCode ? suggestion.countryCode : null);

                              return (
                                <button
                                  key={suggestion?.code || index}
                                  type="button"
                                  onClick={() => handleSelectHotelSuggestion(suggestion)}
                                  className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                                    index === hotelSelectedIndex ? 'bg-purple-50' : ''
                                  } ${index === 0 ? 'rounded-t-xl' : ''} ${
                                    index === hotelSuggestions.length - 1 ? 'rounded-b-xl' : ''
                                  }`}
                                >
                                  <MapPin className="w-4 h-4 text-purple-400" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {suggestion.displayName || suggestion.name}
                                    </p>
                                    {locationSubtitle && (
                                      <p className="text-xs text-gray-500">{locationSubtitle}</p>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-200">
                        <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">Check-in / Check-out</p>
                          <div className="flex items-center gap-1">
                            <input
                              type="date"
                              value={hotelCheckIn}
                              onChange={(e) => setHotelCheckIn(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="text-gray-900 focus:outline-none bg-transparent text-sm w-[110px]"
                            />
                            <span className="text-gray-400 text-sm">-</span>
                            <input
                              type="date"
                              value={hotelCheckOut}
                              onChange={(e) => setHotelCheckOut(e.target.value)}
                              min={hotelCheckIn || new Date().toISOString().split('T')[0]}
                              className="text-gray-900 focus:outline-none bg-transparent text-sm w-[110px]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 px-4 py-3">
                        <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex gap-3">
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Guests</p>
                            <div className="relative">
                              <select
                                value={hotelGuests}
                                onChange={(e) => setHotelGuests(parseInt(e.target.value))}
                                className="text-gray-900 focus:outline-none bg-transparent appearance-none pr-5 cursor-pointer text-sm"
                              >
                                {[1,2,3,4,5,6].map(n => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                              <ChevronDown className="w-3 h-3 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Rooms</p>
                            <div className="relative">
                              <select
                                value={hotelRooms}
                                onChange={(e) => setHotelRooms(parseInt(e.target.value))}
                                className="text-gray-900 focus:outline-none bg-transparent appearance-none pr-5 cursor-pointer text-sm"
                              >
                                {[1,2,3,4].map(n => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                              <ChevronDown className="w-3 h-3 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!hotelDestination.trim() || !hotelCheckIn || !hotelCheckOut || isLoading}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-4 rounded-xl transition-colors m-1 flex items-center justify-center"
                        title={!hotelCheckIn || !hotelCheckOut ? 'Please select check-in and check-out dates' : ''}
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Search className="w-5 h-5" />
                        )}
                      </button>
                    </form>
                  )}
                </div>

                {/* Where Is This Tab */}
                <div className={`transition-all duration-300 ease-in-out ${
                  activeTab === 'whereis'
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 absolute inset-0 pointer-events-none translate-y-2'
                }`}>
                  {activeTab === 'whereis' && (
                    <div className="p-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      
                      {!imagePreview ? (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                            isDragging 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                              isDragging ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <Camera className={`w-8 h-8 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
                            </div>
                            <div>
                              <p className="text-gray-900 font-medium">
                                {isDragging ? 'Drop your image here!' : 'Upload a photo to identify the location'}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Drag & drop or click to browse
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                          <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                            <img 
                              src={imagePreview} 
                              alt="Uploaded" 
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={resetWhereIsThis}
                              className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </div>
                          
                          <div className="flex-1 text-center sm:text-left">
                            {identifyingLocation ? (
                              <div className="flex items-center gap-3 justify-center sm:justify-start">
                                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                <div>
                                  <p className="text-gray-900 font-medium">Identifying location...</p>
                                  <p className="text-sm text-gray-500">Analyzing your image</p>
                                </div>
                              </div>
                            ) : identifiedLocation?.error ? (
                              <div>
                                <p className="text-gray-900 font-medium">Couldn't identify location</p>
                                <p className="text-sm text-gray-500">{identifiedLocation.message || 'Unable to recognize this location'}</p>
                                <button
                                  onClick={resetWhereIsThis}
                                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  Try another image
                                </button>
                              </div>
                            ) : identifiedLocation?.destination ? (
                              <div>
                                <p className="text-sm text-gray-500">We found it!</p>
                                <p className="text-xl font-bold text-gray-900">
                                  {typeof identifiedLocation.destination === 'object' 
                                    ? (identifiedLocation.destination.fullName || identifiedLocation.destination.name)
                                    : identifiedLocation.destination}
                                </p>
                                {identifiedLocation.landmark && (
                                  <p className="text-sm text-gray-600">📍 {identifiedLocation.landmark}</p>
                                )}
                                {identifiedLocation.confidence && (
                                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                                    identifiedLocation.confidence === 'high' ? 'bg-green-100 text-green-700' :
                                    identifiedLocation.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {identifiedLocation.confidence} confidence
                                  </span>
                                )}
                              </div>
                            ) : identifiedLocation ? (
                              <div>
                                <p className="text-gray-900 font-medium">Location not recognized</p>
                                <p className="text-sm text-gray-500">We couldn't identify a specific destination in this image. Try a photo of a famous landmark or tourist attraction.</p>
                                <button
                                  onClick={resetWhereIsThis}
                                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  Try another image
                                </button>
                              </div>
                            ) : null}
                          </div>
                          
                          {identifiedLocation?.destination && !identifiedLocation.error && (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={handleSearchIdentifiedLocation}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-colors font-medium flex items-center justify-center gap-2 whitespace-nowrap"
                              >
                                <MapPin className="w-4 h-4" />
                                Find Tours
                              </button>
                              <button
                                onClick={handleSearchIdentifiedLocationHotels}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl transition-colors font-medium flex items-center justify-center gap-2 whitespace-nowrap"
                              >
                                <Hotel className="w-4 h-4" />
                                Find Hotels
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Deals Tab */}
                <div className={`transition-all duration-300 ease-in-out ${
                  activeTab === 'deals'
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 absolute inset-0 pointer-events-none translate-y-2'
                }`}>
                  {activeTab === 'deals' && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="flex-1 relative" ref={destinationInputRef}>
                        <div className="flex items-center gap-3 px-4 py-3">
                          <Tag className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium">Find Deals In</p>
                            <input 
                              type="text"
                              placeholder="Enter a city to find deals..."
                              value={destination}
                              onChange={(e) => {
                                setDestination(e.target.value);
                                setSelectedDestinationId(null);
                              }}
                              onKeyDown={(e) => {
                                if (showSuggestions && suggestions.length > 0) {
                                  if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                                    return;
                                  } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    setSelectedIndex(prev => Math.max(prev - 1, -1));
                                    return;
                                  } else if (e.key === 'Enter' && selectedIndex >= 0) {
                                    e.preventDefault();
                                    handleSelectSuggestion(suggestions[selectedIndex]);
                                    return;
                                  } else if (e.key === 'Escape') {
                                    setShowSuggestions(false);
                                    return;
                                  }
                                }
                                if (e.key === 'Enter' && destination.trim()) {
                                  handleDealsSearch(destination.trim());
                                }
                              }}
                              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                              className="w-full text-gray-900 placeholder-gray-400 focus:outline-none"
                              autoComplete="off"
                            />
                          </div>
                          {loadingSuggestions && (
                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                          )}
                        </div>

                        {showSuggestions && suggestions.length > 0 && (
                          <div
                            ref={suggestionsRef}
                            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto"
                          >
                            {suggestions.map((suggestion, index) => {
                              const displayName = typeof suggestion?.displayName === 'string'
                                ? suggestion.displayName
                                : (typeof suggestion?.name === 'string' ? suggestion.name : 'Unknown');
                              const parentName = suggestion?.parentName || null;

                              return (
                                <button
                                  key={suggestion?.destinationId || index}
                                  type="button"
                                  onClick={() => handleSelectSuggestion(suggestion)}
                                  className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                                    index === selectedIndex ? 'bg-orange-50' : ''
                                  } ${index === 0 ? 'rounded-t-xl' : ''} ${
                                    index === suggestions.length - 1 ? 'rounded-b-xl' : ''
                                  }`}
                                >
                                  <MapPin className="w-4 h-4 text-orange-400" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{displayName}</p>
                                    {parentName && (
                                      <p className="text-xs text-gray-500">{parentName}</p>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => destination.trim() && handleDealsSearch(destination.trim())}
                        disabled={!destination.trim() || isLoading}
                        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-300 text-white px-6 py-4 rounded-xl transition-colors font-medium flex items-center justify-center gap-2 m-1"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Find Deals
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Credit & Navigation Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-4">
          {/* Navigation Dots */}
          <div className="flex gap-2">
            {HERO_IMAGES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentHeroIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentHeroIndex 
                    ? 'bg-white w-6' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Location Credit */}
          <div className="text-white/80 text-xs font-medium backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-full">
            📍 {HERO_IMAGES[currentHeroIndex].location}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* FEATURED EXPERIENCES - Carousel */}
      {/* ================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 mt-4 sm:mt-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Featured Experiences</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => scrollCarousel('left')}
              className="p-1.5 sm:p-2 rounded-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
            <button 
              onClick={() => scrollCarousel('right')}
              className="p-1.5 sm:p-2 rounded-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div 
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2"
        >
          {FEATURED_DESTINATIONS.map((dest, index) => (
            <div
              key={`${dest.name}-${index}`}
              data-card
              onClick={() => handleFeaturedDealClick(dest)}
              onMouseEnter={() => handleDestinationHover(dest.name)}
              onMouseLeave={handleDestinationHoverEnd}
              className="group relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer flex-shrink-0 snap-start"
              style={{ width: 'calc((100% - 64px) / 5)', minWidth: '200px' }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  loading="lazy"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-2.5 sm:p-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{dest.name}</h3>
                <p className="text-xs sm:text-sm text-orange-600 font-medium">{dest.deal}</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 sm:p-4">
                <span className="text-white font-medium flex items-center gap-1 text-sm sm:text-base">
                  View Deals <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================== */}
      {/* VIA CHAT */}
      {/* ================================================================== */}
      <ViaChat
        backendUrl={backendUrl}
        onSearch={onSearch}
        travelers={travelers}
      />

      {/* ================================================================== */}
      {/* FLOATING CART PANEL */}
      {/* ================================================================== */}
      {cartSidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/30"
            onClick={() => setCartSidebarOpen(false)}
          />
          
          <div className="absolute right-4 top-4 bottom-4 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                My Trip ({tripItemCount})
              </h2>
              <button
                onClick={() => setCartSidebarOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3">
              {tripItemCount === 0 ? (
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
                      <div key={tour.id} className="flex gap-2.5 p-2.5 bg-gray-50 rounded-xl group">
                        <div 
                          className="flex gap-2.5 flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            setCartSidebarOpen(false);
                            onOpenProductPage?.(tour);
                          }}
                        >
                          {tour.image && (
                            <img 
                              src={tour.image} 
                              alt="" 
                              loading="lazy" 
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0 group-hover:ring-2 group-hover:ring-blue-400 transition-all" 
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{tour.name}</p>
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
                        </div>
                        {removeFromCart && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromCart('tour', tour.id);
                            }}
                            className="text-gray-400 hover:text-red-500 flex-shrink-0 p-1"
                            aria-label="Remove from cart"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {tripItemCount > 0 && (
              <div className="border-t border-gray-100 p-3 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Total</span>
                    <span className="text-xs text-gray-400 ml-1">for {travelers} guest{travelers > 1 ? 's' : ''}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(cart.tours.reduce((sum, t) => {
                      const price = t.price || 0;
                      return sum + (t.pricingType === 'group' ? price : price * travelers);
                    }, 0))}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCartSidebarOpen(false);
                    if (onCheckout) onCheckout();
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Continue to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MOBILE DESTINATIONS SHEET */}
      {/* ================================================================== */}
      {showMobileDestinations && (
        <MobileDestinationsSheet
          destinationsData={TOP_DESTINATIONS_DATA}
          regionList={REGION_LIST}
          onCityClick={handleCityClick}
          onCityHover={handleCityHover}
          onClose={() => setShowMobileDestinations(false)}
        />
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
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
