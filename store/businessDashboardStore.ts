'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface BusinessProfile {
  id: number;
  user_id: number;
  business_name: string;
  business_type: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  city: string | null;
  district: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  description: string | null;
  working_hours: any;
  photos: string[] | null;
  location_id: string | null;
  is_visible_on_map: boolean;
  auto_sync_to_cityv: boolean;
  created_at: string;
  updated_at: string;
}

interface BusinessDashboardState {
  // Business Data (kalıcı - logout'ta silinmez)
  businessProfile: BusinessProfile | null;
  businessUser: any | null;
  
  // UI State (geçici)
  activeSection: string;
  
  // Actions
  setBusinessProfile: (profile: BusinessProfile | null) => void;
  setBusinessUser: (user: any | null) => void;
  setActiveSection: (section: string) => void;
  
  // Helper Methods
  clearProfile: () => void; // Sadece profil temizleme (gerekirse)
}

export const useBusinessDashboardStore = create<BusinessDashboardState>()(
  persist(
    (set, get) => ({
      // Initial State
      businessProfile: null,
      businessUser: null,
      activeSection: 'overview',

      // Actions
      setBusinessProfile: (profile) => {
        console.log('💾 Saving business profile to store (kalıcı - logout\'ta silinmez):', profile?.business_name);
        set({ businessProfile: profile });
      },

      setBusinessUser: (user) => {
        console.log('💾 Saving business user to store (kalıcı - logout\'ta silinmez):', user?.email);
        set({ businessUser: user });
      },

      setActiveSection: (section) => {
        set({ activeSection: section });
      },

      // Helper Methods
      clearProfile: () => {
        console.log('🗑️ Clearing business profile (opsiyonel - normal logout\'ta çağrılmaz)');
        set({
          businessProfile: null,
          businessUser: null,
          activeSection: 'overview'
        });
      }
    }),
    {
      name: 'business-dashboard-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Kalıcı veriler (logout'ta silinmez - sadece konum, profil vs)
        businessProfile: state.businessProfile,
        businessUser: state.businessUser,
        
        // UI state (sayfalar arası geçişte korunsun)
        activeSection: state.activeSection
      }),
      version: 2, // Version upgrade - analytics kaldırıldı
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          console.log('🔄 Migrating business dashboard store to v2 - removing analytics');
          // Eski analytics verilerini temizle
          const { analytics, analyticsExpiry, ...rest } = persistedState;
          return rest;
        }
        return persistedState;
      }
    }
  )
);

// Profil temizleme helper (opsiyonel - normalde kullanılmaz)
export const clearBusinessProfile = () => {
  const store = useBusinessDashboardStore.getState();
  store.clearProfile();
};

// NOT: Logout'ta profil VERİLERİ silinmez (konum, adres vs kalır)
// Sadece token temizlenir, kullanıcı tekrar login olduğunda verileri görebilir
