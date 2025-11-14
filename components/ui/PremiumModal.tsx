'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard, Shield, Zap, Bell, Star, Crown } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { user, login } = useAuthStore();

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Premium'u aktif et
    if (user) {
      login(user.email, user.name, true); // premium: true
    }

    setPaymentSuccess(true);
    setIsProcessing(false);

    // 2 saniye sonra modal'ı kapat
    setTimeout(() => {
      onClose();
      setPaymentSuccess(false);
    }, 2000);
  };

  const features = [
    { icon: Bell, text: 'Anında bildirimler', color: 'text-blue-500' },
    { icon: Star, text: 'Öncelikli destek', color: 'text-yellow-500' },
    { icon: Zap, text: 'Hızlı güncelleme', color: 'text-purple-500' },
    { icon: Crown, text: 'Özel rozetler', color: 'text-orange-500' },
    { icon: Shield, text: 'Reklamsız deneyim', color: 'text-green-500' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
                <div className="relative">
                  <button
                    onClick={onClose}
                    className="absolute top-0 right-0 text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div className="flex items-center gap-3 mb-2">
                    <Crown className="w-8 h-8" />
                    <h2 className="text-3xl font-bold">Premium'a Geç</h2>
                  </div>
                  <p className="text-white/90">
                    Tüm özelliklerin kilidini aç ve deneyimini iyileştir!
                  </p>
                </div>
              </div>

              {paymentSuccess ? (
                // Success State
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Check className="w-10 h-10 text-green-600" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Ödeme Başarılı! 🎉
                  </h3>
                  <p className="text-gray-600">
                    Premium üyeliğiniz aktif edildi.
                  </p>
                </div>
              ) : (
                <>
                  {/* Features */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">
                      Premium Özellikler
                    </h3>
                    <div className="space-y-3 mb-6">
                      {features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className={`${feature.color} bg-gray-50 p-2 rounded-lg`}>
                            <feature.icon className="w-5 h-5" />
                          </div>
                          <span className="text-gray-700">{feature.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pricing */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Aylık Üyelik</p>
                        <div className="flex items-baseline justify-center gap-2 mb-2">
                          <span className="text-5xl font-bold text-gray-800">99</span>
                          <span className="text-2xl font-bold text-gray-600">₺</span>
                          <span className="text-gray-500">/ay</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          İstediğin zaman iptal edebilirsin
                        </p>
                      </div>
                    </div>

                    {/* Payment Button */}
                    <button
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          İşleniyor...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          Ödemeyi Tamamla
                        </>
                      )}
                    </button>

                    {/* Security Notice */}
                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                      <Shield className="w-4 h-4" />
                      <span>Güvenli ödeme sistemi</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
