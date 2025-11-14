'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MenuSection({ businessProfile }: { businessProfile: any }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);

  useEffect(() => {
    if (businessProfile) {
      loadMenu();
    }
  }, [businessProfile]);

  const loadMenu = async () => {
    try {
      const response = await fetch(`/api/business/menu?businessId=${businessProfile.id}`);
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Menu load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async () => {
    const name = prompt('Kategori adı:');
    if (!name) return;

    try {
      const response = await fetch('/api/business/menu/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: businessProfile.id,
          name
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Kategori eklendi');
        loadMenu();
      }
    } catch (error) {
      toast.error('Eklenemedi');
    }
  };

  const editCategory = async (categoryId: number, currentName: string) => {
    const name = prompt('Yeni kategori adı:', currentName);
    if (!name || name === currentName) return;

    try {
      const response = await fetch('/api/business/menu/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          name
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Kategori güncellendi');
        loadMenu();
      } else {
        toast.error(data.error || 'Güncellenemedi');
      }
    } catch (error) {
      toast.error('Güncellenemedi');
    }
  };

  const deleteCategory = async (categoryId: number, categoryName: string) => {
    if (!confirm(`"${categoryName}" kategorisini silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/business/menu/categories?categoryId=${categoryId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Kategori silindi');
        loadMenu();
      } else {
        toast.error(data.error || 'Silinemedi');
      }
    } catch (error) {
      toast.error('Silinemedi');
    }
  };

  const addItem = async (categoryId: number) => {
    const name = prompt('Ürün adı:');
    if (!name) return;

    const description = prompt('Ürün açıklaması (opsiyonel):') || '';
    const priceStr = prompt('Fiyat (₺):');
    if (!priceStr) return;

    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) {
      toast.error('Geçerli bir fiyat girin');
      return;
    }

    try {
      const response = await fetch('/api/business/menu/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          name,
          description,
          price
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Ürün eklendi');
        loadMenu();
      } else {
        toast.error(data.error || 'Eklenemedi');
      }
    } catch (error) {
      toast.error('Eklenemedi');
    }
  };

  const deleteItem = async (itemId: number, itemName: string) => {
    if (!confirm(`"${itemName}" ürününü silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/business/menu/items?itemId=${itemId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Ürün silindi');
        loadMenu();
      } else {
        toast.error(data.error || 'Silinemedi');
      }
    } catch (error) {
      toast.error('Silinemedi');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Menü & Fiyatlar</h2>
        <button
          onClick={addCategory}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Kategori Ekle
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz menü eklenmemiş</h3>
          <p className="text-gray-500 mb-6">Ürünlerinizi ve fiyatlarınızı ekleyin</p>
          <button
            onClick={addCategory}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            İlk Kategoriyi Ekle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {category.icon} {category.name}
                </h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => addItem(category.id)}
                    className="flex items-center gap-1 text-green-600 hover:text-green-700 px-3 py-2 hover:bg-green-50 rounded-lg transition-colors text-sm font-medium"
                    title="Ürün Ekle"
                  >
                    <Plus className="w-4 h-4" />
                    Ürün Ekle
                  </button>
                  <button 
                    onClick={() => editCategory(category.id, category.name)}
                    className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Kategoriyi Düzenle"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteCategory(category.id, category.name)}
                    className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Kategoriyi Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {category.items?.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm mb-3">Bu kategoride henüz ürün yok</p>
                  <button
                    onClick={() => addItem(category.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    İlk Ürünü Ekle
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {category.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-gray-500">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{parseFloat(item.price).toFixed(2)} ₺</p>
                          {item.original_price && (
                            <p className="text-sm text-gray-400 line-through">{parseFloat(item.original_price).toFixed(2)} ₺</p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteItem(item.id, item.name)}
                          className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition-all"
                          title="Ürünü Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
