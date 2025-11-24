'use client';

import { useState } from 'react';
import { X, Calendar, Percent, Users, Send } from 'lucide-react';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number;
  onSuccess: () => void;
}

export default function CreateCampaignModal({ isOpen, onClose, businessId, onSuccess }: CreateCampaignModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountPercent: '',
    startDate: '',
    endDate: '',
    targetAudience: 'all'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validasyon
    if (!formData.title.trim()) {
      setError('Kampanya başlığı gerekli');
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('Açıklama gerekli');
      setLoading(false);
      return;
    }

    if (!formData.discountPercent || parseInt(formData.discountPercent) <= 0) {
      setError('Geçerli bir indirim oranı girin');
      setLoading(false);
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Başlangıç ve bitiş tarihleri gerekli');
      setLoading(false);
      return;
    }

    try {
      console.log('📤 Kampanya oluşturuluyor:', {
        businessId,
        title: formData.title,
        description: formData.description,
        discountPercent: parseInt(formData.discountPercent),
        startDate: formData.startDate,
        endDate: formData.endDate,
        targetAudience: formData.targetAudience
      });

      const response = await fetch('/api/business/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          title: formData.title,
          description: formData.description,
          discountPercent: parseInt(formData.discountPercent),
          discountAmount: null,
          startDate: formData.startDate,
          endDate: formData.endDate,
          targetAudience: formData.targetAudience,
          imageUrl: null
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
        setFormData({
          title: '',
          description: '',
          discountPercent: '',
          startDate: '',
          endDate: '',
          targetAudience: 'all'
        });
        
        // ✅ Custom event dispatch et - ProHeader hemen bildirim fetch etsin
        window.dispatchEvent(new CustomEvent('campaignCreated', {
          detail: { campaignId: data.campaign?.id }
        }));
      } else {
        setError(data.error || 'Kampanya oluşturulamadı');
      }
    } catch (error) {
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Send className="w-6 h-6 text-purple-400" />
            Yeni Kampanya Oluştur
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {/* Kampanya Başlığı */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Kampanya Başlığı *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Örn: Yaz İndirimi"
              required
            />
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Açıklama *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
              placeholder="Kampanya detaylarını yazın..."
              required
            />
          </div>

          {/* İndirim Oranı */}
          <div>
            <label className="block text-white font-semibold mb-2 flex items-center gap-2">
              <Percent className="w-4 h-4 text-green-400" />
              İndirim Oranı *
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.discountPercent}
              onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Örn: 25"
              required
            />
          </div>

          {/* Tarih Aralığı */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Başlangıç Tarihi *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-400" />
                Bitiş Tarihi *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          {/* Hedef Kitle */}
          <div>
            <label className="block text-white font-semibold mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Hedef Kitle
            </label>
            <select
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tüm Kullanıcılar</option>
              <option value="new">Yeni Üyeler</option>
              <option value="vip">VIP Üyeler</option>
            </select>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-purple-300 text-sm">
              <strong>📱 Otomatik Bildirim:</strong> Kampanya oluşturulduğunda tüm CityV kullanıcılarına push bildirimi gönderilecek.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-semibold transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Kampanya Oluştur ve Gönder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
