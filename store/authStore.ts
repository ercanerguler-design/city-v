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
          premium: true,
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
          premium: false,
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
          
          const updatedUser = { ...state.user, premium: true };
          
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
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
