'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, Clock, Check, X, Eye, EyeOff, Settings, 
  Calendar, Globe, RefreshCw, CheckCircle, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface WorkingHoursEditorProps {
  businessUserId: number;
  initialWorkingHours?: any;
  initialVisibility?: boolean;
  initialAutoSync?: boolean;
}

const DAYS = [
  { key: 'monday', label: 'Pazartesi', labelShort: 'Pzt' },
  { key: 'tuesday', label: 'Salı', labelShort: 'Sal' },
  { key: 'wednesday', label: 'Çarşamba', labelShort: 'Çar' },
  { key: 'thursday', label: 'Perşembe', labelShort: 'Per' },
  { key: 'friday', label: 'Cuma', labelShort: 'Cum' },
  { key: 'saturday', label: 'Cumartesi', labelShort: 'Cmt' },
  { key: 'sunday', label: 'Pazar', labelShort: 'Paz' }
];

const DEFAULT_HOURS = {
  monday: { openTime: '09:00', closeTime: '18:00', isOpen: true },
  tuesday: { openTime: '09:00', closeTime: '18:00', isOpen: true },
  wednesday: { openTime: '09:00', closeTime: '18:00', isOpen: true },
  thursday: { openTime: '09:00', closeTime: '18:00', isOpen: true },
  friday: { openTime: '09:00', closeTime: '18:00', isOpen: true },
  saturday: { openTime: '10:00', closeTime: '16:00', isOpen: true },
  sunday: { openTime: null, closeTime: null, isOpen: false }
};

export default function WorkingHoursEditor({
  businessUserId,
  initialWorkingHours,
  initialVisibility = true,
  initialAutoSync = true
}: WorkingHoursEditorProps) {
  const [workingHours, setWorkingHours] = useState(initialWorkingHours || DEFAULT_HOURS);
  const [isVisibleOnMap, setIsVisibleOnMap] = useState(initialVisibility);
  const [autoSyncToCityv, setAutoSyncToCityv] = useState(initialAutoSync);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Update state when props change (after save & page refresh)
  useEffect(() => {
    if (initialWorkingHours) {
      setWorkingHours(initialWorkingHours);
    }
    setIsVisibleOnMap(initialVisibility);
    setAutoSyncToCityv(initialAutoSync);
  }, [initialWorkingHours, initialVisibility, initialAutoSync]);

  useEffect(() => {
    fetchSyncStatus();
  }, [businessUserId]);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch(`/api/business/sync-to-cityv?businessUserId=${businessUserId}`);
      const data = await response.json();
      if (data.success) {
        setSyncStatus(data);
      }
    } catch (error) {
      console.error('Sync status error:', error);
    }
  };

  const handleDayToggle = (day: string) => {
    setWorkingHours((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day]?.isOpen
      }
    }));
  };

  const handleTimeChange = (day: string, type: 'openTime' | 'closeTime', value: string) => {
    setWorkingHours((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/business/sync-to-cityv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessUserId,
          workingHours,
          isVisibleOnMap,
          autoSyncToCityv
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('✅ Çalışma saatleri kaydedildi ve City-V\'ye senkronize edildi!');
        fetchSyncStatus();
        
        // Force parent to reload business profile data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(data.error || 'Kaydetme başarısız');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const applyToAll = () => {
    const monday = workingHours.monday;
    const newHours: any = {};
    DAYS.forEach(day => {
      newHours[day.key] = { ...monday };
    });
    setWorkingHours(newHours);
    toast.success('Pazartesi saatleri tüm günlere uygulandı');
  };

  return (
    <div className="space-y-6">
      {/* Sync Status Banner */}
      {syncStatus && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border-2 ${
            syncStatus.synced
              ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
              : 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
          }`}
        >
          <div className="flex items-center gap-3">
            {syncStatus.synced ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-orange-600" />
            )}
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 dark:text-white">
                {syncStatus.synced ? '✅ City-V\'de Aktif' : '⚠️ City-V\'de Görünmüyor'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {syncStatus.synced
                  ? `İşletmeniz City-V anasayfasında ${syncStatus.profile.locationId} ID'si ile görünüyor`
                  : 'Haritada görünmek için konum bilgileri ve çalışma saatlerini tamamlayın'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Visibility Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600" />
          City-V Görünürlük Ayarları
        </h3>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              {isVisibleOnMap ? (
                <Eye className="w-5 h-5 text-green-600" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Haritada Görünsün</p>
                <p className="text-sm text-gray-500">İşletmeniz City-V haritasında listelenecek</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isVisibleOnMap}
              onChange={(e) => setIsVisibleOnMap(e.target.checked)}
              className="w-6 h-6 text-indigo-600 rounded focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <RefreshCw className={`w-5 h-5 ${autoSyncToCityv ? 'text-blue-600' : 'text-gray-400'}`} />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Otomatik Senkronizasyon</p>
                <p className="text-sm text-gray-500">Değişiklikler anında City-V\'ye yansısın</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoSyncToCityv}
              onChange={(e) => setAutoSyncToCityv(e.target.checked)}
              className="w-6 h-6 text-indigo-600 rounded focus:ring-indigo-500"
            />
          </label>
        </div>
      </div>

      {/* Working Hours Editor */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Çalışma Saatleri
          </h3>
          <button
            onClick={applyToAll}
            className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors text-sm font-semibold"
          >
            Tüm Günlere Uygula
          </button>
        </div>

        <div className="space-y-3">
          {DAYS.map(day => (
            <div key={day.key} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <label className="flex items-center gap-2 min-w-[120px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={workingHours[day.key]?.isOpen || false}
                  onChange={() => handleDayToggle(day.key)}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {day.label}
                </span>
              </label>

              {workingHours[day.key]?.isOpen ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={workingHours[day.key]?.openTime || '09:00'}
                    onChange={(e) => handleTimeChange(day.key, 'openTime', e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="time"
                    value={workingHours[day.key]?.closeTime || '18:00'}
                    onChange={(e) => handleTimeChange(day.key, 'closeTime', e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <span className="text-gray-500 dark:text-gray-400 italic">Kapalı</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Kaydediliyor...
          </>
        ) : (
          <>
            <Check className="w-5 h-5" />
            Kaydet ve City-V'ye Senkronize Et
          </>
        )}
      </motion.button>
    </div>
  );
}
