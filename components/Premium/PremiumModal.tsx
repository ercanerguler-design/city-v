'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Sparkles, Check, Star, TrendingUp, Zap, Shield } from 'lucide-react';
import { usePremiumStore } from '@/lib/stores/premiumStore';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const { 
    subscription, 
    subscribe, 
    cancelSubscription,
    restoreSubscription,
    checkSubscriptionStatus,
    updatePremiumStats,
    getDaysRemaining,
    getPremiumBenefits,
    stats,
    premiumBadges,
  } = usePremiumStore();
  
  const { user } = useAuthStore();

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const isPremium = user?.premium === true; // AuthStore'dan al
  const daysRemaining = getDaysRemaining();
  const benefits = getPremiumBenefits();

  // Update stats when modal opens
  useEffect(() => {
    if (isOpen && isPremium) {
      updatePremiumStats();
    }
  }, [isOpen, isPremium, updatePremiumStats]);

  const plans = [
    {
      id: 'monthly' as const,
      name: 'Aylık Premium',
      price: '₺49.99',
      period: '/ay',
      savings: null,
      features: [
        'Tüm premium özellikler',
        '30 günlük erişim',
        'İstediğiniz zaman iptal',
      ],
      badge: '💳',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'yearly' as const,
      name: 'Yıllık Premium',
      price: '₺399.99',
      period: '/yıl',
      savings: '₺199.89 tasarruf!',
      popular: true,
      features: [
        'Tüm premium özellikler',
        '365 günlük erişim',
        '%33 indirim',
        '🎁 Özel yıllık rozet',
      ],
      badge: '👑',
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  const handleSubscribe = () => {
    subscribe(selectedPlan);
  };

  const handleCancel = () => {
    if (window.confirm('Aboneliği iptal etmek istediğinizden emin misiniz? Mevcut dönem sonuna kadar premium özelliklere erişebilirsiniz.')) {
      cancelSubscription();
    }
  };

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
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                       md:w-[900px] md:max-h-[90vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl z-50 
                       overflow-hidden flex flex-col"
          >
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-6 md:p-8">
              {/* Animated sparkles background */}
              <div className="absolute inset-0 overflow-hidden opacity-30">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-xl transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 mb-2 relative z-10">
                <Crown className="w-8 h-8 text-white" />
                <h2 className="text-3xl font-bold text-white">Premium'a Yükselt</h2>
              </div>
              <p className="text-white/90 text-lg">
                Tüm özelliklerin kilidini açın ve deneyiminizi iyileştirin
              </p>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {/* Premium Active Status - ONLY FOR PAID PREMIUM USERS */}
              {isPremium && subscription && subscription.isActive && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 
                             rounded-xl border-2 border-purple-300 dark:border-purple-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="font-bold text-purple-900 dark:text-purple-100">
                          Premium Üyeliğiniz Aktif
                        </h3>
                      </div>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        {subscription.plan === 'monthly' ? 'Aylık' : 'Yıllık'} plan • {daysRemaining} gün kaldı
                      </p>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <p className="text-purple-600 dark:text-purple-400">Premium Gün</p>
                          <p className="font-bold text-purple-900 dark:text-purple-100">{stats.premiumDays}</p>
                        </div>
                        <div>
                          <p className="text-purple-600 dark:text-purple-400">Kazanç</p>
                          <p className="font-bold text-purple-900 dark:text-purple-100">${stats.totalSavings}</p>
                        </div>
                        <div>
                          <p className="text-purple-600 dark:text-purple-400">Rozetler</p>
                          <p className="font-bold text-purple-900 dark:text-purple-100">{premiumBadges.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {subscription.autoRenew ? (
                        <button
                          onClick={handleCancel}
                          className="px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                          İptal Et
                        </button>
                      ) : (
                        <button
                          onClick={restoreSubscription}
                          className="px-3 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        >
                          Yeniden Aktifleştir
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Free User - Upgrade Call to Action */}
              {!isPremium && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 
                             rounded-xl border-2 border-amber-200 dark:border-amber-700"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-900 dark:text-amber-100 text-lg">
                        Ücretsiz Üyelik
                      </h3>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Premium özelliklerle daha fazlasını keşfedin!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                    <Sparkles className="w-4 h-4" />
                    <span>Aşağıdan bir plan seçerek premium'a geçin</span>
                  </div>
                </motion.div>
              )}

              {/* Benefits Section */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Premium Avantajları
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                    >
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Premium Badges Preview */}
              {premiumBadges.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Kazandığınız Premium Rozetler
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {premiumBadges.map((badge) => (
                      <motion.div
                        key={badge.id}
                        whileHover={{ scale: 1.05 }}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm font-semibold shadow-lg"
                      >
                        {badge.icon} {badge.name}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Plans */}
              {!isPremium && (
                <>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    Planları Seçin
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {plans.map((plan) => (
                      <motion.div
                        key={plan.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                          selectedPlan === plan.id
                            ? 'border-purple-500 shadow-xl shadow-purple-200 dark:shadow-purple-900/50'
                            : 'border-gray-200 dark:border-slate-600'
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-xs font-bold text-white shadow-lg">
                            🔥 EN POPÜLER
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-4">
                          <div className="text-4xl">{plan.badge}</div>
                          {selectedPlan === plan.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </div>

                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {plan.name}
                        </h4>

                        <div className="flex items-baseline gap-1 mb-1">
                          <span className={`text-3xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                            {plan.price}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
                        </div>

                        {plan.savings && (
                          <div className="text-sm text-green-600 dark:text-green-400 font-semibold mb-4">
                            {plan.savings}
                          </div>
                        )}

                        <div className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Subscribe Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubscribe}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 
                               text-white font-bold text-lg rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    Premium'a Başla - {plans.find(p => p.id === selectedPlan)?.price}
                  </motion.button>

                  {/* Security Note */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Shield className="w-4 h-4" />
                    <span>Güvenli ödeme • İstediğiniz zaman iptal</span>
                  </div>
                </>
              )}

              {/* Feature Icons */}
              <div className="mt-8 grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-3xl mb-1">🚫</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Reklamsız</div>
                </div>
                <div>
                  <div className="text-3xl mb-1">📊</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Analitik</div>
                </div>
                <div>
                  <div className="text-3xl mb-1">🎨</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Temalar</div>
                </div>
                <div>
                  <div className="text-3xl mb-1">⚡</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Destek</div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
