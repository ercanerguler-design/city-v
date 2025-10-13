'use client';

import { create } from 'zustand';

interface Photo {
  id: string;
  locationId?: string;
  imageUrl: string;
  caption: string;
  timestamp: string;
  userId: string;
  tags: string[];
  aiAnalysis?: {
    detectedLocation?: string;
    confidence: number;
    landmarks: string[];
    categories: string[];
  };
}

interface QRResult {
  type: 'location' | 'campaign' | 'menu' | 'unknown';
  data: string;
  metadata?: any;
}

interface CameraState {
  // Camera permissions
  hasPermission: boolean;
  isPermissionRequested: boolean;
  
  // Photo management
  photos: Photo[];
  currentPhoto: string | null;
  isCapturing: boolean;
  
  // QR Scanner
  isQRScannerActive: boolean;
  lastQRResult: QRResult | null;
  
  // IoT features
  beaconData: any[];
  nfcData: any[];
  isIoTActive: boolean;
  
  // Actions
  requestCameraPermission: () => Promise<boolean>;
  capturePhoto: (locationId?: string) => Promise<Photo | null>;
  sharePhoto: (photoId: string, platforms: string[]) => Promise<boolean>;
  analyzePhoto: (photoUrl: string) => Promise<any>;
  
  // QR Actions
  startQRScanner: () => void;
  stopQRScanner: () => void;
  processQRCode: (data: string) => QRResult;
  
  // IoT Actions
  enableIoT: () => void;
  disableIoT: () => void;
  detectBeacons: () => Promise<any[]>;
  readNFC: () => Promise<any>;
}

export const useCameraStore = create<CameraState>((set, get) => ({
  // Initial state
  hasPermission: false,
  isPermissionRequested: false,
  photos: [],
  currentPhoto: null,
  isCapturing: false,
  isQRScannerActive: false,
  lastQRResult: null,
  beaconData: [],
  nfcData: [],
  isIoTActive: false,

  // Camera permission
  requestCameraPermission: async () => {
    try {
      set({ isPermissionRequested: true });
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, // Back camera
        audio: false 
      });
      
      // Stop the stream immediately, we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      set({ hasPermission: true });
      console.log('📷 Kamera izni verildi');
      return true;
    } catch (error) {
      console.error('❌ Kamera izni reddedildi:', error);
      set({ hasPermission: false });
      return false;
    }
  },

  // Photo capture
  capturePhoto: async (locationId?: string) => {
    const { hasPermission } = get();
    if (!hasPermission) {
      const granted = await get().requestCameraPermission();
      if (!granted) return null;
    }

    try {
      set({ isCapturing: true });

      // Simulate photo capture with high-quality random image
      const photoId = `photo_${Date.now()}`;
      const mockPhotoUrl = `https://picsum.photos/800/600?random=${Date.now()}`;
      
      const newPhoto: Photo = {
        id: photoId,
        locationId,
        imageUrl: mockPhotoUrl,
        caption: '',
        timestamp: new Date().toISOString(),
        userId: 'current-user-id',
        tags: [],
      };

      // AI Analysis simulation
      const aiAnalysis = await get().analyzePhoto(mockPhotoUrl);
      newPhoto.aiAnalysis = aiAnalysis;

      set(state => ({
        photos: [newPhoto, ...state.photos],
        currentPhoto: mockPhotoUrl,
        isCapturing: false
      }));

      console.log('📸 Fotoğraf çekildi ve AI analizi tamamlandı');
      return newPhoto;
    } catch (error) {
      console.error('❌ Fotoğraf çekme hatası:', error);
      set({ isCapturing: false });
      return null;
    }
  },

  // Photo analysis with AI
  analyzePhoto: async (photoUrl: string) => {
    try {
      // Simulate AI photo analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const locations = [
        'Starbucks Kızılay',
        'Café Central Çankaya', 
        'ANKAmall Food Court',
        'Güvenpark Café',
        'Tunalı Hilmi Resto',
        'Armada AVM Restaurant'
      ];
      
      const categories = [
        ['cafe', 'coffee', 'indoor', 'seating'],
        ['restaurant', 'food', 'dining', 'turkish'],
        ['mall', 'shopping', 'food-court', 'modern'],
        ['park', 'outdoor', 'cafe', 'green'],
        ['fine-dining', 'upscale', 'evening', 'romantic'],
        ['shopping', 'mall', 'family', 'entertainment']
      ];

      const randomIndex = Math.floor(Math.random() * locations.length);
      
      const mockAnalysis = {
        detectedLocation: locations[randomIndex],
        confidence: 0.75 + Math.random() * 0.2, // 75-95% confidence
        landmarks: ['Kızılay Metro', 'Güvenpark', 'Tunalı Hilmi'],
        categories: categories[randomIndex]
      };

      console.log('🤖 AI fotoğraf analizi tamamlandı:', mockAnalysis);
      return mockAnalysis;
    } catch (error) {
      console.error('❌ AI analiz hatası:', error);
      return null;
    }
  },

  // Photo sharing
  sharePhoto: async (photoId: string, platforms: string[]) => {
    try {
      const photo = get().photos.find(p => p.id === photoId);
      if (!photo) return false;

      console.log(`📤 Fotoğraf paylaşılıyor: ${platforms.join(', ')}`);
      
      // Use Web Share API if available
      if (navigator.share && platforms.includes('native')) {
        await navigator.share({
          title: 'City-V Fotoğraf Paylaşımı',
          text: photo.caption || 'City-V üzerinden keşfettiğim harika mekan!',
          url: photo.imageUrl
        });
      }

      // Simulate social media sharing
      for (const platform of platforms) {
        if (platform !== 'native') {
          console.log(`📱 ${platform} platformunda paylaşıldı`);
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Paylaşım hatası:', error);
      return false;
    }
  },

  // QR Scanner
  startQRScanner: () => {
    set({ isQRScannerActive: true, lastQRResult: null });
    console.log('📱 QR tarayıcı başlatıldı');
  },

  stopQRScanner: () => {
    set({ isQRScannerActive: false });
    console.log('📱 QR tarayıcı durduruldu');
  },

  processQRCode: (data: string) => {
    let result: QRResult;

    if (data.includes('cityv.com/location/') || data.includes('location')) {
      result = {
        type: 'location',
        data,
        metadata: { locationId: data.split('/').pop() || 'unknown' }
      };
    } else if (data.includes('campaign') || data.includes('discount') || data.includes('COUPON')) {
      result = {
        type: 'campaign',
        data,
        metadata: { campaignCode: data, discount: '20%' }
      };
    } else if (data.includes('menu') || data.includes('qr-menu')) {
      result = {
        type: 'menu',
        data,
        metadata: { menuUrl: data, restaurant: 'Restaurant' }
      };
    } else {
      result = {
        type: 'unknown',
        data
      };
    }

    set({ lastQRResult: result });
    console.log('📱 QR kod işlendi:', result);
    
    // Auto-stop scanner after successful scan
    setTimeout(() => {
      set({ isQRScannerActive: false });
    }, 3000);
    
    return result;
  },

  // IoT Features
  enableIoT: () => {
    set({ isIoTActive: true });
    console.log('🌐 IoT özellikleri aktifleştirildi');
    
    // Start beacon detection
    get().detectBeacons();
  },

  disableIoT: () => {
    set({ isIoTActive: false, beaconData: [], nfcData: [] });
    console.log('🌐 IoT özellikleri devre dışı bırakıldı');
  },

  detectBeacons: async () => {
    try {
      // Simulate beacon detection
      const mockBeacons = [
        {
          id: 'beacon_starbucks_001',
          locationId: 'starbucks_kizilay',
          name: 'Starbucks Kızılay',
          distance: 2.5,
          rssi: -65,
          services: ['menu', 'order', 'payment', 'loyalty']
        },
        {
          id: 'beacon_mall_002',
          locationId: 'ankamall',
          name: 'ANKAmall Info Point',
          distance: 15.0,
          rssi: -78,
          services: ['map', 'events', 'parking', 'directory']
        }
      ];

      // Only return beacons within reasonable range
      const nearbyBeacons = mockBeacons.filter(beacon => beacon.distance < 10);

      set({ beaconData: nearbyBeacons });
      console.log('📡 Beacon\'lar tespit edildi:', nearbyBeacons);
      return nearbyBeacons;
    } catch (error) {
      console.error('❌ Beacon tespit hatası:', error);
      return [];
    }
  },

  readNFC: async () => {
    try {
      // Check if Web NFC is available
      if ('NDEFReader' in window) {
        const mockNFCData = {
          type: 'location_info',
          locationId: 'current_location',
          locationName: 'Starbucks Kızılay',
          services: ['payment', 'loyalty', 'menu', 'wifi'],
          specialOffers: ['%20 indirim', 'Bedava WiFi', 'Loyalty puan']
        };
        
        set(state => ({
          nfcData: [mockNFCData, ...state.nfcData]
        }));
        
        console.log('📲 NFC verisi okundu:', mockNFCData);
        return mockNFCData;
      } else {
        console.log('📲 NFC bu cihazda desteklenmiyor');
        return null;
      }
    } catch (error) {
      console.error('❌ NFC okuma hatası:', error);
      return null;
    }
  }
}));

export type { Photo, QRResult, CameraState };