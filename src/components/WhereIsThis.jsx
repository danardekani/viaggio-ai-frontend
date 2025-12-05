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
  const [whereIsThisOpen, setWhereIsThisOpen] = useState(true);

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
      handleFileSelect({ target: { files: [file] } });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Clear the current image
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
    if (!image) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${backendUrl}/api/identify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: image // Already includes data URL prefix
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setResult({
          success: false,
          message: data.message || 'Could not identify the location',
          reasoning: data.reasoning,
          suggestion: data.suggestion
        });
      }
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

  // Collapsed view (toggle button)
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="hidden md:flex fixed right-0 top-1/3 bg-gradient-to-b from-purple-600 to-blue-600 text-white p-3 rounded-l-lg shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all z-40 flex-col items-center gap-2"
        title="Where Is This?"
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
    <div className="hidden md:flex w-80 bg-white border-l border-gray-200 shadow-lg flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Where Is This?</h2>
              <p className="text-xs text-purple-100">Upload a travel photo</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
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
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-gray-100 rounded-full">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Drop an image or click to upload
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Screenshot from Instagram, TikTok, or any travel photo
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Image Preview */}
            <div className="relative">
              <img
                src={imagePreview}
                alt="Uploaded travel photo"
                className="w-full h-48 object-cover rounded-xl shadow-md"
              />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Identify Button */}
            {!result && (
              <button
                onClick={identifyLocation}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Identify Location
                  </>
                )}
              </button>
            )}
          </>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            {result.success ? (
              <>
                {/* Success Result */}
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">
                          {result.destination?.fullName || result.landmark}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceColor(result.confidence)}`}>
                          {result.confidence}
                        </span>
                      </div>
                      
                      {result.landmark && result.destination?.name !== result.landmark && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {result.landmark}
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
            ) : (
              <>
                {/* Not Identified */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {result.message || 'Location not identified'}
                      </h3>
                      {result.reasoning && (
                        <p className="text-sm text-gray-600 mt-1">
                          {result.reasoning}
                        </p>
                      )}
                      {result.suggestion && (
                        <p className="text-xs text-amber-700 mt-2">
                          💡 {result.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={clearImage}
                  className="w-full py-2 text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
                >
                  ← Try another image
                </button>
              </>
            )}
          </div>
        )}

        {/* Tips */}
        {!imagePreview && !result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Tips for best results
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <Camera className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <span>Include recognizable landmarks or scenery</span>
              </li>
              <li className="flex items-start gap-2">
                <ImageIcon className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <span>Clear, well-lit photos work best</span>
              </li>
              <li className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <span>Signs or text in the image help identify locations</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
