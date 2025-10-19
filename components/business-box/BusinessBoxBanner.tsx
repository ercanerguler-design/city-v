'use client';

import { motion } from 'framer-motion';
import { X, TrendingUp, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BusinessBoxBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // localStorage kontrolü
    const bannerClosed = localStorage.getItem('cityv-business-box-banner-closed');
    if (!bannerClosed) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('cityv-business-box-banner-closed', 'true');
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white relative overflow-hidden z-50"
    >
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between relative z-10 gap-3">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {/* Icon */}
          <div className="bg-white/20 rounded-full p-1.5 sm:p-2 animate-bounce hidden sm:block">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          {/* Text */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
            <span className="font-bold text-yellow-300 text-xs sm:text-sm flex items-center gap-1 flex-shrink-0">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              YENİ!
            </span>
            <span className="text-xs sm:text-sm truncate">
              <strong className="hidden sm:inline">İşletme sahipleri için:</strong>
              <span className="sm:hidden">İşletmeler için </span>
              City-V Business Box ile müşteri yoğunluğunuzu takip edin!
            </span>
            <span className="hidden lg:inline text-xs bg-yellow-400 text-orange-900 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
              Beta %40 İndirim
            </span>
          </div>
        </div>

        {/* CTA + Close */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/business-box"
            onClick={() => {
              console.log('🚀 Business Box\'a yönlendiriliyor...');
            }}
            className="bg-white text-orange-600 px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-orange-50 transition whitespace-nowrap shadow-md hover:shadow-lg active:scale-95"
          >
            <span className="hidden sm:inline">Hemen İncele</span>
            <span className="sm:hidden">İncele</span>
            <span className="ml-1">→</span>
          </Link>
          
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition p-1 hover:bg-white/10 rounded"
            aria-label="Kapat"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
