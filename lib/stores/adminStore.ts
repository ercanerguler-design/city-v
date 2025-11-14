import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Admin Stats
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalLocations: number;
  totalReports: number;
  totalCheckIns: number;
  totalFavorites: number;
  totalTrackedLocations: number;
  totalComments: number;
  totalPhotos: number;
  revenue: {
    monthly: number;
    yearly: number;
    total: number;
  };
  userGrowth: {
    today: number;
    week: number;
    month: number;
  };
  popularLocations: {
    id: string;
    name: string;
    category: string;
    visits: number;
    reports: number;
  }[];
  recentActivities: {
    id: string;
    type: 'signup' | 'premium' | 'report' | 'checkin' | 'comment';
    userId: string;
    userName: string;
    timestamp: Date;
    details: string;
  }[];
}

// Admin User
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'moderator';
  permissions: string[];
}

interface AdminState {
  isAdmin: boolean;
  adminUser: AdminUser | null;
  stats: AdminStats;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateStats: () => void;
  refreshStats: () => void;
  addUser: (count?: number) => void;
  addPremiumUser: () => void;
  addReport: () => void;
  addCheckIn: () => void;
  addActivity: (activity: Omit<AdminStats['recentActivities'][0], 'id' | 'timestamp'>) => void;
  trackUserSignup: (userName: string, userId: string) => void;
  trackPremiumUpgrade: (userName: string, userId: string, plan: string) => void;
  trackLocationReport: (userName: string, userId: string, locationName: string) => void;
  trackCheckIn: (userName: string, userId: string, locationName: string) => void;
}

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'sce@scegrup.com',
  password: 'Ka250806Ka'
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAdmin: false,
      adminUser: null,
      stats: {
        totalUsers: 0,
        activeUsers: 0,
        premiumUsers: 0,
        totalLocations: 0,
        totalReports: 0,
        totalCheckIns: 0,
        totalFavorites: 0,
        totalTrackedLocations: 0,
        totalComments: 0,
        totalPhotos: 0,
        revenue: {
          monthly: 0,
          yearly: 0,
          total: 0,
        },
        userGrowth: {
          today: 0,
          week: 0,
          month: 0,
        },
        popularLocations: [],
        recentActivities: [],
      },

      login: (email: string, password: string) => {
        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
          set({
            isAdmin: true,
            adminUser: {
              id: 'admin1',
              email: email,
              name: 'Admin',
              role: 'admin',
              permissions: ['all'],
            },
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({
          isAdmin: false,
          adminUser: null,
        });
      },

      updateStats: () => {
        const currentStats = get().stats;
        set({
          stats: {
            ...currentStats,
            totalUsers: currentStats.totalUsers + Math.floor(Math.random() * 10),
            activeUsers: currentStats.activeUsers + Math.floor(Math.random() * 5),
          },
        });
      },

      refreshStats: () => {
        // Gerçek uygulamada API'den çekilecek
        get().updateStats();
      },

      addUser: (count = 1) => {
        const currentStats = get().stats;
        set({
          stats: {
            ...currentStats,
            totalUsers: currentStats.totalUsers + count,
            activeUsers: currentStats.activeUsers + Math.floor(count * 0.3),
            userGrowth: {
              ...currentStats.userGrowth,
              today: currentStats.userGrowth.today + count,
            },
          },
        });
      },

      addPremiumUser: () => {
        const currentStats = get().stats;
        set({
          stats: {
            ...currentStats,
            premiumUsers: currentStats.premiumUsers + 1,
            revenue: {
              ...currentStats.revenue,
              monthly: currentStats.revenue.monthly + 50,
            },
          },
        });
      },

      addReport: () => {
        const currentStats = get().stats;
        set({
          stats: {
            ...currentStats,
            totalReports: currentStats.totalReports + 1,
          },
        });
      },

      addCheckIn: () => {
        const currentStats = get().stats;
        set({
          stats: {
            ...currentStats,
            totalCheckIns: currentStats.totalCheckIns + 1,
          },
        });
      },

      addActivity: (activity) => {
        const currentStats = get().stats;
        const newActivity = {
          ...activity,
          id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        };
        
        set({
          stats: {
            ...currentStats,
            recentActivities: [newActivity, ...currentStats.recentActivities].slice(0, 20), // Son 20 aktivite
          },
        });
      },

      trackUserSignup: (userName: string, userId: string) => {
        get().addUser(1);
        get().addActivity({
          type: 'signup',
          userId,
          userName,
          details: 'Yeni kullanıcı kaydı',
        });
      },

      trackPremiumUpgrade: (userName: string, userId: string, plan: string) => {
        get().addPremiumUser();
        get().addActivity({
          type: 'premium',
          userId,
          userName,
          details: `${plan} pakete geçti`,
        });
      },

      trackLocationReport: (userName: string, userId: string, locationName: string) => {
        get().addReport();
        get().addActivity({
          type: 'report',
          userId,
          userName,
          details: `${locationName} için kalabalık bildirimi yaptı`,
        });
      },

      trackCheckIn: (userName: string, userId: string, locationName: string) => {
        get().addCheckIn();
        get().addActivity({
          type: 'checkin',
          userId,
          userName,
          details: `${locationName} konumuna check-in yaptı`,
        });
      },
    }),
    {
      name: 'admin-storage',
      // Sadece oturum bilgilerini persist et
      partialize: (state) => ({ 
        isAdmin: state.isAdmin, 
        adminUser: state.adminUser 
      }),
    }
  )
);
