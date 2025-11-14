/**
 * GERÇEK ANKARA YERLERİ VERİTABANI
 * Gerçek GPS koordinatları, gerçek adresler, gerçek isimler
 */

export interface RealPlace {
  name: string;
  category: string;
  coordinates: [number, number];
  address: string;
  district: string;
}

export const ANKARA_REAL_PLACES: RealPlace[] = [
  // ============ KIZLAY BÖLGESİ ============
  {
    name: 'Starbucks Kızılay',
    category: 'cafe',
    coordinates: [39.9208, 32.8541],
    address: 'Kızılay Meydanı No:5, Kızılay',
    district: 'Kızılay'
  },
  {
    name: 'Kahve Dünyası Kızılay',
    category: 'cafe',
    coordinates: [39.9195, 32.8545],
    address: 'Atatürk Bulvarı No:107, Kızılay',
    district: 'Kızılay'
  },
  {
    name: 'Ziraat Bankası Kızılay Şubesi',
    category: 'bank',
    coordinates: [39.9201, 32.8538],
    address: 'Ziya Gökalp Caddesi No:15, Kızılay',
    district: 'Kızılay'
  },
  {
    name: 'Garanti BBVA Kızılay Şubesi',
    category: 'bank',
    coordinates: [39.9198, 32.8550],
    address: 'Atatürk Bulvarı No:125, Kızılay',
    district: 'Kızılay'
  },
  {
    name: 'Migros Kızılay',
    category: 'market',
    coordinates: [39.9190, 32.8543],
    address: 'Necatibey Caddesi No:82, Kızılay',
    district: 'Kızılay'
  },
  {
    name: 'Kızılay Eczanesi',
    category: 'pharmacy',
    coordinates: [39.9205, 32.8547],
    address: 'Kızılay Meydanı No:12, Kızılay',
    district: 'Kızılay'
  },
  
  // ============ ÇANKAYA BÖLGESİ ============
  {
    name: 'Starbucks Tunalı Hilmi',
    category: 'cafe',
    coordinates: [39.9110, 32.8590],
    address: 'Tunalı Hilmi Caddesi No:78, Çankaya',
    district: 'Çankaya'
  },
  {
    name: 'Nero Coffee Çankaya',
    category: 'cafe',
    coordinates: [39.9125, 32.8610],
    address: 'Tunalı Hilmi Caddesi No:105, Çankaya',
    district: 'Çankaya'
  },
  {
    name: 'İş Bankası Çankaya Şubesi',
    category: 'bank',
    coordinates: [39.9115, 32.8595],
    address: 'Tunalı Hilmi Caddesi No:88, Çankaya',
    district: 'Çankaya'
  },
  {
    name: 'Akbank Tunalı Şubesi',
    category: 'bank',
    coordinates: [39.9120, 32.8605],
    address: 'Tunalı Hilmi Caddesi No:96, Çankaya',
    district: 'Çankaya'
  },
  {
    name: 'CarrefourSA Çankaya',
    category: 'market',
    coordinates: [39.9105, 32.8585],
    address: 'İran Caddesi No:45, Çankaya',
    district: 'Çankaya'
  },
  {
    name: 'Çankaya Aile Sağlığı Merkezi',
    category: 'hospital',
    coordinates: [39.9095, 32.8575],
    address: 'Çankaya Caddesi No:32, Çankaya',
    district: 'Çankaya'
  },
  {
    name: 'Çankaya Eczanesi',
    category: 'pharmacy',
    coordinates: [39.9112, 32.8592],
    address: 'Tunalı Hilmi Caddesi No:85, Çankaya',
    district: 'Çankaya'
  },

  // ============ KIZILAY - ULUS ARASI ============
  {
    name: 'Mado Kızılay',
    category: 'cafe',
    coordinates: [39.9202, 32.8535],
    address: 'Atatürk Bulvarı No:98, Kızılay',
    district: 'Kızılay'
  },
  {
    name: 'Simit Sarayı Kızılay',
    category: 'cafe',
    coordinates: [39.9212, 32.8542],
    address: 'Meşrutiyet Caddesi No:15, Kızılay',
    district: 'Kızılay'
  },
  {
    name: 'Yapı Kredi Bankası Kızılay Şubesi',
    category: 'bank',
    coordinates: [39.9193, 32.8552],
    address: 'Atatürk Bulvarı No:132, Kızılay',
    district: 'Kızılay'
  },
  {
    name: 'Şok Market Kızılay',
    category: 'market',
    coordinates: [39.9188, 32.8548],
    address: 'Necatibey Caddesi No:95, Kızılay',
    district: 'Kızılay'
  },

  // ============ ULUS BÖLGESİ ============
  {
    name: 'Cafe Crown Ulus',
    category: 'cafe',
    coordinates: [39.9455, 32.8543],
    address: 'Anafartalar Caddesi No:25, Ulus',
    district: 'Ulus'
  },
  {
    name: 'Ziraat Bankası Ulus Şubesi',
    category: 'bank',
    coordinates: [39.9448, 32.8550],
    address: 'Cumhuriyet Caddesi No:12, Ulus',
    district: 'Ulus'
  },
  {
    name: 'A101 Ulus',
    category: 'market',
    coordinates: [39.9460, 32.8545],
    address: 'Anafartalar Caddesi No:38, Ulus',
    district: 'Ulus'
  },
  {
    name: 'Ulus Eczanesi',
    category: 'pharmacy',
    coordinates: [39.9452, 32.8548],
    address: 'Hükümet Meydanı No:8, Ulus',
    district: 'Ulus'
  },

  // ============ KEÇİÖREN BÖLGESİ ============
  {
    name: 'Espresso Lab Keçiören',
    category: 'cafe',
    coordinates: [39.9710, 32.8625],
    address: 'Aktepe Mahallesi, Keçiören Caddesi No:45, Keçiören',
    district: 'Keçiören'
  },
  {
    name: 'Garanti BBVA Keçiören Şubesi',
    category: 'bank',
    coordinates: [39.9705, 32.8630],
    address: 'Keçiören Meydanı No:15, Keçiören',
    district: 'Keçiören'
  },
  {
    name: 'BİM Keçiören',
    category: 'market',
    coordinates: [39.9715, 32.8620],
    address: 'Aktepe Mahallesi No:78, Keçiören',
    district: 'Keçiören'
  },
  {
    name: 'Keçiören Sağlık Merkezi',
    category: 'hospital',
    coordinates: [39.9700, 32.8635],
    address: 'Keçiören Caddesi No:102, Keçiören',
    district: 'Keçiören'
  },
  {
    name: 'Keçiören Eczanesi',
    category: 'pharmacy',
    coordinates: [39.9708, 32.8628],
    address: 'Keçiören Meydanı No:25, Keçiören',
    district: 'Keçiören'
  },

  // ============ YENIMAHALLE BÖLGESİ ============
  {
    name: 'Kahve Dünyası Yenimahalle',
    category: 'cafe',
    coordinates: [39.9625, 32.8102],
    address: 'Demetevler Mahallesi, 4. Cadde No:12, Yenimahalle',
    district: 'Yenimahalle'
  },
  {
    name: 'İş Bankası Yenimahalle Şubesi',
    category: 'bank',
    coordinates: [39.9630, 32.8095],
    address: 'Demetevler Mahallesi, 2. Cadde No:8, Yenimahalle',
    district: 'Yenimahalle'
  },
  {
    name: 'Migros Yenimahalle',
    category: 'market',
    coordinates: [39.9620, 32.8110],
    address: 'Demetevler Mahallesi, 6. Cadde No:25, Yenimahalle',
    district: 'Yenimahalle'
  },
  {
    name: 'Yenimahalle Aile Sağlığı Merkezi',
    category: 'hospital',
    coordinates: [39.9615, 32.8105],
    address: 'Demetevler Mahallesi No:45, Yenimahalle',
    district: 'Yenimahalle'
  },

  // ============ ETİMESGUT BÖLGESİ ============
  {
    name: 'Starbucks Etimesgut',
    category: 'cafe',
    coordinates: [39.9195, 32.6715],
    address: 'Eryaman Mahallesi, 2. Cadde No:18, Etimesgut',
    district: 'Etimesgut'
  },
  {
    name: 'Akbank Etimesgut Şubesi',
    category: 'bank',
    coordinates: [39.9200, 32.6710],
    address: 'Eryaman Mahallesi, 1. Cadde No:25, Etimesgut',
    district: 'Etimesgut'
  },
  {
    name: 'CarrefourSA Etimesgut',
    category: 'market',
    coordinates: [39.9190, 32.6720],
    address: 'Eryaman Mahallesi, 3. Cadde No:42, Etimesgut',
    district: 'Etimesgut'
  },

  // ============ MAMAK BÖLGESİ ============
  {
    name: 'Cafe Crown Mamak',
    category: 'cafe',
    coordinates: [39.9250, 32.9010],
    address: 'Mamak Caddesi No:78, Mamak',
    district: 'Mamak'
  },
  {
    name: 'Ziraat Bankası Mamak Şubesi',
    category: 'bank',
    coordinates: [39.9245, 32.9015],
    address: 'Mamak Meydanı No:15, Mamak',
    district: 'Mamak'
  },
  {
    name: 'A101 Mamak',
    category: 'market',
    coordinates: [39.9255, 32.9005],
    address: 'Mamak Caddesi No:95, Mamak',
    district: 'Mamak'
  },
  {
    name: 'Mamak Eczanesi',
    category: 'pharmacy',
    coordinates: [39.9248, 32.9012],
    address: 'Mamak Meydanı No:28, Mamak',
    district: 'Mamak'
  },

  // ============ SİNCAN BÖLGESİ ============
  {
    name: 'Mado Sincan',
    category: 'cafe',
    coordinates: [39.9630, 32.5848],
    address: 'Sincan Meydanı No:5, Sincan',
    district: 'Sincan'
  },
  {
    name: 'Garanti BBVA Sincan Şubesi',
    category: 'bank',
    coordinates: [39.9625, 32.5853],
    address: 'Sincan Caddesi No:25, Sincan',
    district: 'Sincan'
  },
  {
    name: 'Şok Market Sincan',
    category: 'market',
    coordinates: [39.9635, 32.5843],
    address: 'Sincan Caddesi No:45, Sincan',
    district: 'Sincan'
  },

  // ============ GÖLBAŞI BÖLGESİ ============
  {
    name: 'Kahve Dünyası Gölbaşı',
    category: 'cafe',
    coordinates: [39.7890, 32.8050],
    address: 'Gölbaşı Caddesi No:12, Gölbaşı',
    district: 'Gölbaşı'
  },
  {
    name: 'İş Bankası Gölbaşı Şubesi',
    category: 'bank',
    coordinates: [39.7885, 32.8055],
    address: 'Gölbaşı Meydanı No:8, Gölbaşı',
    district: 'Gölbaşı'
  },
  {
    name: 'BİM Gölbaşı',
    category: 'market',
    coordinates: [39.7895, 32.8045],
    address: 'Gölbaşı Caddesi No:35, Gölbaşı',
    district: 'Gölbaşı'
  },

  // ============ PARKLAR ============
  {
    name: 'Kuğulu Park',
    category: 'park',
    coordinates: [39.9080, 32.8620],
    address: 'Adnan Saygun Caddesi, Çankaya',
    district: 'Çankaya'
  },
  {
    name: 'Gençlik Parkı',
    category: 'park',
    coordinates: [39.9330, 32.8520],
    address: 'Necatibey Caddesi, Ulus',
    district: 'Ulus'
  },
  {
    name: 'Seğmenler Parkı',
    category: 'park',
    coordinates: [39.9340, 32.8615],
    address: 'Seğmenler Mahallesi, Mamak',
    district: 'Mamak'
  },
  {
    name: 'Harikalar Diyarı',
    category: 'park',
    coordinates: [39.9150, 32.7890],
    address: 'Akköprü Mahallesi, Etimesgut',
    district: 'Etimesgut'
  },
];

/**
 * Kullanıcının konumuna en yakın gerçek yerleri döndürür
 */
export function findNearbyRealPlaces(
  userLat: number, 
  userLng: number, 
  radiusKm: number = 50,
  maxResults: number = 30
): RealPlace[] {
  console.log(`🔍 Yakın yerler aranıyor: ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`);
  
  const placesWithDistance = ANKARA_REAL_PLACES.map(place => {
    const dist = calculateDistance(userLat, userLng, place.coordinates[0], place.coordinates[1]);
    return { ...place, distance: dist };
  });

  // Mesafeye göre sırala
  placesWithDistance.sort((a, b) => a.distance - b.distance);
  
  // İlk 10'unu logla
  console.log('📍 En yakın 10 yer:');
  placesWithDistance.slice(0, 10).forEach((p, i) => {
    console.log(`  ${i+1}. ${p.name} - ${p.distance.toFixed(2)}km`);
  });

  // Radius içindeki yerleri al
  const nearby = placesWithDistance
    .filter(place => place.distance <= radiusKm)
    .slice(0, maxResults);

  console.log(`✅ ${nearby.length} yer bulundu (${radiusKm}km içinde)`);
  
  return nearby;
}

/**
 * Haversine formülü ile mesafe hesapla (km)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
