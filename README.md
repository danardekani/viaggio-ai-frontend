# Viaggio.ai

An AI-powered travel planning assistant that helps users plan their perfect trip through an intuitive conversational interface.

## Overview

Viaggio.ai is a modern web application that combines conversational AI with travel booking functionality. Users can chat with an AI travel expert to plan their trips, browse flight options, hotels, and tours, and build a complete itinerary through natural language interaction.

## Features

- **Conversational Trip Planning**: Interactive chat interface powered by AI to understand travel preferences
- **Flight Search**: Browse and select flights with detailed information (routes, pricing, stops)
- **Hotel Recommendations**: Explore accommodation options with ratings, amenities, and location details
- **Tour & Activity Booking**: Discover and add local tours and experiences to your itinerary
- **Trip Cart Management**: Build and manage your complete trip itinerary in a sidebar
- **Itinerary Sharing**: Export and share your planned trip via clipboard
- **Mobile Responsive**: Fully responsive design with mobile-optimized bottom sheet interface
- **Real-time Updates**: Dynamic updates as you build your trip

## Tech Stack

- **React 18.2** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
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
│   │   ├── BookingPage.jsx       # Trip booking confirmation page
│   │   ├── ChatMessage.jsx       # Individual chat message component
│   │   ├── ItineraryModal.jsx    # Full itinerary view modal
│   │   ├── MobileTripSheet.jsx   # Mobile bottom sheet for trip details
│   │   ├── OptionCard.jsx        # Card for flights/hotels/tours
│   │   └── Sidebar.jsx           # Desktop sidebar for trip cart
│   ├── App.jsx                   # Main application component
│   ├── main.jsx                  # Application entry point
│   └── index.css                 # Global styles and Tailwind directives
├── index.html                    # HTML template
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
└── package.json                  # Project dependencies and scripts
```

## API Integration

The application connects to a backend API for AI-powered chat functionality:

**Backend URL**: `https://viaggio-ai-backend-production.up.railway.app`

### API Endpoint

- `POST /api/chat` - Send messages and receive AI responses with travel recommendations

The backend handles natural language processing to understand user intent and returns structured responses with commands like `SHOW_FLIGHTS`, `SHOW_HOTELS`, or `SHOW_TOURS`.

## Key Components

### App.jsx
Main application container managing:
- Chat messages and conversation state
- Cart/itinerary management
- Modal and sidebar visibility
- API communication with backend

### ChatMessage
Renders individual messages with support for displaying travel options (flights, hotels, tours) as interactive cards.

### Sidebar / MobileTripSheet
Desktop sidebar and mobile bottom sheet for managing trip selections and viewing total cost.

### ItineraryModal
Full-screen modal displaying complete trip details with booking and sharing functionality.

## Development

### Adding New Destinations

Travel data is currently stored in `App.jsx` under `travelDatabase`. To add new destinations:

1. Add a new destination object to `travelDatabase.destinations`
2. Include arrays for `flights`, `hotels`, and `tours`
3. Ensure each item has a unique `id` and proper structure

### Modifying Styles

- Global styles: Edit `src/index.css`
- Tailwind configuration: Modify `tailwind.config.js`
- Component styles: Use Tailwind utility classes in JSX

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

[Add your license here]

## Contact

[Add contact information or links here]
