'use client';

import { useState } from 'react';
import { useCameraStore } from '../../store/cameraStore';

interface CameraButtonProps {
  className?: string;
  onPhotoGallery?: () => void;
}

export default function CameraButton({ className = '', onPhotoGallery }: CameraButtonProps) {
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const { 
    hasPermission, 
    isCapturing,
    isQRScannerActive,
    photos,
    requestCameraPermission,
    capturePhoto,
    startQRScanner,
    enableIoT,
    disableIoT,
    isIoTActive
  } = useCameraStore();

  const handleCameraClick = () => {
    setShowCameraMenu(!showCameraMenu);
  };

  const handlePhotoCapture = async () => {
    if (!hasPermission) {
      await requestCameraPermission();
    }
    await capturePhoto();
    setShowCameraMenu(false);
  };

  const handleQRScan = () => {
    startQRScanner();
    setShowCameraMenu(false);
  };

  const handleIoTToggle = () => {
    if (isIoTActive) {
      disableIoT();
    } else {
      enableIoT();
    }
    setShowCameraMenu(false);
  };

  const handlePhotoGallery = () => {
    onPhotoGallery?.();
    setShowCameraMenu(false);
  };

  return (
    <div className="relative">
      {/* Camera Button */}
      <button
        onClick={handleCameraClick}
        className={`relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg ${className}`}
        disabled={isCapturing}
      >
        {isCapturing ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
        
        {/* Photo Count Badge */}
        {photos.length > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {photos.length > 9 ? '9+' : photos.length}
          </div>
        )}

        {/* Active States */}
        {isQRScannerActive && (
          <div className="absolute inset-0 border-2 border-green-400 rounded-full animate-pulse"></div>
        )}
        
        {isIoTActive && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
        )}
      </button>

      {/* Camera Menu */}
      {showCameraMenu && (
        <>
          {/* Mobile Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setShowCameraMenu(false)}
          />
          
          {/* Menu Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <div className="p-2">
              {/* Header */}
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">📷</span>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">Kamera Özellikleri</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Next-gen camera tools</div>
                  </div>
                </div>
              </div>

              {/* Photo Capture */}
              <button
                onClick={handlePhotoCapture}
                disabled={isCapturing}
                className="w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📸</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">Fotoğraf Çek</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">AI analizi ile mekan tanıma</div>
                </div>
              </button>

              {/* QR Scanner */}
              <button
                onClick={handleQRScan}
                className="w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📱</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">QR Kod Tara</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Menu, kampanya, konum bilgisi</div>
                </div>
              </button>

              {/* IoT Scanner */}
              <button
                onClick={handleIoTToggle}
                className="w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                  isIoTActive 
                    ? 'bg-orange-100 dark:bg-orange-900/30' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <span className="text-lg">📡</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Smart Scan {isIoTActive ? '(Aktif)' : ''}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Beacon, NFC, IoT cihazları
                  </div>
                </div>
              </button>

              {/* Photo Gallery */}
              {photos.length > 0 && onPhotoGallery && (
                <>
                  <div className="my-2 border-t border-gray-100 dark:border-gray-700"></div>
                  <button
                    onClick={handlePhotoGallery}
                    className="w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🖼️</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Fotoğraf Galerisi</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {photos.length} fotoğraf
                      </div>
                    </div>
                  </button>
                </>
              )}

              {/* Status Indicators */}
              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between px-3 py-1">
                  <div className="flex items-center space-x-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${hasPermission ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Kamera {hasPermission ? 'İzinli' : 'İzin Gerekli'}
                    </span>
                  </div>
                  {isIoTActive && (
                    <div className="flex items-center space-x-1 text-xs">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-gray-600 dark:text-gray-400">IoT Aktif</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}