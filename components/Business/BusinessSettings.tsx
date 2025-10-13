'use client';

import { useState } from 'react';
import { useBusinessStore, type Business } from '@/store/businessStore';

interface BusinessSettingsProps {
  business: Business;
}

export default function BusinessSettings({ business }: BusinessSettingsProps) {
  const { updateBusiness, addLocation, removeLocation } = useBusinessStore();
  const [activeTab, setActiveTab] = useState<'general' | 'hours' | 'locations' | 'billing'>('general');
  
  const [formData, setFormData] = useState({
    name: business.name,
    description: business.description || '',
    address: business.address,
    phone: business.phone,
    email: business.email,
    website: business.website || '',
    category: business.category
  });

  const [workingHours, setWorkingHours] = useState(business.workingHours);

  const tabs = [
    { id: 'general', label: 'Genel Bilgiler', icon: '⚙️' },
    { id: 'hours', label: 'Çalışma Saatleri', icon: '🕒' },
    { id: 'locations', label: 'Şubeler', icon: '📍' },
    { id: 'billing', label: 'Faturalandırma', icon: '💳' }
  ];

  const handleSaveGeneral = () => {
    updateBusiness(formData);
  };

  const handleSaveWorkingHours = () => {
    updateBusiness({ workingHours });
  };

  const days = [
    { key: 'monday', label: 'Pazartesi' },
    { key: 'tuesday', label: 'Salı' },
    { key: 'wednesday', label: 'Çarşamba' },
    { key: 'thursday', label: 'Perşembe' },
    { key: 'friday', label: 'Cuma' },
    { key: 'saturday', label: 'Cumartesi' },
    { key: 'sunday', label: 'Pazar' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">İşletme Ayarları</h1>
        <p className="text-gray-600">İşletme bilgilerinizi ve ayarlarınızı yönetin</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Genel Bilgiler</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">İşletme Adı</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cafe">Kafe</option>
                <option value="restaurant">Restoran</option>
                <option value="hotel">Otel</option>
                <option value="shop">Mağaza</option>
                <option value="service">Hizmet</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="İşletmeniz hakkında kısa açıklama..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Web Sitesi</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSaveGeneral}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}

      {activeTab === 'hours' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Çalışma Saatleri</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is24Hours"
                checked={workingHours.is24Hours || false}
                onChange={(e) => setWorkingHours(prev => ({ ...prev, is24Hours: e.target.checked }))}
                className="rounded mr-3"
              />
              <label htmlFor="is24Hours" className="text-sm font-medium text-gray-700">
                7/24 Açık
              </label>
            </div>
            
            {!workingHours.is24Hours && (
              <div className="space-y-3">
                {days.map((day) => (
                  <div key={day.key} className="flex items-center space-x-4">
                    <div className="w-24">
                      <label className="text-sm font-medium text-gray-700">{day.label}</label>
                    </div>
                    <input
                      type="text"
                      value={(workingHours as any)[day.key] || ''}
                      onChange={(e) => setWorkingHours(prev => ({ ...prev, [day.key]: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="09:00-18:00 veya Kapalı"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSaveWorkingHours}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}

      {activeTab === 'locations' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Şubeler</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Şube Ekle</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {business.locations?.map((location) => (
              <div key={location.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{location.name}</h3>
                  <p className="text-sm text-gray-600">{location.address}</p>
                  {location.isMainLocation && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      Ana Şube
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {!location.isMainLocation && (
                    <button
                      onClick={() => removeLocation(location.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <p className="text-gray-500">Henüz ek şube eklenmemiş</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Faturalandırma ve Abonelik</h2>
          
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Mevcut Plan</h3>
                  <p className="text-gray-600">
                    {business.subscription === 'free' ? 'Ücretsiz Plan' :
                     business.subscription === 'basic' ? 'Temel Plan' :
                     business.subscription === 'premium' ? 'Premium Plan' :
                     'Kurumsal Plan'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {business.subscription === 'free' ? '₺0' :
                     business.subscription === 'basic' ? '₺99' :
                     business.subscription === 'premium' ? '₺199' :
                     '₺399'}
                  </p>
                  <p className="text-sm text-gray-600">/ay</p>
                </div>
              </div>
            </div>

            {/* Plan Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free Plan */}
              <div className={`border rounded-lg p-6 ${business.subscription === 'free' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">Ücretsiz</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">₺0</p>
                  <p className="text-sm text-gray-600">/ay</p>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Temel analitik
                  </li>
                  <li className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    50 rezervasyon/ay
                  </li>
                  <li className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    E-posta desteği
                  </li>
                </ul>
              </div>

              {/* Premium Plan */}
              <div className={`border rounded-lg p-6 ${business.subscription === 'premium' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">Premium</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">₺199</p>
                  <p className="text-sm text-gray-600">/ay</p>
                  {business.subscription === 'premium' && (
                    <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full mt-2">
                      Mevcut Plan
                    </span>
                  )}
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Gelişmiş analitik
                  </li>
                  <li className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sınırsız rezervasyon
                  </li>
                  <li className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    7/24 canlı destek
                  </li>
                  <li className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Kampanya yönetimi
                  </li>
                </ul>
              </div>

              {/* Enterprise Plan */}
              <div className={`border rounded-lg p-6 ${business.subscription === 'enterprise' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">Kurumsal</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">₺399</p>
                  <p className="text-sm text-gray-600">/ay</p>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Tüm premium özellikler
                  </li>
                  <li className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Çoklu şube yönetimi
                  </li>
                  <li className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    API entegrasyonu
                  </li>
                  <li className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Özel destek
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Plan Değiştir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}