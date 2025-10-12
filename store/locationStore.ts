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

          // Reverse geocoding ile gerçek adresi al
          const lat = coords[0];
          const lng = coords[1];

          // Adres bilgisini al (arka planda)
          reverseGeocode(lat, lng).then((addressInfo) => {
            if (addressInfo) {
              set({ userAddress: addressInfo });
            }
          });

          // Ankara sınırları içinde mi kontrol et
          let detectedCity: 'ankara' | 'istanbul' = 'ankara';
          if (lat >= 39.5 && lat <= 40.5 && lng >= 32.0 && lng <= 33.5) {
            detectedCity = 'ankara';
          } else if (lat >= 40.5 && lat <= 41.5 && lng >= 28.0 && lng <= 30.0) {
            detectedCity = 'istanbul';
          }

          set({
            userLocation: coords,
            isLoadingLocation: false,
            locationError: null,
            selectedCity: detectedCity,
          });
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
