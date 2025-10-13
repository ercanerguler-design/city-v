'use client';

import { useState, useEffect } from 'react';
import useLocationShareStore, { SharedLocation, LocationShareRequest } from '@/store/locationShareStore';
import useSocketStore from '@/store/socketStore';
import { 
  MapPin, 
  Users, 
  Share2, 
  X, 
  Shield, 
  Check, 
  Clock,
  Navigation,
  Eye,
  EyeOff,
  Settings,
  AlertCircle
} from 'lucide-react';

interface LiveLocationSharingProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
}

export default function LiveLocationSharing({ 
  isOpen, 
  onClose, 
  currentUserId, 
  currentUserName 
}: LiveLocationSharingProps) {
  const [activeTab, setActiveTab] = useState<'sharing' | 'requests' | 'privacy'>('sharing');
  const [isStarting, setIsStarting] = useState(false);

  const { isConnected } = useSocketStore();
  const {
    sharedLocations,
    locationRequests,
    mySharedLocation,
    isLocationSharing,
    privacySettings,
    startLocationSharing,
    stopLocationSharing,
    acceptLocationRequest,
    declineLocationRequest,
    sendLocationRequest,
    updatePrivacySettings,
    cleanupExpiredRequests,
    getNearbyUsers,
    getDistanceToUser
  } = useLocationShareStore();

  // Cleanup expired requests periodically
  useEffect(() => {
    const interval = setInterval(() => {
      cleanupExpiredRequests();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [cleanupExpiredRequests]);

  const handleStartSharing = async () => {
    setIsStarting(true);
    try {
      await startLocationSharing();
    } catch (error) {
      console.error('Location sharing error:', error);
      alert('Konum paylaşımı başlatılamadı: ' + (error as Error).message);
    } finally {
      setIsStarting(false);
    }
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes}dk önce`;
    const hours = Math.floor(minutes / 60);
    return `${hours}sa önce`;
  };

  const sharedLocationsList = Array.from(sharedLocations.values());
  const pendingRequests = Array.from(locationRequests.values()).filter(req => req.status === 'pending');
  const nearbyUsers = mySharedLocation ? getNearbyUsers(mySharedLocation.coordinates, 5) : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-blue-600">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6" />
              <h2 className="font-bold text-xl">Konum Paylaşımı</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center gap-2 mt-3 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-300' : 'bg-red-300'}`} />
            <span className="text-white opacity-90">
              {isConnected ? 'Bağlı' : 'Bağlantı bekleniyor'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('sharing')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'sharing' 
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              <span>Paylaşım</span>
              {pendingRequests.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'requests' 
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              <span>İstekler</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'privacy' 
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Gizlilik</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Sharing Tab */}
          {activeTab === 'sharing' && (
            <div className="space-y-6">
              
              {/* My Location Status */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Konum Paylaşım Durumu</h3>
                  <div className="flex items-center gap-2">
                    {isLocationSharing ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-green-600 font-medium">Aktif</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        <span className="text-sm text-gray-600">Kapalı</span>
                      </>
                    )}
                  </div>
                </div>
                
                {isLocationSharing ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Konumunuz şu anda {sharedLocationsList.length} kişi ile paylaşılıyor.
                    </p>
                    <button
                      onClick={stopLocationSharing}
                      className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Paylaşımı Durdur
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Konumunuzu arkadaşlarınızla paylaşmak için başlatın.
                    </p>
                    <button
                      onClick={handleStartSharing}
                      disabled={isStarting || !isConnected}
                      className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isStarting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Başlatılıyor...</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-4 h-4" />
                          <span>Konum Paylaşımını Başlat</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Nearby Users */}
              {nearbyUsers.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Yakınımdakiler (5km)</h3>
                  <div className="space-y-3">
                    {nearbyUsers.map((user) => {
                      const distance = mySharedLocation ? getDistanceToUser(user.userId, mySharedLocation.coordinates) : null;
                      return (
                        <div key={user.userId} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{user.userName}</p>
                              <p className="text-sm text-gray-600">
                                {distance && formatDistance(distance)} uzaklıkta
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTime(user.timestamp)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Shared Locations */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Konum Paylaşan Kullanıcılar ({sharedLocationsList.length})
                </h3>
                
                {sharedLocationsList.length > 0 ? (
                  <div className="space-y-3">
                    {sharedLocationsList.map((location) => {
                      const distance = mySharedLocation ? getDistanceToUser(location.userId, mySharedLocation.coordinates) : null;
                      return (
                        <div key={location.userId} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {location.userName.charAt(0).toUpperCase()}
                              </div>
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border border-white rounded-full" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{location.userName}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                {distance && (
                                  <span>{formatDistance(distance)} uzaklıkta</span>
                                )}
                                <span>{formatTime(location.timestamp)}</span>
                                {location.accuracy && (
                                  <span>±{Math.round(location.accuracy)}m</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                            <MapPin className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Henüz kimse konum paylaşmıyor</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Bekleyen İstekler</h3>
              
              {pendingRequests.length > 0 ? (
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {request.fromUserName} konum paylaşımı istiyor
                          </p>
                          {request.message && (
                            <p className="text-sm text-gray-600 mt-1">"{request.message}"</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(request.timestamp)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => acceptLocationRequest(request.id)}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => declineLocationRequest(request.id)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Bekleyen istek yok</p>
                </div>
              )}
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-800">Gizlilik Ayarları</h3>
              
              {/* Share Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Konum Paylaşım İzinleri</h4>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shareLevel"
                      checked={privacySettings.shareWithNone}
                      onChange={() => updatePrivacySettings({ 
                        shareWithNone: true, 
                        shareWithFriends: false, 
                        shareWithAll: false 
                      })}
                      className="text-blue-500"
                    />
                    <EyeOff className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Kimseyle paylaşma</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shareLevel"
                      checked={privacySettings.shareWithFriends}
                      onChange={() => updatePrivacySettings({ 
                        shareWithFriends: true, 
                        shareWithNone: false, 
                        shareWithAll: false 
                      })}
                      className="text-blue-500"
                    />
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Sadece arkadaşlarımla</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shareLevel"
                      checked={privacySettings.shareWithAll}
                      onChange={() => updatePrivacySettings({ 
                        shareWithAll: true, 
                        shareWithFriends: false, 
                        shareWithNone: false 
                      })}
                      className="text-blue-500"
                    />
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Herkesle paylaş</span>
                  </label>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Ek Bilgiler</h4>
                
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Navigation className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Konum doğruluğu</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.shareAccuracy}
                      onChange={(e) => updatePrivacySettings({ shareAccuracy: e.target.checked })}
                      className="text-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Navigation className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Yön bilgisi</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.shareHeading}
                      onChange={(e) => updatePrivacySettings({ shareHeading: e.target.checked })}
                      className="text-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Navigation className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Hız bilgisi</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.shareSpeed}
                      onChange={(e) => updatePrivacySettings({ shareSpeed: e.target.checked })}
                      className="text-blue-500"
                    />
                  </label>
                </div>
              </div>

              {/* Auto Expire */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Otomatik Süre Sonu</h4>
                <select
                  value={privacySettings.autoExpireAfter}
                  onChange={(e) => updatePrivacySettings({ autoExpireAfter: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 dakika</option>
                  <option value={30}>30 dakika</option>
                  <option value={60}>1 saat</option>
                  <option value={180}>3 saat</option>
                  <option value={360}>6 saat</option>
                  <option value={720}>12 saat</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}