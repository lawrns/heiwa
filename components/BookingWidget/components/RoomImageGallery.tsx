import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Users, ImageOff } from 'lucide-react';

// Local fallback images from the property
export const FALLBACK_IMAGES = [
  '/images/rooms/room1.jpg',
  '/images/rooms/room2.webp',
  '/images/rooms/room3.webp',
  '/images/rooms/dorm.webp',
  '/images/DSC02099-scaled.jpg',
  '/images/DSC03521-scaled.jpg',
];

// Image loading states
export type ImageLoadState = 'loading' | 'loaded' | 'error' | 'fallback';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackIndex?: number;
  className?: string;
  onLoadComplete?: () => void;
}

/**
 * Robust image component with fallback chain and loading states
 * Prevents broken image icons by gracefully handling errors
 */
export function ImageWithFallback({
  src,
  alt,
  fallbackIndex = 0,
  className = '',
  onLoadComplete,
}: ImageWithFallbackProps) {
  // If no src provided, start with fallback immediately
  const initialSrc = src && src.trim() !== '' ? src : FALLBACK_IMAGES[fallbackIndex % FALLBACK_IMAGES.length];
  const [loadState, setLoadState] = useState<ImageLoadState>(src && src.trim() !== '' ? 'loading' : 'fallback');
  const [currentSrc, setCurrentSrc] = useState(initialSrc);
  const [fallbackAttempt, setFallbackAttempt] = useState(src && src.trim() !== '' ? 0 : 1);

  // Reset state when src changes
  useEffect(() => {
    if (src && src.trim() !== '' && src !== currentSrc) {
      setCurrentSrc(src);
      setLoadState('loading');
      setFallbackAttempt(0);
    } else if (!src || src.trim() === '') {
      // If src becomes empty, use fallback
      setCurrentSrc(FALLBACK_IMAGES[fallbackIndex % FALLBACK_IMAGES.length]);
      setLoadState('fallback');
      setFallbackAttempt(1);
    }
  }, [src, currentSrc, fallbackIndex]);

  const handleLoad = useCallback(() => {
    setLoadState(fallbackAttempt > 0 ? 'fallback' : 'loaded');
    onLoadComplete?.();
  }, [fallbackAttempt, onLoadComplete]);

  const handleError = useCallback(() => {
    // Try next fallback image
    if (fallbackAttempt < FALLBACK_IMAGES.length) {
      const nextFallback = FALLBACK_IMAGES[(fallbackIndex + fallbackAttempt) % FALLBACK_IMAGES.length];
      setCurrentSrc(nextFallback);
      setFallbackAttempt(prev => prev + 1);
    } else {
      // All fallbacks exhausted
      setLoadState('error');
    }
  }, [fallbackAttempt, fallbackIndex]);

  // Show placeholder for error state
  if (loadState === 'error') {
    return (
      <div className={`flex items-center justify-center bg-gray-200 ${className}`}>
        <ImageOff className="text-gray-400" size={24} />
      </div>
    );
  }

  return (
    <>
      {loadState === 'loading' && (
        <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse ${className}`}>
          <div className="w-8 h-8 border border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${loadState === 'loading' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
}

interface RoomImageGalleryProps {
  images: string[];
  roomName: string;
  roomDescription?: string;
  roomAmenities?: string[];
  roomType?: string;
  maxOccupancy?: number;
  pricePerNight?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function RoomImageGallery({
  images,
  roomName,
  roomDescription,
  roomAmenities,
  roomType,
  maxOccupancy,
  pricePerNight,
  isOpen,
  onClose
}: RoomImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || images.length === 0) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative w-full h-full max-w-6xl max-h-screen p-4 flex flex-col">
        {/* Main image area - full width */}
        <div className="relative flex-1 min-h-0">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white motion-safe:transition-all motion-safe:duration-200 motion-reduce:transition-none"
          >
            <X size={24} />
          </button>

          {/* Room name and image counter */}
          <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 px-4 py-2 rounded-lg">
            <h3 className="text-white text-lg font-semibold">{roomName}</h3>
            <p className="text-white text-sm opacity-80">
              {currentImageIndex + 1} of {images.length}
            </p>
          </div>

          {/* Main image */}
          <div className="relative w-full h-full flex items-center justify-center">
            <ImageWithFallback
              src={images[currentImageIndex]}
              alt={`${roomName} - ${currentImageIndex + 1}`}
              fallbackIndex={currentImageIndex}
              className="max-w-full max-h-full object-contain rounded-lg"
            />

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white motion-safe:transition-all motion-safe:duration-200 motion-reduce:transition-none"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white motion-safe:transition-all motion-safe:duration-200 motion-reduce:transition-none"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail navigation */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black bg-opacity-50 p-3 rounded-lg max-w-full overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={`${roomName}-thumb-${index}`}
                  onClick={() => goToImage(index)}
                  className={`relative flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border motion-safe:transition-all motion-safe:duration-200 motion-reduce:transition-none ${
                    index === currentImageIndex
                      ? 'border-blue-400 opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-80'
                  }`}
                >
                  <ImageWithFallback
                    src={image}
                    alt={`${roomName} thumbnail ${index + 1}`}
                    fallbackIndex={index}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Room Details Panel - Below image */}
        <div className="w-full bg-white bg-opacity-95 backdrop-blur-sm rounded-lg mt-4 p-6 max-h-64 overflow-y-auto">
            <div className="space-y-6">
              {/* Room Header */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{roomName}</h2>
                {/* TOON-compliant icon-text gap (8px) */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {roomType && (
                    <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {roomType} room
                    </span>
                  )}
                  {maxOccupancy && (
                    <span className="flex items-center gap-2">
                      <Users size={16} className="flex-shrink-0" />
                      Up to {maxOccupancy} guests
                    </span>
                  )}
                  {pricePerNight && (
                    <span className="font-semibold text-[#ec681c]">
                      €{pricePerNight}/night
                    </span>
                  )}
                </div>
              </div>

              {/* Room Description */}
              {roomDescription && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{roomDescription}</p>
                </div>
              )}

              {/* Room Amenities */}
              {roomAmenities && roomAmenities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities & Features</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {roomAmenities.map((amenity, index) => (
                      <div key={`${roomName}-amenity-${index}`} className="flex items-center gap-2 text-gray-700">
                        <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}

interface RoomThumbnailProps {
  image: string;
  roomName: string;
  onClick: () => void;
  className?: string;
}

export function RoomThumbnail({ image, roomName, onClick, className = '' }: RoomThumbnailProps) {
  // If no image provided, start with fallback immediately
  const initialImage = image && image.trim() !== '' ? image : FALLBACK_IMAGES[0];
  const [loadState, setLoadState] = useState<ImageLoadState>(image && image.trim() !== '' ? 'loading' : 'fallback');
  const [currentSrc, setCurrentSrc] = useState(initialImage);
  const [fallbackAttempt, setFallbackAttempt] = useState(image && image.trim() !== '' ? 0 : 1);

  // Reset state when image prop changes
  useEffect(() => {
    if (image && image.trim() !== '' && image !== currentSrc) {
      setCurrentSrc(image);
      setLoadState('loading');
      setFallbackAttempt(0);
    } else if (!image || image.trim() === '') {
      // If image becomes empty, use fallback
      setCurrentSrc(FALLBACK_IMAGES[0]);
      setLoadState('fallback');
      setFallbackAttempt(1);
    }
  }, [image, currentSrc]);

  const handleLoad = useCallback(() => {
    setLoadState(fallbackAttempt > 0 ? 'fallback' : 'loaded');
  }, [fallbackAttempt]);

  const handleError = useCallback(() => {
    // Try next fallback image
    if (fallbackAttempt < FALLBACK_IMAGES.length) {
      const nextFallback = FALLBACK_IMAGES[fallbackAttempt % FALLBACK_IMAGES.length];
      setCurrentSrc(nextFallback);
      setFallbackAttempt(prev => prev + 1);
    } else {
      // All fallbacks exhausted
      setLoadState('error');
    }
  }, [fallbackAttempt]);

  return (
    <button
      onClick={onClick}
      className={`relative group overflow-hidden rounded-lg motion-safe:transition-all motion-safe:duration-200 motion-reduce:transition-none hover:scale-105 hover:shadow-lg ${className}`}
    >
      {/* Loading state */}
      {loadState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse z-10">
          <div className="w-6 h-6 border border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error state - show placeholder */}
      {loadState === 'error' ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          <ImageOff className="text-gray-400" size={20} />
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={`${roomName} thumbnail`}
          className={`w-full h-full object-cover ${loadState === 'loading' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 motion-safe:transition-all motion-safe:duration-200 motion-reduce:transition-none flex items-center justify-center">
        <ZoomIn className="text-white opacity-0 group-hover:opacity-100 motion-safe:transition-all motion-safe:duration-200 motion-reduce:transition-none" size={20} />
      </div>
    </button>
  );
}

interface RoomHeroImageProps {
  image: string;
  roomName: string;
  onClick?: () => void;
  className?: string;
}

export function RoomHeroImage({ image, roomName, onClick, className = '' }: RoomHeroImageProps) {
  // If no image provided, start with fallback immediately
  const initialImage = image && image.trim() !== '' ? image : FALLBACK_IMAGES[0];
  const [loadState, setLoadState] = useState<ImageLoadState>(image && image.trim() !== '' ? 'loading' : 'fallback');
  const [currentSrc, setCurrentSrc] = useState(initialImage);
  const [fallbackAttempt, setFallbackAttempt] = useState(image && image.trim() !== '' ? 0 : 1);

  // Reset state when image prop changes
  useEffect(() => {
    if (image && image.trim() !== '' && image !== currentSrc) {
      // Add cache-busting to image URL to prevent browser cache issues
      const cacheBustedImage = image.includes('?') 
        ? `${image}&_v=${Date.now()}` 
        : `${image}?_v=${Date.now()}`;
      setCurrentSrc(cacheBustedImage);
      setLoadState('loading');
      setFallbackAttempt(0);
    } else if (!image || image.trim() === '') {
      // If image becomes empty, use fallback
      setCurrentSrc(FALLBACK_IMAGES[0]);
      setLoadState('fallback');
      setFallbackAttempt(1);
    }
  }, [image, currentSrc]);

  const handleLoad = useCallback(() => {
    setLoadState(fallbackAttempt > 0 ? 'fallback' : 'loaded');
  }, [fallbackAttempt]);

  const handleError = useCallback(() => {
    // Try next fallback image
    if (fallbackAttempt < FALLBACK_IMAGES.length) {
      const nextFallback = FALLBACK_IMAGES[fallbackAttempt % FALLBACK_IMAGES.length];
      setCurrentSrc(nextFallback);
      setFallbackAttempt(prev => prev + 1);
    } else {
      // All fallbacks exhausted
      setLoadState('error');
    }
  }, [fallbackAttempt]);

  return (
    <div
      className={`relative group overflow-hidden rounded-lg cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* Loading state */}
      {loadState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse z-10">
          <div className="w-10 h-10 border border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error state - show placeholder */}
      {loadState === 'error' ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          <ImageOff className="text-gray-400" size={32} />
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={`${roomName} hero image`}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${loadState === 'loading' ? 'opacity-0' : 'opacity-100'}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
      <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <ZoomIn className="text-white" size={16} />
      </div>
    </div>
  );
}
