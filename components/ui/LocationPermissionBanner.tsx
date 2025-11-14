'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, AlertCircle, CheckCircle } from 'lucide-react';

interface LocationPermissionBannerProps {
  show: boolean;
  onRequestPermission: () => void;
  onDismiss: () => void;
}

export default function LocationPermissionBanner({ 
  show, 
  onRequestPermission, 
  onDismiss 
}: LocationPermissionBannerProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full mx-4"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-2xl p-6 border-2 border-blue-400">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">
                  Size Özel Deneyim! 🎯
                </h3>
                <p className="text-sm text-white/90 mb-4">
                  Konumunuzu paylaşarak <strong>size en yakın</strong> mekanları görebilir ve 
                  <strong> gerçek zamanlı mesafe</strong> bilgilerine ulaşabilirsiniz.
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-300" />
                    <span>Tam konum doğruluğu</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-300" />
                    <span>Mesafeye göre sıralama</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-300" />
                    <span>Haritada konumunuzu görün</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    data-tour="location-button"
                    onClick={onRequestPermission}
                    className="flex-1 bg-white text-blue-600 px-4 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-md"
                  >
                    Konumumu Paylaş
                  </button>
                  <button
                    onClick={onDismiss}
                    className="px-4 py-2.5 border-2 border-white/30 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                  >
                    Daha Sonra
                  </button>
                </div>
              </div>

              <button
                onClick={onDismiss}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gizlilik Notu */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-start gap-2 text-xs text-white/70">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Gizlilik:</strong> Konumunuz yalnızca cihazınızda saklanır ve 
                  sunuculara gönderilmez. İstediğiniz zaman iptal edebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
