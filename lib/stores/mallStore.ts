import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Mall, MallFloor, MallShop, MallCrowdAnalysis } from '@/types/mall-food';

interface MallStore {
  // Data
  malls: Mall[];
  currentMall: Mall | null;
  floors: MallFloor[];
  shops: MallShop[];
  crowdAnalytics: any;
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Actions
  setMalls: (malls: Mall[]) => void;
  setCurrentMall: (mall: Mall | null) => void;
  setFloors: (floors: MallFloor[]) => void;
  setShops: (shops: MallShop[]) => void;
  setCrowdAnalytics: (analytics: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // API Calls
  loadMalls: (token: string) => Promise<void>;
  loadFloors: (mallId: number) => Promise<void>;
  loadShops: (mallId: number, floorId?: number) => Promise<void>;
  loadAnalytics: (mallId: number, hours?: number) => Promise<void>;
  createMall: (token: string, mallData: Partial<Mall>) => Promise<Mall | null>;
  createFloor: (mallId: number, floorData: Partial<MallFloor>) => Promise<MallFloor | null>;
  createShop: (mallId: number, shopData: Partial<MallShop>) => Promise<MallShop | null>;
  saveCrowdData: (mallId: number, data: any) => Promise<void>;
}

export const useMallStore = create<MallStore>()(
  persist(
    (set, get) => ({
      // Initial State
      malls: [],
      currentMall: null,
      floors: [],
      shops: [],
      crowdAnalytics: null,
      loading: false,
      error: null,

      // Setters
      setMalls: (malls) => set({ malls }),
      setCurrentMall: (mall) => set({ currentMall: mall }),
      setFloors: (floors) => set({ floors }),
      setShops: (shops) => set({ shops }),
      setCrowdAnalytics: (analytics) => set({ crowdAnalytics: analytics }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // API Calls
      loadMalls: async (token: string) => {
        try {
          set({ loading: true, error: null });
          
          const response = await fetch('/api/mall/list', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) throw new Error('Failed to load malls');

          const data = await response.json();
          
          if (data.success) {
            set({ malls: data.malls, loading: false });
          } else {
            throw new Error(data.error);
          }
        } catch (error: any) {
          console.error('❌ Load malls error:', error);
          set({ error: error.message, loading: false });
        }
      },

      loadFloors: async (mallId: number) => {
        try {
          set({ loading: true, error: null });
          
          const response = await fetch(`/api/mall/${mallId}/floors`);
          if (!response.ok) throw new Error('Failed to load floors');

          const data = await response.json();
          
          if (data.success) {
            set({ floors: data.floors, loading: false });
          } else {
            throw new Error(data.error);
          }
        } catch (error: any) {
          console.error('❌ Load floors error:', error);
          set({ error: error.message, loading: false });
        }
      },

      loadShops: async (mallId: number, floorId?: number) => {
        try {
          set({ loading: true, error: null });
          
          const url = floorId 
            ? `/api/mall/${mallId}/shops?floorId=${floorId}`
            : `/api/mall/${mallId}/shops`;
          
          const response = await fetch(url);
          if (!response.ok) throw new Error('Failed to load shops');

          const data = await response.json();
          
          if (data.success) {
            set({ shops: data.shops, loading: false });
          } else {
            throw new Error(data.error);
          }
        } catch (error: any) {
          console.error('❌ Load shops error:', error);
          set({ error: error.message, loading: false });
        }
      },

      loadAnalytics: async (mallId: number, hours: number = 24) => {
        try {
          set({ loading: true, error: null });
          
          const response = await fetch(`/api/mall/${mallId}/analytics?hours=${hours}`);
          if (!response.ok) throw new Error('Failed to load analytics');

          const data = await response.json();
          
          if (data.success) {
            set({ crowdAnalytics: data.analytics, loading: false });
          } else {
            throw new Error(data.error);
          }
        } catch (error: any) {
          console.error('❌ Load analytics error:', error);
          set({ error: error.message, loading: false });
        }
      },

      createMall: async (token: string, mallData: Partial<Mall>) => {
        try {
          set({ loading: true, error: null });
          
          const response = await fetch('/api/mall/list', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(mallData)
          });

          if (!response.ok) throw new Error('Failed to create mall');

          const data = await response.json();
          
          if (data.success) {
            const { malls } = get();
            set({ 
              malls: [...malls, data.mall],
              currentMall: data.mall,
              loading: false 
            });
            return data.mall;
          } else {
            throw new Error(data.error);
          }
        } catch (error: any) {
          console.error('❌ Create mall error:', error);
          set({ error: error.message, loading: false });
          return null;
        }
      },

      createFloor: async (mallId: number, floorData: Partial<MallFloor>) => {
        try {
          set({ loading: true, error: null });
          
          const response = await fetch(`/api/mall/${mallId}/floors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(floorData)
          });

          if (!response.ok) throw new Error('Failed to create floor');

          const data = await response.json();
          
          if (data.success) {
            const { floors } = get();
            set({ 
              floors: [...floors, data.floor],
              loading: false 
            });
            return data.floor;
          } else {
            throw new Error(data.error);
          }
        } catch (error: any) {
          console.error('❌ Create floor error:', error);
          set({ error: error.message, loading: false });
          return null;
        }
      },

      createShop: async (mallId: number, shopData: Partial<MallShop>) => {
        try {
          set({ loading: true, error: null });
          
          const response = await fetch(`/api/mall/${mallId}/shops`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(shopData)
          });

          if (!response.ok) throw new Error('Failed to create shop');

          const data = await response.json();
          
          if (data.success) {
            const { shops } = get();
            set({ 
              shops: [...shops, data.shop],
              loading: false 
            });
            return data.shop;
          } else {
            throw new Error(data.error);
          }
        } catch (error: any) {
          console.error('❌ Create shop error:', error);
          set({ error: error.message, loading: false });
          return null;
        }
      },

      saveCrowdData: async (mallId: number, data: any) => {
        try {
          const response = await fetch(`/api/mall/${mallId}/analytics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

          if (!response.ok) throw new Error('Failed to save crowd data');

          const result = await response.json();
          
          if (!result.success) {
            throw new Error(result.error);
          }
        } catch (error: any) {
          console.error('❌ Save crowd data error:', error);
        }
      }
    }),
    {
      name: 'mall-storage',
      partialize: (state) => ({
        malls: state.malls,
        currentMall: state.currentMall
      })
    }
  )
);
