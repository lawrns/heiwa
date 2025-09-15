import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface RoomImageGalleryProps {
  images: string[];
  roomName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RoomImageGallery({ images, roomName, isOpen, onClose }: RoomImageGalleryProps) {
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
      <div className="relative w-full h-full max-w-6xl max-h-screen p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all duration-200"
        >
          <X size={24} />
        </button>

        {/* Room name */}
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
            alt={`${roomName} - Image ${currentImageIndex + 1}`}
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
                key={index}
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
