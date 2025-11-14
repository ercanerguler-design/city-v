// Koordinatlara göre gerçek Ankara semtini belirle
// Ankara'nın gerçek semt sınırları (daha hassas)

interface District {
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// Gerçek Ankara mahalle koordinatları (OpenStreetMap verileri baz alınarak)
const ankaraDistricts: District[] = [
  // Merkez - Kızılay çevresi (çok hassas)
  { name: 'Kızılay', bounds: { north: 39.9235, south: 39.9185, east: 32.8560, west: 32.8520 } },
  { name: 'Sıhhiye', bounds: { north: 39.9360, south: 39.9240, east: 32.8620, west: 32.8550 } },
  { name: 'Kolej', bounds: { north: 39.9180, south: 39.9130, east: 32.8620, west: 32.8550 } },
  { name: 'Küçükesat', bounds: { north: 39.9280, south: 39.9220, east: 32.8660, west: 32.8580 } },
  
  // Tunalı - Kavaklıdere bölgesi
  { name: 'Kavaklıdere', bounds: { north: 39.9190, south: 39.9130, east: 32.8620, west: 32.8540 } },
  { name: 'Gaziosmanpaşa', bounds: { north: 39.9170, south: 39.9100, east: 32.8640, west: 32.8560 } },
  { name: 'Aydınlıkevler', bounds: { north: 39.9180, south: 39.9120, east: 32.8700, west: 32.8620 } },
  
  // Çankaya güney
  { name: 'Çankaya Merkez', bounds: { north: 39.9100, south: 39.9000, east: 32.8720, west: 32.8600 } },
  { name: 'Dikmen', bounds: { north: 39.9020, south: 39.8900, east: 32.8800, west: 32.8680 } },
  { name: 'Maltepe', bounds: { north: 39.9260, south: 39.9180, east: 32.8780, west: 32.8680 } },
  
  // Söğütözü - Balgat bölgesi
  { name: 'Söğütözü', bounds: { north: 39.9230, south: 39.9150, east: 32.8680, west: 32.8600 } },
  { name: 'Balgat', bounds: { north: 39.9200, south: 39.9130, east: 32.8760, west: 32.8660 } },
  { name: 'Çukurambar', bounds: { north: 39.8980, south: 39.8850, east: 32.8100, west: 32.7900 } },
  
  // Batı yakası
  { name: 'Bahçelievler', bounds: { north: 39.9380, south: 39.9260, east: 32.8500, west: 32.8350 } },
  { name: 'Emek', bounds: { north: 39.9280, south: 39.9180, east: 32.8480, west: 32.8360 } },
  { name: 'Beşevler', bounds: { north: 39.9480, south: 39.9360, east: 32.8480, west: 32.8320 } },
  { name: 'Oran', bounds: { north: 39.9220, south: 39.9080, east: 32.8300, west: 32.8100 } },
  { name: 'Çayyolu', bounds: { north: 39.9140, south: 39.8950, east: 32.7700, west: 32.7400 } },
  
  // Kuzey - Ulus çevresi
  { name: 'Ulus', bounds: { north: 39.9500, south: 39.9380, east: 32.8650, west: 32.8520 } },
  { name: 'Altındağ', bounds: { north: 39.9620, south: 39.9400, east: 32.8850, west: 32.8650 } },
  
  // Dış mahalleler
  { name: 'Keçiören', bounds: { north: 40.0100, south: 39.9650, east: 32.8950, west: 32.8550 } },
  { name: 'Yenimahalle', bounds: { north: 39.9900, south: 39.9520, east: 32.8350, west: 32.7850 } },
  { name: 'Etimesgut', bounds: { north: 39.9850, south: 39.9500, east: 32.7600, west: 32.7050 } },
  { name: 'Mamak', bounds: { north: 39.9600, south: 39.9100, east: 32.9350, west: 32.8850 } },
];

// Koordinata göre semt bul (HASSAS)
export function getDistrictFromCoordinates(lat: number, lng: number): string {
  // Önce tam sınır içinde mi kontrol et
  for (const district of ankaraDistricts) {
    if (
      lat >= district.bounds.south &&
      lat <= district.bounds.north &&
      lng >= district.bounds.west &&
      lng <= district.bounds.east
    ) {
      return district.name;
    }
  }
  
  // Sınırlar dışındaysa en yakın semti hassas hesapla (Haversine)
  let closestDistrict = 'Çankaya Merkez';
  let minDistance = Infinity;
  
  for (const district of ankaraDistricts) {
    const centerLat = (district.bounds.north + district.bounds.south) / 2;
    const centerLng = (district.bounds.east + district.bounds.west) / 2;
    
    // Haversine mesafe hesabı
    const R = 6371; // km
    const dLat = (lat - centerLat) * Math.PI / 180;
    const dLng = (lng - centerLng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(centerLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    if (distance < minDistance) {
      minDistance = distance;
      closestDistrict = district.name;
    }
  }
  
  return closestDistrict;
}

// İlçe ismini al (Çankaya, Keçiören vb.) - HASSAS
export function getMainDistrict(lat: number, lng: number): string {
  const district = getDistrictFromCoordinates(lat, lng);
  
  // Büyükşehir ilçeleri
  const mainDistricts: { [key: string]: string } = {
    'Keçiören': 'Keçiören',
    'Yenimahalle': 'Yenimahalle',
    'Etimesgut': 'Etimesgut',
    'Mamak': 'Mamak',
    'Altındağ': 'Altındağ',
    'Ulus': 'Altındağ',
    'Sincan': 'Sincan',
    'Pursaklar': 'Pursaklar',
    'Gölbaşı': 'Gölbaşı',
  };
  
  if (mainDistricts[district]) {
    return mainDistricts[district];
  }
  
  // Merkez semtler Çankaya'da
  return 'Çankaya';
}

// Semte özel gerçek sokak adları
const districtStreets: { [key: string]: string[] } = {
  'Kızılay': ['Atatürk Bulvarı', 'Ziya Gökalp Caddesi', 'Necatibey Caddesi', 'İzmir Caddesi', 'Meşrutiyet Caddesi'],
  'Kavaklıdere': ['Tunalı Hilmi Caddesi', 'Arjantin Caddesi', 'Cinnah Caddesi', 'Kızılırmak Caddesi'],
  'Söğütözü': ['Söğütözü Caddesi', 'Çetin Emeç Bulvarı', 'Yaşam Caddesi', 'Mustafa Kemal Mahallesi'],
  'Balgat': ['Çetin Emeç Bulvarı', 'Balgat Caddesi', 'Mevlana Bulvarı'],
  'Bahçelievler': ['Bestekar Sokak', 'Yüksel Caddesi', '7. Cadde', 'Hoşdere Caddesi'],
  'Ulus': ['Anafartalar Caddesi', 'Çankırı Caddesi', 'Hisarpark Caddesi', 'Denizciler Caddesi'],
  'Çankaya Merkez': ['Kennedy Caddesi', 'Atatürk Bulvarı', 'Çankaya Caddesi'],
};

// Gerçekçi sokak adı üret
export function generateStreetName(district: string): string {
  const streets = districtStreets[district] || [
    'Atatürk Bulvarı',
    'Cumhuriyet Caddesi',
    'İnönü Caddesi',
    'Gazi Caddesi',
  ];
  
  const randomStreet = streets[Math.floor(Math.random() * streets.length)];
  const streetNumber = Math.floor(Math.random() * 200) + 1;
  
  return `${randomStreet} No:${streetNumber}`;
}

// Tam adres oluştur (GERÇEKÇI)
export function generateFullAddress(lat: number, lng: number): string {
  const district = getDistrictFromCoordinates(lat, lng);
  const mainDistrict = getMainDistrict(lat, lng);
  const street = generateStreetName(district);
  
  // Format: Sokak No, Mahalle, İlçe/Şehir
  if (district === mainDistrict) {
    return `${street}, ${district}, Ankara`;
  }
  
  return `${street}, ${district}, ${mainDistrict}/Ankara`;
}

// Mesafe hesapla (Haversine) - HASSAS
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Dünya yarıçapı km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // km cinsinden
}

// Mesafe formatla
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}
