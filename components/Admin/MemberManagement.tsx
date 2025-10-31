'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Crown, Shield, Trash2, Edit, Plus, Search, 
  Filter, CheckCircle, XCircle, Mail, Calendar, 
  TrendingUp, Activity, AlertCircle, Lock, Unlock
} from 'lucide-react';
import { useAuthStore, MembershipTier } from '@/store/authStore';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  membershipTier: MembershipTier;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  aiCredits: number;
  profilePicture?: string;
}

interface MemberManagementProps {
  onClose?: () => void;
}

export default function MemberManagement({ onClose }: MemberManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<'all' | MembershipTier>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const { user: currentUser } = useAuthStore();

  // Load users from database
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        const formattedUsers: User[] = data.users.map((user: any) => ({
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          membershipTier: user.membership_tier || 'free',
          createdAt: user.created_at || user.join_date,
          lastLogin: user.last_login,
          isActive: user.is_active !== false,
          aiCredits: user.ai_credits || 0,
          profilePicture: user.profile_picture
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterTier === 'all' || user.membershipTier === filterTier;
    return matchesSearch && matchesFilter;
  });

  const handleUpdateMembership = async (userId: string, newTier: MembershipTier) => {
    try {
      const response = await fetch('/api/admin/update-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, membershipTier: newTier })
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, membershipTier: newTier } : user
        ));
        
        toast.success(`✅ Üyelik ${newTier.toUpperCase()} olarak güncellendi!`);
        console.log(`✅ ${userId} kullanıcısının üyeliği ${newTier} olarak güncellendi`);
      } else {
        toast.error(`❌ Premium üyelik verilemedi: ${data.error || 'Bilinmeyen hata'}`);
        console.error('Üyelik güncellenemedi:', data.error);
      }
    } catch (error) {
      toast.error('❌ Premium üyelik verilemedi: Bağlantı hatası');
      console.error('Üyelik güncelleme hatası:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    
    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(prev => prev.filter(user => user.id !== userId));
        console.log(`🗑️ Kullanıcı silindi: ${userId}`);
      } else {
        console.error('Kullanıcı silinemedi:', data.error);
      }
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/toggle-user-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive })
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isActive } : user
        ));
      }
    } catch (error) {
      console.error('Kullanıcı durumu güncellenemedi:', error);
    }
  };

  const getTierColor = (tier: MembershipTier) => {
    switch (tier) {
      case 'free': return 'bg-gray-100 text-gray-700';
      case 'premium': return 'bg-yellow-100 text-yellow-700';
      case 'business': return 'bg-blue-100 text-blue-700';
      case 'enterprise': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTierIcon = (tier: MembershipTier) => {
    switch (tier) {
      case 'premium': return <Crown className="w-3 h-3" />;
      case 'business': return <Shield className="w-3 h-3" />;
      case 'enterprise': return <Shield className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  const stats = {
    total: users.length,
    free: users.filter(u => u.membershipTier === 'free').length,
    premium: users.filter(u => u.membershipTier === 'premium').length,
    business: users.filter(u => u.membershipTier === 'business').length,
    enterprise: users.filter(u => u.membershipTier === 'enterprise').length,
    active: users.filter(u => u.isActive).length
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Üye Yönetimi</h1>
        <p className="text-gray-600">Kullanıcıları yönetin, üyelikleri güncelleyin ve erişim kontrolü yapın</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <motion.div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Üye</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Free</p>
              <p className="text-2xl font-bold text-gray-900">{stats.free}</p>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </motion.div>

        <motion.div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Premium</p>
              <p className="text-2xl font-bold text-gray-900">{stats.premium}</p>
            </div>
            <Crown className="w-8 h-8 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Business</p>
              <p className="text-2xl font-bold text-gray-900">{stats.business}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Enterprise</p>
              <p className="text-2xl font-bold text-gray-900">{stats.enterprise}</p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </motion.div>

        <motion.div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="İsim veya e-posta ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value as 'all' | MembershipTier)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tüm Üyeler</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="business">Business</option>
              <option value="enterprise">Enterprise</option>
            </select>
            
            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Yenile
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Üyelik</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kayıt Tarihi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Giriş</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {user.profilePicture ? (
                          <img className="h-10 w-10 rounded-full" src={user.profilePicture} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(user.membershipTier)}`}>
                      {getTierIcon(user.membershipTier)}
                      {user.membershipTier.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('tr-TR') : 'Hiç'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {user.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {/* Membership Update Dropdown */}
                      <select
                        value={user.membershipTier}
                        onChange={(e) => handleUpdateMembership(user.id, e.target.value as MembershipTier)}
                        className="text-xs px-2 py-1 border border-gray-300 rounded"
                      >
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                        <option value="business">Business</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                      
                      {/* Toggle Active Status */}
                      <button
                        onClick={() => handleToggleActive(user.id, !user.isActive)}
                        className={`p-1 rounded ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                        title={user.isActive ? 'Devre dışı bırak' : 'Aktif et'}
                      >
                        {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                      
                      {/* Delete User */}
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Kullanıcıyı sil"
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
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Kriterlere uygun kullanıcı bulunamadı</p>
        </div>
      )}
    </div>
  );
}