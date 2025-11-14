'use client';

import { useState } from 'react';
import { X, Camera, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface AddCameraModalProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editMode?: boolean;
  initialData?: any;
}

export default function AddCameraModal({ onClose, onSubmit, editMode = false, initialData }: AddCameraModalProps) {
  const [formData, setFormData] = useState({
    camera_name: initialData?.camera_name || '',
    ip_address: initialData?.ip_address || '',
    port: initialData?.port || 80,
    stream_path: initialData?.stream_path || '/stream',
    stream_url: initialData?.stream_url || '',
    username: '', // Always empty in edit mode for security
    password: '', // Always empty in edit mode for security
    location_description: initialData?.location_description || ''
  });
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'' | 'testing' | 'success' | 'error'>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (error: any) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!formData.ip_address) {
      toast.error('Lütfen IP adresi girin');
      return;
    }

    setTestStatus('testing');
    
    try {
      console.log('🔍 ESP32-CAM bağlantısı test ediliyor:', {
        ip: formData.ip_address,
        port: formData.port || 80
      });

      const response = await fetch('/api/esp32/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipAddress: formData.ip_address,
          port: formData.port || 80
        })
      });

      const data = await response.json();
      console.log('📡 ESP32 doğrulama yanıtı:', data);

      if (response.ok && data.success) {
        setTestStatus('success');
        toast.success('✅ ESP32-CAM başarıyla tanındı!');
        
        // Stream URL'i otomatik doldur
        if (data.streamUrl && !formData.stream_url) {
          setFormData(prev => ({
            ...prev,
            stream_url: data.streamUrl
          }));
        }
      } else {
        setTestStatus('error');
        toast.error(data.message || 'ESP32-CAM bulunamadı');
      }
    } catch (error) {
      console.error('❌ Bağlantı test hatası:', error);
      setTestStatus('error');
      toast.error('Bağlantı testi başarısız oldu');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editMode ? 'Kamera Düzenle' : 'Yeni Kamera Ekle'}
              </h2>
              <p className="text-sm text-gray-500">
                {editMode ? 'Kamera bilgilerini güncelleyin' : 'IoT kamera veya IP kamera bağlayın'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Kamera Adı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kamera Adı *
            </label>
            <input
              type="text"
              required
              value={formData.camera_name}
              onChange={(e) => setFormData({ ...formData, camera_name: e.target.value })}
              placeholder="Örn: Giriş Kapısı, Kasa Önü"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* IP ve Port */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IP Adresi *
              </label>
              <input
                type="text"
                required
                value={formData.ip_address}
                onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                placeholder="192.168.1.100"
                pattern="^(\d{1,3}\.){3}\d{1,3}$"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Port *
              </label>
              <input
                type="number"
                required
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                placeholder="80"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Stream Path */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stream Path
            </label>
            <input
              type="text"
              value={formData.stream_path}
              onChange={(e) => setFormData({ ...formData, stream_path: e.target.value })}
              placeholder="/stream"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
            <p className="mt-1 text-xs text-gray-500">
              IoT kameralar için genelde: /stream veya /cam-hi.jpg
            </p>
          </div>

          {/* Stream URL (Otomatik doldurulur) */}
          {formData.stream_url && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <label className="block text-sm font-medium text-green-800 mb-1">
                ✅ Tespit Edilen Stream URL
              </label>
              <p className="text-sm text-green-700 font-mono break-all">
                {formData.stream_url}
              </p>
            </div>
          )}

          {/* Kimlik Bilgileri (Opsiyonel) */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-gray-900">Kimlik Doğrulama (Opsiyonel)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="admin"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Lokasyon Açıklaması */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasyon Açıklaması
            </label>
            <textarea
              value={formData.location_description}
              onChange={(e) => setFormData({ ...formData, location_description: e.target.value })}
              placeholder="Kameranın bulunduğu konumu açıklayın"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Test Connection */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Bağlantıyı Test Et</p>
                  <p className="text-sm text-gray-500">Kamera erişilebilir mi kontrol edin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={testConnection}
                disabled={testStatus === 'testing' || !formData.ip_address}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${
                  testStatus === 'success' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : testStatus === 'error'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300'
                }`}
              >
                {testStatus === 'testing' && (
                  <>
                    <span className="animate-spin">🔄</span>
                    <span>ESP32 Aranıyor...</span>
                  </>
                )}
                {testStatus === 'success' && (
                  <>
                    <span>✅</span>
                    <span>Cihaz Tanındı!</span>
                  </>
                )}
                {testStatus === 'error' && (
                  <>
                    <span>❌</span>
                    <span>Tekrar Dene</span>
                  </>
                )}
                {!testStatus && <span>Test Et</span>}
              </button>
            </div>
            {testStatus === 'success' && formData.stream_url && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">✓ ESP32-CAM başarıyla tanındı!</p>
                <p className="text-xs text-green-600 mt-1">Stream URL otomatik ayarlandı</p>
              </div>
            )}
            {testStatus === 'error' && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">✗ ESP32-CAM bulunamadı</p>
                <p className="text-xs text-red-600 mt-1">
                  • Cihazın açık ve ağa bağlı olduğundan emin olun<br/>
                  • IP adresini ve port numarasını kontrol edin<br/>
                  • Cihaz ve bilgisayarınız aynı ağda olmalı
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors font-medium"
            >
              {loading 
                ? (editMode ? 'Güncelleniyor...' : 'Ekleniyor...') 
                : (editMode ? 'Güncelle' : 'Kamera Ekle')
              }
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
