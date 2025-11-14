import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface BusinessUser {
  id: number;
  email: string;
  business_name: string;
  business_type: string;
  membership_type: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  website?: string;
  is_active: boolean;
  created_at: string;
}

interface BusinessAuthState {
  user: BusinessUser | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: BusinessUser, token: string) => void;
  updateProfile: (data: Partial<BusinessUser>) => void;
  checkAuth: () => Promise<boolean>;
}

export const useBusinessAuthStore = create<BusinessAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          console.log('🏢 Business Login API çağrısı:', email);
          
          const response = await fetch('/api/business/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Giriş başarısız');
          }

          const data = await response.json();
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true
          });

          console.log('✅ Business login başarılı:', data.user.business_name);
        } catch (error: any) {
          console.error('❌ Business login hatası:', error);
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
        console.log('👋 Business logout');
      },

      setUser: (user: BusinessUser, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true
        });
      },

      updateProfile: (data: Partial<BusinessUser>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...data }
          });
        }
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) {
          set({ isAuthenticated: false });
          return false;
        }

        try {
          const response = await fetch('/api/business/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            set({
              user: data.user,
              isAuthenticated: true
            });
            return true;
          } else {
            // Token geçersiz
            set({
              user: null,
              token: null,
              isAuthenticated: false
            });
            return false;
          }
        } catch (error) {
          console.error('❌ Auth check hatası:', error);
          set({ isAuthenticated: false });
          return false;
        }
      }
    }),
    {
      name: 'business-auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
