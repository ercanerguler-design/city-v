'use client';

import { useState, useEffect } from 'react';
import { Building2, Upload, Save, X, Plus, Clock, Mail, Phone, Globe, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const WorkingHoursEditor = dynamic(() => import('./WorkingHoursEditor'), { ssr: false });

export default function SettingsSection({ businessProfile, onUpdate }: { businessProfile: any; onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    business_name: '',
    business_type: '',
    description: '',
    address: '',
    city: '',
    district: '',
    phone: '',
    email: '',
    website: '',
    logo_url: '',
    photos: [] as string[],
    working_hours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    },
    social_media: {
      instagram: '',
      facebook: '',
      twitter: '',
      linkedin: ''
    }
  });

  const [newPhoto, setNewPhoto] = useState('');

  useEffect(() => {
    if (businessProfile) {
      const defaultWorkingHours = {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { open: '00:00', close: '00:00', closed: true }
      };
      
      const defaultSocialMedia = {
        instagram: '',
        facebook: '',
        twitter: '',
        linkedin: ''
      };
      
      setProfile({
        business_name: businessProfile.business_name || '',
        business_type: businessProfile.business_type || '',
        description: businessProfile.description || '',
        address: businessProfile.address || '',
        city: businessProfile.city || '',
        district: businessProfile.district || '',
        phone: businessProfile.phone || '',
        email: businessProfile.email || '',
        website: businessProfile.website || '',
        logo_url: businessProfile.logo_url || '',
        photos: businessProfile.photos || [],
        working_hours: businessProfile.working_hours || defaultWorkingHours,
        social_media: businessProfile.social_media || defaultSocialMedia
      });
    }
  }, [businessProfile]);

  const handleSave = async () => {
    setLoading(true);

    try {
      // user_id'yi kullan, profile id değil!
      const userId = businessProfile?.user_id;
      
      if (!userId) {
        toast.error('Kullanıcı ID bulunamadı');
        console.error('❌ businessProfile:', businessProfile);
        return;
      }

      console.log('💾 Profil kaydediliyor, userId:', userId);
      
      const response = await fetch('/api/business/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('business_token')}`
        },
        body: JSON.stringify({
          businessId: userId, // user_id gönder
          businessName: profile.business_name,
          businessType: profile.business_type,
          logoUrl: profile.logo_url,
          description: profile.description,
          address: profile.address,
          city: profile.city,
          district: profile.district,
          phone: profile.phone,
          email: profile.email,
          workingHours: profile.working_hours,
          socialMedia: profile.social_media,
          photos: profile.photos
        })
      });
      
      console.log('📋 API response status:', response.status);

      const data = await response.json();

      if (data.success) {
        toast.success('✅ Profil güncellendi!');
        onUpdate();
      } else {
        toast.error(data.error || 'Güncellenemedi');
      }
    } catch (error) {
      console.error('❌ Profil güncelleme hatası:', error);
      toast.error('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhoto = () => {
    if (newPhoto.trim() && !profile.photos.includes(newPhoto)) {
      setProfile({
        ...profile,
        photos: [...profile.photos, newPhoto]
      });
      setNewPhoto('');
      toast.success('Fotoğraf eklendi');
    }
  };

  const handleRemovePhoto = (photoUrl: string) => {
    setProfile({
      ...profile,
      photos: profile.photos.filter(p => p !== photoUrl)
    });
    toast.success('Fotoğraf kaldırıldı');
  };

  const businessTypes = [
    'Restoran', 'Kafe', 'Bar', 'Otel', 'Mağaza', 'Market', 
    'Spor Salonu', 'Güzellik Salonu', 'Eczane', 'Hastane', 
    'Okul', 'Sinema', 'Müze', 'Park', 'Diğer'
  ];

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames: { [key: string]: string } = {
    monday: 'Pazartesi',
    tuesday: 'Salı',
    wednesday: 'Çarşamba',
    thursday: 'Perşembe',
    friday: 'Cuma',
    saturday: 'Cumartesi',
    sunday: 'Pazar'
  };

  return (
    <div className="space-y-6">
      {/* Temel Bilgiler */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          İşletme Bilgileri
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">İşletme Adı *</label>
            <input
              type="text"
              value={profile.business_name}
              onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Örnek: Şehir Kafe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">İşletme Türü *</label>
            <select
              value={profile.business_type}
              onChange={(e) => setProfile({ ...profile, business_type: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seçiniz</option>
              {businessTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
            <textarea
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="İşletmeniz hakkında kısa bir açıklama..."
            />
          </div>
        </div>
      </div>

      {/* İletişim Bilgileri */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Phone className="w-5 h-5 text-green-600" />
          İletişim Bilgileri
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              placeholder="+90 555 123 45 67"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              placeholder="info@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input
              type="url"
              value={profile.website}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              placeholder="https://www.example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Şehir</label>
            <input
              type="text"
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              placeholder="Ankara"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
            <textarea
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              placeholder="Tam adres..."
            />
          </div>
        </div>
      </div>

      {/* Sosyal Medya */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Sosyal Medya</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
            <input
              type="text"
              value={profile.social_media.instagram}
              onChange={(e) => setProfile({
                ...profile,
                social_media: { ...profile.social_media, instagram: e.target.value }
              })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              placeholder="@username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
            <input
              type="text"
              value={profile.social_media.facebook}
              onChange={(e) => setProfile({
                ...profile,
                social_media: { ...profile.social_media, facebook: e.target.value }
              })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              placeholder="facebook.com/page"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
            <input
              type="text"
              value={profile.social_media.twitter}
              onChange={(e) => setProfile({
                ...profile,
                social_media: { ...profile.social_media, twitter: e.target.value }
              })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              placeholder="@username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
            <input
              type="text"
              value={profile.social_media.linkedin}
              onChange={(e) => setProfile({
                ...profile,
                social_media: { ...profile.social_media, linkedin: e.target.value }
              })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              placeholder="linkedin.com/company/..."
            />
          </div>
        </div>
      </div>

      {/* Fotoğraflar */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Fotoğraf Galerisi</h2>

        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="url"
              value={newPhoto}
              onChange={(e) => setNewPhoto(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg"
              placeholder="Fotoğraf URL'si girin..."
            />
            <button
              onClick={handleAddPhoto}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ekle
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {profile.photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Fotoğraf ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => handleRemovePhoto(photo)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Şifre Değiştirme */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">🔐 Şifre Değiştirme</h2>
        
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const currentPassword = formData.get('currentPassword') as string;
            const newPassword = formData.get('newPassword') as string;
            const confirmPassword = formData.get('confirmPassword') as string;

            // Validasyon
            if (!currentPassword || !newPassword || !confirmPassword) {
              toast.error('Tüm alanları doldurun');
              return;
            }

            if (newPassword !== confirmPassword) {
              toast.error('Yeni şifreler eşleşmiyor');
              return;
            }

            if (newPassword.length < 8) {
              toast.error('Yeni şifre en az 8 karakter olmalı');
              return;
            }

            try {
              // Business user ID'yi localStorage'dan al
              const businessUser = localStorage.getItem('business_user');
              if (!businessUser) {
                toast.error('Kullanıcı bilgisi bulunamadı');
                return;
              }

              const user = JSON.parse(businessUser);

              const response = await fetch('/api/business/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: user.id,
                  currentPassword,
                  newPassword
                })
              });

              const data = await response.json();

              if (data.success) {
                toast.success('✅ Şifreniz başarıyla değiştirildi');
                e.currentTarget.reset();
              } else {
                toast.error(`❌ ${data.error}`);
              }
            } catch (error) {
              console.error('❌ Şifre değiştirme hatası:', error);
              toast.error('Bağlantı hatası');
            }
          }}
          className="space-y-4 max-w-md"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mevcut Şifre
            </label>
            <input
              type="password"
              name="currentPassword"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Mevcut şifrenizi girin"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Şifre
            </label>
            <input
              type="password"
              name="newPassword"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="En az 8 karakter"
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Şifre (Tekrar)
            </label>
            <input
              type="password"
              name="confirmPassword"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Yeni şifrenizi tekrar girin"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Şifreyi Değiştir
          </button>
        </form>
      </div>

      {/* City-V Entegrasyonu ve Çalışma Saatleri */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Globe className="w-6 h-6 text-indigo-600" />
          City-V Anasayfa Entegrasyonu
        </h3>
        
        <WorkingHoursEditor
          businessUserId={businessProfile?.user_id || businessProfile?.id}
          initialWorkingHours={profile.working_hours}
          initialVisibility={true}
          initialAutoSync={true}
        />
      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center gap-2 font-medium"
        >
          <Save className="w-5 h-5" />
          {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </div>
    </div>
  );
}
