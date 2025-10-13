'use client';

import { useEffect, useState } from 'react';
import useCrowdStore from '@/store/crowdStore';
import { Users, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function CrowdOverlayPanel() {
  const { crowdData } = useCrowdStore();
  const [isVisible, setIsVisible] = useState(true);

  const formatLastUpdated = (timestamp: number) => {
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return `${diff} saniye önce`;
    if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
    return `${Math.floor(diff / 3600)} saat önce`;
  };

  const getCrowdColor = (level: string) => {
    const colors = {
      low: 'text-green-500',
      medium: 'text-yellow-500',
      high: 'text-red-500'
    };
    return colors[level as keyof typeof colors] || 'text-gray-500';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 right-4 z-50 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg shadow-lg"
      >
        <Users className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-sm min-h-[200px] border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          Gerçek Zamanlı Kalabalık
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
      </div>

      {crowdData.size === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Henüz kalabalık verisi yok</p>
          <p className="text-sm">Demo başlatın</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {Array.from(crowdData.values()).map((data) => (
            <div
              key={data.locationId}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm">{data.name}</h4>
                {getTrendIcon(data.trend)}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className={`w-4 h-4 ${getCrowdColor(data.crowdLevel)}`} />
                  <span className={`font-medium ${getCrowdColor(data.crowdLevel)}`}>
                    {data.crowdCount} kişi
                  </span>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {data.estimatedWaitTime}dk
                </div>
              </div>
              
              <div className="text-xs text-gray-400 mt-1">
                {formatLastUpdated(data.lastUpdated)}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Canlı Güncelleme Aktif
        </div>
      </div>
    </div>
  );
}