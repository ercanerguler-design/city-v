'use client';

import { X, Plus, Minus, Trash2, ShoppingBag, MapPin, Phone, CreditCard } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cartStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import CheckoutModal from './CheckoutModal';

interface CartModalProps {
  onClose: () => void;
}

export default function CartModal({ onClose }: CartModalProps) {
  const { items, updateQuantity, removeFromCart, getTotalPrice, businessName, emptyCart } = useCartStore();
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Sepetiniz boş');
      return;
    }
    setShowCheckout(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Sepetim</h2>
                <p className="text-sm opacity-90">{businessName || 'Restoran'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Items */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Sepetiniz boş</p>
                <p className="text-gray-400 text-sm mt-2">Menüden ürün ekleyerek başlayın</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                  >
                    {/* Image */}
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    )}

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                      <p className="text-orange-600 font-bold mt-1">₺{item.price.toFixed(2)}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-6 bg-gray-50">
              {/* Total */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 font-medium">Toplam</span>
                <span className="text-3xl font-bold text-orange-600">
                  ₺{getTotalPrice().toFixed(2)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (confirm('Sepeti boşaltmak istediğinize emin misiniz?')) {
                      emptyCart();
                      toast.success('Sepet boşaltıldı');
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  Sepeti Boşalt
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Siparişi Onayla
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onBack={() => setShowCheckout(false)}
        />
      )}
    </>
  );
}
