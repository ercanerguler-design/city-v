'use client';

import React, { useState } from 'react';
import { useBusinessStore, type Business } from '@/store/businessStore';
import toast from 'react-hot-toast';

interface WorkingHoursEditProps {
  business: Business;
  onClose: () => void;
}

const WorkingHoursEdit: React.FC<WorkingHoursEditProps> = ({ business, onClose }) => {
  const { updateBusiness } = useBusinessStore();
  const [workingHours, setWorkingHours] = useState(business.workingHours);

  const days = [
    { key: 'monday', label: 'Pazartesi' },
    { key: 'tuesday', label: 'Salı' },
    { key: 'wednesday', label: 'Çarşamba' },
    { key: 'thursday', label: 'Perşembe' },
    { key: 'friday', label: 'Cuma' },
    { key: 'saturday', label: 'Cumartesi' },
    { key: 'sunday', label: 'Pazar' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('⏰ Çalışma saatleri kaydediliyor...');
      
      // Local state'i güncelle
      updateBusiness({ workingHours });
      
      // SYNC TO MAIN SITE: Ana siteye real-time sync
      console.log('🔄 Ana siteye sync yapılıyor...');
      
      const syncResponse = await fetch('/api/business/sync-to-cityv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessUserId: business.id,
          workingHours: workingHours,
          autoSyncToCityv: true
        })
      });
      
      if (syncResponse.ok) {
        const syncData = await syncResponse.json();
        console.log('✅ Ana site senkronize edildi:', syncData);
        toast.success('✅ Çalışma saatleri güncellendi ve ana siteye senkronize edildi!');
      } else {
        console.error('❌ Sync hatası:', syncResponse.status);
        toast.error('⚠️ Çalışma saatleri güncellendi ama ana site senkronize edilemedi');
      }
      
      onClose();
    } catch (error) {
      console.error('❌ Çalışma saati kaydetme hatası:', error);
      toast.error('❌ Çalışma saatleri güncellenemedi');
    }
  };

  const handleDayChange = (day: string, hours: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: hours === '' ? undefined : hours
    }));
  };

  const toggle24Hours = () => {
    setWorkingHours(prev => ({
      ...prev,
      is24Hours: !prev.is24Hours
    }));
  };

  const setAllDaysSame = () => {
    const mondayHours = workingHours.monday || '09:00-18:00';
    const newHours = { ...workingHours };
    days.forEach(day => {
      if (day.key !== 'is24Hours') {
        (newHours as any)[day.key] = mondayHours;
      }
    });
    setWorkingHours(newHours);
  };

  const clearAllHours = () => {
    const clearedHours = { ...workingHours };
    days.forEach(day => {
      if (day.key !== 'is24Hours') {
        (clearedHours as any)[day.key] = undefined;
      }
    });
    setWorkingHours(clearedHours);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Çalışma Saatleri</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 24 Hours Toggle */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">24 Saat Açık</h3>
              <p className="text-sm text-gray-600">İşletmeniz 7/24 hizmet veriyor mu?</p>
            </div>
            <button
              type="button"
              onClick={toggle24Hours}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                workingHours.is24Hours ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  workingHours.is24Hours ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {!workingHours.is24Hours && (
            <>
              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={setAllDaysSame}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Tüm Günleri Aynı Yap
                </button>
                <button
                  type="button"
                  onClick={clearAllHours}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                >
                  Tümünü Temizle
                </button>
              </div>

              {/* Days Schedule */}
              <div className="space-y-4">
                {days.map((day) => (
                  <div key={day.key} className="flex items-center gap-4">
                    <label className="w-24 text-sm font-medium text-gray-700">
                      {day.label}
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={(workingHours as any)[day.key] || ''}
                        onChange={(e) => handleDayChange(day.key, e.target.value)}
                        placeholder="09:00-18:00 veya Kapalı"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Format Info */}
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">💡 Format Örnekleri:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• <strong>09:00-18:00</strong> - Normal çalışma saatleri</li>
                  <li>• <strong>09:00-12:00, 14:00-18:00</strong> - Öğle arası ile</li>
                  <li>• <strong>Kapalı</strong> - O gün kapalı</li>
                  <li>• <strong>Boş bırak</strong> - Belirsiz saatler</li>
                </ul>
              </div>
            </>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkingHoursEdit;