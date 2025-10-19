import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useAdminStore } from '@/lib/stores/adminStore';
import { saveUser } from '@/lib/stores/userManager';

// Üyelik Tipleri
export type MembershipTier = 'free' | 'premium' | 'business' | 'enterprise';

export interface MembershipBenefits {
  tier: MembershipTier;
  features: {
    adFree: boolean;
    advancedAnalytics: boolean;
    aiChatLimit: number; // -1 = unlimited
    iotMonitoring: boolean;
    prioritySupport: boolean;
    customThemes: boolean;
    apiAccess: boolean;
    teamMembers: number;
  };
  price: {
    monthly: number;
    yearly: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  membershipTier: MembershipTier;
  membershipExpiry?: Date | null; // null = lifetime/free
  aiCredits: number;
  createdAt: Date;
  
  // Premium özellikleri için kolay erişim
  get isPremium(): boolean;
  get isBusiness(): boolean;
  get isEnterprise(): boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  membershipBenefits: Record<MembershipTier, MembershipBenefits>;
  
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  upgradeToPremium: (plan: string) => void; // Eski sistem uyumluluğu
  upgradeMembership: (tier: MembershipTier, duration: 'monthly' | 'yearly') => void;
  checkFeatureAccess: (feature: keyof MembershipBenefits['features']) => boolean;
  getRemainingAICredits: () => number;
  useAICredit: () => boolean;
  createTestUser: (tier: MembershipTier) => void;
}

// @ts-ignore - Complex type inference with getters
export const useAuthStore = create<AuthState>()(
  persist(
    // @ts-ignore
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Simüle edilmiş login - gerçek uygulamada API çağrısı yapılır
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const mockUser: any = {
          id: '1',
          name: 'Ercan Kullanıcı',
          email: email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent('Ercan Kullanıcı')}&background=6366f1&color=fff`,
          membershipTier: 'free' as MembershipTier, // Default free
          membershipExpiry: null,
          aiCredits: 100,
          createdAt: new Date(),
          // Getter'lar için
          get isPremium() { return this.membershipTier !== 'free'; },
          get isBusiness() { return this.membershipTier === 'business'; },
          get isEnterprise() { return this.membershipTier === 'enterprise'; },
        };

        set({ user: mockUser, isAuthenticated: true });
        
        // Kullanıcıyı all-users storage'a kaydet (eğer yoksa)
        try {
          const existingUsers = JSON.parse(localStorage.getItem('all-users-storage') || '{"users":[]}');
          const users = existingUsers.users || [];
          
          if (!users.find((u: any) => u.id === mockUser.id)) {
            users.push({
              id: mockUser.id,
              name: mockUser.name,
              email: mockUser.email,
              avatar: mockUser.avatar,
              premium: false,
              membershipTier: 'free',
              createdAt: mockUser.createdAt.toISOString(),
              membershipExpiry: null,
            });
            localStorage.setItem('all-users-storage', JSON.stringify({ users }));
          }
        } catch (error) {
          console.error('Login user save error:', error);
        }
      },

      register: async (name: string, email: string, password: string) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const mockUser: any = {
          id: Date.now().toString(),
          name,
          email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
          membershipTier: 'free' as MembershipTier, // Yeni kullanıcılar free başlar
          membershipExpiry: null,
          aiCredits: 50,
          createdAt: new Date(),
          // Getter'lar için
          get isPremium() { return this.membershipTier !== 'free'; },
          get isBusiness() { return this.membershipTier === 'business'; },
          get isEnterprise() { return this.membershipTier === 'enterprise'; },
        };

        set({ user: mockUser, isAuthenticated: true });
        
        // Kullanıcıyı all-users storage'a kaydet
        try {
          saveUser({
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            avatar: mockUser.avatar,
            premium: false, // Free başlar
            membershipTier: 'free',
            createdAt: mockUser.createdAt.toISOString(),
            membershipExpiry: null,
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
        // Eski sistem uyumluluğu - yeni sisteme yönlendir
        const { user } = useAuthStore.getState();
        if (!user) return;
        
        const tierMap: Record<string, MembershipTier> = {
          'basic': 'premium',
          'pro': 'premium',
          'enterprise': 'enterprise'
        };
        const tier = tierMap[plan] || 'premium';
        
        const updatedUser: any = {
          ...user,
          membershipTier: tier,
          membershipExpiry: null,
          aiCredits: user.aiCredits + 100,
          get isPremium() { return this.membershipTier !== 'free'; },
          get isBusiness() { return this.membershipTier === 'business'; },
          get isEnterprise() { return this.membershipTier === 'enterprise'; },
        };
        
        set({ user: updatedUser });
      },

      createTestUser: (tier: MembershipTier) => {
        const isPremium = tier !== 'free';
        const testUser: any = {
          id: Date.now().toString(),
          name: isPremium ? `${tier.toUpperCase()} Test Kullanıcısı` : 'Free Test Kullanıcısı',
          email: isPremium ? `${tier}@test.com` : 'free@test.com',
          avatar: `https://ui-avatars.com/api/?name=${tier}&background=${isPremium ? 'fbbf24' : '6b7280'}&color=fff`,
          membershipTier: tier,
          membershipExpiry: null,
          aiCredits: isPremium ? 100 : 0,
          createdAt: new Date(),
          // Getter'lar
          get isPremium() { return this.membershipTier !== 'free'; },
          get isBusiness() { return this.membershipTier === 'business'; },
          get isEnterprise() { return this.membershipTier === 'enterprise'; },
        };

        set({ user: testUser, isAuthenticated: true });
      },

      // Membership benefits (boş döndür şimdilik)
      membershipBenefits: {} as Record<MembershipTier, MembershipBenefits>,

      // Feature access kontrolü
      checkFeatureAccess: (feature: keyof MembershipBenefits['features']): boolean => {
        const state = useAuthStore.getState();
        const currentUser = state.user;
        if (!currentUser) return false;
        // Premium+ her şeye erişebilir
        return currentUser.membershipTier !== 'free';
      },

      // AI Credits
      getRemainingAICredits: () => {
        const user = useAuthStore.getState().user;
        return user?.aiCredits || 0;
      },

      useAICredit: () => {
        const { user } = useAuthStore.getState();
        if (!user || user.aiCredits <= 0) return false;
        set({ user: { ...user, aiCredits: user.aiCredits - 1 } });
        return true;
      },

      // Upgrade membership
      upgradeMembership: (tier: MembershipTier, duration: 'monthly' | 'yearly') => {
        const { user } = useAuthStore.getState();
        if (!user) return;
        
        const updatedUser: any = {
          ...user,
          membershipTier: tier,
          membershipExpiry: null, // Lifetime for now
          get isPremium() { return this.membershipTier !== 'free'; },
          get isBusiness() { return this.membershipTier === 'business'; },
          get isEnterprise() { return this.membershipTier === 'enterprise'; },
        };
        
        set({ user: updatedUser });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Persist'den sonra user objesini yeniden oluştur (getter'ları geri ekle)
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          const user = state.user as any;
          // Getter'ları yeniden ekle
          Object.defineProperty(user, 'isPremium', {
            get() { return this.membershipTier !== 'free'; },
            enumerable: true
          });
          Object.defineProperty(user, 'isBusiness', {
            get() { return this.membershipTier === 'business'; },
            enumerable: true
          });
          Object.defineProperty(user, 'isEnterprise', {
            get() { return this.membershipTier === 'enterprise'; },
            enumerable: true
          });
        }
      }
    }
  )
);
