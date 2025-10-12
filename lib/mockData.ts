import { Location, CrowdStats, CrowdLevel } from '@/types';

// İstanbul koordinatları örneği (İstiklal Caddesi merkez)
const ISTANBUL_CENTER: [number, number] = [41.0082, 28.9784];

// Mock lokasyon verileri
export const mockLocations: Location[] = [
  {
    id: '1',
    name: 'İstiklal Caddesi',
    category: 'Alışveriş Caddesi',
    coordinates: [41.0082, 28.9784],
    address: 'Beyoğlu, İstanbul',
    currentCrowdLevel: 'high',
    averageWaitTime: 15,
    lastUpdated: new Date(),
    description: 'Popüler alışveriş ve gezinti caddesi',
  },
  {
    id: '2',
    name: 'Taksim Meydanı',
    category: 'Meydan',
    coordinates: [41.0369, 28.9850],
    address: 'Taksim, Beyoğlu, İstanbul',
    currentCrowdLevel: 'very_high',
    averageWaitTime: 0,
    lastUpdated: new Date(),
    description: 'Şehrin en işlek meydanı',
  },
  {
    id: '3',
    name: 'Eminönü Meydanı',
    category: 'Meydan',
    coordinates: [41.0186, 28.9714],
    address: 'Eminönü, Fatih, İstanbul',
    currentCrowdLevel: 'high',
    averageWaitTime: 5,
    lastUpdated: new Date(),
    description: 'Tarihi yarımada girişi',
  },
  {
    id: '4',
    name: 'Ortaköy Meydanı',
    category: 'Sahil',
    coordinates: [41.0553, 29.0267],
    address: 'Ortaköy, Beşiktaş, İstanbul',
    currentCrowdLevel: 'moderate',
    averageWaitTime: 10,
    lastUpdated: new Date(),
    description: 'Boğaz manzaralı sahil',
  },
  {
    id: '5',
    name: 'Kapalıçarşı',
    category: 'Alışveriş Merkezi',
    coordinates: [41.0108, 28.9681],
    address: 'Beyazıt, Fatih, İstanbul',
    currentCrowdLevel: 'moderate',
    averageWaitTime: 8,
    lastUpdated: new Date(),
    description: 'Tarihi kapalı çarşı',
  },
  {
    id: '6',
    name: 'Bebek Sahil',
    category: 'Sahil',
    coordinates: [41.0787, 29.0433],
    address: 'Bebek, Beşiktaş, İstanbul',
    currentCrowdLevel: 'low',
    averageWaitTime: 5,
    lastUpdated: new Date(),
    description: 'Boğaz kenarı dinlenme alanı',
  },
  {
    id: '7',
    name: 'Kadıköy Çarşı',
    category: 'Alışveriş Bölgesi',
    coordinates: [40.9904, 29.0245],
    address: 'Kadıköy, İstanbul',
    currentCrowdLevel: 'high',
    averageWaitTime: 12,
    lastUpdated: new Date(),
    description: 'Anadolu yakası merkezi',
  },
  {
    id: '8',
    name: 'Nişantaşı',
    category: 'Alışveriş Bölgesi',
    coordinates: [41.0460, 28.9940],
    address: 'Nişantaşı, Şişli, İstanbul',
    currentCrowdLevel: 'moderate',
    averageWaitTime: 7,
    lastUpdated: new Date(),
    description: 'Butik mağazalar bölgesi',
  },
  {
    id: '9',
    name: 'Sultanahmet Meydanı',
    category: 'Turistik Alan',
    coordinates: [41.0054, 28.9768],
    address: 'Sultanahmet, Fatih, İstanbul',
    currentCrowdLevel: 'high',
    averageWaitTime: 20,
    lastUpdated: new Date(),
    description: 'Tarihi yarımada merkezi',
  },
  {
    id: '10',
    name: 'Bağdat Caddesi',
    category: 'Alışveriş Caddesi',
    coordinates: [40.9651, 29.0851],
    address: 'Maltepe, İstanbul',
    currentCrowdLevel: 'low',
    averageWaitTime: 5,
    lastUpdated: new Date(),
    description: 'Uzun alışveriş caddesi',
  },
  {
    id: '11',
    name: 'Galata Kulesi',
    category: 'Turistik Alan',
    coordinates: [41.0256, 28.9742],
    address: 'Galata, Beyoğlu, İstanbul',
    currentCrowdLevel: 'very_high',
    averageWaitTime: 30,
    lastUpdated: new Date(),
    description: 'Tarihi kule ve manzara noktası',
  },
  {
    id: '12',
    name: 'Büyükada İskele',
    category: 'İskele',
    coordinates: [40.8607, 29.1248],
    address: 'Büyükada, Adalar, İstanbul',
    currentCrowdLevel: 'empty',
    averageWaitTime: 0,
    lastUpdated: new Date(),
    description: 'Ada iskelesi',
  },
];

// Mock istatistikler
export const mockStats: CrowdStats = {
  totalReports: 1247,
  activeUsers: 342,
  trackedLocations: 31, // Ankara lokasyon sayısı
  averageCrowdLevel: 'moderate' as CrowdLevel,
};

// Rastgele kalabalık seviyesi oluştur (demo için)
export const getRandomCrowdLevel = (): CrowdLevel => {
  const levels: CrowdLevel[] = ['empty', 'low', 'moderate', 'high', 'very_high'];
  return levels[Math.floor(Math.random() * levels.length)];
};

// Lokasyonları güncelleyici fonksiyon (demo için)
export const updateLocationsCrowdLevel = (locations: Location[]): Location[] => {
  return locations.map(location => ({
    ...location,
    currentCrowdLevel: getRandomCrowdLevel(),
    averageWaitTime: Math.floor(Math.random() * 35),
    lastUpdated: new Date(),
  }));
};
