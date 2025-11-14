'use client';

import { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Crown, Lock, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface PremiumGuardProps {
  children: ReactNode;
  featureName: string;
  onUpgradeClick?: () => void;
  showLockIcon?: boolean;
  customMessage?: string;
}

/**
 * Premium özellikler için guard komponenti
 * Kullanıcı premium değilse içeriği kilitler ve upgrade mesajı gösterir
 */
export default function PremiumGuard({
  children,
  featureName,
  onUpgradeClick,
  showLockIcon = true,
  customMessage,
}: PremiumGuardProps) {
  const { user, isAuthenticated } = useAuthStore();

  // Kullanıcı giriş yapmamışsa
  if (!isAuthenticated || !user) {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm rounded-2xl">
          <div className="text-center p-8">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Giriş Yapın
            </h3>
            <p className="text-gray-300">
              Bu özelliği kullanmak için giriş yapmanız gerekiyor
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Kullanıcı premium ise içeriği göster
  if (user.premium) {
    return <>{children}</>;
  }

  // Kullanıcı premium değilse kilitli içerik göster
  return (
    <div className="relative">
      {/* Blurred Content */}
      <div className="blur-sm pointer-events-none select-none">{children}</div>

      {/* Premium Lock Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl border-2 border-amber-400/50"
      >
        <div className="text-center p-8 max-w-md">
          {/* Crown Icon */}
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1.1, 1.1, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="inline-block mb-4"
          >
            <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full">
              <Crown className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-3 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Premium Özellik
            <Sparkles className="w-6 h-6 text-amber-400" />
          </h3>

          {/* Description */}
          <p className="text-white/90 text-lg mb-2 font-semibold">
            {featureName}
          </p>
          <p className="text-white/70 mb-6">
            {customMessage || `${featureName} özelliği Premium üyeler içindir. Premium'a geçerek tüm özelliklere sınırsız erişim sağlayın!`}
          </p>

          {/* Upgrade Button */}
          <button
            onClick={() => {
              if (onUpgradeClick) {
                onUpgradeClick();
              } else {
                toast.success('Premium modal açılıyor...', {
                  icon: '👑',
                });
              }
            }}
            className="px-8 py-4 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 hover:from-amber-500 hover:via-orange-600 hover:to-pink-600 text-white rounded-xl font-bold text-lg shadow-2xl transform hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            <Crown className="w-6 h-6" />
            Premium'a Geç
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Features List */}
          <div className="mt-6 text-left bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-white/80 text-sm font-semibold mb-2">
              Premium Avantajları:
            </p>
            <ul className="text-white/70 text-xs space-y-1">
              <li>✅ Tamamen reklamsız deneyim</li>
              <li>✅ 1000+ ziyaret geçmişi</li>
              <li>✅ Gelişmiş istatistikler</li>
              <li>✅ 6+ özel premium tema</li>
              <li>✅ Özel premium rozetleri</li>
              <li>✅ Ve daha fazlası...</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Daha küçük inline premium badge komponenti
 */
export function PremiumBadge({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full hover:scale-105 transition-transform"
    >
      <Crown className="w-3 h-3" />
      PRO
    </button>
  );
}

/**
 * Premium özellik için basit toast mesajı gösterir
 */
export function showPremiumToast(featureName: string, onUpgradeClick?: () => void) {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg rounded-xl pointer-events-auto flex items-center gap-3 p-4`}
      >
        <Crown className="w-8 h-8 text-white flex-shrink-0" />
        <div className="flex-1">
          <p className="text-white font-bold">{featureName}</p>
          <p className="text-white/90 text-sm">Premium özellik - Yükselt!</p>
        </div>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            onUpgradeClick?.();
          }}
          className="px-4 py-2 bg-white text-orange-600 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors"
        >
          Yükselt
        </button>
      </div>
    ),
    { duration: 4000 }
  );
}
