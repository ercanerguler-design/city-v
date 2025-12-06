'use client';

import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cartStore';
import { useState } from 'react';
import CartModal from './CartModal';

export default function CartIcon() {
  const { items } = useCartStore();
  const [showCart, setShowCart] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (itemCount === 0) return null;

  return (
    <>
      <button
        onClick={() => setShowCart(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-200"
      >
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {itemCount}
          </span>
        )}
      </button>

      {showCart && <CartModal onClose={() => setShowCart(false)} />}
    </>
  );
}
