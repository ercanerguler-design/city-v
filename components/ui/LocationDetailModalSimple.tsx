'use client';

import { useState } from 'react';
import { X, MapPin, Clock, Users, Star, MessageSquare, Navigation, Heart, Share } from 'lucide-react';
import toast from 'react-hot-toast';
import { Location } from '@/types';
import { safeRenderLocation } from '@/lib/locationUtils';

interface LocationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location | null;
  onReviewClick?: () => void;
  onRouteClick?: () => void;
}

const LocationDetailModalSimple = ({ isOpen, onClose, location, onReviewClick, onRouteClick }: LocationDetailModalProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  console.log('🔧 LocationDetailModalSimple rendering:', { isOpen, location: location?.name });

  if (!isOpen || !location) {
    console.log('⏹️ Modal not rendering - isOpen:', isOpen, 'location:', !!location);
    return null;
  }

  console.log('✅ Modal WILL render for location:', location.name);
  console.log('🔍 Props check:', { 
    onReviewClick: typeof onReviewClick, 
    onRouteClick: typeof onRouteClick,
    location: !!location 
  });

  const handleShare = () => {
    console.log('📤 Share clicked');
    navigator.clipboard.writeText(`${location.name} - ${window.location.href}`);
    toast.success('Lokasyon linki kopyalandı!');
  };

  const toggleFavorite = () => {
    console.log('❤️ Favorite toggled');
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi');
  };

  const getCrowdText = (level: string) => {
    switch (level) {
      case 'low': return 'Az Kalabalık';
      case 'moderate': return 'Orta Kalabalık';
      case 'high': return 'Çok Kalabalık';
      case 'very_high': return 'Çok Kalabalık';
      default: return 'Bilinmiyor';
    }
  };

  const getCrowdColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'very_high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  console.log('🎨 Rendering modal components...');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          console.log('🔙 Modal backdrop clicked');
          onClose();
        }}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{location.name}</h2>
              <p className="text-gray-600 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {safeRenderLocation(location.address)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-lg transition-colors ${isFavorite ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'} hover:bg-red-200`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Share className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => {
                console.log('❌ Modal close clicked');
                onClose();
              }}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Kalabalık Durumu</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getCrowdColor(location.currentCrowdLevel)}`}>
                  {getCrowdText(location.currentCrowdLevel)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <Star className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Değerlendirme</p>
                <p className="font-semibold">4.5 ⭐ (124 yorum)</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Durum</p>
                <p className="font-semibold text-green-600">Açık</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => {
                console.log('📝 Review button clicked');
                if (onReviewClick) {
                  onReviewClick();
                }
                onClose();
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Yorum Yaz</span>
            </button>
            
            <button
              onClick={() => {
                console.log('🗺️ Route button clicked');
                if (onRouteClick) {
                  onRouteClick();
                }
                onClose();
              }}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Navigation className="w-5 h-5" />
              <span>Yol Tarifi Al</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetailModalSimple;