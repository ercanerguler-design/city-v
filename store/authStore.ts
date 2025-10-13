import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useAdminStore } from '@/lib/stores/adminStore';
import { saveUser } from '@/lib/stores/userManager';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  premium: boolean;
  premiumPlan?: 'basic' | 'pro' | 'enterprise';
  aiCredits?: number;
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  upgradeToPremium: (plan: string) => void;
  createTestUser: (premium: boolean) => void; // Test amaçlı
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Simüle edilmiş login - gerçek uygulamada API çağrısı yapılır
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const mockUser: User = {
          id: '1',
          name: 'Ercan Kullanıcı',
          email: email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent('Ercan Kullanıcı')}&background=6366f1&color=fff`,
          premium: true, // Test için premium yapalım
          premiumPlan: 'pro',
          aiCredits: 100, // Bol bol AI kredisi
          createdAt: new Date(),
        };

        set({ user: mockUser, isAuthenticated: true });
      },

      register: async (name: string, email: string, password: string) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const mockUser: User = {
          id: Date.now().toString(),
          name,
          email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
          premium: true, // Test için premium
          premiumPlan: 'basic',
          aiCredits: 50, // Yeni premium kullanıcılara 50 AI credit
          createdAt: new Date(),
        };

        set({ user: mockUser, isAuthenticated: true });
        
        // Kullanıcıyı all-users storage'a kaydet
        try {
          saveUser({
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            avatar: mockUser.avatar,
            premium: mockUser.premium,
            createdAt: mockUser.createdAt.toISOString(),
          });
        } catch (error) {
          console.error('User save error:', error);
        }
        
        // Admin paneline bildir
        try {
          const adminStore = useAdminStore.getState();
          adminStore.trackUserSignup(name, mockUser.id);
        } catch (error) {
          console.error('Admin tracking error:', error);
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (data: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },

      upgradeToPremium: (plan: string) => {
        set((state) => {
          if (!state.user) return state;
          
          // Plan'a göre farklı krediler ver
          const creditsByPlan = {
            'basic': 100,
            'pro': 500,
            'enterprise': 1000
          };
          
          const updatedUser = { 
            ...state.user, 
            premium: true,
            premiumPlan: plan as 'basic' | 'pro' | 'enterprise',
            aiCredits: (state.user.aiCredits || 0) + (creditsByPlan[plan as keyof typeof creditsByPlan] || 100)
          };
          
          // Admin paneline bildir
          try {
            const adminStore = useAdminStore.getState();
            adminStore.trackPremiumUpgrade(state.user.name, state.user.id, plan);
          } catch (error) {
            console.error('Admin tracking error:', error);
          }
          
          return { user: updatedUser };
        });
      },

      createTestUser: (premium: boolean) => {
        const testUser: User = {
          id: Date.now().toString(),
          name: premium ? 'Premium Test Kullanıcısı' : 'Normal Test Kullanıcısı',
          email: premium ? 'premium@test.com' : 'normal@test.com',
          avatar: `https://ui-avatars.com/api/?name=${premium ? 'Premium' : 'Normal'}&background=${premium ? 'fbbf24' : '6b7280'}&color=fff`,
          premium,
          premiumPlan: premium ? 'pro' : undefined,
          aiCredits: premium ? 100 : 0,
          createdAt: new Date(),
        };

        set({ user: testUser, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
