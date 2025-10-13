'use client';

import { useEffect, useRef, useState } from 'react';
import { useCameraStore } from '../../store/cameraStore';

export default function QRScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectionFrame, setDetectionFrame] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  
  const { 
    isQRScannerActive, 
    stopQRScanner, 
    processQRCode,
    lastQRResult 
  } = useCameraStore();

  useEffect(() => {
    if (isQRScannerActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isQRScannerActive]);

  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Start QR detection after video loads
        videoRef.current.addEventListener('loadedmetadata', () => {
          setTimeout(() => startQRDetection(), 1000);
        });
      }
    } catch (err) {
      setError('Kamera erişimi reddedildi veya mevcut değil. Lütfen kamera izinlerini kontrol edin.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setDetectionFrame(null);
  };

  const startQRDetection = () => {
    // Simulate QR code detection
    const detectQR = () => {
      if (!isQRScannerActive) return;

      // Mock QR codes for different scenarios
      const mockQRCodes = [
        {
          data: 'https://cityv.com/location/starbucks_kizilay',
          type: 'Mekan QR Kodu',
          frame: { x: 100, y: 150, width: 200, height: 200 }
        },
        {
          data: 'CAMPAIGN_DISCOUNT_20_CITYV',
          type: 'Kampanya Kodu',
          frame: { x: 120, y: 120, width: 180, height: 180 }
        },
        {
          data: 'https://qr-menu.com/starbucks-kizilay',
          type: 'Dijital Menu',
          frame: { x: 80, y: 100, width: 220, height: 220 }
        },
        {
          data: 'IoT_BEACON_STARBUCKS_001',
          type: 'IoT Cihazı',
          frame: { x: 90, y: 140, width: 200, height: 200 }
        },
        {
          data: 'WIFI:T:WPA;S:StarbucksWiFi;P:coffee123;H:false;;',
          type: 'WiFi Bağlantısı',
          frame: { x: 110, y: 130, width: 190, height: 190 }
        }
      ];

      // Randomly "detect" a QR code (15% chance per scan)
      if (Math.random() < 0.15) {
        const randomQR = mockQRCodes[Math.floor(Math.random() * mockQRCodes.length)];
        
        // Show detection animation
        setDetectionFrame(randomQR.frame);
        
        // Process QR code after a short delay
        setTimeout(() => {
          processQRCode(randomQR.data);
        }, 500);

        // Show success animation
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        if (canvas && video) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = video.videoWidth || 320;
            canvas.height = video.videoHeight || 240;
            
            // Draw detection rectangle
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 4;
            ctx.strokeRect(
              randomQR.frame.x, 
              randomQR.frame.y, 
              randomQR.frame.width, 
              randomQR.frame.height
            );
            
            // Add success indicator
            ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
            ctx.fillRect(
              randomQR.frame.x, 
              randomQR.frame.y, 
              randomQR.frame.width, 
              randomQR.frame.height
            );
          }
        }
        
        return; // Stop scanning after detection
      }

      // Continue scanning if no QR detected
      setTimeout(detectQR, 800); // Check every 800ms
    };

    detectQR();
  };

  const handleManualCode = () => {
    // Simulate manual QR code input for testing
    const testCodes = [
      'https://cityv.com/location/test_location',
      'CAMPAIGN_TEST_50',
      'https://qr-menu.com/test-restaurant'
    ];
    
    const randomCode = testCodes[Math.floor(Math.random() * testCodes.length)];
    processQRCode(randomCode);
  };

  if (!isQRScannerActive) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 text-white safe-area-top">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📱</span>
          <div>
            <h2 className="text-lg font-semibold">QR Kod Tarayıcı</h2>
            <p className="text-xs opacity-75">Kamerayı QR koda yöneltin</p>
          </div>
        </div>
        <button
          onClick={stopQRScanner}
          className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors touch-manipulation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full text-white text-center p-6">
            <div className="max-w-sm">
              <div className="text-6xl mb-4">📷</div>
              <div className="text-xl font-medium mb-3">Kamera Erişim Hatası</div>
              <div className="text-sm opacity-75 mb-6">{error}</div>
              <button 
                onClick={handleManualCode}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                Test QR Kodu Dene
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {/* QR Detection Overlay */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none"
            />
            
            {/* Scanning Frame */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 border-2 border-white/50 rounded-lg">
                  {/* Corner Indicators */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                </div>
                
                {/* Scanning Line Animation */}
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <div 
                    className="w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-80" 
                    style={{ 
                      animation: 'scan 2s ease-in-out infinite'
                    }}>
                  </div>
                </div>

                {/* Detection Frame */}
                {detectionFrame && (
                  <div 
                    className="absolute border-4 border-green-400 bg-green-400/20 rounded-lg animate-pulse"
                    style={{
                      left: `${detectionFrame.x}px`,
                      top: `${detectionFrame.y}px`,
                      width: `${detectionFrame.width}px`,
                      height: `${detectionFrame.height}px`
                    }}
                  />
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-32 md:bottom-24 left-0 right-0 text-center text-white p-4">
              <div className="bg-black/60 rounded-xl p-4 max-w-sm mx-auto">
                <div className="text-sm font-medium mb-2">📱 QR Kodu Tarama</div>
                <div className="text-xs opacity-90 space-y-1">
                  <div>• QR kodu çerçeve içine hizalayın</div>
                  <div>• Net görüntü için mesafeyi ayarlayın</div>
                  {isScanning && <div className="text-green-400">• Taranıyor...</div>}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-4 p-4">
              <button 
                onClick={handleManualCode}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm hover:bg-white/30 transition-colors"
              >
                🧪 Test QR
              </button>
              <button 
                onClick={() => {/* Flash toggle could be implemented */}}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
              >
                💡
              </button>
            </div>
          </>
        )}
      </div>

      {/* Results */}
      {lastQRResult && (
        <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white safe-area-bottom">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold mb-1">QR Kod Başarıyla Tarandı!</div>
              <div className="text-sm opacity-90 truncate">
                Tür: <span className="font-medium">{lastQRResult.type}</span>
              </div>
              <div className="text-xs opacity-75 truncate mt-1">
                {lastQRResult.data}
              </div>
            </div>
            <button 
              onClick={stopQRScanner}
              className="flex-shrink-0 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
            >
              Kapat
            </button>
          </div>
          
          {/* Action based on QR type */}
          <div className="mt-3 pt-3 border-t border-white/20">
            {lastQRResult.type === 'location' && (
              <button className="w-full py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                📍 Konuma Git
              </button>
            )}
            {lastQRResult.type === 'campaign' && (
              <button className="w-full py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                🎫 Kampanyayı Kullan
              </button>
            )}
            {lastQRResult.type === 'menu' && (
              <button className="w-full py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                🍽️ Menüyü Aç
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}