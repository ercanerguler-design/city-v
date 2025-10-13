import { Location } from '@/types';
import { getDefaultWorkingHours, isLocationOpen } from './workingHours';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Google Places API çalışma saatleri interface'leri
interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  opening_hours?: {
    periods: Array<{
      close?: {
        day: number;
        time: string;
      };
      open: {
        day: number;
        time: string;
      };
    }>;
    weekday_text: string[];
    open_now: boolean;
  };
  business_status?: string;
  permanently_closed?: boolean;
}

// Google API günlerini bizim sisteme çevir
const GOOGLE_DAY_MAP = {
  0: 'sunday',
  1: 'monday', 
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
} as const;

// Google Places API kategorileri -> bizim kategori dönüşümü (GENİŞLETİLMİŞ)
const CATEGORY_MAP: Record<string, string[]> = {
  cafe: ['cafe', 'coffee_shop', 'bakery'],
  bank: ['bank', 'atm'],
  hospital: ['hospital', 'doctor', 'dentist', 'physiotherapist'],
  pharmacy: ['pharmacy', 'drugstore'],
  market: ['supermarket', 'grocery_or_supermarket', 'convenience_store'],
  park: ['park', 'tourist_attraction'],
  restaurant: ['restaurant', 'meal_takeaway', 'meal_delivery', 'food'],
  gas_station: ['gas_station'],
  school: ['school', 'university', 'primary_school', 'secondary_school'],
  gym: ['gym', 'spa', 'stadium'],
  library: ['library', 'book_store'],
  post_office: ['post_office'],
  police: ['police', 'fire_station', 'local_government_office'],
  mosque: ['mosque', 'church', 'synagogue', 'hindu_temple', 'place_of_worship'],
  cinema: ['movie_theater', 'night_club', 'bowling_alley', 'amusement_park'],
  beauty: ['beauty_salon', 'hair_care', 'spa'],
  pet: ['pet_store', 'veterinary_care'],
  electronics: ['electronics_store', 'home_goods_store'],
  clothing: ['clothing_store', 'shoe_store', 'jewelry_store', 'department_store'],
  hotel: ['lodging', 'hotel', 'motel'],
  shopping: ['shopping_mall', 'store', 'furniture_store'],
  car: ['car_dealer', 'car_rental', 'car_repair', 'car_wash', 'parking'],
  travel: ['travel_agency', 'bus_station', 'train_station', 'subway_station', 'airport'],
  finance: ['accounting', 'insurance_agency'],
  legal: ['lawyer'],
  real_estate: ['real_estate_agency'],
  locksmith: ['locksmith'],
  laundry: ['laundry'],
  florist: ['florist'],
  hardware: ['hardware_store'],
  liquor: ['liquor_store'],
  moving: ['moving_company'],
  painter: ['painter'],
  plumber: ['plumber'],
  roofing: ['roofing_contractor'],
  storage: ['storage'],
  // Yeni eklenen kategoriler
  government: ['local_government_office', 'city_hall', 'courthouse', 'embassy'],
  doctor: ['doctor', 'health'],
  dentist: ['dentist'],
  veterinary_care: ['veterinary_care'],
  university: ['university'],
  primary_school: ['primary_school'],
  secondary_school: ['secondary_school'],
  courthouse: ['courthouse'],
  embassy: ['embassy'],
  fire_station: ['fire_station'],
  lawyer: ['lawyer'],
  accounting: ['accounting'],
  insurance_agency: ['insurance_agency'],
  electrician: ['electrician'],
  carpenter: ['general_contractor'],
  car_dealer: ['car_dealer'],
  car_rental: ['car_rental'],
  car_repair: ['car_repair'],
  car_wash: ['car_wash'],
  tourist_attraction: ['tourist_attraction'],
  amusement_park: ['amusement_park'],
  zoo: ['zoo'],
  museum: ['museum'],
  art_gallery: ['art_gallery'],
  campground: ['campground'],
  rv_park: ['rv_park'],
  stadium: ['stadium'],
  bowling_alley: ['bowling_alley'],
  bus_station: ['bus_station', 'transit_station'],
  subway_station: ['subway_station'],
  taxi_stand: ['taxi_stand'],
  airport: ['airport'],
  garden_center: ['store'], // Genel store kategorisinde
  warehouse: ['storage'],
  moving_company: ['moving_company'],
  funeral_home: ['funeral_home'],
  cemetery: ['cemetery'],
  spa: ['spa'],
};

interface GooglePlace {
  place_id: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  vicinity?: string;
  formatted_address?: string;
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now?: boolean;
  };
}

/**
 * Google Places Nearby Search API ile yakındaki yerleri çeker
 */
export async function fetchNearbyPlacesFromGoogle(
  userLat: number,
  userLng: number,
  radius: number = 2000 // metre cinsinden (2km)
): Promise<Location[]> {
  console.log('=== GOOGLE PLACES API ÇAĞRILIYOR ===');
  console.log(`Konum: ${userLat.toFixed(6)}, ${userLng.toFixed(6)}`);
  console.log(`Yarıçap: ${radius}m`);

  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'your_api_key_here') {
    console.error('❌ Google Maps API Key tanımlanmamış!');
    console.error('Lütfen .env.local dosyasına NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ekleyin');
    return [];
  }

  const allLocations: Location[] = [];
  const seenPlaceIds = new Set<string>(); // Tekrar eden yerleri engellemek için
  let idCounter = 1000;

  // PARALEL API ÇAĞRILARI - Tüm kategorileri aynı anda çek
  console.log('🚀 Paralel API çağrıları başlatılıyor...');
  
  const fetchPromises: Promise<void>[] = [];
  
  for (const [ourCategory, googleTypes] of Object.entries(CATEGORY_MAP)) {
    // Her kategoriden sadece ilk type'ı kullan (hızlı sonuç için)
    const mainType = googleTypes[0];
    
    const promise = (async () => {
      try {
        const url = `/api/places?lat=${userLat}&lng=${userLng}&radius=${radius}&type=${mainType}`;
        
        console.log(`🔍 ${ourCategory} (${mainType}) aranıyor...`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`❌ HTTP Hatası (${mainType}): ${response.status}`);
          return;
        }
        
        const data = await response.json();

        if (data.status === 'OK' && data.results) {
          console.log(`✅ ${data.results.length} ${mainType} bulundu`);
          
          const places = data.results as GooglePlace[];
          
          for (const place of places) {
            // Aynı yeri tekrar ekleme
            if (seenPlaceIds.has(place.place_id)) {
              continue;
            }
            
            seenPlaceIds.add(place.place_id);
            
            const location: Location = {
              id: place.place_id,
              name: place.name,
              category: ourCategory,
              coordinates: [place.geometry.location.lat, place.geometry.location.lng],
              address: place.vicinity || place.formatted_address || 'Adres bilgisi yok',
              currentCrowdLevel: estimateCrowdLevel(place, ourCategory),
              averageWaitTime: estimateWaitTime(ourCategory, place),
              lastUpdated: new Date(),
              description: place.types.join(', '),
              workingHours: getDefaultWorkingHours(ourCategory),
              phone: '',
              rating: place.rating,
              reviewCount: place.user_ratings_total,
            };
            
            allLocations.push(location);
            
            // Her kategoriden maksimum 20 yer al
            const categoryCount = allLocations.filter(l => l.category === ourCategory).length;
            if (categoryCount >= 20) {
              break;
            }
          }
        } else if (data.status === 'ZERO_RESULTS') {
          console.log(`ℹ️ ${mainType} için sonuç bulunamadı`);
        } else {
          console.error(`❌ Google API Hatası (${mainType}):`, data.status);
        }
      } catch (error) {
        console.error(`❌ ${mainType} çekerken hata:`, error);
      }
    })();
    
    fetchPromises.push(promise);
  }
  
  // Tüm API çağrılarını paralel olarak bekle
  await Promise.all(fetchPromises);
  console.log('✅ Tüm paralel çağrılar tamamlandı!');

  console.log('========================================');
  console.log(`🎉 TOPLAM ${allLocations.length} YER BULUNDU`);
  console.log('========================================');
  
  // Kategori başına özet
  const categorySummary: Record<string, number> = {};
  allLocations.forEach(loc => {
    categorySummary[loc.category] = (categorySummary[loc.category] || 0) + 1;
  });
  
  console.log('� Kategori Dağılımı:');
  Object.entries(categorySummary).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} yer`);
  });
  console.log('========================================');

  return allLocations;
}

/**
 * Google Place verilerinden kalabalık seviyesini tahmin et
 */
function estimateCrowdLevel(place: GooglePlace, category: string): 'empty' | 'low' | 'moderate' | 'high' | 'very_high' {
  const currentHour = new Date().getHours();
  
  // Bizim working hours sistemimizi kullan
  const workingHours = getDefaultWorkingHours(category);
  const tempLocation = { category, workingHours };
  const { isOpen } = isLocationOpen(tempLocation);
  
  if (!isOpen) return 'empty';
  
  // Rating ve review sayısına göre popülerlik tahmini
  const rating = place.rating ?? 3;
  const reviewCount = place.user_ratings_total ?? 0;
  
  // Peak saatler (öğle ve akşam)
  const isPeakHour = [12, 13, 18, 19, 20].includes(currentHour);
  
  if (reviewCount > 1000 && rating > 4.0 && isPeakHour) return 'very_high';
  if (reviewCount > 500 && rating > 3.5 && isPeakHour) return 'high';
  if (reviewCount > 200 && isPeakHour) return 'moderate';
  if (reviewCount > 100) return 'low';
  
  return 'empty';
}

/**
 * Kategoriye göre ortalama bekleme süresi tahmini
 */
function estimateWaitTime(category: string, place: GooglePlace): number {
  const crowdLevel = estimateCrowdLevel(place, category);
  
  const baseWaitTimes: Record<string, [number, number]> = {
    cafe: [2, 10],
    bank: [5, 20],
    hospital: [10, 45],
    pharmacy: [2, 8],
    market: [3, 12],
    park: [0, 0],
  };
  
  const [min, max] = baseWaitTimes[category] || [0, 5];
  
  const multiplier = {
    empty: 0.5,
    low: 0.7,
    moderate: 1.0,
    high: 1.5,
    very_high: 2.0,
  }[crowdLevel] || 1.0;
  
  const avgWait = Math.floor(((min + max) / 2) * multiplier);
  return Math.max(0, avgWait);
}

/**
 * Google Places Detail API'den bir yer hakkında detaylı bilgi çeker
 * ÖZELLİKLE ÇALIŞMA SAATLERİ için kullanılır
 */
export async function fetchPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('❌ Google Maps API Key tanımlanmamış!');
    return null;
  }

  try {
    const fields = 'place_id,name,formatted_address,geometry,opening_hours,business_status';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_MAPS_API_KEY}&language=tr`;
    
    console.log(`🔍 Google Place Details çekiliyor: ${placeId}`);
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      return data.result;
    } else {
      console.error('❌ Google Places Detail API hatası:', data.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Google Places Detail API fetch hatası:', error);
    return null;
  }
}

/**
 * Google Places API'den gelen çalışma saatlerini bizim formata çevirir
 */
export function convertGoogleWorkingHours(openingHours?: GooglePlaceDetails['opening_hours']) {
  if (!openingHours || !openingHours.periods) {
    return {};
  }

  const workingHours: any = {};

  // Google'ın periods formatını bizim formatımıza çevir
  openingHours.periods.forEach(period => {
    const dayName = GOOGLE_DAY_MAP[period.open.day as keyof typeof GOOGLE_DAY_MAP];
    
    if (period.close) {
      // Normal açılış-kapanış saati
      const openTime = `${period.open.time.slice(0, 2)}:${period.open.time.slice(2)}`;
      const closeTime = `${period.close.time.slice(0, 2)}:${period.close.time.slice(2)}`;
      workingHours[dayName] = `${openTime}-${closeTime}`;
    } else {
      // 24 saat açık
      workingHours[dayName] = '00:00-23:59';
    }
  });

  return workingHours;
}

/**
 * Bir lokasyonun gerçek çalışma saatlerini Google API'den çeker ve günceller
 */
export async function updateLocationWorkingHours(location: Location): Promise<Location> {
  // Eğer lokasyonun Google place_id'si varsa, gerçek saatleri çek
  if (location.googlePlaceId) {
    try {
      const placeDetails = await fetchPlaceDetails(location.googlePlaceId);
      
      if (placeDetails && placeDetails.opening_hours) {
        const realWorkingHours = convertGoogleWorkingHours(placeDetails.opening_hours);
        
        console.log(`✅ ${location.name} için gerçek çalışma saatleri güncellendi:`, realWorkingHours);
        
        return {
          ...location,
          workingHours: realWorkingHours,
          isCurrentlyOpen: placeDetails.opening_hours.open_now || false,
          lastWorkingHoursUpdate: Date.now()
        };
      }
    } catch (error) {
      console.error(`❌ ${location.name} çalışma saatleri güncellenirken hata:`, error);
    }
  }

  // Google API'den veri alınamazsa varsayılan saatleri kullan
  return {
    ...location,
    workingHours: getDefaultWorkingHours(location.category)
  };
}

/**
 * Tüm lokasyonların çalışma saatlerini toplu günceller
 */
export async function updateAllLocationsWorkingHours(locations: Location[]): Promise<Location[]> {
  console.log(`🕒 ${locations.length} lokasyon için çalışma saatleri güncelleniyor...`);
  
  const updatedLocations = await Promise.all(
    locations.map(async (location) => {
      try {
        return await updateLocationWorkingHours(location);
      } catch (error) {
        console.error(`❌ ${location.name} güncellenirken hata:`, error);
        return location;
      }
    })
  );

  const successCount = updatedLocations.filter(loc => loc.lastWorkingHoursUpdate).length;
  console.log(`✅ ${successCount}/${locations.length} lokasyon çalışma saatleri güncellendi`);
  
  return updatedLocations;
}
