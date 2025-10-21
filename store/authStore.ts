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
  loginWithGoogle: (googleUser: { email: string; name: string; picture?: string; googleId?: string }) => Promise<void>;
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Kayıtlı kullanıcıları kontrol et
        const existingUsers = JSON.parse(localStorage.getItem('all-users-storage') || '{"users":[]}');
        const users = existingUsers.users || [];
        
        console.log('🔍 Login denemesi:', email);
        console.log('📊 Storage\'da kayıtlı kullanıcı sayısı:', users.length);
        
        // Kullanıcıyı email ile bul
        const foundUser = users.find((u: any) => u.email === email);
        
        if (!foundUser) {
          console.log('❌ Kullanıcı bulunamadı:', email);
          throw new Error('Bu email adresi ile kayıtlı kullanıcı bulunamadı. Lütfen kayıt olun.');
        }
        
        console.log('✅ Kullanıcı bulundu:', foundUser.email, '- Tier:', foundUser.membershipTier);
        
        // Kullanıcı bulundu, giriş yap
        const loggedInUser: any = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          avatar: foundUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(foundUser.name)}&background=6366f1&color=fff`,
          membershipTier: foundUser.membershipTier || 'free',
          membershipExpiry: foundUser.membershipExpiry || null,
          aiCredits: foundUser.aiCredits || 100,
          createdAt: foundUser.createdAt ? new Date(foundUser.createdAt) : new Date(),
          // Getter'lar için
          get isPremium() { return this.membershipTier !== 'free'; },
          get isBusiness() { return this.membershipTier === 'business'; },
          get isEnterprise() { return this.membershipTier === 'enterprise'; },
        };

        set({ user: loggedInUser, isAuthenticated: true });
        console.log('✅ Login başarılı, membershipTier:', loggedInUser.membershipTier);
      },

      loginWithGoogle: async (googleUser: { email: string; name: string; picture?: string; googleId?: string }) => {
        try {
          console.log('🔐 Google login başlatılıyor:', googleUser.email);
          
          // API'ye Google kullanıcı bilgilerini gönder (Postgres'e kaydet/kontrol et)
          const response = await fetch('/api/auth/google', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: googleUser.email,
              name: googleUser.name,
              picture: googleUser.picture,
              googleId: googleUser.googleId
            })
          });
          
          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.error || 'Google login başarısız');
          }
          
          const dbUser = data.user;
          
          // Kullanıcı state'ini oluştur
          const loggedInUser: any = {
            id: dbUser.id.toString(),
            name: dbUser.name,
            email: dbUser.email,
            avatar: dbUser.profile_picture || googleUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(dbUser.name)}&background=6366f1&color=fff`,
            membershipTier: dbUser.membership_tier || 'free',
            membershipExpiry: dbUser.membership_expiry ? new Date(dbUser.membership_expiry) : null,
            aiCredits: dbUser.ai_credits || 100,
            createdAt: new Date(dbUser.created_at),
            // Getter'lar
            get isPremium() { return this.membershipTier !== 'free'; },
            get isBusiness() { return this.membershipTier === 'business'; },
            get isEnterprise() { return this.membershipTier === 'enterprise'; },
          };

          set({ user: loggedInUser, isAuthenticated: true });
          
          if (data.isNewUser) {
            console.log('🎉 Yeni Google kullanıcısı oluşturuldu:', googleUser.email);
            
            // Admin paneline bildir
            try {
              const adminStore = useAdminStore.getState();
              adminStore.trackUserSignup(dbUser.name, dbUser.id.toString());
            } catch (error) {
              console.error('Admin tracking error:', error);
            }
          } else {
            console.log('✅ Mevcut Google kullanıcısı giriş yaptı:', googleUser.email);
          }
          
          console.log('✅ Google login başarılı, membershipTier:', loggedInUser.membershipTier);
          
        } catch (error) {
          console.error('❌ Google login hatası:', error);
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Email kontrolü - zaten kayıtlı mı?
        const existingUsers = JSON.parse(localStorage.getItem('all-users-storage') || '{"users":[]}');
        const users = existingUsers.users || [];
        
        if (users.find((u: any) => u.email === email)) {
          throw new Error('Bu email adresi zaten kayıtlı. Lütfen giriş yapın.');
        }
        
        // Yeni kullanıcı oluştur
        const newUserId = Date.now().toString();
        const newUserData = {
          id: newUserId,
          name,
          email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
          premium: false,
          membershipTier: 'free' as MembershipTier,
          membershipExpiry: null,
          aiCredits: 50,
          createdAt: new Date().toISOString(),
        };
        
        // ÖNEMLİ: Önce all-users-storage'a kaydet
        users.push(newUserData);
        localStorage.setItem('all-users-storage', JSON.stringify({ 
          users,
          lastUpdated: new Date().toISOString()
        }));
        
        console.log('✅ Kullanıcı all-users-storage\'a kaydedildi:', email);
        console.log('📊 Toplam kullanıcı sayısı:', users.length);
        
        // Sonra auth store'a set et
        const mockUser: any = {
          id: newUserId,
          name,
          email,
          avatar: newUserData.avatar,
          membershipTier: 'free' as MembershipTier,
          membershipExpiry: null,
          aiCredits: 50,
          createdAt: new Date(),
          // Getter'lar için
          get isPremium() { return this.membershipTier !== 'free'; },
          get isBusiness() { return this.membershipTier === 'business'; },
          get isEnterprise() { return this.membershipTier === 'enterprise'; },
        };

        set({ user: mockUser, isAuthenticated: true });
        
        // Admin paneline bildir
        try {
          const adminStore = useAdminStore.getState();
          adminStore.trackUserSignup(name, newUserId);
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
