'use client';

import { ShoppingBag, Clock, CheckCircle, XCircle, Package, TrendingUp, Phone, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  userId: number;
  userName: string;
  phone: string;
  address: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
  notes?: string;
}

export default function OrderManagementSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pending: 0,
    preparing: 0,
    delivered: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000); // Her 10 saniyede yenile
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('business_token');
      const response = await fetch('/api/food/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
        calculateStats(data.orders);
      }
    } catch (error) {
      console.error('Orders load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orders: Order[]) => {
    setStats({
      totalOrders: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0)
    });
  };

  const updateOrderStatus = async (orderId: number, status: Order['status']) => {
    try {
      const token = localStorage.getItem('business_token');
      const response = await fetch(`/api/food/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Sipariş durumu güncellendi');
        loadOrders();
      }
    } catch (error) {
      toast.error('Güncelleme başarısız');
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ready': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '📝 Yeni Sipariş';
      case 'preparing': return '👨‍🍳 Hazırlanıyor';
      case 'ready': return '📦 Hazır';
      case 'delivered': return '✅ Teslim Edildi';
      case 'cancelled': return '❌ İptal';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-orange-600" />
          Sipariş Yönetimi
        </h2>
        <p className="text-gray-500 mt-1">Gelen siparişleri takip edin ve yönetin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 rounded-xl">
          <ShoppingBag className="w-10 h-10 mb-3 opacity-80" />
          <p className="text-sm opacity-90">Toplam Sipariş</p>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-6 rounded-xl">
          <Clock className="w-10 h-10 mb-3 opacity-80" />
          <p className="text-sm opacity-90">Bekleyen</p>
          <p className="text-3xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white p-6 rounded-xl">
          <Package className="w-10 h-10 mb-3 opacity-80" />
          <p className="text-sm opacity-90">Hazırlanıyor</p>
          <p className="text-3xl font-bold">{stats.preparing}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-6 rounded-xl">
          <CheckCircle className="w-10 h-10 mb-3 opacity-80" />
          <p className="text-sm opacity-90">Teslim</p>
          <p className="text-3xl font-bold">{stats.delivered}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-xl">
          <TrendingUp className="w-10 h-10 mb-3 opacity-80" />
          <p className="text-sm opacity-90">Toplam Gelir</p>
          <p className="text-2xl font-bold">₺{stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Aktif Siparişler</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Siparişler yükleniyor...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Henüz sipariş yok</p>
          </div>
        ) : (
          <div className="divide-y">
            {orders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition">
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-gray-900">Sipariş #{order.id}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">₺{order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Müşteri</p>
                    <p className="font-medium text-gray-900">{order.userName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Telefon
                    </p>
                    <p className="font-medium text-gray-900">{order.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Adres
                    </p>
                    <p className="text-sm text-gray-700">{order.address}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Sipariş Detayı:</p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium text-gray-900">₺{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium mb-1">Not:</p>
                    <p className="text-sm text-blue-900">{order.notes}</p>
                  </div>
                )}

                {/* Actions */}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          👨‍🍳 Hazırlamaya Başla
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium"
                        >
                          ❌ İptal
                        </button>
                      </>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                      >
                        📦 Hazır - Teslime Çıkar
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        ✅ Teslim Edildi
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
