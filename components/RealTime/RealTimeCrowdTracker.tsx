'use client';

import { useEffect, useState } from 'react';
import useCrowdStore, { CrowdData } from '@/store/crowdStore';
import useSocketStore from '@/store/socketStore';
import { Users, TrendingUp, TrendingDown, Minus, Clock, MapPin } from 'lucide-react';

interface RealTimeCrowdTrackerProps {
  locationId?: string;
  showAllLocations?: boolean;
  compact?: boolean;
  className?: string;
}

export default function RealTimeCrowdTracker({ 
  locationId, 
  showAllLocations = false,
  compact = false,
  className = '' 
}: RealTimeCrowdTrackerProps) {
  const { isConnected } = useSocketStore();
  const { 
    subscribeToCrowdUpdates,
    unsubscribeFromCrowdUpdates,
    getCrowdDataForLocation,
    getAllCrowdData,
    getCrowdLevelColor,
    getCrowdLevelText,
    getCrowdLevelIcon,
    lastUpdateTime
  } = useCrowdStore();

  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (isConnected) {
      subscribeToCrowdUpdates();
    }

    return () => {
      unsubscribeFromCrowdUpdates();
    };
  }, [isConnected, subscribeToCrowdUpdates, unsubscribeFromCrowdUpdates]);

  const getTrendIcon = (trend: CrowdData['trend']) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-3 h-3 text-green-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const formatLastUpdate = (timestamp: number) => {
    if (!timestamp) return 'Hiç';
    
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s önce`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}dk önce`;
    const hours = Math.floor(minutes / 60);
    return `${hours}sa önce`;
  };

  const CrowdCard = ({ data }: { data: CrowdData }) => (
    <div className={`
      p-4 rounded-xl border backdrop-blur-sm transition-all duration-300
      ${getCrowdLevelColor(data.crowdLevel)}
      hover:shadow-lg hover:scale-[1.02]
    `}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCrowdLevelIcon(data.crowdLevel)}</span>
          <div>
            <h3 className="font-semibold text-sm">{data.name}</h3>
            <p className="text-xs opacity-75">{data.category}</p>
          </div>
        </div>
        {getTrendIcon(data.trend)}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">{getCrowdLevelText(data.crowdLevel)}</span>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span className="text-xs font-mono">{data.crowdCount}</span>
          </div>
        </div>
        
        {data.estimatedWaitTime && (
          <div className="flex items-center gap-1 text-xs">
            <Clock className="w-3 h-3" />
            <span>~{data.estimatedWaitTime} dk bekleme</span>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs opacity-75">
          <span>Son güncelleme:</span>
          <span>{formatLastUpdate(data.lastUpdated)}</span>
        </div>
      </div>
    </div>
  );

  if (compact) {
    const data = locationId ? getCrowdDataForLocation(locationId) : null;
    if (!data) return null;

    return (
      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg text-xs ${getCrowdLevelColor(data.crowdLevel)} ${className}`}>
        <span>{getCrowdLevelIcon(data.crowdLevel)}</span>
        <span className="font-medium">{getCrowdLevelText(data.crowdLevel)}</span>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span className="font-mono">{data.crowdCount}</span>
        </div>
        {getTrendIcon(data.trend)}
      </div>
    );
  }

  if (locationId && !showAllLocations) {
    const data = getCrowdDataForLocation(locationId);
    if (!data) {
      return (
        <div className={`p-4 rounded-xl border border-gray-200 bg-gray-50 ${className}`}>
          <div className="text-center text-gray-500">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Kalabalık verisi yükleniyor...</p>
          </div>
        </div>
      );
    }

    return (
      <div className={className}>
        <CrowdCard data={data} />
      </div>
    );
  }

  const allData = getAllCrowdData();

  if (allData.length === 0) {
    return (
      <div className={`p-6 rounded-xl border border-gray-200 bg-gray-50 text-center ${className}`}>
        <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <h3 className="font-semibold text-gray-700 mb-2">Kalabalık Verisi Bekleniyor</h3>
        <p className="text-sm text-gray-500 mb-4">
          Veriler yükleniyor...
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span>{isConnected ? 'Bağlı' : 'Bağlantı bekleniyor'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          <h2 className="font-bold">Canlı Kalabalık Takibi</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span>Son güncelleme: {formatLastUpdate(lastUpdateTime)}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allData.map((data) => (
          <CrowdCard key={data.locationId} data={data} />
        ))}
      </div>
      
      <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-xs text-blue-700">
          ℹ️ Kalabalık verileri her 30 saniyede otomatik güncellenir
        </p>
      </div>
    </div>
  );
}