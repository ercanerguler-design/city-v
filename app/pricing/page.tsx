'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Check, 
  Zap, 
  Building2, 
  Rocket, 
  ArrowLeft,
  Sparkles,
  Shield,
  Headphones,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 99,
    period: 'ay',
    description: 'Bireysel kullanıcılar için',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    features: [
      '100 AI Kredi',
      'Temel harita özellikleri',
      'Kalabalık raporlama',
      'Sınırlı AI asistan',
      'E-posta desteği',
      'Mobil uygulama erişimi'
    ],
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 249,
    period: 'ay',
    description: 'Profesyoneller için',
    icon: Crown,
    color: 'from-purple-500 to-pink-500',
    features: [
      '500 AI Kredi',
      'Tüm harita özellikleri',
      'Gelişmiş kalabalık analizi',
      'Sınırsız AI asistan',
      'IoT cihaz yönetimi',
      'Öncelikli e-posta desteği',
      'Gelişmiş analitik',
      'Özel raporlar',
      'API erişimi'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999,
    period: 'ay',
    description: 'İşletmeler için',
    icon: Building2,
    color: 'from-orange-500 to-red-500',
    features: [
      '1000 AI Kredi',
      'Tüm Pro özellikleri',
      'Özel IoT entegrasyonları',
      'Çoklu lokasyon yönetimi',
      'Kampanya yönetimi',
      'Beyaz etiket çözümler',
      '7/24 öncelikli destek',
      'Özel eğitim',
      'SLA garantisi',
      'Özel geliştirmeler'
    ],
    popular: false
  }
];

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    
    // Ödeme sistemine yönlendirme - şimdilik toast gösterelim
    toast.success(`${plans.find(p => p.id === planId)?.name} planı seçildi! Ödeme sistemine yönlendiriliyorsunuz...`, {
      duration: 3000,
      icon: '💳'
    });

    // TODO: Ödeme sistemi entegrasyonu
    // Örnek: Stripe, PayTR, iyzico vs.
    setTimeout(() => {
      console.log('Redirecting to payment gateway for plan:', planId);
      // window.location.href = `/checkout?plan=${planId}`;
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Geri Dön
        </button>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6"
          >
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-medium">Premium Üyelik Paketleri</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            Doğru Planı Seçin
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/70 max-w-2xl mx-auto"
          >
            City-V Premium ile şehir deneyiminizi bir üst seviyeye taşıyın
          </motion.p>
        </div>

        {/* Current User Info */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-md mx-auto mb-12 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{user.name}</p>
                <p className="text-white/60 text-sm">
                  Mevcut Plan: <span className="text-white font-medium">{user.membershipTier}</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative ${plan.popular ? 'md:-translate-y-4' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
                    ✨ EN POPÜLER
                  </div>
                )}

                <div className={`h-full p-8 rounded-3xl border-2 ${
                  plan.popular 
                    ? 'bg-white border-transparent shadow-2xl' 
                    : 'bg-white/10 backdrop-blur-sm border-white/20'
                }`}>
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Plan Name */}
                  <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-gray-900' : 'text-white'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-6 ${plan.popular ? 'text-gray-600' : 'text-white/60'}`}>
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-5xl font-bold ${plan.popular ? 'text-gray-900' : 'text-white'}`}>
                        ₺{plan.price}
                      </span>
                      <span className={`text-lg ${plan.popular ? 'text-gray-600' : 'text-white/60'}`}>
                        /{plan.period}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          plan.popular ? 'text-green-500' : 'text-green-400'
                        }`} />
                        <span className={`text-sm ${plan.popular ? 'text-gray-700' : 'text-white/80'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-4 rounded-xl font-bold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-2xl hover:scale-105'
                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                    }`}
                  >
                    {selectedPlan === plan.id ? '✓ Seçildi' : 'Hemen Başla'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Tüm Planlarda Dahil
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Güvenli', desc: 'SSL şifreleme' },
              { icon: Headphones, title: 'Destek', desc: '7/24 yardım' },
              { icon: Rocket, title: 'Hızlı', desc: 'Anında erişim' },
              { icon: TrendingUp, title: 'Analitik', desc: 'Detaylı raporlar' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white font-bold mb-2">{item.title}</h3>
                  <p className="text-white/60 text-sm">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Sıkça Sorulan Sorular
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'Ödeme nasıl yapılır?',
                a: 'Kredi kartı, banka kartı veya havale ile ödeme yapabilirsiniz.'
              },
              {
                q: 'İptal edebilir miyim?',
                a: 'Evet, istediğiniz zaman iptal edebilirsiniz. Kalan süre için iade yapılır.'
              },
              {
                q: 'AI krediler ne işe yarar?',
                a: 'AI asistan, akıllı öneriler ve otomasyon özellikleri için kullanılır.'
              },
              {
                q: 'Fatura alabilir miyim?',
                a: 'Evet, her ödeme için otomatik fatura düzenlenir.'
              }
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
              >
                <h3 className="text-white font-bold mb-2">{faq.q}</h3>
                <p className="text-white/70">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-white/70 mb-4">
            Özel bir çözüme mi ihtiyacınız var?
          </p>
          <a
            href="mailto:sce@scegrup.com"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all"
          >
            <Headphones className="w-5 h-5" />
            Bizimle İletişime Geçin
          </a>
        </motion.div>
      </div>
    </div>
  );
}
