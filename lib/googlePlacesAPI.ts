import { Location } from '@/types';
import { getDefaultWorkingHours } from './workingHours';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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

  // Her kategori için ayrı ayrı yer çek
  for (const [ourCategory, googleTypes] of Object.entries(CATEGORY_MAP)) {
    for (const type of googleTypes) {
      try {
        // Kendi API route'umuzu kullan (CORS hatası olmaması için)
        const url = `/api/places?lat=${userLat}&lng=${userLng}&radius=${radius}&type=${type}`;
        
        console.log(`🔍 ${ourCategory} (${type}) aranıyor...`);
        console.log(`   URL: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`❌ HTTP Hatası: ${response.status} ${response.statusText}`);
          const errorText = await response.text();
          console.error(`   Hata detayı: ${errorText}`);
          continue;
        }
        
        const data = await response.json();
        
        console.log(`   Google Status: ${data.status}`);
        if (data.error_message) {
          console.error(`   Google Hata Mesajı: ${data.error_message}`);
        }

        if (data.status === 'OK' && data.results) {
          console.log(`✅ ${data.results.length} ${type} bulundu`);
          
          // Sonuçları al
          const places = data.results as GooglePlace[];
          
          for (const place of places) {
            // Aynı yeri tekrar ekleme
            if (seenPlaceIds.has(place.place_id)) {
              console.log(`⏭️ Tekrar: ${place.name} (atlandı)`);
              continue;
            }
            
            seenPlaceIds.add(place.place_id);
            
            const location: Location = {
              id: place.place_id, // Google place_id kullan (benzersiz)
              name: place.name,
              category: ourCategory,
              coordinates: [place.geometry.location.lat, place.geometry.location.lng],
              address: place.vicinity || place.formatted_address || 'Adres bilgisi yok',
              currentCrowdLevel: estimateCrowdLevel(place),
              averageWaitTime: estimateWaitTime(ourCategory, place),
              lastUpdated: new Date(),
              description: place.types.join(', '),
              workingHours: getDefaultWorkingHours(ourCategory),
              phone: '', // Google Places Details API ile alınabilir
              rating: place.rating,
              reviewCount: place.user_ratings_total,
            };
            
            allLocations.push(location);
            
            // Her kategoriden maksimum 20 yer al (daha fazla sonuç)
            const categoryCount = allLocations.filter(l => l.category === ourCategory).length;
            if (categoryCount >= 20) {
              console.log(`   ✓ ${ourCategory} kategorisi tamamlandı (20 yer)`);
              break;
            }
          }
        } else if (data.status === 'ZERO_RESULTS') {
          console.log(`ℹ️ ${type} için sonuç bulunamadı`);
        } else {
          console.error(`❌ Google API Hatası (${type}):`, data.status, data.error_message);
        }
      } catch (error) {
        console.error(`❌ ${type} çekerken hata:`, error);
      }
    }
  }

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
function estimateCrowdLevel(place: GooglePlace): 'empty' | 'low' | 'moderate' | 'high' | 'very_high' {
  const currentHour = new Date().getHours();
  const isOpen = place.opening_hours?.open_now ?? true;
  
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
  const crowdLevel = estimateCrowdLevel(place);
  
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
