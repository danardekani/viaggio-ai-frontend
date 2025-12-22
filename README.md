# Viaggio.ai

An AI-powered travel planning platform that helps users discover, plan, and book their perfect trip through an intuitive conversational interface combined with rich search and browsing experiences.

## Overview

Viaggio.ai is a modern travel planning web application that combines conversational AI with comprehensive travel booking functionality. Users can chat with Via, an AI travel expert, to plan trips, search for tours and activities via Viator, browse hotels through Hotelbeds, and build complete itineraries through natural language interaction or direct search.

## Features

### Core Features
- **AI-Powered Trip Planning**: Interactive chat interface with Via, your personal travel expert
- **Tour & Activity Search**: Browse thousands of tours and experiences powered by Viator API
- **Hotel Search**: Explore accommodation options with Hotelbeds integration
- **Product Display Pages**: Detailed tour pages with itineraries, reviews, pricing, and booking info
- **Trip Cart Management**: Build and manage your complete trip itinerary
- **Itinerary Sharing**: Export and share your planned trip

### Search & Discovery
- **Smart Search Panel**: Multi-destination search with date pickers and traveler selection
- **Tag-Based Filtering**: Filter tours by categories (Outdoor, Museums, Food & Drink, etc.)
- **Quick View Modals**: Preview tour and hotel details without leaving search results
- **Deals Discovery**: Featured deals and popular destinations

### Product Display Page (PDP) Features
- **Image Gallery**: High-quality photo carousel with thumbnail navigation
- **Dynamic Pricing**: Per-person and per-group pricing with multi-traveler calculations
- **Multi-Day Tour Support**: Start/end date selection for multi-day experiences
- **Smart Itinerary Display**: Automatic landmark extraction from tour descriptions
- **Meeting & Pickup Info**: Detailed logistics and departure information
- **Reviews Section**: Rating breakdown with expandable review list
- **Cancellation Policies**: Detailed policy information with free cancellation badges
- **Reserve Now & Pay Later**: Flexible booking option explanations

### User Experience
- **Mobile Responsive**: Fully responsive design with mobile-optimized interfaces
- **Lazy Loading**: Code-split components for faster initial load
- **Search Caching**: Cached search results for improved performance
- **Real-time Updates**: Dynamic updates as you build your trip

## Tech Stack

- **React 18.2** - UI framework with hooks and lazy loading
- **Vite 4.3** - Build tool and dev server
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **Lucide React** - Icon library
- **PostCSS & Autoprefixer** - CSS processing

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd viaggio-ai-frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode
```bash
npm run dev
```
The application will start at `http://localhost:5173`

### Production Build
```bash
npm run build
```
Build output will be in the `dist/` directory

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
viaggio-ai-frontend/
├── src/
│   ├── components/
│   │   ├── BookingPage.jsx         # Trip booking confirmation page
│   │   ├── ChatMessage.jsx         # Individual chat message component
│   │   ├── CheckoutPage.jsx        # Checkout flow with payment details
│   │   ├── DealsDiscovery.jsx      # Featured deals and destinations
│   │   ├── HotelCard.jsx           # Hotel listing card component
│   │   ├── HotelQuickViewModal.jsx # Hotel preview modal
│   │   ├── HotelResultsPage.jsx    # Hotel search results page
│   │   ├── ItineraryModal.jsx      # Full itinerary view modal
│   │   ├── LandingPage.jsx         # Homepage with search and discovery
│   │   ├── MobileTripSheet.jsx     # Mobile bottom sheet for trip details
│   │   ├── OptionCard.jsx          # Generic card for flights/hotels/tours
│   │   ├── ProductDisplayPage.jsx  # Tour/activity detail page (PDP)
│   │   ├── QuickViewModal.jsx      # Tour preview modal
│   │   ├── ResultsPage.jsx         # Tour search results with filtering
│   │   ├── SearchPanel.jsx         # Search form with destinations/dates
│   │   ├── Sidebar.jsx             # Desktop sidebar for trip cart
│   │   ├── ViaChat.jsx             # AI chat interface component
│   │   └── WhereIsThis.jsx         # Destination discovery component
│   │
│   ├── utils/
│   │   ├── hotelbedsImages.js      # Hotelbeds image URL construction
│   │   └── searchCache.js          # Search result caching utilities
│   │
│   ├── App.jsx                     # Main application component & routing
│   ├── main.jsx                    # Application entry point
│   └── index.css                   # Global styles and Tailwind directives
│
├── index.html                      # HTML template
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
└── package.json                    # Project dependencies and scripts
```

## Key Components

### App.jsx
Main application container managing:
- Page navigation state (landing, results, PDP, checkout)
- Chat messages and conversation state
- Cart/itinerary management
- Search parameters and results
- API communication with backend

### LandingPage
Homepage featuring:
- Hero section with search panel
- Featured destinations
- Deals discovery section
- Popular tour categories

### ResultsPage
Tour search results page with:
- Grid/list view of tour cards
- Tag-based category filtering
- Sort options (price, rating, duration)
- Horizontal image carousels on cards
- Quick view modal integration

### ProductDisplayPage (PDP)
Comprehensive tour detail page with:
- Image gallery with navigation
- Dynamic pricing calculations
- Multi-day tour date selection
- Smart itinerary rendering (handles various API data formats)
- Meeting/pickup logistics
- Reviews with load-more functionality
- Cancellation policy details
- Reserve Now & Pay Later information

### HotelResultsPage
Hotel search results with:
- Hotel cards with amenities
- Price comparison
- Quick view modals
- Filtering and sorting

### SearchPanel
Multi-purpose search component:
- Destination autocomplete
- Date range selection
- Traveler count
- Search type toggle (tours/hotels)

### ViaChat
AI chat interface:
- Message history
- Real-time AI responses
- Travel recommendation cards
- Natural language trip planning

## API Integration

### Backend API
**URL**: `https://viaggio-ai-backend-production.up.railway.app`

#### Endpoints
- `POST /api/chat` - AI chat for trip planning
- `GET /api/tours/search` - Search tours (Viator)
- `GET /api/tours/:id` - Get tour details
- `GET /api/hotels/search` - Search hotels (Hotelbeds)
- `GET /api/destinations` - Get destination suggestions

### External APIs (via Backend)
- **Viator** - Tours and activities
- **Hotelbeds** - Hotel accommodations

## Data Handling

### Itinerary Smart Parsing
The PDP handles various Viator API data formats:
- Extracts landmark names from descriptions when API returns generic data
- Handles `LOC-` ID strings by falling back to descriptions
- Removes duplicate text when name matches description
- Supports array and string formats for additional info

### Image Optimization
- Constructs optimized image URLs for different sizes
- Supports Viator and Hotelbeds image CDNs
- Lazy loading for performance

### Search Caching
- Caches search results to reduce API calls
- Pre-warms popular destinations
- Automatic cache invalidation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

### Adding New Features
1. Create component in `src/components/`
2. Use Tailwind CSS for styling
3. Add lazy loading for large components in `App.jsx`
4. Update routing logic as needed

### Styling Guidelines
- Use Tailwind utility classes
- Follow existing color scheme (blue-600 primary, emerald-500 success)
- Maintain responsive design patterns
- Use Lucide icons consistently

## License

[Add your license here]

## Contact

[Add contact information or links here]
