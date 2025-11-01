'use client';

import { useState } from 'react';
import { X, Send, Users, MapPin, Calendar, Percent, DollarSign, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface CampaignModalProps {
  businessProfile: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CampaignCreationModal({ businessProfile, onClose, onSuccess }: CampaignModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_percent: '',
    discount_amount: '',
    start_date: '',
    end_date: '',
    target_audience: 'all' as 'all' | 'nearby' | 'visitors',
    radius_km: '1',
    min_age: '',
    max_age: '',
    banner_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description) {
      toast.error('Başlık ve açıklama gerekli');
      return;
    }

    if (!formData.discount_percent && !formData.discount_amount) {
      toast.error('İndirim yüzdesi veya tutarı girin');
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      toast.error('Başlangıç ve bitiş tarihi gerekli');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/business/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessProfile.id,
          ...formData,
          discount_percent: formData.discount_percent ? parseFloat(formData.discount_percent) : null,
          discount_amount: formData.discount_amount ? parseFloat(formData.discount_amount) : null,
          radius_km: parseFloat(formData.radius_km),
          min_age: formData.min_age ? parseInt(formData.min_age) : null,
          max_age: formData.max_age ? parseInt(formData.max_age) : null
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Kampanya oluşturuldu! ${data.notifications_sent || 0} kullanıcıya bildirim gönderildi`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Kampanya oluşturma hatası');
      }
    } catch (error) {
      console.error('Campaign creation error:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Yeni Kampanya Oluştur</h2>
              <p className="text-blue-100">{businessProfile.business_name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                Kampanya Bilgileri
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kampanya Başlığı *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Örn: Yeni Yıl İndirim Kampanyası"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Kampanya detaylarını yazın..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner URL (Opsiyonel)
                  </label>
                  <input
                    type="url"
                    value={formData.banner_url}
                    onChange={(e) => updateField('banner_url', e.target.value)}
                    placeholder="https://example.com/banner.jpg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Discount */}
            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Percent className="w-5 h-5 text-green-600" />
                İndirim Detayları
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İndirim Yüzdesi (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discount_percent}
                    onChange={(e) => updateField('discount_percent', e.target.value)}
                    placeholder="20"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    veya İndirim Tutarı (₺)
                  </label>
                  <input
                    type="number"
                    value={formData.discount_amount}
                    onChange={(e) => updateField('discount_amount', e.target.value)}
                    placeholder="50"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-purple-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Kampanya Tarihleri
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlangıç Tarihi *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => updateField('start_date', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bitiş Tarihi *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => updateField('end_date', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Target Audience */}
            <div className="bg-orange-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                Hedef Kitle
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kitle Seçimi
                  </label>
                  <select
                    value={formData.target_audience}
                    onChange={(e) => updateField('target_audience', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">Tüm CityV Kullanıcıları</option>
                    <option value="nearby">Yakındaki Kullanıcılar</option>
                    <option value="visitors">Geçmiş Ziyaretçiler</option>
                  </select>
                </div>

                {formData.target_audience === 'nearby' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yarıçap (km)
                    </label>
                    <input
                      type="number"
                      value={formData.radius_km}
                      onChange={(e) => updateField('radius_km', e.target.value)}
                      min="0.1"
                      step="0.1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Yaş
                    </label>
                    <input
                      type="number"
                      value={formData.min_age}
                      onChange={(e) => updateField('min_age', e.target.value)}
                      placeholder="18"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Yaş
                    </label>
                    <input
                      type="number"
                      value={formData.max_age}
                      onChange={(e) => updateField('max_age', e.target.value)}
                      placeholder="65"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Kampanyayı Başlat
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
