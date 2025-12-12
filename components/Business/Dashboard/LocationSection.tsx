'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Save, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBusinessDashboardStore } from '@/store/businessDashboardStore';

export default function LocationSection({ businessProfile }: { businessProfile: any }) {
  const { setBusinessProfile } = useBusinessDashboardStore();
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [autoDetecting, setAutoDetecting] = useState(false);

  // Konum verilerini yükle ve güncelle - dependency array düzeltildi
  useEffect(() => {
    if (businessProfile) {
      const locationData = {
        latitude: businessProfile.latitude,
        longitude: businessProfile.longitude,
        address: businessProfile.address,
        city: businessProfile.city,
        district: businessProfile.district
      };
      setLocation(locationData);
      console.log('📍 Konum store\'dan yüklendi:', locationData);
    }
  }, [businessProfile?.latitude, businessProfile?.longitude, businessProfile?.address]);

  const handleAutoDetect = () => {
    setAutoDetecting(true);
    
    if (!('geolocation' in navigator)) {
      toast.error('❌ Tarayıcınız konum desteği sunmuyor. Lütfen konumu manuel olarak girin.');
      setAutoDetecting(false);
      return;
    }

    // Konum izni durumunu kontrol et
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          toast.error('🚫 Konum izni reddedildi!\n\n' +
            'Tarayıcı ayarlarından konum iznini açın:\n' +
            '1. Adres çubuğundaki kilit ikonuna tıklayın\n' +
            '2. "Konum" veya "Location" seçeneğini bulun\n' +
            '3. İzin verin ve sayfayı yenileyin', 
            { duration: 8000 }
          );
          setAutoDetecting(false);
          return;
        }
      });
    }

    // Kullanıcıya bilgilendirme
    toast('📍 Konum izni isteniyor...', { icon: '⏳', duration: 2000 });
    
    // Cihaz türüne göre timeout ayarla
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const timeout = isMobile ? 60000 : 30000; // Mobile: 60s, PC: 30s
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          ...location,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setLocation(newLocation);
        console.log('📍 Konum algılandı:', {
          lat: newLocation.latitude,
          lng: newLocation.longitude,
          accuracy: position.coords.accuracy + 'm'
        });
        toast.success(`✅ Konum başarıyla algılandı!\n` +
          `📍 Doğruluk: ${Math.round(position.coords.accuracy)}m\n` +
          `💾 Kaydetmeyi unutmayın!`, 
          { duration: 4000 }
        );
        setAutoDetecting(false);
      },
      (error) => {
        console.error('❌ Konum algılama hatası:', error);
        
        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '🚫 Konum izni reddedildi!\n\n' +
              '📱 Ayarlar:\n' +
              '• Tarayıcı: Adres çubuğundaki kilit ikonuna tıklayın\n' +
              '• Chrome: Ayarlar > Gizlilik > Site ayarları > Konum\n' +
              '• Firefox: Ayarlar > Gizlilik > İzinler > Konum\n' +
              '• Safari: Ayarlar > Safari > Konum Hizmetleri\n\n' +
              'Veya konumu manuel olarak girin 👇';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '❌ Konum bilgisi alınamadı.\n' +
              'GPS/Wi-Fi bağlantınızı kontrol edin veya manuel girin.';
            break;
          case error.TIMEOUT:
            errorMessage = '⏱️ Konum algılama zaman aşımına uğradı.\n' +
              'GPS sinyaliniz zayıf olabilir. Manuel girin veya tekrar deneyin.';
            break;
          default:
            errorMessage = '❌ Bilinmeyen hata. Konumu manuel olarak girin.';
        }
        
        toast.error(errorMessage, { duration: 8000 });
        setAutoDetecting(false);
      },
      { 
        enableHighAccuracy: isMobile ? true : false, // Mobile'da high accuracy
        timeout: timeout,
        maximumAge: 0 
      }
    );
  };

  const handleSave = async () => {
    if (!location?.latitude || !location?.longitude) {
      toast.error('Lütfen konum belirleyin');
      return;
    }

    setLoading(true);

    try {
      // businessProfile'dan ID'yi al - birden fazla isim deniyoruz
      const businessId = businessProfile?.id || businessProfile?.business_id || businessProfile?.user_id;
      
      console.log('🔍 BusinessProfile:', businessProfile);
      console.log('🔍 Bulunan businessId:', businessId);
      
      if (!businessId) {
        console.error('❌ BusinessProfile yapısı:', Object.keys(businessProfile || {}));
        toast.error('İşletme ID bulunamadı - Sayfayı yenileyin');
        setLoading(false);
        return;
      }

      console.log('📍 Konum kaydediliyor:', {
        businessId,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        city: location.city,
        district: location.district
      });

      const token = localStorage.getItem('business_token');
      if (!token) {
        toast.error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/business/location', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          businessId,
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
          address: location.address || '',
          city: location.city || '',
          district: location.district || '',
          postalCode: location.postalCode || ''
        })
      });

      const data = await response.json();

      console.log('📍 Konum kayıt yanıtı:', data);

      if (data.success) {
        // Store'u güncelle (persist edilsin)
        const updatedProfile = {
          ...businessProfile,
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
          city: location.city,
          district: location.district
        };
        setBusinessProfile(updatedProfile);
        console.log('💾 Konum store\'a kaydedildi');
        
        toast.success('✅ Konum başarıyla güncellendi!');
      } else {
        toast.error(data.error || 'Konum güncellenemedi');
      }
    } catch (error) {
      console.error('❌ Konum kayıt hatası:', error);
      toast.error('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bilgilendirme Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Konum Nasıl Belirlenir?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ <strong>Otomatik Algıla:</strong> Tarayıcınızın konum iznini verin (önerilen)</li>
              <li>✅ <strong>Manuel Giriş:</strong> Enlem/Boylam veya adresi kendiniz yazın</li>
              <li>💡 <strong>İpucu:</strong> Google Maps'ten koordinatları kopyalayabilirsiniz</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Konum Yönetimi</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Enlem (Latitude)</label>
            <input
              type="number"
              step="any"
              value={location?.latitude || ''}
              onChange={(e) => setLocation({ ...location, latitude: parseFloat(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Boylam (Longitude)</label>
            <input
              type="number"
              step="any"
              value={location?.longitude || ''}
              onChange={(e) => setLocation({ ...location, longitude: parseFloat(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
            <textarea
              value={location?.address || ''}
              onChange={(e) => setLocation({ ...location, address: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Şehir</label>
            <input
              type="text"
              value={location?.city || ''}
              onChange={(e) => setLocation({ ...location, city: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">İlçe</label>
            <input
              type="text"
              value={location?.district || ''}
              onChange={(e) => setLocation({ ...location, district: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleAutoDetect}
            disabled={autoDetecting}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
          >
            <Navigation className="w-4 h-4" />
            {autoDetecting ? 'Algılanıyor...' : 'Otomatik Algıla'}
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {location?.latitude && location?.longitude && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Harita Önizleme</h3>
          <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <iframe
              src={`https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`}
              className="w-full h-full rounded-lg"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
}
