'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';
import { usePWAStore } from '@/lib/stores/pwaStore';
import { useEffect, useState } from 'react';

export default function OnlineStatusIndicator() {
  const { isOnline } = usePWAStore();
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Show status indicator when going offline
    if (!isOnline) {
      setShowStatus(true);
    } else {
      // Hide after 3 seconds when coming online
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
        >
          <div
            className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 ${
              isOnline
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-red-500 to-orange-500'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">Çevrimiçi</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-white animate-pulse" />
                <span className="text-white font-semibold">Çevrimdışı</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
