'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Store, MapPin, Phone, Tag, Sparkles, Clock, Info, ShoppingCart, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/lib/stores/cartStore';
import { useAuthStore } from '@/store/authStore';
import CartModal from '@/components/Cart/CartModal';

interface BusinessMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number;
  businessName: string;
}

export default function BusinessMenuModal({
  isOpen,
  onClose,
  businessId,
  businessName
}: BusinessMenuModalProps) {
  const [menuData, setMenuData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const { user } = useAuthStore();
  const { addToCart, setBusinessInfo, getTotalItems } = useCartStore();

  useEffect(() => {
    if (isOpen && businessId) {
      loadMenu();
      setBusinessInfo(businessId, businessName);
    }
  }, [isOpen, businessId]);

  const loadMenu = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/business/menu/public?businessId=${businessId}`);
      const data = await response.json();
      
      if (data.success) {
        setMenuData(data);
      } else {
        toast.error('Menü yüklenemedi');
      }
    } catch (error) {
      console.error('Menu load error:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item: any) => {
    if (!user) {
      toast.error('Sipariş vermek için giriş yapmalısınız');
      return;
    }

    if (!item.is_available) {
      toast.error('Bu ürün şu anda mevcut değil');
      return;
    }

    try {
      await addToCart(
        user.id,
        businessId,
        item.id,
        1,
        parseFloat(item.price)
      );
      toast.success(`${item.name} sepete eklendi!`, {
        icon: '🛒',
        duration: 2000
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Sepete eklenemedi');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Store className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">{businessName}</h2>
                  
                  {/* Sepet Butonu */}
                  {getTotalItems() > 0 && (
                    <button
                      onClick={() => setShowCart(true)}
                      className="ml-auto relative bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span className="font-semibold">Sepetim ({getTotalItems()})</span>
                    </button>
                  )}
                </div>
                {menuData?.business && (
                  <div className="space-y-1 text-sm text-blue-100">
                    {menuData.business.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{menuData.business.address}</span>
                      </div>
                    )}
                    {menuData.business.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{menuData.business.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">Menü yükleniyor...</p>
              </div>
            ) : !menuData?.hasMenu ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Tag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Henüz Fiyat Listesi Yok
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Bu işletme henüz fiyat listesini paylaşmamış
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* İstatistikler */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Kategoriler</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {menuData.categories.length}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Ürünler</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {menuData.totalItems}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-800 col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">Güncel Fiyatlar</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {new Date().toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>

                {/* Kategoriler ve Ürünler */}
                <div className="space-y-6">
                  {menuData.categories.map((category: any, catIndex: number) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIndex * 0.1 }}
                      className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
                    >
                      {/* Kategori Başlığı */}
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-2xl">{category.icon || '📦'}</span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {category.name}
                        </h3>
                        <span className="ml-auto text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                          {category.items.length} ürün
                        </span>
                      </div>

                      {/* Ürünler */}
                      {category.items.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">Bu kategoride henüz ürün yok</p>
                      ) : (
                        <div className="space-y-3">
                          {category.items.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex items-start justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all group"
                            >
                              <div className="flex-1">
                                <div className="flex items-start gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {item.name}
                                  </h4>
                                  {!item.is_available && (
                                    <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">
                                      Tükendi
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              
                              <div className="ml-4 flex items-center gap-3 flex-shrink-0">
                                <div className="text-right">
                                  <div className="flex items-center gap-2">
                                    {item.original_price && parseFloat(item.original_price) > parseFloat(item.price) && (
                                      <span className="text-sm text-gray-400 line-through">
                                        {parseFloat(item.original_price).toFixed(2)} ₺
                                      </span>
                                    )}
                                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                      {parseFloat(item.price).toFixed(2)} ₺
                                    </span>
                                  </div>
                                  {item.original_price && parseFloat(item.original_price) > parseFloat(item.price) && (
                                    <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                                      %{Math.round(((parseFloat(item.original_price) - parseFloat(item.price)) / parseFloat(item.original_price)) * 100)} İndirim
                                    </span>
                                  )}
                                </div>
                                
                                {/* Sepete Ekle Butonu */}
                                <button
                                  onClick={() => handleAddToCart(item)}
                                  disabled={!item.is_available}
                                  className={`
                                    px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2
                                    ${item.is_available
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }
                                  `}
                                  title={item.is_available ? 'Sepete Ekle' : 'Ürün mevcut değil'}
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                  <span className="hidden sm:inline">Sepete Ekle</span>
                                  <Plus className="w-4 h-4 sm:hidden" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Footer Bilgi */}
                <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900 dark:text-blue-300">
                    <p className="font-medium mb-1">Fiyat Bilgilendirmesi</p>
                    <p className="text-blue-700 dark:text-blue-400">
                      Fiyatlar güncel olmakla birlikte değişiklik gösterebilir. Güncel fiyatlar için lütfen işletmeyle iletişime geçiniz.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Sepet Modal */}
        {showCart && <CartModal onClose={() => setShowCart(false)} />}
      </div>
    </AnimatePresence>
  );
}
