import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

// Premium Plan Types
export type PremiumPlan = 'free' | 'monthly' | 'yearly';

// Premium Feature
export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  availableIn: PremiumPlan[];
}

// Premium Subscription
export interface PremiumSubscription {
  plan: PremiumPlan;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  autoRenew: boolean;
}

// Premium Theme
export interface PremiumTheme {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  isPremium: boolean;
}

// Premium Badge
export interface PremiumBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 'premium' | 'exclusive' | 'legendary';
  unlockedAt?: Date;
}

// Premium Stats
export interface PremiumStats {
  totalSavings: number; // Reklam engelleyerek kazandığı para
  premiumDays: number; // Premium üyelik günü
  themesUsed: number;
  advancedFeaturesUsed: number;
  prioritySupportsUsed: number;
}

// Store State
interface PremiumState {
  subscription: PremiumSubscription | null;
  selectedTheme: string;
  premiumBadges: PremiumBadge[];
  stats: PremiumStats;
  
  // Premium Features List
  features: PremiumFeature[];
  themes: PremiumTheme[];
  
  // Actions
  subscribe: (plan: PremiumPlan) => void;
  cancelSubscription: () => void;
  restoreSubscription: () => void;
  selectTheme: (themeId: string) => void;
  unlockPremiumBadge: (badgeId: string) => void;
  incrementFeatureUsage: (feature: 'theme' | 'analytics' | 'support') => void;
  checkSubscriptionStatus: () => boolean;
  updatePremiumStats: () => void;
  getDaysRemaining: () => number;
  getPremiumBenefits: () => string[];
}

// Premium Features Definition
const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'ad-free',
    name: '🚫 Reklamsız Deneyim',
    description: 'Hiç reklam görmeden uygulamayı kullanın',
    icon: '🚫',
    availableIn: ['monthly', 'yearly'],
  },
  {
    id: 'advanced-analytics',
    name: '📊 Gelişmiş Analitikler',
    description: '1000+ ziyaret geçmişi ve detaylı istatistikler',
    icon: '📊',
    availableIn: ['monthly', 'yearly'],
  },
  {
    id: 'premium-themes',
    name: '🎨 Premium Temalar',
    description: '5+ özel tasarlanmış premium tema',
    icon: '🎨',
    availableIn: ['monthly', 'yearly'],
  },
  {
    id: 'exclusive-badges',
    name: '👑 Özel Rozetler',
    description: 'Sadece premium üyelere özel rozetler',
    icon: '👑',
    availableIn: ['monthly', 'yearly'],
  },
  {
    id: 'priority-support',
    name: '⚡ Öncelikli Destek',
    description: '7/24 öncelikli müşteri desteği',
    icon: '⚡',
    availableIn: ['monthly', 'yearly'],
  },
  {
    id: 'advanced-notifications',
    name: '🔔 Gelişmiş Bildirimler',
    description: 'Akıllı bildirimler ve özel uyarılar',
    icon: '🔔',
    availableIn: ['monthly', 'yearly'],
  },
  {
    id: 'custom-filters',
    name: '🔍 Özel Filtreler',
    description: 'Kendi filtrelerinizi oluşturun ve kaydedin',
    icon: '🔍',
    availableIn: ['monthly', 'yearly'],
  },
  {
    id: 'export-data',
    name: '📥 Veri İndirme',
    description: 'Tüm verilerinizi CSV/JSON formatında indirin',
    icon: '📥',
    availableIn: ['monthly', 'yearly'],
  },
];

// Premium Themes
const PREMIUM_THEMES: PremiumTheme[] = [
  {
    id: 'default',
    name: 'Varsayılan',
    description: 'Standart mavi tema',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb',
      background: '#ffffff',
      text: '#1a202c',
    },
    isPremium: false,
  },
  {
    id: 'sunset',
    name: '🌅 Sunset Glow',
    description: 'Sıcak günbatımı renkleri',
    preview: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
    colors: {
      primary: '#ff6b6b',
      secondary: '#feca57',
      accent: '#ff9ff3',
      background: '#fff5f5',
      text: '#2d3748',
    },
    isPremium: true,
  },
  {
    id: 'ocean',
    name: '🌊 Ocean Breeze',
    description: 'Sakin okyanus tonları',
    preview: 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)',
    colors: {
      primary: '#0093E9',
      secondary: '#80D0C7',
      accent: '#4facfe',
      background: '#f0f9ff',
      text: '#1e3a8a',
    },
    isPremium: true,
  },
  {
    id: 'forest',
    name: '🌲 Forest Green',
    description: 'Doğal yeşil tonları',
    preview: 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)',
    colors: {
      primary: '#134E5E',
      secondary: '#71B280',
      accent: '#95e1d3',
      background: '#f0fdf4',
      text: '#064e3b',
    },
    isPremium: true,
  },
  {
    id: 'royal',
    name: '👑 Royal Purple',
    description: 'Kraliyet moru teması',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#c471ed',
      background: '#faf5ff',
      text: '#581c87',
    },
    isPremium: true,
  },
  {
    id: 'midnight',
    name: '🌙 Midnight Dark',
    description: 'Gece teması (OLED dostu)',
    preview: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#a78bfa',
      background: '#0f0f0f',
      text: '#e5e7eb',
    },
    isPremium: true,
  },
  {
    id: 'sakura',
    name: '🌸 Sakura Pink',
    description: 'Japon kiraz çiçeği teması',
    preview: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    colors: {
      primary: '#ff9a9e',
      secondary: '#fecfef',
      accent: '#fda085',
      background: '#fef2f2',
      text: '#881337',
    },
    isPremium: true,
  },
];

// Premium Badges
const PREMIUM_BADGES: PremiumBadge[] = [
  {
    id: 'vip',
    name: '💎 VIP Üye',
    icon: '💎',
    description: 'Premium üyelik satın aldınız',
    rarity: 'premium',
  },
  {
    id: 'early-adopter',
    name: '🚀 İlk Kullanıcı',
    icon: '🚀',
    description: 'İlk 100 premium üye arasındasınız',
    rarity: 'exclusive',
  },
  {
    id: 'loyal-member',
    name: '🏆 Sadık Üye',
    icon: '🏆',
    description: '3 ay boyunca premium üye kaldınız',
    rarity: 'premium',
  },
  {
    id: 'year-member',
    name: '👑 Yıllık Üye',
    icon: '👑',
    description: 'Yıllık premium abonelik satın aldınız',
    rarity: 'exclusive',
  },
  {
    id: 'theme-master',
    name: '🎨 Tema Ustası',
    icon: '🎨',
    description: 'Tüm premium temaları kullandınız',
    rarity: 'premium',
  },
  {
    id: 'data-scientist',
    name: '📊 Veri Bilimci',
    icon: '📊',
    description: 'Gelişmiş analitikleri 50+ kez kullandınız',
    rarity: 'exclusive',
  },
  {
    id: 'legend',
    name: '⭐ Efsane',
    icon: '⭐',
    description: '1 yıldır premium üyesiniz',
    rarity: 'legendary',
  },
];

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set, get) => ({
      subscription: null,
      selectedTheme: 'default',
      premiumBadges: [],
      stats: {
        totalSavings: 0,
        premiumDays: 0,
        themesUsed: 0,
        advancedFeaturesUsed: 0,
        prioritySupportsUsed: 0,
      },
      features: PREMIUM_FEATURES,
      themes: PREMIUM_THEMES,

      subscribe: (plan: PremiumPlan) => {
        const now = new Date();
        const endDate = new Date();
        
        if (plan === 'monthly') {
          endDate.setMonth(endDate.getMonth() + 1);
        } else if (plan === 'yearly') {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }

        const subscription: PremiumSubscription = {
          plan,
          startDate: now,
          endDate: plan === 'free' ? null : endDate,
          isActive: true,
          autoRenew: true,
        };

        set({ subscription });

        // Unlock VIP badge
        get().unlockPremiumBadge('vip');
        
        // Unlock year member badge for yearly plan
        if (plan === 'yearly') {
          get().unlockPremiumBadge('year-member');
        }

        const planName = plan === 'monthly' ? 'Aylık Premium' : 'Yıllık Premium';
        toast.success(
          `🎉 ${planName} aboneliğiniz başarıyla başlatıldı!`,
          {
            duration: 5000,
            style: {
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              padding: '16px',
              fontSize: '14px',
            },
          }
        );
      },

      cancelSubscription: () => {
        const { subscription } = get();
        if (subscription && subscription.isActive) {
          set({
            subscription: {
              ...subscription,
              autoRenew: false,
            },
          });

          toast.success(
            '✅ Otomatik yenileme kapatıldı. Mevcut dönem sonuna kadar premium özelliklere erişebilirsiniz.',
            {
              duration: 5000,
              style: {
                borderRadius: '12px',
                background: '#10b981',
                color: '#fff',
              },
            }
          );
        }
      },

      restoreSubscription: () => {
        const { subscription } = get();
        if (subscription) {
          set({
            subscription: {
              ...subscription,
              autoRenew: true,
            },
          });

          toast.success(
            '✅ Otomatik yenileme tekrar açıldı!',
            {
              duration: 3000,
              style: {
                borderRadius: '12px',
                background: '#10b981',
                color: '#fff',
              },
            }
          );
        }
      },

      selectTheme: (themeId: string) => {
        const theme = get().themes.find(t => t.id === themeId);
        
        if (!theme) return;

        // Check if theme is premium and user has subscription
        if (theme.isPremium && !get().checkSubscriptionStatus()) {
          toast.error(
            '🔒 Bu tema premium üyelere özeldir. Premium üyelik satın alın!',
            {
              duration: 4000,
              style: {
                borderRadius: '12px',
                background: '#ef4444',
                color: '#fff',
              },
            }
          );
          return;
        }

        set({ selectedTheme: themeId });
        
        // Increment theme usage
        set((state) => ({
          stats: {
            ...state.stats,
            themesUsed: state.stats.themesUsed + 1,
          },
        }));

        // Check for theme master badge
        const usedThemes = new Set<string>();
        usedThemes.add(themeId);
        if (usedThemes.size >= 5) {
          get().unlockPremiumBadge('theme-master');
        }

        toast.success(
          `🎨 ${theme.name} teması aktif edildi!`,
          {
            duration: 3000,
            style: {
              borderRadius: '12px',
              background: theme.preview,
              color: '#fff',
            },
          }
        );
      },

      unlockPremiumBadge: (badgeId: string) => {
        const { premiumBadges } = get();
        
        // Check if already unlocked
        if (premiumBadges.some(b => b.id === badgeId)) {
          return;
        }

        const badge = PREMIUM_BADGES.find(b => b.id === badgeId);
        if (!badge) return;

        const unlockedBadge = {
          ...badge,
          unlockedAt: new Date(),
        };

        set((state) => ({
          premiumBadges: [...state.premiumBadges, unlockedBadge],
        }));

        // Show toast based on rarity
        const rarityColors = {
          premium: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          exclusive: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          legendary: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
        };

        toast.success(
          `${badge.icon} ${badge.name} rozeti kazandınız!`,
          {
            duration: 5000,
            style: {
              borderRadius: '12px',
              background: rarityColors[badge.rarity],
              color: '#fff',
              padding: '16px',
              fontSize: '15px',
              fontWeight: 'bold',
            },
          }
        );
      },

      incrementFeatureUsage: (feature: 'theme' | 'analytics' | 'support') => {
        set((state) => {
          const updates: any = { ...state.stats };

          if (feature === 'theme') {
            updates.themesUsed += 1;
          } else if (feature === 'analytics') {
            updates.advancedFeaturesUsed += 1;
            
            // Check for data scientist badge
            if (updates.advancedFeaturesUsed >= 50) {
              get().unlockPremiumBadge('data-scientist');
            }
          } else if (feature === 'support') {
            updates.prioritySupportsUsed += 1;
          }

          return { stats: updates };
        });
      },

      checkSubscriptionStatus: () => {
        const { subscription } = get();
        
        if (!subscription || !subscription.isActive) {
          return false;
        }

        if (subscription.plan === 'free') {
          return false;
        }

        // Check if subscription has expired
        if (subscription.endDate) {
          const now = new Date();
          if (now > new Date(subscription.endDate)) {
            // Subscription expired (don't update state here - will be done in updateStats)
            return false;
          }
        }

        return true;
      },

      updatePremiumStats: () => {
        const { subscription } = get();
        
        if (!subscription || !subscription.isActive || subscription.plan === 'free') {
          return;
        }

        // Check if subscription has expired
        if (subscription.endDate) {
          const now = new Date();
          if (now > new Date(subscription.endDate)) {
            // Subscription expired
            set({
              subscription: {
                ...subscription,
                isActive: false,
              },
            });
            return;
          }
        }

        // Update premium days
        const startDate = new Date(subscription.startDate);
        const now = new Date();
        const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculate savings (assume 1 ad every 5 minutes = 288 ads/day, $0.01 per ad)
        const totalSavings = daysPassed * 288 * 0.01;
        
        set((state) => ({
          stats: {
            ...state.stats,
            premiumDays: daysPassed,
            totalSavings: Math.floor(totalSavings * 100) / 100, // Round to 2 decimals
          },
        }));

        // Check for loyal member badge (90 days)
        if (daysPassed >= 90 && !get().premiumBadges.some(b => b.id === 'loyal-member')) {
          get().unlockPremiumBadge('loyal-member');
        }

        // Check for legend badge (365 days)
        if (daysPassed >= 365 && !get().premiumBadges.some(b => b.id === 'legend')) {
          get().unlockPremiumBadge('legend');
        }
      },

      getDaysRemaining: () => {
        const { subscription } = get();
        
        if (!subscription || !subscription.endDate) {
          return 0;
        }

        const now = new Date();
        const endDate = new Date(subscription.endDate);
        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return Math.max(0, daysRemaining);
      },

      getPremiumBenefits: () => {
        return [
          '✅ Tamamen reklamsız deneyim',
          '✅ 1000+ ziyaret geçmişi',
          '✅ Gelişmiş istatistikler ve grafikler',
          '✅ 6+ özel premium tema',
          '✅ Özel premium rozetleri',
          '✅ Öncelikli müşteri desteği',
          '✅ Akıllı bildirimler',
          '✅ Özel filtreler ve kayıtlar',
          '✅ Veri dışa aktarma (CSV/JSON)',
          '✅ Yeni özelliklere erken erişim',
        ];
      },
    }),
    {
      name: 'premium-storage',
    }
  )
);
