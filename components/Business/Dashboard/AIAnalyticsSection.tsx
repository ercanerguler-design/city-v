'use client';

import { useState } from 'react';
import { Activity, BarChart3, Users, Eye, Armchair } from 'lucide-react';
import { motion } from 'framer-motion';

// Import Analytics Components
import {
  LiveCrowdCard,
  CrowdTrendChart,
  HeatmapVisualizer,
  AIDetectionFeed,
  SeatingMap
} from '@/components/Business/Analytics';

interface AIAnalyticsSectionProps {
  businessId: string;
}

export default function AIAnalyticsSection({ businessId }: AIAnalyticsSectionProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'crowd' | 'heatmap' | 'ai' | 'seating'>('overview');

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
    { id: 'crowd', label: 'Kalabalık Analizi', icon: Users },
    { id: 'heatmap', label: 'Isı Haritası', icon: Activity },
    { id: 'ai', label: 'AI Algılama', icon: Eye },
    { id: 'seating', label: 'Oturma Durumu', icon: Armchair }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-6 border border-indigo-700">
        <h2 className="text-2xl font-bold text-white mb-2">AI Analytics Dashboard</h2>
        <p className="text-indigo-200">Gerçek zamanlı kalabalık analizi, ısı haritası ve yapay zeka destekli görüntüleme</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LiveCrowdCard businessId={businessId} />
            <CrowdTrendChart businessId={businessId} timeRange="24hours" />
          </div>
        )}

        {activeTab === 'crowd' && (
          <div className="space-y-6">
            <LiveCrowdCard businessId={businessId} />
            <CrowdTrendChart businessId={businessId} timeRange="24hours" />
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
