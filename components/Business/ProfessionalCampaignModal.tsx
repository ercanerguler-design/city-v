'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Send, Users, Target, Calendar, DollarSign, 
  Tag, Image, Bell, CheckCircle, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfessionalCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number;
  onSuccess: () => void;
}

export default function ProfessionalCampaignModal({
  isOpen,
  onClose,
  businessId,
  onSuccess
}: ProfessionalCampaignModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountPercent: '',
    discountAmount: '',
    startDate: '',
    endDate: '',
    targetAudience: 'all',
    imageUrl: '',
    sendNotification: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('business_token');
      
      // Kampanya oluştur
      const campaignResponse = await fetch('/api/business/campaigns', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId,
          ...formData,
          discountPercent: formData.discountPercent ? parseInt(formData.discountPercent) : null,
          discountAmount: formData.discountAmount ? parseFloat(formData.discountAmount) : null
        })
      });

      const campaignData = await campaignResponse.json();

      if (!campaignData.success) {
        throw new Error(campaignData.error || 'Kampanya oluşturulamadı');
      }

      // Push notification gönder
      if (formData.sendNotification) {
        const notificationResponse = await fetch('/api/business/push-notification', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            businessId,
            campaignId: campaignData.campaignId,
            title: formData.title,
            message: formData.description,
            targetAudience: formData.targetAudience
          })
        });

        const notificationData = await notificationResponse.json();

        if (notificationData.success) {
          toast.success(`🎉 Kampanya oluşturuldu ve ${notificationData.sentCount} kullanıcıya bildirim gönderildi!`);
        }
      } else {
        toast.success('✅ Kampanya başarıyla oluşturuldu!');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Kampanya oluşturma hatası:', error);
      toast.error(error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl border border-white/20 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/20">
                  <Tag className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Yeni Kampanya Oluştur</h2>
                  <p className="text-pink-100 mt-1">Müşterilerinize özel fırsatlar sunun</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Kampanya Başlığı */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  📢 Kampanya Başlığı
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Örn: Yaz İndirimi - %50 İndirim!"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  📝 Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Kampanya detaylarını girin..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* İndirim */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    💰 İndirim Yüzdesi (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value, discountAmount: '' })}
                    placeholder="50"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">
                    💵 veya Sabit Tutar (TL)
                  </label>
                  <input
                    type="number"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value, discountPercent: '' })}
                    placeholder="100"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Tarih Aralığı */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    📅 Başlangıç Tarihi
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">
                    📅 Bitiş Tarihi
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Hedef Kitle */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  🎯 Hedef Kitle
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Tüm Kullanıcılar</option>
                  <option value="new">Yeni Kullanıcılar</option>
                  <option value="regular">Düzenli Müşteriler</option>
                  <option value="vip">VIP Müşteriler</option>
                  <option value="nearby">Yakındaki Kullanıcılar</option>
                </select>
              </div>

              {/* Görsel URL */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  🖼️ Kampanya Görseli (URL)
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/campaign-image.jpg"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Push Notification */}
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sendNotification}
                    onChange={(e) => setFormData({ ...formData, sendNotification: e.target.checked })}
                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-purple-600 focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-semibold">Tüm kullanıcılara anında push bildirim gönder</span>
                  </div>
                </label>
                <p className="text-gray-400 text-sm mt-2 ml-8">
                  Kampanya oluşturulduğunda hedef kitleye otomatik bildirim gönderilecek
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-bold transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Kampanyayı Yayınla
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
