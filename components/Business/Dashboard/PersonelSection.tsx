'use client';

import { useState, useEffect } from 'react';
import { 
  UserCheck, Users, Calendar, Clock, AlertCircle, CheckCircle, 
  XCircle, TrendingUp, Coffee, Shield, Award, Plus, Edit, Trash2,
  Search, Filter, FileText, Download, Eye, QrCode, Camera
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Staff {
  id: number;
  name: string;
  position: string;
  status: 'active' | 'leave' | 'report' | 'iot-detected';
  shift: string;
  photo?: string;
  phone?: string;
  email?: string;
  joinDate?: string;
  lastSeen?: string;
}

export default function PersonelSection({ businessProfile }: { businessProfile: any }) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Personel verilerini yükle
  const loadStaff = async () => {
    if (!businessProfile?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/business/staff?businessId=${businessProfile.id}`);
      const data = await response.json();
      
      if (data.success) {
        // API'den gelen verileri UI formatına dönüştür
        const formattedStaff = data.staff.map((s: any) => ({
          id: s.id,
          name: s.full_name,
          position: s.position || 'Personel',
          status: s.status || 'active',
          shift: s.working_hours ? JSON.parse(s.working_hours).shift : 'Belirtilmemiş',
          phone: s.phone,
          email: s.email,
          joinDate: s.hire_date,
          photo: s.photo_url
        }));
        setStaff(formattedStaff);
      }
    } catch (error) {
      console.error('❌ Personel yükleme hatası:', error);
      toast.error('Personel listesi yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [businessProfile]);

  // Personel ekle/düzenle
  const handleSaveStaff = async (formData: any) => {
    if (!businessProfile?.id) return;

    try {
      const staffData = {
        businessId: businessProfile.id,
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        role: formData.role || 'employee',
        working_hours: JSON.stringify({ shift: formData.shift }),
        permissions: formData.permissions || { cameras: false, menu: false, reports: false, settings: false }
      };

      console.log('💼 Personel kaydediliyor:', staffData);

      let response;
      if (editingStaff) {
        // Güncelle
        response = await fetch('/api/business/staff', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...staffData, id: editingStaff.id })
        });
      } else {
        // Yeni ekle
        response = await fetch('/api/business/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(staffData)
        });
      }

      const data = await response.json();
      console.log('📋 API yanıtı:', data);
      
      if (data.success) {
        toast.success(editingStaff ? '✅ Personel güncellendi!' : '✅ Personel eklendi!');
        loadStaff(); // Listeyi yenile
        setShowAddModal(false);
        setEditingStaff(null);
      } else {
        console.error('❌ API hatası:', data.error);
        toast.error(data.error || 'İşlem başarısız');
      }
    } catch (error) {
      console.error('❌ Personel kaydetme hatası:', error);
      toast.error('Bağlantı hatası');
    }
  };

  // Personel sil
  const handleDeleteStaff = async (staffId: number, staffName: string) => {
    if (!confirm(`${staffName} adlı personeli silmek istediğinize emin misiniz?`)) return;

    try {
      const response = await fetch(`/api/business/staff?id=${staffId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('✅ Personel silindi!');
        loadStaff(); // Listeyi yenile
      } else {
        toast.error(data.error || 'Silme başarısız');
      }
    } catch (error) {
      console.error('❌ Personel silme hatası:', error);
      toast.error('Bağlantı hatası');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'iot-detected':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'leave':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'report':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'iot-detected':
        return <Shield className="w-4 h-4" />;
      case 'leave':
        return <Coffee className="w-4 h-4" />;
      case 'report':
        return <FileText className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Vardiyada';
      case 'iot-detected':
        return 'IoT Tanımlı';
      case 'leave':
        return 'İzinli';
      case 'report':
        return 'Raporlu';
      default:
        return 'Bilinmiyor';
    }
  };

  const filteredStaff = staff.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || person.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statsData = [
    {
      label: 'Vardiyada',
      value: staff.filter(s => s.status === 'active' || s.status === 'iot-detected').length,
      total: staff.length,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600 border-green-200'
    },
    {
      label: 'IoT Tanımlı',
      value: staff.filter(s => s.status === 'iot-detected').length,
      total: staff.length,
      icon: Shield,
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      label: 'İzinli',
      value: staff.filter(s => s.status === 'leave').length,
      total: staff.length,
      icon: Coffee,
      color: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    {
      label: 'Raporlu',
      value: staff.filter(s => s.status === 'report').length,
      total: staff.length,
      icon: FileText,
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-8 h-8 text-blue-600" />
            Personel Yönetimi
          </h2>
          <p className="text-gray-500 mt-1">Ekibinizin gerçek zamanlı durumu</p>
        </div>
        <button 
          onClick={() => {
            setEditingStaff(null);
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Personel Ekle
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.color} rounded-2xl p-6 border-2 shadow-lg`}
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-8 h-8" />
              <div className="text-right">
                <div className="text-3xl font-black">{stat.value}</div>
                <div className="text-xs font-medium opacity-70">/ {stat.total}</div>
              </div>
            </div>
            <div className="font-semibold">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Personel ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'active', 'iot-detected', 'leave', 'report'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Tümü' : 
                 status === 'active' ? 'Vardiyada' :
                 status === 'iot-detected' ? 'IoT' :
                 status === 'leave' ? 'İzinli' : 'Raporlu'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Personel listesi yükleniyor...</p>
        </div>
      )}

      {/* Staff List */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredStaff.map((person) => (
          <motion.div
            key={person.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {person.name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{person.name}</h3>
                    <p className="text-sm text-gray-500">{person.position}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(person.status)} flex items-center gap-1`}>
                    {getStatusIcon(person.status)}
                    {getStatusText(person.status)}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{person.shift}</span>
                  </div>
                  {person.lastSeen && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Eye className="w-4 h-4" />
                      <span>Son görülme: {person.lastSeen}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button 
                    onClick={() => {
                      setEditingStaff(person);
                      setShowAddModal(true);
                    }}
                    className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Düzenle
                  </button>
                  <button 
                    onClick={() => {
                      // QR kod göster
                      const qrData = `STAFF-${person.id}-${btoa(person.email || person.name)}`;
                      toast((t) => (
                        <div className="flex flex-col items-center">
                          <div className="text-lg font-bold mb-2">{person.name} - QR Kod</div>
                          <div className="bg-white p-4 rounded-lg border-4 border-gray-800">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`}
                              alt="QR Code"
                              className="w-48 h-48"
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-2 text-center">
                            ESP32-CAM kameraya gösterin
                          </div>
                          <button
                            onClick={() => toast.dismiss(t.id)}
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                          >
                            Kapat
                          </button>
                        </div>
                      ), {
                        duration: Infinity,
                        style: { maxWidth: '400px' }
                      });
                    }}
                    className="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <QrCode className="w-4 h-4" />
                    QR Kod
                  </button>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => alert(`Personel detayları: ${person.name}`)}
                    className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    <FileText className="w-4 h-4 mx-auto" />
                  </button>
                  <button 
                    onClick={() => handleDeleteStaff(person.id, person.name)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredStaff.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Personel Bulunamadı</h3>
          <p className="text-gray-500 mb-4">Arama kriterlerinize uygun personel yok</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}

      {/* IoT Integration Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-blue-900 mb-2">IoT Personel Tanıma Sistemi</h3>
            <p className="text-blue-700 mb-3">
              Akıllı kameralarınız personeli otomatik olarak tanıyabilir. Vardiya girişleri, 
              çıkışları ve mekan içi hareketleri takip edin.
            </p>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2 text-blue-800">
                <CheckCircle className="w-4 h-4" />
                <span>Otomatik Vardiya Kaydı</span>
              </div>
              <div className="flex items-center gap-2 text-blue-800">
                <CheckCircle className="w-4 h-4" />
                <span>Gerçek Zamanlı Konum</span>
              </div>
              <div className="flex items-center gap-2 text-blue-800">
                <CheckCircle className="w-4 h-4" />
                <span>Güvenlik Takibi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingStaff ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
              </h2>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = {
                  name: e.currentTarget.fullName.value,
                  email: e.currentTarget.email.value,
                  phone: e.currentTarget.phone.value,
                  position: e.currentTarget.position.value,
                  shift: e.currentTarget.shift.value,
                  role: e.currentTarget.role.value
                };
                handleSaveStaff(formData);
              }}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad *</label>
                  <input
                    type="text"
                    name="fullName"
                    defaultValue={editingStaff?.name}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Örn: Ahmet Yılmaz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pozisyon *</label>
                  <input
                    type="text"
                    name="position"
                    defaultValue={editingStaff?.position}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Örn: Garson, Aşçı, Kasiyer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingStaff?.email}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingStaff?.phone}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="05XX XXX XX XX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vardiya</label>
                  <select
                    name="shift"
                    defaultValue={editingStaff?.shift || 'Sabah (08:00-16:00)'}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option>Sabah (08:00-16:00)</option>
                    <option>Öğle (12:00-20:00)</option>
                    <option>Akşam (16:00-00:00)</option>
                    <option>Gece (00:00-08:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                  <select
                    name="role"
                    defaultValue="employee"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="employee">Çalışan</option>
                    <option value="manager">Yönetici</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingStaff(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingStaff ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
