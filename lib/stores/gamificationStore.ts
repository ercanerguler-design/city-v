import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress?: number;
  total?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  completed: boolean;
  completedAt?: number;
  progress: number;
  total: number;
}

export interface UserStats {
  level: number;
  totalPoints: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  totalCheckIns: number;
  totalReports: number;
  totalRoutes: number;
  favoritesCount: number;
  streak: number;
  longestStreak: number;
  lastCheckIn?: number;
}

interface GamificationStore {
  stats: UserStats;
  badges: Badge[];
  achievements: Achievement[];
  
  // Actions
  addPoints: (points: number, reason: string) => void;
  checkIn: (locationId: string) => void;
  reportSubmitted: () => void;
  routeCreated: () => void;
  favoriteAdded: () => void;
  unlockBadge: (badgeId: string) => void;
  completeAchievement: (achievementId: string) => void;
  getLevel: () => number;
  getProgress: () => number;
  resetStats: () => void;
}

// Rozet tanımları
const ALL_BADGES: Badge[] = [
  {
    id: 'first-visit',
    name: 'İlk Adım',
    description: 'İlk mekanını ziyaret et',
    icon: '🎯',
    rarity: 'common',
    total: 1,
  },
  {
    id: 'explorer-10',
    name: 'Kaşif',
    description: '10 farklı mekan ziyaret et',
    icon: '🗺️',
    rarity: 'common',
    total: 10,
  },
  {
    id: 'explorer-50',
    name: 'Gezgin',
    description: '50 farklı mekan ziyaret et',
    icon: '🧳',
    rarity: 'rare',
    total: 50,
  },
  {
    id: 'explorer-100',
    name: 'Dünya Gezgini',
    description: '100 farklı mekan ziyaret et',
    icon: '✈️',
    rarity: 'epic',
    total: 100,
  },
  {
    id: 'reporter',
    name: 'Muhabir',
    description: '5 durum raporu gönder',
    icon: '📰',
    rarity: 'common',
    total: 5,
  },
  {
    id: 'navigator',
    name: 'Navigatör',
    description: '10 rota oluştur',
    icon: '🧭',
    rarity: 'rare',
    total: 10,
  },
  {
    id: 'collector',
    name: 'Koleksiyoncu',
    description: '20 mekanı favorilere ekle',
    icon: '❤️',
    rarity: 'rare',
    total: 20,
  },
  {
    id: 'streak-7',
    name: 'Kararlı',
    description: '7 gün üst üste giriş yap',
    icon: '🔥',
    rarity: 'epic',
    total: 7,
  },
  {
    id: 'night-owl',
    name: 'Gece Kuşu',
    description: 'Gece 12-6 arası 10 ziyaret yap',
    icon: '🦉',
    rarity: 'rare',
    total: 10,
  },
  {
    id: 'legend',
    name: 'Efsane',
    description: '1000 puan topla',
    icon: '👑',
    rarity: 'legendary',
    total: 1000,
  },
];

// Başarım tanımları
const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'welcome',
    title: 'Hoş Geldin!',
    description: 'Uygulamaya ilk kez giriş yap',
    points: 10,
    icon: '👋',
    completed: false,
    progress: 0,
    total: 1,
  },
  {
    id: 'social-butterfly',
    title: 'Sosyal Kelebek',
    description: '5 farklı kategoride mekan ziyaret et',
    points: 50,
    icon: '🦋',
    completed: false,
    progress: 0,
    total: 5,
  },
  {
    id: 'master-reporter',
    title: 'Usta Muhabir',
    description: '20 durum raporu gönder',
    points: 100,
    icon: '📝',
    completed: false,
    progress: 0,
    total: 20,
  },
  {
    id: 'route-master',
    title: 'Rota Ustası',
    description: '50 rota oluştur',
    points: 150,
    icon: '🛣️',
    completed: false,
    progress: 0,
    total: 50,
  },
  {
    id: 'city-expert',
    title: 'Şehir Uzmanı',
    description: 'Tüm kategorilerden en az 1 mekan ziyaret et',
    points: 200,
    icon: '🏙️',
    completed: false,
    progress: 0,
    total: 10,
  },
];

const POINTS_PER_LEVEL = 100;

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      stats: {
        level: 1,
        totalPoints: 0,
        currentLevelPoints: 0,
        nextLevelPoints: POINTS_PER_LEVEL,
        totalCheckIns: 0,
        totalReports: 0,
        totalRoutes: 0,
        favoritesCount: 0,
        streak: 0,
        longestStreak: 0,
      },
      badges: ALL_BADGES.map(b => ({ ...b, progress: 0 })),
      achievements: ALL_ACHIEVEMENTS,

      addPoints: (points, reason) => {
        set((state) => {
          const newTotalPoints = state.stats.totalPoints + points;
          const newCurrentLevelPoints = state.stats.currentLevelPoints + points;
          
          let newLevel = state.stats.level;
          let levelPoints = newCurrentLevelPoints;
          let nextLevel = state.stats.nextLevelPoints;
          let leveledUp = false;

          // Seviye atlama kontrolü
          while (levelPoints >= nextLevel) {
            levelPoints -= nextLevel;
            newLevel++;
            nextLevel = POINTS_PER_LEVEL * newLevel;
            leveledUp = true;
            console.log(`🎉 Seviye Atladın! Yeni seviye: ${newLevel}`);
          }

          console.log(`⭐ +${points} puan kazandın! Sebep: ${reason}`);

          // Toast bildirimleri
          if (leveledUp) {
            toast.success(`🎉 Tebrikler! Seviye ${newLevel}'e Atladın!`, {
              duration: 4000,
              icon: '🏆',
              style: {
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                fontWeight: 'bold',
              },
            });
          }

          return {
            stats: {
              ...state.stats,
              totalPoints: newTotalPoints,
              currentLevelPoints: levelPoints,
              nextLevelPoints: nextLevel,
              level: newLevel,
            },
          };
        });
      },

      checkIn: (locationId) => {
        const { stats, addPoints, unlockBadge } = get();
        
        set((state) => ({
          stats: {
            ...state.stats,
            totalCheckIns: state.stats.totalCheckIns + 1,
          },
        }));

        // Puan kazan
        addPoints(10, 'Mekan ziyareti');

        // Rozet kontrolü
        const newCheckIns = stats.totalCheckIns + 1;
        if (newCheckIns === 1) unlockBadge('first-visit');
        if (newCheckIns === 10) unlockBadge('explorer-10');
        if (newCheckIns === 50) unlockBadge('explorer-50');
        if (newCheckIns === 100) unlockBadge('explorer-100');

        // Streak güncelleme
        const now = Date.now();
        const lastCheckIn = stats.lastCheckIn;
        const oneDayMs = 24 * 60 * 60 * 1000;

        set((state) => {
          let newStreak = state.stats.streak;
          
          if (!lastCheckIn || now - lastCheckIn > oneDayMs * 2) {
            // Streak koptu
            newStreak = 1;
          } else if (now - lastCheckIn > oneDayMs) {
            // Yeni gün
            newStreak++;
          }

          const newLongestStreak = Math.max(state.stats.longestStreak, newStreak);
          
          // 7 günlük streak rozeti
          if (newStreak === 7) {
            unlockBadge('streak-7');
          }

          return {
            stats: {
              ...state.stats,
              streak: newStreak,
              longestStreak: newLongestStreak,
              lastCheckIn: now,
            },
          };
        });
      },

      reportSubmitted: () => {
        const { stats, addPoints, unlockBadge } = get();
        
        set((state) => ({
          stats: {
            ...state.stats,
            totalReports: state.stats.totalReports + 1,
          },
        }));

        addPoints(15, 'Durum raporu');

        const newReports = stats.totalReports + 1;
        if (newReports === 5) unlockBadge('reporter');
        if (newReports === 20) {
          set((state) => ({
            achievements: state.achievements.map(a =>
              a.id === 'master-reporter'
                ? { ...a, completed: true, completedAt: Date.now(), progress: a.total }
                : a
            ),
          }));
          addPoints(100, 'Usta Muhabir başarımı');
        }
      },

      routeCreated: () => {
        const { stats, addPoints, unlockBadge } = get();
        
        set((state) => ({
          stats: {
            ...state.stats,
            totalRoutes: state.stats.totalRoutes + 1,
          },
        }));

        addPoints(5, 'Rota oluşturma');

        const newRoutes = stats.totalRoutes + 1;
        if (newRoutes === 10) unlockBadge('navigator');
        if (newRoutes === 50) {
          set((state) => ({
            achievements: state.achievements.map(a =>
              a.id === 'route-master'
                ? { ...a, completed: true, completedAt: Date.now(), progress: a.total }
                : a
            ),
          }));
          addPoints(150, 'Rota Ustası başarımı');
        }
      },

      favoriteAdded: () => {
        const { stats, addPoints, unlockBadge } = get();
        
        set((state) => ({
          stats: {
            ...state.stats,
            favoritesCount: state.stats.favoritesCount + 1,
          },
        }));

        addPoints(3, 'Favoriye ekleme');

        const newFavorites = stats.favoritesCount + 1;
        if (newFavorites === 20) unlockBadge('collector');
      },

      unlockBadge: (badgeId) => {
        set((state) => {
          const badgeIndex = state.badges.findIndex(b => b.id === badgeId);
          if (badgeIndex === -1 || state.badges[badgeIndex].unlockedAt) {
            return state;
          }

          const updatedBadges = [...state.badges];
          updatedBadges[badgeIndex] = {
            ...updatedBadges[badgeIndex],
            unlockedAt: Date.now(),
            progress: updatedBadges[badgeIndex].total,
          };

          const badge = updatedBadges[badgeIndex];
          console.log(`🏆 Yeni rozet kazandın: ${badge.name}`);

          // Toast bildirimi
          toast.success(`🏆 Yeni Rozet: ${badge.name}!`, {
            duration: 5000,
            icon: badge.icon,
            style: {
              borderRadius: '12px',
              background: badge.rarity === 'legendary' 
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : badge.rarity === 'epic'
                ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'
                : badge.rarity === 'rare'
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontWeight: 'bold',
            },
          });

          // Rozet puanı
          const rarityPoints = {
            common: 20,
            rare: 50,
            epic: 100,
            legendary: 200,
          };
          const points = rarityPoints[badge.rarity];
          
          setTimeout(() => {
            get().addPoints(points, `${badge.name} rozeti`);
          }, 100);

          return { badges: updatedBadges };
        });
      },

      completeAchievement: (achievementId) => {
        const achievement = get().achievements.find(a => a.id === achievementId);
        if (!achievement || achievement.completed) return;

        set((state) => ({
          achievements: state.achievements.map(a =>
            a.id === achievementId
              ? { ...a, completed: true, completedAt: Date.now(), progress: a.total }
              : a
          ),
        }));

        // Toast bildirimi
        toast.success(`🎯 Başarım Tamamlandı: ${achievement.title}!`, {
          duration: 5000,
          icon: achievement.icon,
          style: {
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
            color: '#fff',
            fontWeight: 'bold',
          },
        });

        get().addPoints(achievement.points, `Başarım: ${achievement.title}`);
      },

      getLevel: () => get().stats.level,

      getProgress: () => {
        const { currentLevelPoints, nextLevelPoints } = get().stats;
        return (currentLevelPoints / nextLevelPoints) * 100;
      },

      resetStats: () => {
        set({
          stats: {
            level: 1,
            totalPoints: 0,
            currentLevelPoints: 0,
            nextLevelPoints: POINTS_PER_LEVEL,
            totalCheckIns: 0,
            totalReports: 0,
            totalRoutes: 0,
            favoritesCount: 0,
            streak: 0,
            longestStreak: 0,
          },
          badges: ALL_BADGES.map(b => ({ ...b, progress: 0 })),
          achievements: ALL_ACHIEVEMENTS,
        });
      },
    }),
    {
      name: 'gamification-storage',
    }
  )
);
