'use client';

import { useState } from 'react';
import { X, MapPin, Phone, User, ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/stores/cartStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface CheckoutModalProps {
  onClose: () => void;
  onBack: () => void;
}

export default function CheckoutModal({ onClose, onBack }: CheckoutModalProps) {
  const { items, getTotalPrice, businessId, businessName, emptyCart } = useCartStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: '',
    address: '',
    addressDetail: '',
    city: 'Ankara',
    district: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || !formData.phone || !formData.address) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    if (formData.phone.length < 10) {
      toast.error('Geçerli bir telefon numarası girin');
      return;
    }

    setLoading(true);

    try {
      // Sipariş oluştur
      const response = await fetch('/api/food/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          businessId,
          items: items.map(item => ({
            menuItemId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: getTotalPrice(),
          deliveryAddress: {
            fullName: formData.fullName,
            phone: formData.phone,
            address: formData.address,
            addressDetail: formData.addressDetail,
            city: formData.city,
            district: formData.district
          },
          notes: formData.notes,
          paymentMethod: 'online', // Sanal POS için hazır
          paymentStatus: 'pending'
        })
      });

      const data = await response.json();

      if (data.success) {
        // TODO: Sanal POS entegrasyonu buraya gelecek
        // Şimdilik sipariş oluşturuldu mesajı göster
        
        toast.success('Sipariş oluşturuldu! Ödeme sayfasına yönlendiriliyorsunuz...');
        
        // Sepeti temizle
        emptyCart();
        
        // TODO: Ödeme sayfasına yönlendir
        // window.location.href = `/payment/${data.orderId}`;
        
        setTimeout(() => {
          onClose();
          // Geçici: Sipariş detay sayfasına yönlendir
          toast.success(`Sipariş No: ${data.orderId}`, { duration: 5000 });
        }, 2000);
      } else {
        toast.error(data.error || 'Sipariş oluşturulamadı');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-2xl font-bold">Teslimat Bilgileri</h2>
                <p className="text-sm opacity-90">{businessName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {/* İletişim Bilgileri */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                İletişim Bilgileri
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ahmet Yılmaz"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon Numarası *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="5XX XXX XX XX"
                      maxLength={11}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Adres Bilgileri */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Teslimat Adresi
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İl
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="Ankara">Ankara</option>
                      <option value="İstanbul">İstanbul</option>
                      <option value="İzmir">İzmir</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İlçe *
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Çankaya"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Mahalle, Sokak, No"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres Tarifi (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={formData.addressDetail}
                    onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Kat, Daire, Bina rengi vb."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sipariş Notu (Opsiyonel)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Özel istekleriniz varsa belirtebilirsiniz"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600 font-medium">Ödenecek Tutar</span>
            <span className="text-3xl font-bold text-green-600">
              ₺{getTotalPrice().toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                İşleniyor...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Ödemeye Geç
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            Ödeme sayfasında kredi kartı bilgilerinizi güvenle girebilirsiniz
          </p>
        </div>
      </motion.div>
    </div>
  );
}
