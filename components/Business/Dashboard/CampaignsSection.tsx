'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit, Trash2, Send, Calendar, Users, Percent } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Campaign {
  id: number;
  title: string;
  description: string;
  discount_percent: number | null;
  discount_amount: number | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  target_audience: string;
  notification_sent: boolean;
  created_at: string;
}

interface CampaignsSectionProps {
  businessProfile: any;
}

export default function CampaignsSection({ businessProfile }: CampaignsSectionProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [credits, setCredits] = useState({ current: 0, total: 0 });
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_percent: '',
    discount_amount: '',
    start_date: '',
    end_date: '',
    target_audience: 'all'
  });

  // 💳 Kredi bilgisini yükle
  useEffect(() => {
    if (businessProfile?.user_id) {
      loadCredits();
    }
  }, [businessProfile]);

  const loadCredits = async () => {
    try {
      setCreditsLoading(true);
      const response = await fetch(`/api/business/credits?userId=${businessProfile.user_id}`);
      const data = await response.json();
      
      if (data.success) {
        setCredits({
          current: data.credits.current || 0,
          total: data.credits.totalCampaigns || 0
        });
      }
    } catch (error) {
      console.error('Kredi yükleme hatası:', error);
    } finally {
      setCreditsLoading(false);
    }
  };

  // Kampanyaları yükle
  useEffect(() => {
    if (businessProfile?.id) {
      loadCampaigns();
    }
  }, [businessProfile]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/business/campaigns?businessId=${businessProfile.id}`);
      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.campaigns || []);
      } else {
        console.error('Kampanyalar yüklenemedi:', data.error);
      }
    } catch (error) {
      console.error('Kampanya yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Kampanya düzenleme modalını aç
  const handleEditClick = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title,
      description: campaign.description || '',
      discount_percent: campaign.discount_percent?.toString() || '',
      discount_amount: campaign.discount_amount?.toString() || '',
      start_date: campaign.start_date.split('T')[0],
      end_date: campaign.end_date.split('T')[0],
      target_audience: campaign.target_audience || 'all'
    });
    setShowEditModal(true);
  };

  // Kampanya güncelleme
  const handleUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCampaign) return;

    try {
      const response = await fetch(`/api/business/campaigns?campaignId=${editingCampaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          discount_percent: formData.discount_percent ? parseInt(formData.discount_percent) : null,
          discount_amount: formData.discount_amount ? parseFloat(formData.discount_amount) : null,
          start_date: formData.start_date,
          end_date: formData.end_date,
          target_audience: formData.target_audience
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('✅ Kampanya güncellendi!');
        setShowEditModal(false);
        setEditingCampaign(null);
        loadCampaigns(); // Listeyi yenile
      } else {
        toast.error('❌ ' + (data.error || 'Güncelleme başarısız'));
      }
    } catch (error) {
      console.error('Kampanya güncelleme hatası:', error);
      toast.error('❌ Bir hata oluştu');
    }
  };

  // Kampanya silme
  const handleDeleteCampaign = async (campaignId: number) => {
    if (!confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/business/campaigns?campaignId=${campaignId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('✅ Kampanya silindi!');
        loadCampaigns(); // Listeyi yenile
      } else {
        toast.error('❌ ' + (data.error || 'Silme başarısız'));
      }
    } catch (error) {
      console.error('Kampanya silme hatası:', error);
      toast.error('❌ Bir hata oluştu');
    }
  };

  // Kampanya durumu badge
  const getStatusBadge = (campaign: Campaign) => {
    const now = new Date();
    const startDate = new Date(campaign.start_date);
    const endDate = new Date(campaign.end_date);

    if (!campaign.is_active) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Pasif</span>;
    }
    if (endDate < now) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Süresi Doldu</span>;
    }
    if (startDate > now) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Beklemede</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Aktif</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Kampanyalar</h2>
            <p className="text-gray-600">Oluşturduğunuz kampanyaları yönetin</p>
          </div>
        </div>
        
        {/* 💳 Kredi Bilgisi */}
        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div>
            <p className="text-sm text-gray-600">Kampanya Kredisi</p>
            <p className="text-2xl font-bold text-blue-600">
              {creditsLoading ? (
                <div className="w-12 h-8 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                `${credits.current} / ∞`
              )}
            </p>
          </div>
          <div className="text-xs text-gray-500">
            <p>Toplam Kampanya: {credits.total}</p>
          </div>
        </div>
      </div>

      {/* Kampanya Listesi */}
      {campaigns.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz kampanya oluşturmadınız</h3>
          <p className="text-gray-600 mb-4">Dashboard'dan "Kampanya Oluştur" modalını kullanarak kampanya ekleyebilirsiniz.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {campaigns.map((campaign) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Başlık ve Durum */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{campaign.title}</h3>
                    {getStatusBadge(campaign)}
                    {campaign.notification_sent && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <Send className="w-3 h-3" />
                        Gönderildi
                      </span>
                    )}
                  </div>

                  {/* Açıklama */}
                  <p className="text-gray-600 mb-4">{campaign.description}</p>

                  {/* Detaylar */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {campaign.discount_percent && (
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-purple-500" />
                        <span className="font-medium text-purple-600">%{campaign.discount_percent} İndirim</span>
                      </div>
                    )}
                    {campaign.discount_amount && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-purple-600">{campaign.discount_amount}₺ İndirim</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span>
                        {new Date(campaign.start_date).toLocaleDateString('tr-TR')} - {new Date(campaign.end_date).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="capitalize">{campaign.target_audience === 'all' ? 'Tüm Kullanıcılar' : campaign.target_audience}</span>
                    </div>
                  </div>
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEditClick(campaign)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Düzenle"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Düzenleme Modal */}
      <AnimatePresence>
        {showEditModal && editingCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Kampanya Düzenle</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateCampaign} className="p-6 space-y-4">
                {/* Başlık */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kampanya Başlığı</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                {/* Açıklama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {/* İndirim Bilgileri */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">İndirim Yüzdesi (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount_percent}
                      onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">İndirim Tutarı (₺)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discount_amount}
                      onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Tarihler */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç Tarihi</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bitiş Tarihi</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                </div>

                {/* Hedef Kitle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hedef Kitle</label>
                  <select
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="all">Tüm Kullanıcılar</option>
                    <option value="nearby">Yakınımdaki Kullanıcılar</option>
                    <option value="visitors">Ziyaretçiler</option>
                  </select>
                </div>

                {/* Butonlar */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
                  >
                    Güncelle
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
