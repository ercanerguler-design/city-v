'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Sparkles, X, CheckCircle2, TrendingUp, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BusinessBoxModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // İlk ziyarette mi kontrol et
    const hasSeenModal = localStorage.getItem('cityv-business-box-modal-seen');
    
    if (!hasSeenModal) {
      // 5 saniye sonra göster
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('cityv-business-box-modal-seen', 'true');
  };

  const handleCTA = () => {
    handleClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-70 w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Sol taraf - Gradient background */}
                <div className="bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 p-8 md:p-10 text-white relative overflow-hidden hidden md:block">
                  {/* Animated background */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-1000" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                      <Building2 className="w-10 h-10" />
                      <span className="bg-yellow-400 text-orange-900 text-xs font-bold px-3 py-1 rounded-full">
                        BETA %40 İNDİRİM
                      </span>
                    </div>
                    
                    <h2 className="text-3xl font-bold mb-4">
                      İşletmenizi Bir Sonraki Seviyeye Taşıyın! 🚀
                    </h2>
                    
                    <p className="text-white/90 mb-8 text-lg">
                      City-V Business Box ile müşteri yoğunluğunuzu anlık takip edin, akıllı öneriler alın.
                    </p>

                    {/* Features */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">AI Destekli Yoğunluk Takibi</p>
                          <p className="text-white/80 text-sm">Gerçek zamanlı müşteri sayısı ve yoğunluk analizi</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Akıllı İstatistikler</p>
                          <p className="text-white/80 text-sm">Saatlik, günlük, haftalık detaylı raporlar</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <BarChart3 className="w-5 h-5 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Performans Öngörüleri</p>
                          <p className="text-white/80 text-sm">Gelecek saatler için tahmin ve öneriler</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sağ taraf - Content */}
                <div className="p-8 md:p-10 relative">
                  {/* Close button */}
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                    aria-label="Kapat"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  {/* Mobile başlık (sadece mobilde görünsün) */}
                  <div className="md:hidden mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-8 h-8 text-orange-600" />
                      <span className="bg-orange-100 text-orange-900 text-xs font-bold px-3 py-1 rounded-full">
                        BETA %40 İNDİRİM
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      İşletmenizi Bir Sonraki Seviyeye Taşıyın!
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Beta Programına Katılın!
                      </h3>
                      <p className="text-gray-600">
                        İlk 50 işletmeye özel <strong className="text-orange-600">%40 indirimli</strong> fiyatlarla City-V Business Box&apos;ı deneme şansı.
                      </p>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm">Normal Fiyat</span>
                        <span className="text-gray-400 line-through text-lg">₺7,499</span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-orange-900 font-bold">Beta Fiyatı</span>
                        <span className="text-3xl font-bold text-orange-600">₺4,499</span>
                      </div>
                      <p className="text-sm text-gray-600 text-right">
                        + ₺249/ay abonelik
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">Ücretsiz kurulum ve eğitim</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">7/24 teknik destek</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">İlk 3 ay premium özelliklere erişim</span>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-3 pt-4">
                      <Link
                        href="/business-box"
                        onClick={handleCTA}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <Sparkles className="w-5 h-5" />
                        Hemen Başvur
                      </Link>
                      
                      <button
                        onClick={handleClose}
                        className="w-full text-gray-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition"
                      >
                        Daha Sonra
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                      Beta programı sınırlı sayıda işletmeye açıktır. Yerleriniz dolmadan başvurun!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
