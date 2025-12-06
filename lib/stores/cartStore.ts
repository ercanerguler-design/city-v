import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, FoodOrder, UserAddress } from '@/types/mall-food';

interface CartStore {
  // Cart Data
  cartId: number | null;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  finalTotal: number;
  
  // Business Info
  businessId: number | null;
  businessName: string;
  
  // User Info
  userId: number | null;
  selectedAddress: UserAddress | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Actions
  setCartData: (data: any) => void;
  setBusinessInfo: (id: number, name: string) => void;
  setUserId: (userId: number) => void;
  setSelectedAddress: (address: UserAddress | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCart: () => void;
  
  // API Calls
  loadCart: (userId: number, businessId: number) => Promise<void>;
  addToCart: (userId: number, businessId: number, menuItemId: number, quantity: number, unitPrice: number, notes?: string) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  checkout: (orderData: any) => Promise<FoodOrder | null>;
  emptyCart: (userId: number, businessId: number) => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial State
      cartId: null,
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      finalTotal: 0,
      businessId: null,
      businessName: '',
      userId: null,
      selectedAddress: null,
      loading: false,
      error: null,

      // Setters
      setCartData: (data) => set({
        cartId: data.id,
        items: data.items || [],
        subtotal: data.subtotal || 0,
        deliveryFee: data.delivery_fee || 0,
        finalTotal: data.final_total || 0
      }),

      setBusinessInfo: (id, name) => set({ businessId: id, businessName: name }),
      setUserId: (userId) => set({ userId }),
      setSelectedAddress: (address) => set({ selectedAddress: address }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      clearCart: () => set({
        cartId: null,
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        finalTotal: 0,
        selectedAddress: null
      }),

      // API Calls
      loadCart: async (userId: number, businessId: number) => {
        try {
          set({ loading: true, error: null });
          
          const response = await fetch(`/api/food/cart?userId=${userId}&businessId=${businessId}`);
          
          if (!response.ok) throw new Error('Failed to load cart');

          const data = await response.json();
          
          if (data.success) {
            get().setCartData(data.cart);
            set({ loading: false });
          } else {
            throw new Error(data.error);
          }
        } catch (error: any) {
          console.error('❌ Load cart error:', error);
          set({ error: error.message, loading: false });
        }
      },

      addToCart: async (userId: number, businessId: number, menuItemId: number, quantity: number, unitPrice: number, notes?: string) => {
        try {
          set({ loading: true, error: null });
          
          const response = await fetch('/api/food/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              businessId,
              menuItemId,
              quantity,
              unitPrice,
              notes
            })
          });

          if (!response.ok) throw new Error('Failed to add to cart');

          const data = await response.json();
          
          if (data.success) {
            // Sepeti yeniden yükle
            await get().loadCart(userId, businessId);
          } else {
            throw new Error(data.error);
          }
        } catch (error: any) {
          console.error('❌ Add to cart error:', error);
          set({ error: error.message, loading: false });
        }
      },

      removeFromCart: async (itemId: number) => {
        try {
          set({ loading: true, error: null });
          
          const response = await fetch(`/api/food/cart/items/${itemId}`, {
            method: 'DELETE'
          });

          if (!response.ok) throw new Error('Failed to remove item');

          const data = await response.json();
          
          if (data.success) {
            const { items } = get();
            set({ 
              items: items.filter(item => item.id !== itemId),
              loading: false 
            });
            
            // Toplamları yeniden hesapla
            const { userId, businessId } = get();
            if (userId && businessId) {
              await get().loadCart(userId, businessId);
            }
          } else {
            throw new Error(data.error);
          }
        } catch (error: any) {
          console.error('❌ Remove from cart error:', error);
          set({ error: error.message, loading: false });
        }
      },

      updateQuantity: async (itemId: number, quantity: number) => {
        try {
          set({ loading: true, error: null });
          
          const response = await fetch(`/api/food/cart/items/${itemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity })
          });

          if (!response.ok) throw new Error('Failed to update quantity');

          const data = await response.json();
          
          if (data.success) {
            const { userId, businessId } = get();
            if (userId && businessId) {
              await get().loadCart(userId, businessId);
            }
          } else {
            throw new Error(data.error);
          }
        } catch (error: any) {
          console.error('❌ Update quantity error:', error);
          set({ error: error.message, loading: false });
        }
      },

      checkout: async (orderData: any) => {
        try {
          set({ loading: true, error: null });
          
          const response = await fetch('/api/food/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
          });

          if (!response.ok) throw new Error('Failed to create order');

          const data = await response.json();
          
          if (data.success) {
            // Sepeti temizle
            get().clearCart();
            set({ loading: false });
            return data.order;
          } else {
            throw new Error(data.error);
          }
        } catch (error: any) {
          console.error('❌ Checkout error:', error);
          set({ error: error.message, loading: false });
          return null;
        }
      },

      emptyCart: async (userId: number, businessId: number) => {
        try {
          set({ loading: true, error: null });
          
          const response = await fetch(`/api/food/cart?userId=${userId}&businessId=${businessId}`, {
            method: 'DELETE'
          });

          if (!response.ok) throw new Error('Failed to empty cart');

          const data = await response.json();
          
          if (data.success) {
            get().clearCart();
            set({ loading: false });
          } else {
            throw new Error(data.error);
          }
        } catch (error: any) {
          console.error('❌ Empty cart error:', error);
          set({ error: error.message, loading: false });
        }
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        businessId: state.businessId,
        businessName: state.businessName,
        userId: state.userId
      })
    }
  )
);
