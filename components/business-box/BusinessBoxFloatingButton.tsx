'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function BusinessBoxFloatingButton() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Tooltip/Mini Card (hover/click'te açılır) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-2xl p-5 max-w-xs relative"
          >
            <div className="flex items-start gap-3">
              <div className="bg-white/20 rounded-lg p-2 flex-shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold text-sm mb-1">
                  İşletmeniz için Özel!
                </h4>
                <p className="text-white/90 text-xs mb-3">
                  Müşteri yoğunluğunu AI ile takip edin. <strong>Beta&apos;ya özel %40 indirim!</strong>
                </p>
                <Link
                  href="/business-box"
                  className="bg-white text-orange-600 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-orange-50 transition inline-flex items-center gap-2"
                  onClick={() => setIsExpanded(false)}
                >
                  <Sparkles className="w-4 h-4" />
                  Business Box&apos;ı Keşfet
                </Link>
              </div>
            </div>
            
            {/* Kapatma butonu */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-2 right-2 text-white/60 hover:text-white transition"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ana FAB Butonu */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-gradient-to-br from-orange-500 to-red-600 rounded-full p-4 shadow-2xl hover:shadow-orange-500/50 transition relative group"
        aria-label="Business Box"
      >
        {/* Pulse animasyonu */}
        <span className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-20" />
        
        {/* Badge (Beta yazısı) */}
        <span className="absolute -top-1 -right-1 bg-yellow-400 text-orange-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
          BETA
        </span>

        <Building2 className="w-6 h-6 text-white relative z-10" />
        
        {/* Tooltip (hover'da) */}
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
          İşletmeniz için City-V Business Box
        </span>
      </motion.button>
    </div>
  );
}
