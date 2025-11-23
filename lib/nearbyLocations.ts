import { Location } from '@/types';
import { isLocationOpen } from './workingHours';
import { findNearbyRealPlaces, ANKARA_REAL_PLACES, type RealPlace } from './ankaraRealPlaces';

/**
 * GERÇEK ANKARA YERLERİNİ kullanarak konuma yakın yerleri döndürür
 */
export function generateNearbyLocations(userLat: number, userLng: number, radius: number = 100): Location[] {
  console.log(`📍 KONUMUNUZ: ${userLat.toFixed(6)}, ${userLng.toFixed(6)}`);
  console.log(`📊 Toplam ${ANKARA_REAL_PLACES.length} gerçek Ankara yeri veritabanında`);
  console.log(`🔍 ${radius}km yarıçapında aranıyor...`);
  
  // Gerçek Ankara yerlerinden yakınları bul
  const realPlaces = findNearbyRealPlaces(userLat, userLng, radius, 30);
  
  if (realPlaces.length === 0) {
    console.error('❌ YAKIN YER BULUNAMADI!');
    const ankaraMerkezUzaklik = calculateDistanceToAnkara(userLat, userLng);
    console.error(`📏 Kızılay'a uzaklığınız: ${ankaraMerkezUzaklik.toFixed(1)}km`);
    
    if (ankaraMerkezUzaklik > 150) {
      console.error('🚫 Ankara çok uzakta! Ankara merkez yerlerini gösteriyorum...');
    } else {
      console.warn('⚠️ Radius çok dar olabilir, tüm Ankara yerlerini gösteriyorum...');
    }
    
    // Yakında yer yoksa, en yakın 30 Ankara yerini göster
    const sorted = ANKARA_REAL_PLACES
      .map(place => ({
        ...place,
        distance: calculateDistance(userLat, userLng, place.coordinates[0], place.coordinates[1])
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 30);
    
    console.log('📍 En yakın yerler gösteriliyor:');
    sorted.slice(0, 5).forEach((p, i) => {
      console.log(`  ${i+1}. ${p.name} - ${p.distance.toFixed(1)}km`);
    });
    
    return sorted.map((place, index) => convertRealPlaceToLocation(place, index));
  }

  console.log(`✅ BAŞARILI: ${realPlaces.length} gerçek yer bulundu!`);
  console.log(`📍 İlk 3 yer:`);
  realPlaces.slice(0, 3).forEach((p: any, i: number) => {
    console.log(`  ${i+1}. ${p.name} - ${p.distance.toFixed(2)}km - ${p.address}`);
  });
  
  // Gerçek yerleri Location formatına çevir
  return realPlaces.map((place, index) => convertRealPlaceToLocation(place, index));
}

// Mesafe hesaplama fonksiyonu (tekrar kullanım için)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Kızılay'a (Ankara merkez) uzaklığı hesapla
 */
function calculateDistanceToAnkara(userLat: number, userLng: number): number {
  const KIZILAY_CENTER = [39.9208, 32.8541]; // Starbucks Kızılay koordinatları
  const R = 6371;
  const dLat = (KIZILAY_CENTER[0] - userLat) * Math.PI / 180;
  const dLon = (KIZILAY_CENTER[1] - userLng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(userLat * Math.PI / 180) * Math.cos(KIZILAY_CENTER[0] * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * RealPlace'i Location formatına çevirir ve kalabalık bilgisi ekler
 */
function convertRealPlaceToLocation(place: RealPlace, index: number): Location {
  const currentHour = new Date().getHours();
  
  // Static locations için working hours yok - varsayılan olarak açık kabul et
  const tempLocation = { category: place.category, isBusiness: false };
  const { isOpen } = isLocationOpen(tempLocation);
  
  // Kalabalık seviyesi hesapla (sadece açıksa)
  let crowdLevel: any = 'empty';
  let waitTime = 0;
  
  if (isOpen) {
    // Kategori bazlı peak saatler
    const peakHours: Record<string, number[]> = {
      cafe: [8, 9, 12, 13, 17, 18],
      bank: [9, 10, 11, 16, 17],
      hospital: [8, 9, 10, 11, 16, 17, 18],
      pharmacy: [18, 19, 20],
      market: [12, 13, 18, 19, 20],
      park: [16, 17, 18, 19],
    };

    const isPeak = peakHours[place.category]?.includes(currentHour);
    
    // Sabit kalabalık seviyeleri (hydration hatası olmaması için)
    if (isPeak) {
      // Index'e göre deterministik değer (server ve client'ta aynı)
      const levels = ['moderate', 'high', 'very_high'];
      crowdLevel = levels[index % levels.length];
    } else {
      const levels = ['empty', 'low', 'moderate'];
      crowdLevel = levels[index % levels.length];
    }
    
    // Bekleme süresi
    const waitTimes: Record<string, [number, number]> = {
      cafe: [2, 10],
      bank: [10, 35],
      hospital: [15, 60],
      pharmacy: [0, 8],
      market: [3, 15],
      park: [0, 0],
    };

    const [min, max] = waitTimes[place.category] || [0, 5];
    // Index'e göre deterministik değer
    waitTime = min + (index % (max - min + 1));
    
    if (crowdLevel === 'very_high') {
      waitTime = Math.floor(waitTime * 1.5);
    }
  }

  // Telefon numarası - deterministik (hydration hatası olmaması için)
  const phoneBase = 400 + (index % 400);
  const phone1 = 10 + (index % 90);
  const phone2 = 10 + ((index * 7) % 90);

  // Sabit tarih - client-side'da güncellenecek
  const now = typeof window !== 'undefined' ? new Date() : new Date('2025-10-12T12:00:00Z');

  return {
    id: `real-${index + 1000}`,
    name: place.name,
    category: place.category,
    coordinates: place.coordinates,
    address: place.address,
    currentCrowdLevel: crowdLevel,
    averageWaitTime: waitTime,
    lastUpdated: now,
    description: isOpen ? place.district : `${place.district} (Kapalı)`,
    workingHours,
    phone: `0312 ${phoneBase} ${phone1} ${phone2}`,
  };
}

/**
 * Lokasyonlara çalışma saatleri ekle
 */
export function addWorkingHoursToLocations(locations: Location[]): Location[] {
  return locations.map((loc, index) => {
    // Deterministik telefon numarası (hydration hatası olmaması için)
    const phoneBase = 100 + (index % 900);
    const phone1 = 10 + (index % 90);
    const phone2 = 10 + ((index * 3) % 90);
    
    return {
      ...loc,
      // Static locations için workingHours null bırak - business locations zaten dolu
      workingHours: loc.workingHours || null,
      phone: loc.phone || `0312 ${phoneBase} ${phone1} ${phone2}`,
    };
  });
}
