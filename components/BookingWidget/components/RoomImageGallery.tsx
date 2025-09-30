import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Users } from 'lucide-react';

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
            className="absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all duration-200"
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
            <img
              src={images[currentImageIndex]}
              alt={`${roomName} - ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop&crop=center';
              }}
            />

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all duration-200"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all duration-200"
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
                  className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                    index === currentImageIndex
                      ? 'border-blue-400 opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-80'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${roomName} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=80&h=60&fit=crop&crop=center';
                    }}
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
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {roomType && (
                    <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {roomType} room
                    </span>
                  )}
                  {maxOccupancy && (
                    <span className="flex items-center gap-1">
                      <Users size={16} />
                      Up to {maxOccupancy} guests
                    </span>
                  )}
                  {pricePerNight && (
                    <span className="font-semibold text-orange-600">
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
  return (
    <button
      onClick={onClick}
      className={`relative group overflow-hidden rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg ${className}`}
    >
      <img
        src={image}
        alt={`${roomName} thumbnail`}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=80&h=60&fit=crop&crop=center';
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
        <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-all duration-200" size={20} />
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
  return (
    <div 
      className={`relative group overflow-hidden rounded-lg cursor-pointer ${className}`}
      onClick={onClick}
    >
      <img
        src={image}
        alt={`${roomName} hero image`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop&crop=center';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
      <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <ZoomIn className="text-white" size={16} />
      </div>
    </div>
  );
}
