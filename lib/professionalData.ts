import { Location, CrowdLevel } from '@/types';

export const professionalLocations: Location[] = [
  // Kafeler & Restoranlar
  {
    id: '1',
    name: 'Starbucks İstiklal',
    category: 'cafe',
    coordinates: [41.0345, 28.9784],
    address: 'İstiklal Caddesi No:121, Beyoğlu',
    currentCrowdLevel: 'high',
    averageWaitTime: 12,
    lastUpdated: new Date(),
    description: 'Premium kahve deneyimi',
    imageUrl: '/images/starbucks.jpg',
  },
  {
    id: '2',
    name: 'Nero Cafe',
    category: 'cafe',
    coordinates: [41.0362, 28.9856],
    address: 'Taksim Meydanı, Beyoğlu',
    currentCrowdLevel: 'moderate',
    averageWaitTime: 8,
    lastUpdated: new Date(),
    description: 'Taksim\'in kalbinde',
  },
  
  // Bankalar
  {
    id: '3',
    name: 'Garanti BBVA Taksim',
    category: 'bank',
    coordinates: [41.0371, 28.9848],
    address: 'Cumhuriyet Caddesi, Taksim',
    currentCrowdLevel: 'high',
    averageWaitTime: 25,
    lastUpdated: new Date(),
    description: 'Ana şube',
  },
  {
    id: '4',
    name: 'İş Bankası Beyoğlu',
    category: 'bank',
    coordinates: [41.0342, 28.9768],
    address: 'İstiklal Caddesi, Beyoğlu',
    currentCrowdLevel: 'moderate',
    averageWaitTime: 15,
    lastUpdated: new Date(),
  },
  {
    id: '5',
    name: 'Yapı Kredi Şişli',
    category: 'bank',
    coordinates: [41.0580, 28.9869],
    address: 'Halaskargazi Cad, Şişli',
    currentCrowdLevel: 'low',
    averageWaitTime: 10,
    lastUpdated: new Date(),
  },
  
  // Hastaneler
  {
    id: '6',
    name: 'Taksim İlk Yardım Hastanesi',
    category: 'hospital',
    coordinates: [41.0425, 28.9875],
    address: 'Sıraselviler Cad, Taksim',
    currentCrowdLevel: 'very_high',
    averageWaitTime: 45,
    lastUpdated: new Date(),
    description: 'Acil servis',
  },
  {
    id: '7',
    name: 'Memorial Şişli',
    category: 'hospital',
    coordinates: [41.0586, 28.9924],
    address: 'Şişli, İstanbul',
    currentCrowdLevel: 'high',
    averageWaitTime: 30,
    lastUpdated: new Date(),
    description: 'Özel hastane',
  },
  
  // Noterler
  {
    id: '8',
    name: '1. Beyoğlu Noteri',
    category: 'notary',
    coordinates: [41.0358, 28.9772],
    address: 'İstiklal Caddesi, Beyoğlu',
    currentCrowdLevel: 'high',
    averageWaitTime: 35,
    lastUpdated: new Date(),
  },
  {
    id: '9',
    name: 'Şişli 4. Noteri',
    category: 'notary',
    coordinates: [41.0612, 28.9882],
    address: 'Mecidiyeköy, Şişli',
    currentCrowdLevel: 'moderate',
    averageWaitTime: 20,
    lastUpdated: new Date(),
  },
  
  // Eczaneler
  {
    id: '10',
    name: 'Taksim Nöbetçi Eczane',
    category: 'pharmacy',
    coordinates: [41.0368, 28.9854],
    address: 'Taksim Meydanı',
    currentCrowdLevel: 'moderate',
    averageWaitTime: 5,
    lastUpdated: new Date(),
    description: '7/24 açık',
  },
  {
    id: '11',
    name: 'Lokman Hekim Eczanesi',
    category: 'pharmacy',
    coordinates: [41.0348, 28.9788],
    address: 'İstiklal Caddesi',
    currentCrowdLevel: 'low',
    averageWaitTime: 3,
    lastUpdated: new Date(),
  },
  
  // Alışveriş Merkezleri
  {
    id: '12',
    name: 'Cevahir AVM',
    category: 'shopping',
    coordinates: [41.0584, 28.9857],
    address: 'Şişli, İstanbul',
    currentCrowdLevel: 'very_high',
    averageWaitTime: 0,
    lastUpdated: new Date(),
    description: 'Avrupa\'nın en büyük AVM\'si',
  },
  {
    id: '13',
    name: 'Zorlu Center',
    category: 'shopping',
    coordinates: [41.0668, 29.0098],
    address: 'Zincirlikuyu, Beşiktaş',
    currentCrowdLevel: 'high',
    averageWaitTime: 0,
    lastUpdated: new Date(),
    description: 'Premium alışveriş',
  },
  
  // Kamu Kurumları
  {
    id: '14',
    name: 'Beyoğlu Belediyesi',
    category: 'public',
    coordinates: [41.0356, 28.9762],
    address: 'Beyoğlu, İstanbul',
    currentCrowdLevel: 'high',
    averageWaitTime: 40,
    lastUpdated: new Date(),
  },
  {
    id: '15',
    name: 'Şişli Nüfus Müdürlüğü',
    category: 'public',
    coordinates: [41.0624, 28.9888],
    address: 'Şişli, İstanbul',
    currentCrowdLevel: 'very_high',
    averageWaitTime: 55,
    lastUpdated: new Date(),
  },
  
  // Ulaşım
  {
    id: '16',
    name: 'Taksim Metro İstasyonu',
    category: 'transport',
    coordinates: [41.0369, 28.9850],
    address: 'Taksim Meydanı',
    currentCrowdLevel: 'very_high',
    averageWaitTime: 0,
    lastUpdated: new Date(),
    description: 'M2 Metro Hattı',
  },
  {
    id: '17',
    name: 'Şişli-Mecidiyeköy Metro',
    category: 'transport',
    coordinates: [41.0634, 28.9952],
    address: 'Mecidiyeköy',
    currentCrowdLevel: 'high',
    averageWaitTime: 0,
    lastUpdated: new Date(),
  },
  
  // Eğlence
  {
    id: '18',
    name: 'Zorlu PSM',
    category: 'entertainment',
    coordinates: [41.0671, 29.0102],
    address: 'Zorlu Center, Beşiktaş',
    currentCrowdLevel: 'moderate',
    averageWaitTime: 15,
    lastUpdated: new Date(),
    description: 'Performans Sanatları Merkezi',
  },
  
  // Parklar
  {
    id: '19',
    name: 'Maçka Demokrasi Parkı',
    category: 'park',
    coordinates: [41.0465, 29.0022],
    address: 'Maçka, Şişli',
    currentCrowdLevel: 'low',
    averageWaitTime: 0,
    lastUpdated: new Date(),
    description: 'Geniş yeşil alan',
  },
  {
    id: '20',
    name: 'Gezi Parkı',
    category: 'park',
    coordinates: [41.0377, 28.9876],
    address: 'Taksim, Beyoğlu',
    currentCrowdLevel: 'moderate',
    averageWaitTime: 0,
    lastUpdated: new Date(),
  },
  
  // Spor Salonları
  {
    id: '21',
    name: 'FitnessPlus Taksim',
    category: 'gym',
    coordinates: [41.0382, 28.9862],
    address: 'Taksim',
    currentCrowdLevel: 'high',
    averageWaitTime: 0,
    lastUpdated: new Date(),
    description: 'Premium fitness',
  },
  
  // Marketler
  {
    id: '22',
    name: 'Migros İstiklal',
    category: 'market',
    coordinates: [41.0338, 28.9776],
    address: 'İstiklal Caddesi',
    currentCrowdLevel: 'high',
    averageWaitTime: 8,
    lastUpdated: new Date(),
  },
  {
    id: '23',
    name: 'CarrefourSA Şişli',
    category: 'market',
    coordinates: [41.0596, 28.9874],
    address: 'Şişli',
    currentCrowdLevel: 'moderate',
    averageWaitTime: 5,
    lastUpdated: new Date(),
  },
];

export const getLocationsByCategory = (categoryId: string): Location[] => {
  return professionalLocations.filter(loc => loc.category === categoryId);
};

export const getLocationsByDistance = (
  userLat: number,
  userLng: number,
  maxDistance: number = 5000
): Location[] => {
  return professionalLocations
    .map(loc => ({
      ...loc,
      distance: calculateDistance(userLat, userLng, loc.coordinates[0], loc.coordinates[1]),
    }))
    .filter(loc => loc.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
