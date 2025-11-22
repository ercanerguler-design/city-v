'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Users, Star, MessageSquare, Camera, Navigation, Heart, Share, Phone, Globe, Calendar } from 'lucide-react';
import Image from 'next/image';
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

const LocationDetailModal = ({ isOpen, onClose, location, onReviewClick, onRouteClick }: LocationDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!location) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: location.name,
        text: `${location.name} - ${safeRenderLocation(location.address)}`,
        url: window.location.href
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${location.name} - ${window.location.href}`);
        toast.success('Lokasyon linki kopyalandı!');
      });
    } else {
      navigator.clipboard.writeText(`${location.name} - ${window.location.href}`);
      toast.success('Lokasyon linki kopyalandı!');
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi');
  };

  const getCrowdText = (level: string) => {
    switch (level) {
      case 'low': return 'Az Kalabalık';
      case 'moderate': return 'Orta Kalabalık';
      case 'high': return 'Kalabalık';
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

  const isBusinessLocation = location.id && (location.id.toString().startsWith('business-') || typeof location.id === 'number');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
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
                  onClick={handleShare}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Share className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleFavorite}
                  className={`p-2 rounded-lg transition-colors ${
                    isFavorite 
                      ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                
                {/* Left Column - Images and Info */}
                <div className="space-y-6">
                  {/* Images */}
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
                      {location.images && location.images.length > 0 ? (
                        <Image
                          src={location.images[currentImageIndex]}
                          alt={location.name}
                          className="w-full h-full object-cover"
                          width={400}
                          height={300}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <Camera className="w-12 h-12 mb-2" />
                          <p>Fotoğraf bulunmuyor</p>
                        </div>
                      )}
                    </div>
                    
                    {location.images && location.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {location.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/60'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Info Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                      <div className="flex items-center space-x-2 text-blue-800 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">Kalabalık</span>
                      </div>
                      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getCrowdColor(location.currentCrowdLevel || 'moderate')}`}>
                        {getCrowdText(location.currentCrowdLevel || 'moderate')}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                      <div className="flex items-center space-x-2 text-green-800 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Durum</span>
                      </div>
                      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        location.isOpen ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                      }`}>
                        {location.isOpen ? 'Açık' : 'Kapalı'}
                      </div>
                    </div>
                  </div>

                  {/* Business Details (if business location) */}
                  {isBusinessLocation && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">İşletme Bilgileri</h3>
                      <div className="space-y-3">
                        {location.phone && (
                          <div className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-purple-600" />
                            <span className="text-gray-700">{location.phone}</span>
                          </div>
                        )}
                        {location.website && (
                          <div className="flex items-center space-x-3">
                            <Globe className="w-5 h-5 text-purple-600" />
                            <a 
                              href={location.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:underline"
                            >
                              Web Sitesi
                            </a>
                          </div>
                        )}
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-purple-600" />
                          <span className="text-gray-700">Çalışma Saatleri: 09:00 - 18:00</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Reviews and Actions */}
                <div className="space-y-6">
                  {/* Rating and Reviews */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Değerlendirmeler</h3>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= (location.rating || 4.2) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-sm text-gray-600">({location.rating || 4.2})</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">A</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700 text-sm">"Harika bir yer, kesinlikle tavsiye ederim!"</p>
                            <p className="text-gray-500 text-xs mt-1">Ahmet K. - 2 saat önce</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-semibold text-sm">M</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700 text-sm">"Çok güzel bir atmosfer, tekrar geleceğim."</p>
                            <p className="text-gray-500 text-xs mt-1">Merve S. - 1 gün önce</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onReviewClick?.();
                        onClose();
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Yorum Yaz</span>
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        onRouteClick?.();
                        onClose();
                      }}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Navigation className="w-5 h-5" />
                      <span>Yol Tarifi Al</span>
                    </button>

                    <button
                      onClick={() => {
                        // Open in maps
                        const [lat, lng] = location.coordinates;
                        const url = `https://www.google.com/maps?q=${lat},${lng}`;
                        window.open(url, '_blank');
                      }}
                      className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                    >
                      <MapPin className="w-5 h-5" />
                      <span>Google Maps'te Aç</span>
                    </button>
                  </div>

                  {/* Live Camera Feed (if business location) */}
                  {isBusinessLocation && (
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Camera className="w-5 h-5 mr-2 text-red-600" />
                        Canlı Kamera
                      </h3>
                      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                        <div className="text-center text-white">
                          <Camera className="w-8 h-8 mx-auto mb-2 opacity-60" />
                          <p className="text-sm opacity-80">Canlı yayın yakında</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LocationDetailModal;