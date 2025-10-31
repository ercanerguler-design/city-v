'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Plus, Trash2, Edit, Calendar, CreditCard, 
  Camera, Mail, Phone, User, Shield, Clock, X, Check 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BusinessUser {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login: string;
  plan_type: string;
  max_cameras: number;
  monthly_price: number;
  start_date: string;
  end_date: string;
  subscription_active: boolean;
  license_key: string;
  notes: string;
  camera_count: number;
}

export default function BusinessUsersManagement() {
  const [users, setUsers] = useState<BusinessUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    planType: 'premium',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/business-users', {
        headers: {
          'x-admin-email': 'sce@scegrup.com' // Admin email
        }
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Kullanıcılar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/admin/business-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': 'sce@scegrup.com'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kullanıcı eklenemedi');
      }

      toast.success('✅ Business üyesi başarıyla eklendi!');
      setShowAddModal(false);
      setFormData({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        planType: 'premium',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: ''
      });
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/business-users?id=${userId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-email': 'sce@scegrup.com'
        }
      });

      if (!response.ok) {
        throw new Error('Kullanıcı silinemedi');
      }

      toast.success('Kullanıcı silindi');
      loadUsers();
    } catch (error) {
      toast.error('Silme işlemi başarısız');
    }
  };

  const getPlanBadge = (planType: string) => {
    if (planType === 'premium') {
      return <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold">Premium</span>;
    }
    return <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold">Enterprise</span>;
  };

  const getStatusBadge = (user: BusinessUser) => {
    const now = new Date();
    const endDate = new Date(user.end_date);
    const isExpired = endDate < now;

    if (!user.subscription_active || isExpired) {
      return <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-semibold">Süresi Dolmuş</span>;
    }
    return <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold">Aktif</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Building2 className="w-8 h-8" />
            Business Üye Yönetimi
          </h2>
          <p className="text-gray-400 mt-1">Business paneline erişimi olan üyeleri yönetin</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all"
        >
          <Plus className="w-5 h-5" />
          Yeni Üye Ekle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl rounded-xl border border-blue-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm">Toplam Üye</p>
              <p className="text-3xl font-bold text-white">{users.length}</p>
            </div>
            <User className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl rounded-xl border border-green-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm">Aktif Üye</p>
              <p className="text-3xl font-bold text-white">
                {users.filter(u => u.subscription_active && new Date(u.end_date) > new Date()).length}
              </p>
            </div>
            <Check className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl rounded-xl border border-purple-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm">Premium</p>
              <p className="text-3xl font-bold text-white">
                {users.filter(u => u.plan_type === 'premium').length}
              </p>
            </div>
            <Shield className="w-10 h-10 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-xl rounded-xl border border-orange-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-sm">Enterprise</p>
              <p className="text-3xl font-bold text-white">
                {users.filter(u => u.plan_type === 'enterprise').length}
              </p>
            </div>
            <Building2 className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gradient-to-br from-slate-900/50 to-blue-900/30 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Yükleniyor...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Henüz business üyesi eklenmemiş</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Kullanıcı</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Plan</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Kameralar</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Ücret</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Süre</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Durum</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-semibold">{user.full_name}</p>
                        <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                        {user.phone && (
                          <p className="text-gray-400 text-sm flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getPlanBadge(user.plan_type)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-semibold">{user.camera_count}</span>
                        <span className="text-gray-400">/ {user.max_cameras}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-green-400 font-semibold">
                        <CreditCard className="w-4 h-4" />
                        {user.monthly_price} TL/ay
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.start_date).toLocaleDateString('tr-TR')}
                        </p>
                        <p className="text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(user.end_date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl border border-white/20 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Yeni Business Üyesi Ekle</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ornek@firma.com"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Şifre *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Güçlü şifre"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ahmet Yılmaz"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0555 123 45 67"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Plan Tipi *
                    </label>
                    <select
                      required
                      value={formData.planType}
                      onChange={(e) => setFormData({...formData, planType: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="premium">Premium (249 TL/ay - 10 kamera)</option>
                      <option value="enterprise">Enterprise (499 TL/ay - 50 kamera)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Başlangıç Tarihi *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Bitiş Tarihi *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Notlar
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Ek notlar..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all"
                  >
                    Üye Ekle
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
