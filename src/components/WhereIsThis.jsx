// ============================================================================
// WHERE IS THIS? PANEL - WITH TOUR PRELOADING
// ============================================================================
// Right sidebar panel for identifying travel destinations from images
// Features: Image upload, location identification, AUTOMATIC TOUR PRELOADING
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Camera,
  Compass,
  Loader2,
  X,
  ChevronLeft,
  Sparkles,
  AlertCircle,
  Globe
} from 'lucide-react';

export default function WhereIsThis({ 
  backendUrl, 
  onSearchFlights, 
  onSearchHotels, 
  onSearchTours,
  isOpen,
  onToggle 
}) {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // ============================================================================
  // NEW: Tour Preloading State
  // ============================================================================
  const [preloadedTours, setPreloadedTours] = useState(null);
  const [isPreloading, setIsPreloading] = useState(false);

  // ============================================================================
  // NEW: Preload tours when identification succeeds
  // ============================================================================
  useEffect(() => {
    // Only preload if we have a successful identification and haven't already preloaded
    if (result?.success && result?.destination?.name && !preloadedTours && !isPreloading) {
      const preloadTours = async () => {
        setIsPreloading(true);
        try {
          console.log(`Preloading tours for ${result.destination.name}...`);
          
          const response = await fetch(`${backendUrl}/api/tours/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              destination: result.destination.fullName || result.destination.name,
              destinationId: result.viatorDestinationId || null,
              resultCount: 100,
              sortBy: 'popular'
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            setPreloadedTours({
              tours: data.tours || [],
              totalCount: data.totalCount || 0,
              destination: result.destination.fullName || result.destination.name,
              destinationId: result.viatorDestinationId
            });
            console.log(`✓ Preloaded ${data.tours?.length || 0} tours for ${result.destination.name}`);
          }
        } catch (err) {
          console.error('Tour preload failed:', err);
          // Not critical - user can still click Find Tours manually
        } finally {
          setIsPreloading(false);
        }
      };
      
      preloadTours();
    }
  }, [result, backendUrl, preloadedTours, isPreloading]);

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image too large. Maximum size is 10MB.');
      return;
    }

    setError(null);
    setResult(null);
    setPreloadedTours(null); // Clear previous preloaded tours

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      const input = fileInputRef.current;
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      handleFileSelect({ target: input });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Identify the location
  const identifyLocation = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);
    setPreloadedTours(null); // Clear previous preloaded tours

    try {
      const response = await fetch(`${backendUrl}/api/identify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image })
      });

      if (!response.ok) {
        throw new Error('Failed to identify location');
      }

      const data = await response.json();
      setResult(data);
      // Preloading will start automatically via useEffect
    } catch (err) {
      setError('Could not identify this location. Try a clearer image of a recognizable landmark.');
    } finally {
      setLoading(false);
    }
  };

  // Clear and reset
  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    setPreloadedTours(null); // Clear preloaded tours
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get confidence badge color
  const getConfidenceColor = (confidence) => {
    switch (confidence?.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // ============================================================================
  // NEW: Handle Find Tours click with preloaded data
  // ============================================================================
  const handleFindTours = () => {
    onSearchTours?.(
      result.destination?.fullName || result.destination?.name,
      result.viatorDestinationId,
      preloadedTours // Pass preloaded tours data
    );
  };

  return (
    <>
      {/* Toggle Button - Always in DOM, fades in/out */}
      <button
        onClick={onToggle}
        className={`hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 bg-purple-600 text-white p-2 rounded-l-lg shadow-lg hover:bg-purple-700 transition-all duration-300 z-40 flex-col items-center gap-1 ${
          isOpen ? 'opacity-0 pointer-events-none translate-x-full' : 'opacity-100 translate-x-0'
        }`}
        aria-label="Open Where Is This panel"
      >
        <ChevronLeft className="w-5 h-5" />
        <MapPin className="w-5 h-5" />
        <span className="text-xs font-medium [writing-mode:vertical-lr] rotate-180">
          Where Is This?
        </span>
      </button>

      {/* Panel - Always in DOM, animates width */}
      <div 
        className={`hidden md:flex flex-col bg-white border-l border-gray-200 shadow-lg transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 ${
          isOpen ? 'w-80 opacity-100' : 'w-0 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Where Is This?</h2>
              <p className="text-xs text-gray-500">Upload a photo to identify</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!imagePreview ? (
            /* Upload Zone */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-purple-200 rounded-xl p-6 text-center hover:border-purple-400 hover:bg-purple-50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-purple-100 rounded-full">
                  <Camera className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-700">
                    Drop an image here
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    or click to browse
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  JPG, PNG up to 10MB
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Image Preview */}
              <div className="relative rounded-xl overflow-hidden">
                <img 
                  src={imagePreview} 
                  alt="Uploaded" 
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Identify Button */}
              {!result && !loading && (
                <button
                  onClick={identifyLocation}
                  disabled={loading}
                  className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  Identify Location
                </button>
              )}

              {/* Loading State */}
              {loading && (
                <div className="py-8 text-center">
                  <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Analyzing image...</p>
                  <p className="text-sm text-gray-400 mt-1">Using AI to identify landmarks</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-700">{error}</p>
                      <button
                        onClick={clearImage}
                        className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Try another image
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Result */}
              {result && result.success && result.destination && (
                <>
                  <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                        <Globe className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-green-600 font-medium mb-1">We found it!</p>
                        <p className="font-bold text-gray-900 text-lg">
                          {result.destination.fullName || result.destination.name}
                        </p>
                        
                        {result.landmark && result.destination?.name !== result.landmark && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 flex-shrink-0 text-red-500" />
                            <span className="truncate">{result.landmark}</span>
                          </p>
                        )}
                        
                        {result.confidence && (
                          <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${getConfidenceColor(result.confidence)}`}>
                            {result.confidence} confidence
                          </span>
                        )}
                        
                        {result.reasoning && (
                          <p className="text-xs text-gray-500 mt-2">
                            {result.reasoning}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Start Planning
                    </p>
                    
                    {/* Find Tours Button - WITH PRELOAD STATUS */}
                    <button
                      onClick={handleFindTours}
                      disabled={isPreloading}
                      className={`w-full py-3 px-4 rounded-xl font-medium transition-colors flex items-center gap-3 ${
                        preloadedTours 
                          ? 'bg-green-100 hover:bg-green-200 text-green-800' 
                          : 'bg-green-50 hover:bg-green-100 text-green-700'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${preloadedTours ? 'bg-green-200' : 'bg-green-100'}`}>
                        {isPreloading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Compass className="w-4 h-4" />
                        )}
                      </div>
                      <span className="flex-1 text-left">
                        {isPreloading ? (
                          'Loading Tours...'
                        ) : preloadedTours ? (
                          `Find ${preloadedTours.tours.length} Tours`
                        ) : (
                          'Find Tours & Experiences'
                        )}
                      </span>
                      {preloadedTours && (
                        <span className="text-xs bg-green-200 px-2 py-1 rounded-full">
                          Ready!
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Try Another */}
                  <button
                    onClick={clearImage}
                    className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    ← Try another image
                  </button>
                </>
              )}

              {/* No Result State */}
              {result && !result.success && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-amber-800">Not Identified</p>
                      <p className="text-sm text-amber-700 mt-1">
                        {result.reasoning || "Couldn't identify a specific travel destination in this image."}
                      </p>
                      <p className="text-xs text-amber-600 mt-2">
                        Try a photo with recognizable landmarks, signs, or famous locations.
                      </p>
                      <button
                        onClick={clearImage}
                        className="mt-3 text-sm text-amber-700 hover:text-amber-800 font-medium"
                      >
                        ← Try another image
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
