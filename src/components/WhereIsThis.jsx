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

  // Clear image and result
  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Identify location
  const identifyLocation = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Extract base64 data (remove data URL prefix)
      const base64Data = image.split(',')[1];
      const mediaType = image.split(';')[0].split(':')[1] || 'image/jpeg';

      const response = await fetch(`${backendUrl}/api/identify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
          media_type: mediaType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to identify location');
      }

      const data = await response.json();
      setResult(data);

    } catch (err) {
      console.error('Identification error:', err);
      setError('Failed to identify location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get confidence badge color
  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Get the searchable destination name (city, not landmark)
  const getSearchDestination = () => {
    if (!result) return '';
    // Prefer fullName (e.g., "Rome, Italy") for better search results
    return result.destination?.fullName || result.destination?.name || result.landmark || '';
  };

  return (
    <div className={`fixed top-0 right-0 h-full z-40 transition-all duration-300 ease-in-out ${
      isOpen ? 'w-80' : 'w-0'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`absolute top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-l-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all ${
          isOpen ? '-left-8' : '-left-8'
        }`}
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Panel Content */}
      <div className={`h-full bg-white shadow-2xl border-l border-gray-200 overflow-hidden ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Where Is This?</h2>
              <p className="text-xs text-white/80">Upload a travel photo</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="h-[calc(100%-80px)] overflow-y-auto p-4 space-y-4">
          {/* Upload Area */}
          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-full">
                  <Upload className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-700">Drop an image here</p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <>
              {/* Image Preview */}
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <img
                  src={imagePreview}
                  alt="Uploaded"
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Identify Button */}
              {!result && !loading && (
                <button
                  onClick={identifyLocation}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  Identify Location
                </button>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center gap-3 py-6">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="text-sm text-gray-600">Analyzing image...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Result */}
              {result && result.success ? (
                <>
                  {/* Success Result */}
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-gray-900">
                            {result.destination?.fullName || result.destination?.name || result.landmark}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${getConfidenceColor(result.confidence)}`}>
                            {result.confidence}
                          </span>
                        </div>
                        
                        {/* Show landmark if different from destination */}
                        {result.landmark && result.destination?.name && 
                         result.landmark.toLowerCase() !== result.destination.name.toLowerCase() && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                            <Globe className="w-3 h-3 flex-shrink-0" />
                            <span>{result.landmark}</span>
                          </p>
                        )}
                        
                        {/* Description - the rich context from AI */}
                        {result.description && (
                          <p className="text-sm text-gray-700 leading-relaxed mt-2">
                            {result.description}
                          </p>
                        )}
                        
                        {/* Fallback to reasoning if no description */}
                        {!result.description && result.reasoning && (
                          <p className="text-xs text-gray-500 mt-2">
                            {result.reasoning}
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
                      onClick={() => onSearchFlights?.(getSearchDestination())}
                      className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium transition-colors flex items-center gap-3"
                    >
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Plane className="w-4 h-4" />
                      </div>
                      <span>Find Flights</span>
                    </button>
                    
                    <button
                      onClick={() => onSearchHotels?.(getSearchDestination())}
                      className="w-full py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-medium transition-colors flex items-center gap-3"
                    >
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Hotel className="w-4 h-4" />
                      </div>
                      <span>Find Hotels</span>
                    </button>
                    
                    <button
                      onClick={() => onSearchTours?.(getSearchDestination())}
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
              ) : result && !result.success ? (
                <>
                  {/* Not Identified */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Couldn't identify location
                        </h3>
                        <p className="text-sm text-gray-600">
                          {result.reasoning || 'Try uploading a clearer photo of a recognizable landmark or destination.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Try Another */}
                  <button
                    onClick={clearImage}
                    className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                  >
                    Try another image
                  </button>
                </>
              ) : null}
            </>
          )}

          {/* Tips */}
          {!imagePreview && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Tips for best results
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <Camera className="w-4 h-4 text-indigo-500 mt-0.5" />
                  <span>Use clear photos of landmarks or cityscapes</span>
                </div>
                <div className="flex items-start gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-500 mt-0.5" />
                  <span>Famous landmarks work best</span>
                </div>
                <div className="flex items-start gap-2">
                  <Globe className="w-4 h-4 text-indigo-500 mt-0.5" />
                  <span>Try photos from travel inspiration</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
