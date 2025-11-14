'use client';

import { useState } from 'react';
import { useBusinessStore, type Business, type Campaign } from '@/store/businessStore';

interface CampaignManagementProps {
  business: Business;
}

export default function CampaignManagement({ business }: CampaignManagementProps) {
  const { campaigns, createCampaign, updateCampaign, toggleCampaign, deleteCampaign, sendCampaignNotification } = useBusinessStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [selectedCampaignForNotification, setSelectedCampaignForNotification] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'discount' as Campaign['type'],
    value: 0,
    startDate: '',
    endDate: '',
    maxUsage: '',
    targetAudience: '',
    discountCode: ''
  });

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    
    const campaignData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      value: formData.value,
      startDate: new Date(formData.startDate).getTime(),
      endDate: new Date(formData.endDate).getTime(),
      isActive: true,
      maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : undefined,
      targetAudience: formData.targetAudience ? formData.targetAudience.split(',').map(s => s.trim()) : undefined,
      discountCode: formData.discountCode || undefined
    };

    if (editingCampaign) {
      updateCampaign(editingCampaign.id, campaignData);
      setEditingCampaign(null);
    } else {
      createCampaign(campaignData);
    }

    setIsCreateModalOpen(false);
    setFormData({
      title: '',
      description: '',
      type: 'discount',
      value: 0,
      startDate: '',
      endDate: '',
      maxUsage: '',
      targetAudience: '',
      discountCode: ''
    });
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title,
      description: campaign.description,
      type: campaign.type,
      value: campaign.value,
      startDate: new Date(campaign.startDate).toISOString().split('T')[0],
      endDate: new Date(campaign.endDate).toISOString().split('T')[0],
      maxUsage: campaign.maxUsage?.toString() || '',
      targetAudience: campaign.targetAudience?.join(', ') || '',
      discountCode: campaign.discountCode || ''
    });
    setIsCreateModalOpen(true);
  };

  const getCampaignTypeLabel = (type: Campaign['type']) => {
    switch (type) {
      case 'discount': return 'İndirim';
      case 'bogo': return '1 Al 1 Bedava';
      case 'free_item': return 'Bedava Ürün';
      case 'loyalty': return 'Sadakat';
      default: return type;
    }
  };

  const getCampaignStatusColor = (campaign: Campaign) => {
    if (!campaign.isActive) return 'bg-gray-500';
    if (campaign.endDate < Date.now()) return 'bg-red-500';
    if (campaign.startDate > Date.now()) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleSendNotification = async () => {
    if (!selectedCampaignForNotification) {
      alert('⚠️ Lütfen bir kampanya seçin!');
      return;
    }

    const campaign = campaigns.find(c => c.id === selectedCampaignForNotification);
    if (!campaign) {
      alert('❌ Kampanya bulunamadı!');
      return;
    }

    // Send notification
    const success = await sendCampaignNotification(selectedCampaignForNotification);
    
    if (success) {
      alert(`✅ "${campaign.title}" kampanyası tüm City-V kullanıcılarına gönderildi!`);
      setIsNotificationModalOpen(false);
      setSelectedCampaignForNotification('');
    } else {
      alert('❌ Bildirim gönderilirken hata oluştu!');
    }
  };

  const activeCampaigns = campaigns.filter(c => c.isActive && !c.notificationSent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kampanya Yönetimi</h1>
          <p className="text-gray-600">Promosyonları ve kampanyaları yönetin</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNotificationModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span>📢 Kampanya Bildirimi Gönder</span>
          </button>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Yeni Kampanya</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Kampanya</p>
              <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktif Kampanya</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.filter(c => c.isActive && c.startDate <= Date.now() && c.endDate > Date.now()).length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Kullanım</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.reduce((sum, c) => sum + c.usageCount, 0)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ortalama İndirim</p>
              <p className="text-2xl font-bold text-gray-900">
                %{campaigns.length > 0 ? Math.round(campaigns.reduce((sum, c) => sum + (c.type === 'discount' ? c.value : 0), 0) / campaigns.filter(c => c.type === 'discount').length) || 0 : 0}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Tüm Kampanyalar</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kampanya</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tür</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Değer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanım</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{campaign.title}</p>
                      <p className="text-sm text-gray-600">{campaign.description}</p>
                      {campaign.discountCode && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                          {campaign.discountCode}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getCampaignTypeLabel(campaign.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {campaign.type === 'discount' || campaign.type === 'loyalty' ? `%${campaign.value}` : `₺${campaign.value}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${getCampaignStatusColor(campaign)}`}></div>
                      <span className="text-sm text-gray-600">
                        {!campaign.isActive ? 'Pasif' :
                         campaign.endDate < Date.now() ? 'Süresi Doldu' :
                         campaign.startDate > Date.now() ? 'Beklemede' : 'Aktif'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {campaign.usageCount} {campaign.maxUsage ? `/ ${campaign.maxUsage}` : ''}
                    </div>
                    {campaign.maxUsage && (
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full"
                          style={{ width: `${Math.min((campaign.usageCount / campaign.maxUsage) * 100, 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(campaign.startDate).toLocaleDateString('tr-TR')} - 
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(campaign.endDate).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditCampaign(campaign)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => toggleCampaign(campaign.id)}
                        className={`${campaign.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                      >
                        {campaign.isActive ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h8a2 2 0 012 2v7a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => deleteCampaign(campaign.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {campaigns.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Henüz kampanya oluşturulmamış</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                İlk kampanyanızı oluşturun
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Campaign Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCampaign ? 'Kampanya Düzenle' : 'Yeni Kampanya Oluştur'}
              </h2>
            </div>
            
            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kampanya Adı</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kampanya Türü</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Campaign['type'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="discount">İndirim (%)</option>
                    <option value="bogo">1 Al 1 Bedava</option>
                    <option value="free_item">Bedava Ürün</option>
                    <option value="loyalty">Sadakat Programı</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Değer {formData.type === 'discount' || formData.type === 'loyalty' ? '(%)' : '(₺)'}
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max={formData.type === 'discount' || formData.type === 'loyalty' ? "100" : undefined}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç Tarihi</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bitiş Tarihi</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maksimum Kullanım (Opsiyonel)</label>
                  <input
                    type="number"
                    value={formData.maxUsage}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUsage: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">İndirim Kodu (Opsiyonel)</label>
                  <input
                    type="text"
                    value={formData.discountCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountCode: e.target.value.toUpperCase() }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="INDIRIM20"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hedef Kitle (Opsiyonel)</label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="premium, yeni müşteri, sadık müşteri"
                />
                <p className="text-xs text-gray-600 mt-1">Virgülle ayırarak birden fazla grup ekleyebilirsiniz</p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingCampaign(null);
                    setFormData({
                      title: '',
                      description: '',
                      type: 'discount',
                      value: 0,
                      startDate: '',
                      endDate: '',
                      maxUsage: '',
                      targetAudience: '',
                      discountCode: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCampaign ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📢 PUSH NOTIFICATION MODAL */}
      {isNotificationModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">📢 Kampanya Bildirimi Gönder</h2>
                    <p className="text-white/80 text-sm mt-1">City-V kullanıcılarına push bildirim</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNotificationModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">📣 Bilgilendirme</h3>
                    <p className="text-sm text-gray-600">
                      Seçtiğiniz kampanya, City-V ana sayfasında bulunan <strong>TÜM kullanıcılara</strong> push bildirim olarak gönderilecek.
                    </p>
                  </div>
                </div>
              </div>

              {/* Campaign Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  🎯 Kampanya Seçin
                </label>
                {activeCampaigns.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-yellow-800">⚠️ Aktif kampanya bulunamadı!</p>
                    <p className="text-sm text-yellow-600 mt-1">Önce bir kampanya oluşturun.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {activeCampaigns.map((campaign) => (
                      <label
                        key={campaign.id}
                        className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedCampaignForNotification === campaign.id
                            ? 'border-purple-500 bg-purple-50 shadow-lg'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="campaign"
                          value={campaign.id}
                          checked={selectedCampaignForNotification === campaign.id}
                          onChange={(e) => setSelectedCampaignForNotification(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-900">{campaign.title}</span>
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                {getCampaignTypeLabel(campaign.type)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>💰 {campaign.type === 'discount' ? `%${campaign.value} İndirim` : campaign.value}</span>
                              <span>📅 {new Date(campaign.startDate).toLocaleDateString('tr-TR')} - {new Date(campaign.endDate).toLocaleDateString('tr-TR')}</span>
                            </div>
                          </div>
                          {selectedCampaignForNotification === campaign.id && (
                            <div className="ml-3 p-1 bg-purple-500 rounded-full">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setIsNotificationModalOpen(false);
                    setSelectedCampaignForNotification('');
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                >
                  ❌ İptal
                </button>
                <button
                  onClick={handleSendNotification}
                  disabled={!selectedCampaignForNotification}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl"
                >
                  📢 Gönder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}