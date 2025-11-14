'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Phone } from 'lucide-react';
import { Location } from '@/types';
import { isLocationOpen, getWorkingHoursText, getCurrentDayName } from '@/lib/workingHours';

interface WorkingHoursBadgeProps {
  location: Location;
  size?: 'small' | 'medium' | 'large';
}

export default function WorkingHoursBadge({ location, size = 'medium' }: WorkingHoursBadgeProps) {
  const [mounted, setMounted] = useState(false);
  
  // Hydration hatası önlemek için mount sonrası render
  useEffect(() => {
    setMounted(true);
    console.log('🕐 WorkingHoursBadge mounted for:', location.name, {
      hasWorkingHours: !!location.workingHours,
      category: location.category
    });
  }, []);

  // SSR sırasında basit bir placeholder göster
  if (!mounted) {
    return (
      <div className="bg-gray-100 text-gray-600 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  const { isOpen, reason } = isLocationOpen(location);
  const hoursText = getWorkingHoursText(location);

  console.log('🕐 WorkingHoursBadge result for', location.name, ':', {
    isOpen,
    reason,
    hoursText,
    hasWorkingHours: !!location.workingHours
  });

  if (size === 'small') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${
        isOpen 
          ? 'bg-green-100 text-green-700' 
          : 'bg-red-100 text-red-700'
      }`}>
        <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
        <span>{isOpen ? 'Açık' : 'Kapalı'}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${
        isOpen 
          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
          : 'bg-gradient-to-r from-red-500 to-pink-500'
      } text-white rounded-xl p-3 shadow-md`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4" />
        <span className="font-bold text-sm">
          {getCurrentDayName()} - {isOpen ? '✅ Açık' : '❌ Kapalı'}
        </span>
      </div>
      
      <div className="text-xs space-y-1">
        {isOpen ? (
          <>
            <p className="opacity-90">Çalışma Saati: <strong>{hoursText}</strong></p>
            {location.phone && (
              <div className="flex items-center gap-1 opacity-90">
                <Phone className="w-3 h-3" />
                <span>{location.phone}</span>
              </div>
            )}
          </>
        ) : (
          <p className="font-semibold">{reason || 'Hafta sonu kapalı'}</p>
        )}
      </div>
    </motion.div>
  );
}
