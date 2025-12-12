'use client';

import { useState, useEffect } from 'react';
import { Building2, Plus, Users, TrendingUp, Camera, Store } from 'lucide-react';
import { useMallStore } from '@/lib/stores/mallStore';
import toast from 'react-hot-toast';

export default function MallManagementSection() {
  const {
    malls,
    currentMall,
    floors,
    shops,
    crowdAnalytics,
    loading,
    setCurrentMall,
    loadMalls,
    loadFloors,
    loadShops,
    loadAnalytics,
    createMall,
    createFloor,
    createShop
  } = useMallStore();

  const [showCreateMall, setShowCreateMall] = useState(false);
  const [showCreateFloor, setShowCreateFloor] = useState(false);
  const [showCreateShop, setShowCreateShop] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('business_token');
    if (token) {
      loadMalls(token);
    }
  }, []);

  useEffect(() => {
    if (currentMall) {
      loadFloors(currentMall.id);
      loadShops(currentMall.id);
      loadAnalytics(currentMall.id);
    }
  }, [currentMall]);

  const handleCreateMall = async (formData: any) => {
    const token = localStorage.getItem('business_token');
    if (!token) return;

    const mall = await createMall(token, formData);
    if (mall) {
      toast.success('AVM oluşturuldu!');
      setShowCreateMall(false);
      setCurrentMall(mall);
    } else {
      toast.error('AVM oluşturulamadı');
    }
  };

  const handleCreateFloor = async (formData: any) => {
    if (!currentMall) return;

    const floor = await createFloor(currentMall.id, formData);
    if (floor) {
      toast.success('Kat eklendi!');
      setShowCreateFloor(false);
    } else {
      toast.error('Kat eklenemedi');
    }
  };

  const handleCreateShop = async (formData: any) => {
    if (!currentMall) return;

    const shop = await createShop(currentMall.id, formData);
    if (shop) {
      toast.success('Mağaza eklendi!');
      setShowCreateShop(false);
    } else {
      toast.error('Mağaza eklenemedi');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-600" />
            AVM Yönetimi
          </h2>
          <p className="text-gray-600 mt-1">
            Alışveriş merkezi yoğunluk analizi ve kiracı yönetimi
          </p>
        </div>
        
        {!currentMall && (
          <button
            onClick={() => setShowCreateMall(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Yeni AVM
          </button>
        )}
      </div>

      {/* AVM Selector */}
      {malls.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AVM Seçin
          </label>
          <select
            value={currentMall?.id || ''}
            onChange={(e) => {
              const mall = malls.find(m => m.id === parseInt(e.target.value));
              setCurrentMall(mall || null);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">AVM Seçiniz...</option>
            {malls.map(mall => (
              <option key={mall.id} value={mall.id}>
                {mall.mall_name} - {mall.address}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Stats Cards */}
      {currentMall && crowdAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={Building2}
            label="Toplam Kat"
            value={crowdAnalytics.totalStats.total_floors || 0}
            color="blue"
          />
          <StatCard
            icon={Store}
            label="Aktif Mağaza"
            value={crowdAnalytics.totalStats.total_shops || 0}
            color="green"
          />
          <StatCard
            icon={Camera}
            label="Kamera"
            value={crowdAnalytics.totalStats.total_cameras || 0}
            color="purple"
          />
          <StatCard
            icon={Users}
            label="Anlık Yoğunluk"
            value={crowdAnalytics.floorCrowd.reduce((sum: number, f: any) => sum + (f.avg_crowd || 0), 0)}
            color="orange"
          />
        </div>
      )}

      {/* Floors & Shops */}
      {currentMall && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Floors */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Katlar</h3>
              <button
                onClick={() => setShowCreateFloor(true)}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Kat Ekle
              </button>
            </div>

            <div className="space-y-2">
              {floors.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Henüz kat eklenmemiş</p>
              ) : (
                floors.map(floor => (
                  <div
                    key={floor.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-indigo-300"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {floor.floor_name || `Kat ${floor.floor_number}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {floor.total_area_sqm ? `${floor.total_area_sqm} m²` : 'Alan bilgisi yok'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-indigo-600">
                        {crowdAnalytics?.floorCrowd.find((f: any) => f.floor_id === floor.id)?.avg_crowd || 0} kişi
                      </p>
                      <p className="text-xs text-gray-500">Anlık</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Shops */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Mağazalar</h3>
              <button
                onClick={() => setShowCreateShop(true)}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Mağaza Ekle
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {shops.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Henüz mağaza eklenmemiş</p>
              ) : (
                shops.map(shop => (
                  <div
                    key={shop.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-indigo-300"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{shop.shop_name}</p>
                      <p className="text-sm text-gray-600">
                        {shop.shop_number} • {shop.area_sqm} m²
                      </p>
                    </div>
                    {shop.monthly_rent && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          ₺{shop.monthly_rent.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Aylık Kira</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Crowd Analytics Chart */}
      {currentMall && crowdAnalytics?.hourlyTrend.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Saatlik Yoğunluk Trendi</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {crowdAnalytics.hourlyTrend.map((hour: any) => (
              <div key={hour.hour_of_day} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-indigo-500 rounded-t transition-all hover:bg-indigo-600"
                  style={{ height: `${(hour.avg_people / Math.max(...crowdAnalytics.hourlyTrend.map((h: any) => h.avg_people))) * 100}%` }}
                />
                <p className="text-xs text-gray-600 mt-2">{hour.hour_of_day}:00</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Mall Modal */}
      {showCreateMall && (
        <CreateMallModal
          onClose={() => setShowCreateMall(false)}
          onSubmit={handleCreateMall}
        />
      )}

      {/* Create Floor Modal */}
      {showCreateFloor && currentMall && (
        <CreateFloorModal
          onClose={() => setShowCreateFloor(false)}
          onSubmit={handleCreateFloor}
        />
      )}

      {/* Create Shop Modal */}
      {showCreateShop && currentMall && (
        <CreateShopModal
          floors={floors}
          onClose={() => setShowCreateShop(false)}
          onSubmit={handleCreateShop}
        />
      )}
    </div>
  );
}

// Create Mall Modal
function CreateMallModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    mall_name: '',
    address: '',
    city: '',
    district: '',
    latitude: null,
    longitude: null,
    total_floors: 1,
    total_area_sqm: null,
    parking_capacity: null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Yeni AVM Oluştur</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AVM Adı *
            </label>
            <input
              type="text"
              required
              value={formData.mall_name}
              onChange={(e) => setFormData({ ...formData, mall_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şehir *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İlçe *
              </label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adres *
            </label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kat Sayısı *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.total_floors}
                onChange={(e) => setFormData({ ...formData, total_floors: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Toplam Alan (m²)
              </label>
              <input
                type="number"
                value={formData.total_area_sqm || ''}
                onChange={(e) => setFormData({ ...formData, total_area_sqm: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Otopark Kapasitesi
              </label>
              <input
                type="number"
                value={formData.parking_capacity || ''}
                onChange={(e) => setFormData({ ...formData, parking_capacity: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Create Floor Modal
function CreateFloorModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    floor_name: '',
    floor_number: 0,
    total_area_sqm: null,
    shop_count: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Yeni Kat Ekle</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kat Adı *
            </label>
            <input
              type="text"
              required
              placeholder="örn: Zemin Kat, 1. Kat"
              value={formData.floor_name}
              onChange={(e) => setFormData({ ...formData, floor_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kat Numarası *
            </label>
            <input
              type="number"
              required
              value={formData.floor_number}
              onChange={(e) => setFormData({ ...formData, floor_number: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kat Alanı (m²)
            </label>
            <input
              type="number"
              value={formData.total_area_sqm || ''}
              onChange={(e) => setFormData({ ...formData, total_area_sqm: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Create Shop Modal
function CreateShopModal({ floors, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    shop_name: '',
    shop_number: '',
    floor_id: '',
    area_sqm: null,
    category: '',
    monthly_rent: null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Yeni Mağaza Ekle</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mağaza Adı *
            </label>
            <input
              type="text"
              required
              value={formData.shop_name}
              onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mağaza No *
              </label>
              <input
                type="text"
                required
                value={formData.shop_number}
                onChange={(e) => setFormData({ ...formData, shop_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kat *
              </label>
              <select
                required
                value={formData.floor_id}
                onChange={(e) => setFormData({ ...formData, floor_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seçiniz</option>
                {floors.map((floor: any) => (
                  <option key={floor.id} value={floor.id}>
                    {floor.floor_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <input
              type="text"
              placeholder="örn: Giyim, Teknoloji, Yiyecek"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alan (m²)
              </label>
              <input
                type="number"
                value={formData.area_sqm || ''}
                onChange={(e) => setFormData({ ...formData, area_sqm: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aylık Kira (₺)
              </label>
              <input
                type="number"
                value={formData.monthly_rent || ''}
                onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color }: any) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className={`w-12 h-12 ${colors[color as keyof typeof colors]} rounded-lg flex items-center justify-center mb-3`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </div>
  );
}
