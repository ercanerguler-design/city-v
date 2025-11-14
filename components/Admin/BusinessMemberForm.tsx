'use client';

import { useState } from 'react';
import { X, Building2, Calendar, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

interface BusinessMemberFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function BusinessMemberForm({ onClose, onSuccess }: BusinessMemberFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Firma Bilgileri
    companyName: '',
    companyType: 'restaurant',
    companyAddress: '',
    companyCity: 'Ankara',
    companyDistrict: '',
    taxNumber: '',
    taxOffice: '',
    
    // Yetkili Kişi Bilgileri
    authorizedPerson: '',
    email: '',
    phone: '',
    fullName: '',
    password: '', // Admin tarafından belirlenen şifre
    
    // Üyelik Bilgileri
    planType: 'premium', // 'premium' veya 'enterprise'
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    monthlyPrice: 2500,
    maxUsers: 1,
    isTrial: false,
    
    // Özellikler
    features: {
      maxCameras: 10,
      aiAnalytics: true,
      pushNotifications: true,
      advancedReports: true,
      apiAccess: false,
    },
    
    // Admin Notları
    adminNotes: '',
  });

  const companyTypes = [
    { value: 'restaurant', label: 'Restoran' },
    { value: 'cafe', label: 'Kafe' },
    { value: 'retail', label: 'Perakende' },
    { value: 'hotel', label: 'Otel' },
    { value: 'mall', label: 'AVM' },
    { value: 'gym', label: 'Spor Salonu' },
    { value: 'clinic', label: 'Klinik/Hastane' },
    { value: 'other', label: 'Diğer' },
  ];

  const handlePlanChange = (plan: 'premium' | 'enterprise') => {
    if (plan === 'premium') {
      setFormData(prev => ({
        ...prev,
        planType: plan,
        monthlyPrice: 2500,
        maxUsers: 1,
        features: {
          maxCameras: 10,
          aiAnalytics: true,
          pushNotifications: true,
          advancedReports: true,
          apiAccess: false,
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        planType: plan,
        monthlyPrice: 5000,
        maxUsers: 5,
        features: {
          maxCameras: 50,
          aiAnalytics: true,
          pushNotifications: true,
          advancedReports: true,
          apiAccess: true,
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasyon
    if (!formData.companyName || !formData.email || !formData.authorizedPerson) {
      toast.error('Lütfen zorunlu alanları doldurun!');
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      toast.error('Şifre en az 8 karakter olmalı!');
      return;
    }

    if (!formData.endDate) {
      toast.error('Lütfen bitiş tarihi seçin!');
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error('Bitiş tarihi başlangıç tarihinden sonra olmalı!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/business-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      toast.success(`🎉 ${formData.companyName} başarıyla eklendi!\n📧 Lisans bilgileri ${formData.email} adresine gönderildi.`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Business member add error:', error);
      toast.error(error.message || 'Üye eklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Yeni Business Üye Ekle</h2>
              <p className="text-sm text-gray-600">Firma bilgileri ve üyelik detayları</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Firma Bilgileri */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Firma Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Firma Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Örn: ABC Restaurant Zinciri"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Firma Tipi</label>
                <select
                  value={formData.companyType}
                  onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {companyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
                <input
                  type="text"
                  value={formData.companyCity}
                  onChange={(e) => setFormData({ ...formData, companyCity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
                <input
                  type="text"
                  value={formData.companyDistrict}
                  onChange={(e) => setFormData({ ...formData, companyDistrict: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Örn: Çankaya"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                <input
                  type="text"
                  value={formData.companyAddress}
                  onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Tam adres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Numarası</label>
                <input
                  type="text"
                  value={formData.taxNumber}
                  onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="10 haneli vergi no"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Dairesi</label>
                <input
                  type="text"
                  value={formData.taxOffice}
                  onChange={(e) => setFormData({ ...formData, taxOffice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Örn: Çankaya Vergi Dairesi"
                />
              </div>
            </div>
          </div>

          {/* Yetkili Kişi Bilgileri */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Yetkili Kişi Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yetkili Kişi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.authorizedPerson}
                  onChange={(e) => setFormData({ ...formData, authorizedPerson: e.target.value, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ad Soyad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="email@firma.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="05XX XXX XX XX"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Kullanıcının giriş şifresi (min. 8 karakter)"
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Kullanıcı business dashboard'da profil ayarlarından şifreyi değiştirebilecek
                </p>
              </div>
            </div>
          </div>

          {/* Üyelik Planı */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Üyelik Planı
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Premium Plan */}
              <div
                onClick={() => handlePlanChange('premium')}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.planType === 'premium'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">Premium</h4>
                  <div className="text-2xl font-bold text-indigo-600">₺2,500</div>
                </div>
                <p className="text-sm text-gray-600 mb-3">Tek lokasyon işletmeler için</p>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• 10 Kamera</li>
                  <li>• AI Analitik</li>
                  <li>• Push Bildirimleri</li>
                  <li>• Gelişmiş Raporlar</li>
                  <li>• 1 Kullanıcı</li>
                </ul>
              </div>

              {/* Enterprise Plan */}
              <div
                onClick={() => handlePlanChange('enterprise')}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.planType === 'enterprise'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">Enterprise</h4>
                  <div className="text-2xl font-bold text-indigo-600">₺5,000</div>
                </div>
                <p className="text-sm text-gray-600 mb-3">Çoklu lokasyon ve zincirler için</p>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• 50 Kamera</li>
                  <li>• AI Analitik</li>
                  <li>• Push Bildirimleri</li>
                  <li>• Gelişmiş Raporlar</li>
                  <li>• API Erişimi</li>
                  <li>• 5 Kullanıcı</li>
                </ul>
              </div>
            </div>

            {/* Tarih Seçimi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlangıç Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bitiş Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aylık Ücret (₺)</label>
                <input
                  type="number"
                  value={formData.monthlyPrice}
                  onChange={(e) => setFormData({ ...formData, monthlyPrice: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isTrial}
                    onChange={(e) => setFormData({ ...formData, isTrial: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Deneme Sürümü</span>
                </label>
              </div>
            </div>
          </div>

          {/* Admin Notları */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notları</label>
            <textarea
              value={formData.adminNotes}
              onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              placeholder="Bu üyelik hakkında notlar..."
            />
          </div>

          {/* Butonlar */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Ekleniyor...' : '✓ Üye Ekle ve Lisans Gönder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
