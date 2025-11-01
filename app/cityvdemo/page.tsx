'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Users, TrendingUp, Star, Heart, Clock,
  Search, Filter, Crown, Zap, Target, Award,
  Coffee, ShoppingBag, Utensils, Building2,
  Activity, Eye, Bell, Sparkles, ChevronRight,
  Camera, Radio, BarChart3, Wifi, Signal, Battery
} from 'lucide-react';
import ProHeader from '@/components/Layout/ProHeader';
import LiveCrowdSidebar from '@/components/RealTime/LiveCrowdSidebar';

// Dynamic import for map
const MapViewEnhanced = dynamic(() => import('@/components/Map/MapViewEnhanced'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-semibold">Harita yükleniyor...</p>
      </div>
    </div>
  ),
});

// Demo lokasyonları
const DEMO_LOCATIONS = [
  {
    id: 'demo-1',
    name: 'Kızılay Meydanı',
    category: 'Meydan',
    address: 'Kızılay, Çankaya, Ankara',
    coordinates: [39.9199, 32.8543] as [number, number],
    currentCrowdLevel: 'very_high' as const,
    crowdLevel: 'very_crowded',
    currentPeople: 487,
    rating: 4.6,
    isOpen: true,
    openingHours: '24 Saat Açık',
    tags: ['Merkez', 'Alışveriş', 'Ulaşım'],
    waitTime: 5,
    trend: 'up',
    change: 12,
  },
  {
    id: 'demo-2',
    name: 'Tunalı Hilmi Caddesi',
    category: 'Cadde',
    address: 'Tunalı, Çankaya, Ankara',
    coordinates: [39.9150, 32.8520] as [number, number],
    currentCrowdLevel: 'high' as const,
    crowdLevel: 'crowded',
    currentPeople: 324,
    rating: 4.8,
    isOpen: true,
    openingHours: '09:00 - 23:00',
    tags: ['Cafe', 'Restoran', 'Butik'],
    waitTime: 3,
    trend: 'stable',
    change: 0,
  },
  {
    id: 'demo-3',
    name: 'Ankamall AVM',
    category: 'AVM',
    address: 'Akköprü, Altındağ, Ankara',
    coordinates: [39.9550, 32.8170] as [number, number],
    currentCrowdLevel: 'moderate' as const,
    crowdLevel: 'moderate',
    currentPeople: 256,
    rating: 4.5,
    isOpen: true,
    openingHours: '10:00 - 22:00',
    tags: ['Alışveriş', 'Sinema', 'Yemek'],
    waitTime: 2,
    trend: 'down',
    change: -8,
  },
  {
    id: 'demo-4',
    name: 'Anıtkabir',
    category: 'Müze',
    address: 'Anıttepe, Çankaya, Ankara',
    coordinates: [39.9251, 32.8369] as [number, number],
    currentCrowdLevel: 'low' as const,
    crowdLevel: 'low',
    currentPeople: 87,
    rating: 5.0,
    isOpen: true,
    openingHours: '09:00 - 17:00',
    tags: ['Tarihi', 'Müze', 'Park'],
    waitTime: 0,
    trend: 'stable',
    change: 0,
  },
  {
    id: 'demo-5',
    name: 'Atatürk Orman Çiftliği',
    category: 'Park',
    address: 'Gazi, Çankaya, Ankara',
    coordinates: [39.9600, 32.8100] as [number, number],
    currentCrowdLevel: 'moderate' as const,
    crowdLevel: 'moderate',
    currentPeople: 198,
    rating: 4.7,
    isOpen: true,
    openingHours: '08:00 - 20:00',
    tags: ['Park', 'Piknik', 'Doğa'],
    waitTime: 1,
    trend: 'up',
    change: 5,
  },
  {
    id: 'demo-6',
    name: 'Armada AVM',
    category: 'AVM',
    address: 'Söğütözü, Çankaya, Ankara',
    coordinates: [39.9100, 32.8450] as [number, number],
    currentCrowdLevel: 'high' as const,
    crowdLevel: 'crowded',
    currentPeople: 412,
    rating: 4.6,
    isOpen: true,
    openingHours: '10:00 - 22:00',
    tags: ['Lüks', 'Restoran', 'Marka'],
    waitTime: 4,
    trend: 'up',
    change: 15,
  },
  {
    id: 'demo-7',
    name: 'Kuğulu Park',
    category: 'Park',
    address: 'Küçükesat, Çankaya, Ankara',
    coordinates: [39.9180, 32.8590] as [number, number],
    currentCrowdLevel: 'low' as const,
    crowdLevel: 'low',
    currentPeople: 65,
    rating: 4.4,
    isOpen: true,
    openingHours: '24 Saat Açık',
    tags: ['Park', 'Gölet', 'Yürüyüş'],
    waitTime: 0,
    trend: 'stable',
    change: 0,
  },
  {
    id: 'demo-8',
    name: 'Ankara Kalesi',
    category: 'Tarihi',
    address: 'Altındağ, Ankara',
    coordinates: [39.9400, 32.8650] as [number, number],
    currentCrowdLevel: 'moderate' as const,
    crowdLevel: 'moderate',
    currentPeople: 143,
    rating: 4.5,
    isOpen: true,
    openingHours: '08:00 - 19:00',
    tags: ['Kale', 'Manzara', 'Fotoğraf'],
    waitTime: 1,
    trend: 'up',
    change: 7,
  },
];

// Canlı güncelleme simülasyonu
const updateCrowdData = (locations: any[]) => {
  return locations.map(loc => {
    const newPeople = Math.max(10, loc.currentPeople + Math.floor(Math.random() * 20) - 10);
    const change = Math.floor(Math.random() * 20) - 10;
    
    // Kalabalık seviyesini kişi sayısına göre güncelle
    let newCrowdLevel: 'empty' | 'low' | 'moderate' | 'high' | 'very_high';
    if (newPeople > 400) newCrowdLevel = 'very_high';
    else if (newPeople > 250) newCrowdLevel = 'high';
    else if (newPeople > 150) newCrowdLevel = 'moderate';
    else if (newPeople > 50) newCrowdLevel = 'low';
    else newCrowdLevel = 'empty';
    
    return {
      ...loc,
      currentPeople: newPeople,
      currentCrowdLevel: newCrowdLevel as const,
      change,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
    };
  });
};

export default function CityVDemo() {
  const [mounted, setMounted] = useState(false);
  const [locations, setLocations] = useState(DEMO_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCrowdSidebarOpen, setIsCrowdSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [liveUpdateCount, setLiveUpdateCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Canlı güncelleme - Her 5 saniyede
  useEffect(() => {
    const interval = setInterval(() => {
      setLocations(updateCrowdData(locations));
      setLiveUpdateCount(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [locations]);

  // Filtreleme
  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || loc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // İstatistikler
  const stats = {
    totalLocations: locations.length,
    activeUsers: 1847 + liveUpdateCount * 3,
    totalPeople: locations.reduce((sum, loc) => sum + loc.currentPeople, 0),
    avgRating: 4.7,
  };

  const categories = ['all', ...Array.from(new Set(locations.map(l => l.category)))];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Demo Badge */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute top-20 left-4 z-[60] bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl shadow-2xl border-2 border-white/20"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping" />
          </div>
          <span className="font-bold text-lg">🎯 CANLI DEMO</span>
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
      </motion.div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <ProHeader
          onAuthClick={() => alert('Giriş Yap - Demo')}
          onPremiumClick={() => alert('Premium - Demo')}
          onNotificationsClick={() => alert('Bildirimler - Demo')}
        />
      </div>

      {/* Stats Banner */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute top-28 left-1/2 transform -translate-x-1/2 z-[60] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-purple-200 px-8 py-4"
      >
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-purple-600" />
            <div>
              <div className="text-2xl font-black">{stats.totalLocations}</div>
              <div className="text-xs text-gray-500">Lokasyon</div>
            </div>
          </div>
          
          <div className="w-px h-10 bg-gray-200" />
          
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            <div>
              <div className="text-2xl font-black">{mounted ? stats.activeUsers.toLocaleString() : '--'}</div>
              <div className="text-xs text-gray-500">Kullanıcı</div>
            </div>
          </div>
          
          <div className="w-px h-10 bg-gray-200" />
          
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-green-600" />
            <div>
              <div className="text-2xl font-black">{mounted ? stats.totalPeople.toLocaleString() : '--'}</div>
              <div className="text-xs text-gray-500">Kişi</div>
            </div>
          </div>
          
          <div className="w-px h-10 bg-gray-200" />
          
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-600" />
            <div>
              <div className="text-2xl font-black">{stats.avgRating}</div>
              <div className="text-xs text-gray-500">Puan</div>
            </div>
          </div>

          <div className="ml-4 flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold">Canlı</span>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-48 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4"
      >
        <div className="relative">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
          <input
            type="text"
            placeholder="Lokasyon ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-6 py-5 text-lg bg-white/95 backdrop-blur-xl border-2 border-purple-200 rounded-2xl shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-300"
          />
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-72 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-purple-200 p-6">
              <h3 className="text-lg font-bold mb-4">Kategoriler</h3>
              <div className="grid grid-cols-3 gap-3">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {cat === 'all' ? 'Tümü' : cat}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map */}
      <div className="absolute inset-0">
        <MapViewEnhanced
          locations={filteredLocations}
          onLocationSelect={setSelectedLocation}
          selectedLocation={selectedLocation}
          userLocation={{ latitude: 39.9208, longitude: 32.8541 }}
        />
      </div>

      {/* Live Crowd Sidebar */}
      <div className="absolute top-20 right-0 z-40">
        <LiveCrowdSidebar
          isOpen={isCrowdSidebarOpen}
          onToggle={() => setIsCrowdSidebarOpen(!isCrowdSidebarOpen)}
          locations={locations}
        />
      </div>

      {/* IoT Status */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="absolute bottom-8 left-4 z-50 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl shadow-2xl p-6 border-2 border-white/20"
      >
        <div className="flex items-center gap-4">
          <Camera className="w-8 h-8" />
          <div>
            <div className="text-sm opacity-90">IoT Cihazlar</div>
            <div className="text-2xl font-black">{mounted ? '8/8' : '--'} Aktif</div>
          </div>
        </div>
        <div className="mt-3 flex gap-2 text-sm">
          <Wifi className="w-4 h-4" />
          <Battery className="w-4 h-4" />
          <Signal className="w-4 h-4" />
        </div>
      </motion.div>

      {/* Updates Badge */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-2xl px-8 py-4 border-2 border-white/20"
      >
        <div className="flex items-center gap-4">
          <Radio className="w-6 h-6 animate-pulse" />
          <div>
            <div className="text-sm opacity-90">Canlı Güncelleme</div>
            <div className="text-xl font-black">{mounted ? liveUpdateCount : '--'} Güncelleme</div>
          </div>
        </div>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="absolute bottom-8 right-4 z-50 space-y-3"
      >
        <div className="bg-purple-600 text-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
          <Eye className="w-5 h-5" />
          <span className="font-bold">AI Analiz</span>
        </div>
        <div className="bg-orange-600 text-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
          <Bell className="w-5 h-5 animate-bounce" />
          <span className="font-bold">Bildirimler</span>
        </div>
        <div className="bg-yellow-600 text-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
          <Crown className="w-5 h-5" />
          <span className="font-bold">Premium</span>
        </div>
      </motion.div>
    </div>
  );
}
