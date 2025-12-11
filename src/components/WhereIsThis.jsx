// ============================================================================
// WHERE IS THIS? PANEL
// ============================================================================
// Right sidebar panel for identifying travel destinations from images
// Features: Image upload, location identification, quick action buttons
// ============================================================================

import React, { useState, useRef } from 'react';
import {
  MapPin,
  Upload,
  Camera,
  Plane,
  Hotel,
  Compass,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ImageIcon,
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

  // Collapsed state - show toggle button
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 bg-purple-600 text-white p-2 rounded-l-lg shadow-lg hover:bg-purple-700 transition-all duration-300 z-40 flex-col items-center gap-1"
        aria-label="Open Where Is This panel"
      >
        <ChevronLeft className="w-5 h-5" />
        <MapPin className="w-5 h-5" />
        <span className="text-xs font-medium [writing-mode:vertical-lr] rotate-180">
          Where Is This?
        </span>
      </button>
    );
  }

  return (
    <div className="hidden md:flex w-80 bg-white border-l border-gray-200 shadow-lg flex-col transition-all duration-300 ease-in-out flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg flex-shrink-0">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white truncate">Where Is This?</h2>
              <p className="text-xs text-purple-100">Upload a travel photo</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition-colors flex-shrink-0 ml-2"
            aria-label="Close panel"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Upload Area */}
        {!imagePreview ? (
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
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg"
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
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-medium">Couldn't identify</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
                <button
                  onClick={clearImage}
                  className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  ← Try another image
                </button>
              </div>
            )}

            {/* Success Result */}
            {result && result.destination && (
              <>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-gray-900">
                          {result.destination?.fullName || result.landmark}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceColor(result.confidence)}`}>
                          {result.confidence}
                        </span>
                      </div>
                      
                      {result.landmark && result.destination?.name !== result.landmark && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Globe className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{result.landmark}</span>
                        </p>
                      )}
                      
                      {result.reasoning && (
                        <p className="text-xs text-gray-500 mt-2">
                          {result.reasoning}
                        </p>
                      )}
                      
                      {result.travelTips && (
                        <p className="text-xs text-purple-600 mt-2 italic">
                          ✨ {result.travelTips}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Start Planning
                  </p>
                  
                  <button
                    onClick={() => onSearchFlights?.(result.destination?.fullName || result.destination?.name)}
                    className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium transition-colors flex items-center gap-3"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Plane className="w-4 h-4" />
                    </div>
                    <span>Find Flights</span>
                  </button>
                  
                  <button
                    onClick={() => onSearchHotels?.(result.destination?.fullName || result.destination?.name)}
                    className="w-full py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-medium transition-colors flex items-center gap-3"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Hotel className="w-4 h-4" />
                    </div>
                    <span>Find Hotels</span>
                  </button>
                  
                  <button
                    onClick={() => onSearchTours?.(result.destination?.fullName || result.destination?.name)}
                    className="w-full py-3 px-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-medium transition-colors flex items-center gap-3"
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Compass className="w-4 h-4" />
                    </div>
                    <span>Find Tours & Experiences</span>
                  </button>
                </div>

                {/* Try Another */}
                <button
                  onClick={clearImage}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ← Try another image
                </button>
              </>
            )}

            {/* No Result State */}
            {result && !result.destination && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-800">Not Identified</p>
                    <p className="text-sm text-amber-700 mt-1">
                      {result.reasoning || "Couldn't identify a specific travel destination in this image."}
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearImage}
                  className="mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  ← Try another image
                </button>
              </div>
            )}
          </>
        )}

        {/* Tips */}
        {!imagePreview && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Tips for best results
            </h4>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                Use clear photos of landmarks
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                Famous buildings work best
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                Avoid heavily filtered images
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
