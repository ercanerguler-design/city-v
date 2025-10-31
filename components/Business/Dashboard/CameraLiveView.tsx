'use client';

import { useState, useEffect } from 'react';
import { X, Maximize2, RefreshCw, Wifi, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CameraLiveView({ camera, onClose }: { camera: any; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Stream URL'i oluştur
  const streamUrl = camera.stream_url || `http://${camera.ip_address}:${camera.port}/stream`;
  const finalStreamUrl = `${streamUrl}?t=${refreshKey}`;

  // Otomatik refresh (her 5 saniyede bir)
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError(true);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(false);
    setRefreshKey(prev => prev + 1);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-6xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-900 rounded-t-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              {camera.status === 'active' ? (
                <Wifi className="w-5 h-5 text-white" />
              ) : (
                <Activity className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-white">{camera.camera_name}</h3>
              <p className="text-sm text-gray-400">{camera.location_description || `${camera.ip_address}:${camera.port}`}</p>
            </div>
            <div className="ml-2 flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${camera.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
              <span className={`text-xs font-medium ${camera.status === 'active' ? 'text-green-400' : 'text-gray-400'}`}>
                {camera.status === 'active' ? 'CANLI' : 'OFFLINE'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Yenile"
            >
              <RefreshCw className={`w-5 h-5 text-gray-300 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Tam Ekran"
            >
              <Maximize2 className="w-5 h-5 text-gray-300" />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Kapat"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Video Stream */}
        <div className="bg-black rounded-b-xl overflow-hidden relative" style={{ minHeight: '500px' }}>
          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Kamera akışı yükleniyor...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <Activity className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-50" />
                <p className="text-white font-medium mb-2">Kamera Bağlantısı Kurulamadı</p>
                <p className="text-gray-400 text-sm mb-4">
                  {streamUrl}
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          )}

          <img
            src={finalStreamUrl}
            alt={`${camera.camera_name} canlı görüntü`}
            className={`w-full h-auto ${isLoading || error ? 'hidden' : 'block'}`}
            style={{ maxHeight: '80vh', minHeight: '500px', objectFit: 'contain' }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />

          {/* Info Overlay */}
          {!isLoading && !error && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white">
                    {camera.current_occupancy || 0} kişi
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-600"></div>
                <div className="text-sm text-gray-300">
                  {camera.resolution || '1920x1080'} • {camera.fps || 30}fps
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Camera Info */}
        <div className="bg-gray-900 rounded-b-xl p-4 mt-px">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400">Giriş</p>
              <p className="text-lg font-bold text-white">{camera.total_entries || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Çıkış</p>
              <p className="text-lg font-bold text-white">{camera.total_exits || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">İçeride</p>
              <p className="text-lg font-bold text-green-400">{camera.current_occupancy || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Kapasite</p>
              <p className="text-lg font-bold text-blue-400">
                {camera.max_capacity ? `${camera.max_capacity}` : '∞'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
