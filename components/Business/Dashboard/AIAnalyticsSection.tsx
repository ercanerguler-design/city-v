'use client';

import { useState, useEffect } from 'react';
import { Activity, BarChart3, Users, Eye, Armchair, Zap, TrendingUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import Analytics Components
import {
  LiveCrowdCard,
  CrowdTrendChart,
  HeatmapVisualizer,
  AIDetectionFeed,
  SeatingMap
} from '@/components/Business/Analytics';
import RealTimeStatus from '@/components/Business/Analytics/RealTimeStatus';
import HistoricalReportWidget from '@/components/Business/HistoricalReportWidget';

interface AIAnalyticsSectionProps {
  businessId: string;
}

export default function AIAnalyticsSection({ businessId }: AIAnalyticsSectionProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'crowd' | 'heatmap' | 'ai' | 'seating'>('heatmap');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(true);

  // 🔥 REAL-TIME: Her 5 saniyede bir güncelleme zamanını değiştir
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      console.log('⚡ AI Analytics güncelleniyor...', new Date().toLocaleTimeString());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: BarChart3, color: 'blue', gradient: 'bg-gradient-to-r from-blue-500 to-cyan-500', bgColor: 'bg-blue-500' },
    { id: 'crowd', label: 'Kalabalık Analizi', icon: Users, color: 'purple', gradient: 'bg-gradient-to-r from-purple-500 to-pink-500', bgColor: 'bg-purple-500' },
    { id: 'heatmap', label: 'Isı Haritası', icon: Activity, color: 'orange', gradient: 'bg-gradient-to-r from-orange-500 to-red-500', bgColor: 'bg-orange-500' },
    { id: 'ai', label: 'AI Algılama', icon: Eye, color: 'green', gradient: 'bg-gradient-to-r from-green-500 to-emerald-500', bgColor: 'bg-green-500' },
    { id: 'seating', label: 'Oturma Durumu', icon: Armchair, color: 'indigo', gradient: 'bg-gradient-to-r from-indigo-500 to-violet-500', bgColor: 'bg-indigo-500' }
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Professional Header with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 border border-indigo-400/30 shadow-2xl"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30"
            >
              <Zap className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
                AI Analytics Dashboard
                <span className="text-sm font-normal text-white/80 bg-white/10 px-2 py-0.5 rounded-full">v3.0</span>
              </h2>
              <p className="text-white/90 flex items-center gap-2 font-medium">
                <TrendingUp className="w-4 h-4" />
                Gerçek zamanlı AI destekli yoğunluk analizi ve tahminleme sistemi
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Live Status Badge */}
            <motion.div 
              animate={{ 
                boxShadow: isLive ? ['0 0 0 0 rgba(34, 197, 94, 0.7)', '0 0 0 10px rgba(34, 197, 94, 0)'] : 'none'
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border backdrop-blur-sm ${
                isLive 
                  ? 'bg-green-400/20 border-green-300/50' 
                  : 'bg-white/10 border-white/20'
              }`}
            >
              <motion.div 
                animate={{ scale: isLive ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 1, repeat: Infinity }}
                className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-green-300' : 'bg-gray-400'}`}
              ></motion.div>
              <div className="text-right">
                <div className={`text-xs font-bold ${isLive ? 'text-white' : 'text-white/70'}`}>
                  {isLive ? 'CANLI' : 'DURDURULDU'}
                </div>
                <div className="text-[10px] text-white/60">5s güncelleme</div>
              </div>
            </motion.div>

            {/* Last Update Time */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <Clock className="w-4 h-4 text-white/80" />
              <div className="text-right">
                <div className="text-xs font-medium text-white">Son Güncelleme</div>
                <div className="text-[10px] text-white/70">
                  {lastUpdate.toLocaleTimeString('tr-TR')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Professional Tab Navigation */}
      <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl p-3 border border-slate-600/30 shadow-2xl">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex items-center gap-3 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap min-w-fit border ${
                  isActive
                    ? `${tab.gradient} text-white shadow-xl border-white/30`
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/60 hover:text-white border-slate-600/50 hover:border-slate-500/70'
                }`}
                style={{
                  boxShadow: isActive 
                    ? `0 8px 32px rgba(${
                        tab.color === 'blue' ? '59, 130, 246' : 
                        tab.color === 'purple' ? '147, 51, 234' : 
                        tab.color === 'orange' ? '249, 115, 22' : 
                        tab.color === 'green' ? '34, 197, 94' : 
                        '99, 102, 241'
                      }, 0.4)` 
                    : 'none'
                }}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-sm' : ''}`} />
                <span className="font-semibold">{tab.label}</span>
                
                {/* Active Tab Glow */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                  />
                )}
                
                {/* Active Indicator Dot */}
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-lg animate-pulse" />
                )}
              </motion.button>
            );
          })}
        </div>
        
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-transparent to-slate-900/40 rounded-2xl pointer-events-none" />
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <RealTimeStatus businessId={businessId} />
              <div className="lg:col-span-2">
                <LiveCrowdCard businessId={businessId} />
              </div>
            </div>
            <CrowdTrendChart businessId={businessId} timeRange="24hours" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HistoricalReportWidget businessId={businessId} />
              <AIDetectionFeed businessId={businessId} maxItems={10} />
            </div>
          </div>
        )}

        {activeTab === 'crowd' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <LiveCrowdCard businessId={businessId} />
                <CrowdTrendChart businessId={businessId} timeRange="24hours" />
              </div>
              <div>
                <HistoricalReportWidget businessId={businessId} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'heatmap' && (
          <HeatmapVisualizer businessId={businessId} width={1200} height={600} />
        )}

        {activeTab === 'ai' && (
          <AIDetectionFeed businessId={businessId} maxItems={30} />
        )}

        {activeTab === 'seating' && (
          <SeatingMap businessId={businessId} />
        )}
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 bg-opacity-20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="font-semibold text-white">Gerçek Zamanlı</h4>
          </div>
          <p className="text-sm text-gray-400">
            ESP32-CAM sisteminden 10 saniyede bir güncellenen canlı veriler
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-600 bg-opacity-20 rounded-lg">
              <Eye className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="font-semibold text-white">AI Destekli</h4>
          </div>
          <p className="text-sm text-gray-400">
            Yapay zeka ile kişi, nesne ve yüz tanıma teknolojisi
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-600 bg-opacity-20 rounded-lg">
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <h4 className="font-semibold text-white">Isı Haritası</h4>
          </div>
          <p className="text-sm text-gray-400">
            Müşteri yoğunluğunun görsel analizi ve hotspot tespiti
          </p>
        </div>
      </div>
    </div>
  );
}
