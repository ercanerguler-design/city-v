'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, Train, MapPin, Users, Clock, Star, TrendingUp, 
  Navigation, Route, Zap, Crown, Search, Filter, 
  ChevronRight, Activity, Sparkles, Map, Trophy, 
  Shield, Award, Target, Layers, Heart, Calendar,
  ArrowRight, Wifi, Battery, Signal, Phone, BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface City {
  id: number;
  city_name: string;
  city_code: string;
  population: number;
  transport_tier: string;
  has_metro: boolean;
  has_bus: boolean;
  has_tram: boolean;
  has_ferry: boolean;
  line_count?: number;
  agency_count?: number;
}

interface TransportLine {
  id: number;
  line_code: string;
  line_name: string;
  line_type: string;
  fare_price: number;
  frequency_minutes: number;
  vehicle_capacity: number;
  color_code: string;
  agency_name: string;
}

export default function TransportDemo() {
  const [mounted, setMounted] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [lines, setLines] = useState<TransportLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showDemo, setShowDemo] = useState(true);
  const [liveCount, setLiveCount] = useState(0);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchCities();
    }
  }, [mounted]);

  // Canlı sayaç animasyonu
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transport/cities');
      const data = await response.json();
      
      if (data.success) {
        setCities(data.cities);
        const defaultCity = data.cities.find((city: City) => city.city_code === 'IST') || data.cities[0];
        if (defaultCity) {
          setSelectedCity(defaultCity);
          fetchCityLines(defaultCity.city_code);
        }
      }
    } catch (error) {
      console.error('Şehir listesi yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCityLines = async (cityCode: string) => {
    try {
      const response = await fetch(`/api/transport/cities/${cityCode}/lines`);
      const data = await response.json();
      
      if (data.success) {
        setLines(data.lines);
      }
    } catch (error) {
      console.error('Hat listesi yüklenemedi:', error);
    }
  };

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    fetchCityLines(city.city_code);
  };

  const getTransportTypeIcon = (type: string) => {
    switch (type) {
      case 'metro': return <Train className="w-5 h-5" />;
      case 'bus': return <Bus className="w-5 h-5" />;
      case 'tram': return <Train className="w-5 h-5" />;
      case 'ferry': return <Navigation className="w-5 h-5" />;
      default: return <Bus className="w-5 h-5" />;
    }
  };

  const getTransportTypeColor = (type: string) => {
    switch (type) {
      case 'metro': return 'from-blue-500 to-blue-600';
      case 'bus': return 'from-green-500 to-green-600';
      case 'tram': return 'from-purple-500 to-purple-600';
      case 'ferry': return 'from-cyan-500 to-cyan-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getCityTierBadge = (tier: string) => {
    switch (tier) {
      case 'megapol': return { label: 'Megapol', color: 'from-red-500 to-red-600', icon: Trophy };
      case 'metropol': return { label: 'Metropol', color: 'from-orange-500 to-orange-600', icon: Award };
      case 'büyük': return { label: 'Büyük', color: 'from-blue-500 to-blue-600', icon: Target };
      case 'orta': return { label: 'Orta', color: 'from-green-500 to-green-600', icon: Layers };
      default: return { label: 'Küçük', color: 'from-gray-500 to-gray-600', icon: Heart };
    }
  };

  const getCrowdingLevel = () => {
    const levels = ['Boş', 'Az Dolu', 'Orta', 'Dolu', 'Çok Dolu'];
    const colors = ['text-green-500', 'text-yellow-500', 'text-orange-500', 'text-red-500', 'text-red-700'];
    const randomIndex = Math.floor(Math.random() * levels.length);
    return { level: levels[randomIndex], color: colors[randomIndex] };
  };

  const filteredLines = lines.filter(line => {
    const matchesSearch = line.line_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         line.line_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || line.line_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const topCities = cities
    .sort((a, b) => (b.line_count || 0) - (a.line_count || 0))
    .slice(0, 8);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Floating Demo Banner */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="font-semibold">🚀 DEMO SÜRÜMÜ - City-V Transport Vizyonu</span>
              <button 
                onClick={() => setShowDemo(false)}
                className="ml-2 hover:bg-white/20 rounded-full p-1"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white py-20 px-8 rounded-3xl mb-12 overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-10 left-10 w-32 h-32 border-4 border-white/20 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-10 right-10 w-24 h-24 border-4 border-white/20 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full"
            />
          </div>

          <div className="relative z-10 text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-4 bg-white/20 backdrop-blur-sm rounded-full px-8 py-4 mb-8"
            >
              <Bus className="h-10 w-10" />
              <span className="text-2xl font-bold">City-V Transport</span>
              <div className="flex gap-1">
                <Star className="h-5 w-5 text-yellow-300 fill-current" />
                <Star className="h-5 w-5 text-yellow-300 fill-current" />
                <Star className="h-5 w-5 text-yellow-300 fill-current" />
              </div>
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Akıllı Şehir
              <br />
              <span className="text-5xl md:text-7xl">Ulaşımı</span>
            </h1>
            
            <p className="text-2xl md:text-3xl mb-12 text-blue-100 max-w-4xl mx-auto leading-relaxed font-light">
              🌟 Türkiye'nin en kapsamlı toplu taşıma platformu
              <br />
              <span className="text-xl md:text-2xl text-purple-200">
                Canlı yoğunluk takibi • AI tahminleri • Akıllı rotalar
              </span>
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {[
                { icon: MapPin, title: "Canlı Takip", desc: "Gerçek zamanlı", color: "text-yellow-300" },
                { icon: Users, title: "Yoğunluk", desc: "Anlık doluluk", color: "text-green-300" },
                { icon: Route, title: "Akıllı Rota", desc: "En hızlı yol", color: "text-purple-300" },
                { icon: Zap, title: "AI Tahmin", desc: "Öngörüler", color: "text-orange-300" }
              ].map((feature, i) => (
                <motion.div 
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-4 hover:bg-white/30 transition-all">
                    <feature.icon className={`h-10 w-10 mx-auto ${feature.color}`} />
                  </div>
                  <h3 className="font-bold text-xl">{feature.title}</h3>
                  <p className="text-blue-200">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-emerald-400/20 to-blue-400/20 backdrop-blur-sm border border-white/30 rounded-3xl p-8"
            >
              <div className="flex items-center justify-center gap-4 mb-4">
                <Activity className="h-8 w-8 text-green-300 animate-pulse" />
                <span className="text-2xl font-bold">Canlı Demo</span>
                <Signal className="h-8 w-8 text-blue-300 animate-bounce" />
              </div>
              <p className="text-xl text-blue-100 mb-6">
                🎯 {cities.length} şehir • {lines.length}+ hat • Gerçek zamanlı simülasyon
              </p>
              <div className="flex items-center justify-center gap-8 text-green-200">
                <div className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  <span>Bağlı</span>
                </div>
                <div className="flex items-center gap-2">
                  <Battery className="h-5 w-5" />
                  <span>Aktif</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>{liveCount} veri</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {[
            { label: "Toplam Şehir", value: cities.length, icon: Map, color: "from-blue-500 to-blue-600" },
            { label: "Transport Hatları", value: lines.length, icon: Route, color: "from-green-500 to-green-600" },
            { label: "Canlı Rapor", value: `${liveCount}+`, icon: Activity, color: "from-purple-500 to-purple-600" },
            { label: "Demo Kullanıcı", value: "1K+", icon: Users, color: "from-orange-500 to-orange-600" }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className={`bg-gradient-to-r ${stat.color} text-white rounded-2xl p-6 text-center shadow-lg`}
            >
              <stat.icon className="h-8 w-8 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm opacity-90">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* City Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            🌍 Türkiye Şehirleri
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topCities.map((city, i) => {
              const tierInfo = getCityTierBadge(city.transport_tier);
              const TierIcon = tierInfo.icon;
              
              return (
                <motion.div
                  key={city.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  onClick={() => handleCitySelect(city)}
                  className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl cursor-pointer transition-all transform hover:scale-105 ${
                    selectedCity?.id === city.id ? 'ring-4 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {city.city_name}
                    </h3>
                    <div className={`bg-gradient-to-r ${tierInfo.color} text-white p-2 rounded-lg`}>
                      <TierIcon className="h-5 w-5" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{city.population?.toLocaleString('tr-TR')} nüfus</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Route className="h-4 w-4" />
                      <span>{city.line_count || 0} hat</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    {city.has_metro && (
                      <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-xs">
                        Metro
                      </div>
                    )}
                    {city.has_bus && (
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded text-xs">
                        Otobüs
                      </div>
                    )}
                    {city.has_tram && (
                      <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded text-xs">
                        Tramvay
                      </div>
                    )}
                  </div>

                  <div className={`text-center py-2 px-4 rounded-lg text-sm font-medium bg-gradient-to-r ${tierInfo.color} text-white`}>
                    {tierInfo.label} Şehir
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Selected City Lines */}
        {selectedCity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                🚌 {selectedCity.city_name} Transport Hatları
              </h3>

              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Hat kodu veya adı ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Tüm Araçlar</option>
                  <option value="metro">Metro</option>
                  <option value="bus">Otobüs</option>
                  <option value="tram">Tramvay</option>
                  <option value="ferry">Vapur</option>
                </select>
              </div>

              {/* Lines Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLines.map((line, i) => {
                  const crowding = getCrowdingLevel();
                  return (
                    <motion.div
                      key={line.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer border-l-4"
                      style={{ borderColor: line.color_code }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${getTransportTypeColor(line.line_type)} text-white`}>
                            {getTransportTypeIcon(line.line_type)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">
                              {line.line_code}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {line.agency_name}
                            </div>
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${crowding.color}`}>
                          {crowding.level}
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {line.line_name}
                      </h4>
                      
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Her {line.frequency_minutes} dk</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{line.vehicle_capacity} kişi</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">💰</span>
                          <span>{line.fare_price.toFixed(2)} ₺</span>
                        </div>
                      </div>

                      {/* Live Indicator */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Canlı Takip
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {filteredLines.length === 0 && (
                <div className="text-center py-12">
                  <Bus className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Arama kriterlerinize uygun hat bulunamadı.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 text-white rounded-3xl p-12 text-center"
        >
          <h2 className="text-4xl font-bold mb-4">🚀 Geleceğin Ulaşımı Bugün</h2>
          <p className="text-xl mb-8 opacity-90">
            City-V ile akıllı şehir ulaşımının gücünü keşfedin
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2">
              <Star className="h-5 w-5" />
              Demo'yu Beğen
            </button>
            <button className="border-2 border-white text-white font-bold py-4 px-8 rounded-xl hover:bg-white hover:text-blue-600 transition-colors flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Daha Fazla Bilgi
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}