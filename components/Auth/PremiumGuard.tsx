'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Crown, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PremiumGuardProps {
  children: React.ReactNode;
}

export default function PremiumGuard({ children }: PremiumGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  
  // Premium kontrolü - membershipTier bazlı
  const isPremium = user?.membershipTier && user.membershipTier !== 'free';

  useEffect(() => {
    // Sadece ilk render'da kontrol et
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100); // 100ms bekle, store'un hydrate olması için
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Kullanıcı giriş yapmamışsa ana sayfaya yönlendir
    // ANCAK: Sadece isChecking false olduktan sonra ve gerçekten giriş yapılmamışsa
    if (!isChecking && !isAuthenticated) {
      console.log('⚠️ PremiumGuard: Kullanıcı giriş yapmamış, ana sayfaya yönlendiriliyor');
      router.push('/');
    }
  }, [isAuthenticated, router, isChecking]);

  // İlk yükleme kontrolü
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa boş sayfa göster (yönlendirme yapılıyor)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  // Premium değilse premium uyarı sayfası göster
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-6">
                  <Crown className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>

            {/* Başlık */}
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
              Premium Özellik 👑
            </h1>
            
            <p className="text-xl text-white/80 text-center mb-8">
              Bu sayfaya erişmek için <strong className="text-yellow-400">Premium</strong> üyelik gerekiyor.
            </p>

            {/* Bilgi Kutusu */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10">
              <div className="flex items-start gap-4">
                <Lock className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Neden Premium?
                  </h3>
                  <ul className="space-y-2 text-white/70 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span><strong>IoT Monitör</strong> - ESP32 cihazlarınızı yönetin</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span><strong>Business Dashboard</strong> - İşletme analitiği</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span><strong>Gelişmiş Özellikler</strong> - Premium araçlar</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Kullanıcı Bilgisi */}
            <div className="bg-blue-500/10 backdrop-blur-sm rounded-2xl p-4 mb-8 border border-blue-400/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold">{user?.name}</p>
                  <p className="text-white/60 text-sm">{user?.email}</p>
                  <p className="text-yellow-400 text-xs mt-1 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full"></span>
                    Üyelik: <strong>Free</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Uyarısı */}
            <div className="bg-purple-500/10 backdrop-blur-sm rounded-2xl p-4 mb-8 border border-purple-400/20">
              <p className="text-white/80 text-sm text-center">
                💡 <strong>Not:</strong> Premium üyelik için lütfen admin ile iletişime geçin. 
                Admin onayından sonra bu özelliklere erişebileceksiniz.
              </p>
            </div>

            {/* Butonlar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-xl font-semibold transition-all border border-white/20 flex items-center justify-center gap-2"
              >
                Ana Sayfaya Dön
              </button>
              
              <button
                onClick={() => window.location.href = 'mailto:sce@scegrup.com?subject=Premium Üyelik Talebi'}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <span>İletişime Geç</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Premium kullanıcı - içeriği göster
  return <>{children}</>;
}
