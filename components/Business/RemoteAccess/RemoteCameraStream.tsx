'use client';

import { useState, useEffect, useRef } from 'react';
import { useRemoteCamera } from '@/lib/hooks/useRemoteAccess';
import { Camera, Wifi, WifiOff, RotateCcw, Maximize2, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

interface RemoteCameraStreamProps {
  cameraId: string;
  cameraName: string;
  isRemote?: boolean;
  className?: string;
  autoPlay?: boolean;
  showControls?: boolean;
}

export default function RemoteCameraStream({
  cameraId,
  cameraName,
  isRemote = false,
  className = '',
  autoPlay = true,
  showControls = true
}: RemoteCameraStreamProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    streamUrl,
    isLoading,
    error,
    isOnline,
    refreshStream,
    testConnection
  } = useRemoteCamera(cameraId, isRemote);

  // Auto-retry on error
  useEffect(() => {
    if (error && retryCount < 3) {
      const timeout = setTimeout(() => {
        console.log(`🔄 Retrying camera ${cameraId} (attempt ${retryCount + 1})`);
        refreshStream();
        setRetryCount(prev => prev + 1);
      }, 2000 * (retryCount + 1)); // Exponential backoff
      
      return () => clearTimeout(timeout);
    }
  }, [error, retryCount, cameraId, refreshStream]);

  // Reset retry count on successful load
  useEffect(() => {
    if (streamUrl && !error) {
      setRetryCount(0);
    }
  }, [streamUrl, error]);

  // Test connection periodically
  useEffect(() => {
    const interval = setInterval(() => {
      testConnection();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [testConnection]);

  const handleImageLoad = () => {
    setIsPlaying(true);
    console.log(`✅ Camera ${cameraId} stream loaded successfully`);
  };

  const handleImageError = () => {
    setIsPlaying(false);
    console.log(`❌ Camera ${cameraId} stream error`);
  };

  const handleRefresh = () => {
    setRetryCount(0);
    refreshStream();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const getStreamHeaders = () => {
    if (isRemote) {
      const token = localStorage.getItem('cityv_remote_token');
      return {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      };
    }
    return {};
  };

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${className} ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-white" />
            <span className="text-white font-medium text-sm">{cameraName}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Connection Status */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
              isOnline 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-red-500/20 text-red-300'
            }`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline ? 'Canlı' : 'Offline'}
            </div>
            
            {/* Remote Indicator */}
            {isRemote && (
              <div className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                Uzak Erişim
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Kamera bağlanıyor...</p>
            <p className="text-xs text-gray-300 mt-1">
              {isRemote ? 'Uzak bağlantı kuruluyor' : 'Yerel ağ bağlantısı'}
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white p-4">
            <Camera className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <h3 className="font-semibold mb-2">Kamera Bağlantı Hatası</h3>
            <p className="text-sm text-gray-300 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Tekrar Dene {retryCount > 0 && `(${retryCount}/3)`}
            </button>
          </div>
        </div>
      )}

      {/* Stream Image */}
      {streamUrl && !error && (
        <motion.img
          ref={imgRef}
          src={streamUrl}
          alt={`${cameraName} canlı görüntü`}
          className="w-full h-full object-cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ display: isLoading ? 'none' : 'block' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Controls */}
      {showControls && !isLoading && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Quality Indicator */}
              <div className="text-xs text-white bg-black/30 px-2 py-1 rounded">
                {isRemote ? 'Uzak HD' : 'Yerel HD'}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Audio Toggle (if available) */}
              {hasAudio && (
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              )}
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                title="Yenile"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                title="Tam Ekran"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Overlay */}
      {!isOnline && !isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white">
            <WifiOff className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Kamera çevrimdışı</p>
          </div>
        </div>
      )}
    </div>
  );
}