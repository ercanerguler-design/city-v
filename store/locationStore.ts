import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { reverseGeocode, formatAddress, type AddressInfo } from '@/lib/geocoding';

interface LocationState {
  userLocation: [number, number] | null;
  userAddress: AddressInfo | null;
  selectedCity: 'ankara' | 'istanbul';
  isLoadingLocation: boolean;
  locationError: string | null;
  setUserLocation: (coords: [number, number]) => void;
  setSelectedCity: (city: 'ankara' | 'istanbul') => void;
  requestUserLocation: () => Promise<void>;
  clearLocationError: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      userLocation: null,
      userAddress: null,
      selectedCity: 'ankara', // Varsayılan Ankara
      isLoadingLocation: false,
      locationError: null,

      setUserLocation: (coords) => {
        set({ userLocation: coords, locationError: null });
      },

      setSelectedCity: (city) => {
        set({ selectedCity: city });
      },

      requestUserLocation: async () => {
        set({ isLoadingLocation: true, locationError: null });

        if (!navigator.geolocation) {
          set({
            isLoadingLocation: false,
            locationError: 'Tarayıcınız konum servislerini desteklemiyor',
          });
          return;
        }

        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true, // Yüksek doğruluk
                timeout: 10000, // 10 saniye timeout
                maximumAge: 0, // Cache'den alma, her zaman yeni konum al
              });
            }
          );

          const coords: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];

          console.log('📍 Konum alındı:', coords);

          // Önce koordinatları kaydet
          set({
            userLocation: coords,
            isLoadingLocation: false,
            locationError: null,
          });

          // Reverse geocoding ile gerçek adresi al (arka planda)
          const lat = coords[0];
          const lng = coords[1];

          try {
            const addressInfo = await reverseGeocode(lat, lng);
            
            if (addressInfo) {
              console.log('✅ Adres bilgisi alındı:', addressInfo);
              
              // Global şehir tespiti - Gerçek adres bilgisinden şehir al
              let detectedCity: 'ankara' | 'istanbul' = 'ankara';
              
              if (addressInfo.city) {
                const cityName = addressInfo.city.toLowerCase();
                if (cityName.includes('ankara')) {
                  detectedCity = 'ankara';
                } else if (cityName.includes('istanbul') || cityName.includes('İstanbul')) {
                  detectedCity = 'istanbul';
                }
              }

              set({
                userAddress: addressInfo,
                selectedCity: detectedCity,
              });
            } else {
              console.warn('⚠️ Adres bilgisi alınamadı');
            }
          } catch (geoError) {
            console.error('❌ Geocoding hatası:', geoError);
            // Geocoding başarısız olsa bile konum çalışır
          }
        } catch (error: any) {
          let errorMessage = 'Konum alınamadı';
          
          if (error.code === 1) {
            errorMessage = 'Konum izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.';
          } else if (error.code === 2) {
            errorMessage = 'Konum bilgisi alınamıyor.';
          } else if (error.code === 3) {
            errorMessage = 'Konum alma zaman aşımına uğradı.';
          }

          set({
            isLoadingLocation: false,
            locationError: errorMessage,
          });
        }
      },

      clearLocationError: () => {
        set({ locationError: null });
      },
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
