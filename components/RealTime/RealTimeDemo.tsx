'use client';

import { useEffect, useState } from 'react';
import useNotificationStore from '@/store/notificationStore';
import useCrowdStore from '@/store/crowdStore';

// Mock data generator for testing
export default function RealTimeDemo() {
  const [isActive, setIsActive] = useState(false);
  const { addNotification } = useNotificationStore();
  const { updateCrowdData } = useCrowdStore();

  useEffect(() => {
    if (!isActive) return;

    // Mock crowd data updates every 30 seconds
    const crowdInterval = setInterval(() => {
      const mockCrowdData = [
        {
          locationId: 'loc_1',
          crowdLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          crowdCount: Math.floor(Math.random() * 100) + 10,
          lastUpdated: Date.now(),
          coordinates: [39.9334, 32.8597] as [number, number],
          name: 'Kızılay Meydanı',
          category: 'public_area',
          trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any,
          estimatedWaitTime: Math.floor(Math.random() * 15) + 5
        },
        {
          locationId: 'loc_2',
          crowdLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          crowdCount: Math.floor(Math.random() * 80) + 5,
          lastUpdated: Date.now(),
          coordinates: [39.9208, 32.8541] as [number, number],
          name: 'Ulus Meydanı',
          category: 'public_area',
          trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any,
          estimatedWaitTime: Math.floor(Math.random() * 20) + 3
        }
      ];

      updateCrowdData(mockCrowdData);
    }, 30000);

    // Mock notifications every 10 seconds
    const notificationInterval = setInterval(() => {
      const notificationTypes = ['info', 'crowd', 'success', 'warning'];
      const messages = [
        'Kızılay bölgesinde kalabalık artıyor',
        'Yeni bir cafe Ulus bölgesinde açıldı',
        'Hava durumu güncellendi',
        'Trafik yoğunluğu normal seviyede'
      ];

      const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      addNotification({
        title: 'Real-time Güncelleme',
        message: randomMessage,
        type: randomType as any,
        priority: 'normal'
      });
    }, 10000);

    // Initial data
    setTimeout(() => {
      addNotification({
        title: 'Real-time Demo Başlatıldı',
        message: 'Mock veriler ile test edebilirsiniz',
        type: 'success',
        priority: 'normal'
      });
    }, 1000);

    return () => {
      clearInterval(crowdInterval);
      clearInterval(notificationInterval);
    };
  }, [isActive, addNotification, updateCrowdData]);

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setIsActive(!isActive)}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          isActive 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {isActive ? '🔴 Demo Durdur' : '🟢 Demo Başlat'}
      </button>
      
      {isActive && (
        <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-700 max-w-48">
          Real-time demo aktif. Mock veriler üretiliyor...
        </div>
      )}
    </div>
  );
}