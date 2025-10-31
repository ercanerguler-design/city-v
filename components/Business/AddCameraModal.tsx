'use client';

import { useState } from 'react';
import { X, Camera, Wifi, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (camera: CameraFormData) => Promise<void>;
  planInfo: {
    type: string;
    maxCameras: number;
    currentCount: number;
    remainingSlots: number;
  };
}

export interface CameraFormData {
  camera_name: string;
  ip_address: string;
  port?: number;
  stream_path?: string; // Örn: /stream, /live, /video
  username?: string;
  password?: string;
  location_description?: string;
}

export default function AddCameraModal({ isOpen, onClose, onAdd, planInfo }: AddCameraModalProps) {
  const [formData, setFormData] = useState<CameraFormData>({
    camera_name: '',
    ip_address: '',
    port: 80,
    stream_path: '/stream',
    username: '',
    password: '',
    location_description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validasyon
    if (!formData.camera_name.trim()) {
      setError('Kamera adı gerekli');
      return;
    }

    if (!formData.ip_address.trim()) {
      setError('IP adresi gerekli');
      return;
    }

    // IP formatı kontrolü - 192.168.1.100 veya 192.168.1.100/stream
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}(\/\w+)?$/;
    if (!ipPattern.test(formData.ip_address)) {
      setError('Geçerli bir IP adresi girin (örn: 192.168.1.100 veya 192.168.1.100/stream)');
      return;
    }

    setLoading(true);
    try {
      await onAdd(formData);
      // Reset form
      setFormData({
        camera_name: '',
        ip_address: '',
        port: 80,
        stream_path: '/stream',
        username: '',
        password: '',
        location_description: ''
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Kamera eklenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Yeni Kamera Ekle</h2>
                    <p className="text-blue-100 text-sm">
                      {planInfo.remainingSlots} / {planInfo.maxCameras} slot mevcut ({planInfo.type.toUpperCase()})
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 transition flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              {/* Kamera Adı */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kamera Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.camera_name}
                  onChange={(e) => setFormData({ ...formData, camera_name: e.target.value })}
                  placeholder="Örn: Giriş Kapısı, Kasa Alanı"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* IP ve Port */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Wifi className="w-4 h-4 inline mr-1" />
                    IP Adresi veya URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    placeholder="192.168.1.100 veya 192.168.1.100/stream"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Örn: 192.168.1.100/stream veya sadece 192.168.1.100
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Port
                  </label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 80 })}
                    placeholder="80"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="65535"
                  />
                  <p className="text-xs text-gray-500 mt-1">Varsayılan: 80</p>
                </div>
              </div>

              {/* Kullanıcı Adı ve Şifre (Opsiyonel) */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-start gap-2">
                  <p className="text-sm text-gray-600 font-medium flex-1">
                    RTSP Kimlik Bilgileri (Opsiyonel)
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs">
                    <p className="text-yellow-800 font-semibold">⚠️ RTSP Uyarısı</p>
                    <p className="text-yellow-700 mt-1">
                      Browser RTSP protokolünü desteklemez.<br/>
                      HTTP MJPEG stream kullanın: <code className="bg-yellow-100 px-1 rounded">http://IP:80/stream</code>
                    </p>
                  </div>
                </div>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      placeholder="••••••"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Konum Açıklaması */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Konum Açıklaması
                </label>
                <textarea
                  value={formData.location_description}
                  onChange={(e) => setFormData({ ...formData, location_description: e.target.value })}
                  placeholder="Örn: Ana giriş kapısı - müşteri sayımı için"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading || planInfo.remainingSlots <= 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Ekleniyor...' : '✨ Kamera Ekle'}
                </button>
              </div>

              {planInfo.remainingSlots <= 0 && (
                <p className="text-center text-red-600 text-sm font-medium">
                  ⚠️ Kamera limitine ulaştınız. Plan yükseltmek için yöneticinizle iletişime geçin.
                </p>
              )}
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
