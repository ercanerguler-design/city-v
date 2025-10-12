'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WeatherData,
  formatTemperature,
  getWeatherIcon,
  getWeatherDescription,
  getClothingRecommendation,
  getWeatherBasedRecommendation,
  getWeatherIconUrl,
} from '@/lib/weather';

interface WeatherWidgetProps {
  lat: number;
  lon: number;
  className?: string;
}

export default function WeatherWidget({ lat, lon, className = '' }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);

        if (!response.ok) {
          throw new Error('Weather fetch failed');
        }

        const data = await response.json();
        setWeather(data);
      } catch (err) {
        console.error('Weather error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 600000);

    return () => clearInterval(interval);
  }, [lat, lon]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-white border-2 border-indigo-200 rounded-2xl p-4 shadow-lg ${className}`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-indigo-100 rounded w-20 animate-pulse" />
            <div className="h-3 bg-indigo-100 rounded w-32 animate-pulse" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !weather) {
    return null; // Hata durumunda widget'ı gizle
  }

  const recommendation = getWeatherBasedRecommendation(weather.condition, weather.temp);
  const clothing = getClothingRecommendation(weather.condition, weather.temp);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl overflow-hidden shadow-xl ${className}`}
    >
      {/* Compact View */}
      <motion.div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Weather Icon */}
            <div className="relative w-14 h-14 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <img
                src={getWeatherIconUrl(weather.icon)}
                alt={weather.description}
                className="w-12 h-12 object-contain drop-shadow-lg"
              />
            </div>

            {/* Temperature & Description */}
            <div>
              <div className="text-3xl font-bold text-white drop-shadow-md">
                {formatTemperature(weather.temp)}
              </div>
              <div className="text-sm text-white/90 capitalize font-medium">
                {weather.description}
              </div>
            </div>
          </div>

          {/* Expand Icon */}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-white/80 text-xl font-bold"
          >
            ▼
          </motion.div>
        </div>

        {/* Mock indicator - Sadece API hatası durumunda göster */}
        {weather.isMock && (
          <div className="mt-3 bg-yellow-400/20 border border-yellow-300/30 rounded-lg px-3 py-2">
            <div className="text-xs text-yellow-100 font-medium leading-relaxed">
              ⚠️ Hava durumu API'sine ulaşılamadı - Örnek veri gösteriliyor
            </div>
          </div>
        )}
      </motion.div>

      {/* Expanded View */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/20 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Weather Recommendation */}
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-sm text-white font-semibold leading-relaxed">
                  {recommendation.message}
                </div>
              </div>

              {/* Weather Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Feels Like */}
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className="text-xs text-white/70 mb-1 font-medium">Hissedilen</div>
                  <div className="text-xl font-bold text-white">
                    {formatTemperature(weather.feels_like)}
                  </div>
                </div>

                {/* Humidity */}
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className="text-xs text-white/70 mb-1 font-medium">Nem</div>
                  <div className="text-xl font-bold text-white">
                    💧 {weather.humidity}%
                  </div>
                </div>

                {/* Wind Speed */}
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className="text-xs text-white/70 mb-1 font-medium">Rüzgar</div>
                  <div className="text-xl font-bold text-white">
                    💨 {weather.wind_speed.toFixed(1)} m/s
                  </div>
                </div>

                {/* Outdoor Status */}
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className="text-xs text-white/70 mb-1 font-medium">Dışarı Çıkma</div>
                  <div className="text-lg font-bold text-white">
                    {recommendation.preferOutdoor ? '✅ İdeal' : '❌ Uygun Değil'}
                  </div>
                </div>
              </div>

              {/* Clothing Recommendation */}
              <div className="bg-gradient-to-r from-yellow-400/30 to-orange-400/30 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-xs text-white/80 mb-1 font-medium">Kıyafet Önerisi</div>
                <div className="text-sm text-white font-bold">
                  {clothing}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
