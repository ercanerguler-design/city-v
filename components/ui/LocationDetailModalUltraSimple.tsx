'use client';

import { X, MapPin, Users } from 'lucide-react';

interface LocationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: {
    id: string | number;
    name: string;
    address?: string;
    crowdLevel?: string;
  } | null;
  onReviewClick?: () => void;
  onRouteClick?: () => void;
}

const LocationDetailModalUltraSimple = ({ 
  isOpen, 
  onClose, 
  location, 
  onReviewClick, 
  onRouteClick 
}: LocationDetailModalProps) => {
  console.log('🔧 LocationDetailModalUltraSimple rendering:', { 
    isOpen, 
    location: location?.name,
    onReviewClick: typeof onReviewClick,
    onRouteClick: typeof onRouteClick
  });

  if (!isOpen || !location) {
    console.log('⏹️ Modal not rendering - isOpen:', isOpen, 'location:', !!location);
    return null;
  }

  console.log('✅ Modal WILL render for location:', location.name);

  const getCrowdText = (level?: string) => {
    switch (level) {
      case 'low': return 'Az Kalabalık';
      case 'moderate': return 'Orta Kalabalık';
      case 'high': return 'Çok Kalabalık';
      case 'very_high': return 'Çok Kalabalık';
      default: return 'Bilinmiyor';
    }
  };

  const handleReviewClick = () => {
    console.log('📝 Review button clicked');
    console.log('📝 onReviewClick type:', typeof onReviewClick);
    
    try {
      if (onReviewClick && typeof onReviewClick === 'function') {
        onReviewClick();
        console.log('✅ onReviewClick executed successfully');
      } else {
        console.log('⚠️ onReviewClick is not a function or is undefined');
      }
      onClose();
    } catch (error) {
      console.error('❌ Error in onReviewClick:', error);
    }
  };

  const handleRouteClick = () => {
    console.log('🗺️ Route button clicked');
    console.log('🗺️ onRouteClick type:', typeof onRouteClick);
    
    try {
      if (onRouteClick && typeof onRouteClick === 'function') {
        onRouteClick();
        console.log('✅ onRouteClick executed successfully');
      } else {
        console.log('⚠️ onRouteClick is not a function or is undefined');
      }
      onClose();
    } catch (error) {
      console.error('❌ Error in onRouteClick:', error);
    }
  };

  try {
    console.log('🎨 Rendering modal components...');
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => {
            console.log('🔙 Modal backdrop clicked');
            onClose();
          }}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <h2 className="text-lg font-bold text-gray-900">{location.name}</h2>
                {location.address && (
                  <p className="text-sm text-gray-600">{location.address}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                console.log('❌ Close button clicked');
                onClose();
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Crowd Level */}
            {location.crowdLevel && (
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">
                  Kalabalık: {getCrowdText(location.crowdLevel)}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleReviewClick}
                className="bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
              >
                Yorum Yaz
              </button>
              
              <button
                onClick={handleRouteClick}
                className="bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700"
              >
                Yol Tarifi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ Modal render error:', error);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <p className="text-red-600">Modal yüklenemedi: {String(error)}</p>
          <button 
            onClick={onClose} 
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
          >
            Kapat
          </button>
        </div>
      </div>
    );
  }
};

export default LocationDetailModalUltraSimple;