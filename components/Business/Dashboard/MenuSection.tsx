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
                <button className="text-gray-400 hover:text-gray-600">
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              {category.items?.length === 0 ? (
                <p className="text-gray-500 text-sm">Bu kategoride henüz ürün yok</p>
              ) : (
                <div className="space-y-3">
                  {category.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{item.price} ₺</p>
                        {item.original_price && (
                          <p className="text-sm text-gray-400 line-through">{item.original_price} ₺</p>
                        )}
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
