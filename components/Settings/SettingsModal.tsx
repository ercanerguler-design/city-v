'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Settings as SettingsIcon, Bell, Globe, Lock, Eye, EyeOff,
  Moon, Sun, Shield, Smartphone, MapPin, Volume2, VolumeX
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    // Bildirimler
    notifications: {
      crowdAlerts: true,
      newLocations: true,
      premiumOffers: false,
      weeklyReport: true,
      sound: true,
    },
    // Gizlilik
    privacy: {
      showProfile: true,
      showActivity: false,
      allowTracking: true,
    },
    // Görünüm
    appearance: {
      darkMode: false,
      language: 'tr',
    },
    // Konum
    location: {
      autoDetect: true,
      shareLocation: true,
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleToggle = (section: keyof typeof settings, key: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !(prev[section] as any)[key],
      },
    }));
    toast.success('Ayar güncellendi');
  };

  const handlePasswordChange = () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error('Yeni şifreler eşleşmiyor!');
      return;
    }
    if (passwordData.new.length < 6) {
      toast.error('Şifre en az 6 karakter olmalı!');
      return;
    }
    toast.success('Şifre başarıyla değiştirildi!');
    setPasswordData({ current: '', new: '', confirm: '' });
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <SettingsIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Ayarlar</h2>
                    <p className="text-white/80 text-sm">Tercihlerinizi özelleştirin</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Bildirimler */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Bildirimler
                  </h3>
                </div>

                <ToggleItem
                  label="Kalabalık Uyarıları"
                  description="Favori mekanlarınız kalabalıklaştığında bildirim alın"
                  checked={settings.notifications.crowdAlerts}
                  onChange={() => handleToggle('notifications', 'crowdAlerts')}
                />

                <ToggleItem
                  label="Yeni Mekanlar"
                  description="Yakınınıza yeni mekan eklendiğinde bildirim alın"
                  checked={settings.notifications.newLocations}
                  onChange={() => handleToggle('notifications', 'newLocations')}
                />

                <ToggleItem
                  label="Premium Teklifler"
                  description="Özel indirim ve kampanyalardan haberdar olun"
                  checked={settings.notifications.premiumOffers}
                  onChange={() => handleToggle('notifications', 'premiumOffers')}
                />

                <ToggleItem
                  label="Haftalık Rapor"
                  description="Haftalık aktivite özetinizi e-posta ile alın"
                  checked={settings.notifications.weeklyReport}
                  onChange={() => handleToggle('notifications', 'weeklyReport')}
                />

                <ToggleItem
                  label="Bildirim Sesi"
                  description="Bildirimler için ses efekti çal"
                  checked={settings.notifications.sound}
                  onChange={() => handleToggle('notifications', 'sound')}
                  icon={settings.notifications.sound ? Volume2 : VolumeX}
                />
              </section>

              {/* Gizlilik */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Gizlilik ve Güvenlik
                  </h3>
                </div>

                <ToggleItem
                  label="Profili Göster"
                  description="Diğer kullanıcılar profilinizi görebilsin"
                  checked={settings.privacy.showProfile}
                  onChange={() => handleToggle('privacy', 'showProfile')}
                />

                <ToggleItem
                  label="Aktivite Geçmişi"
                  description="Check-in ve raporlarınız diğerlerine görünsün"
                  checked={settings.privacy.showActivity}
                  onChange={() => handleToggle('privacy', 'showActivity')}
                />

                <ToggleItem
                  label="Kullanım Verisi"
                  description="Uygulamayı geliştirmemiz için anonim veri paylaşın"
                  checked={settings.privacy.allowTracking}
                  onChange={() => handleToggle('privacy', 'allowTracking')}
                />
              </section>

              {/* Konum */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <MapPin className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Konum Ayarları
                  </h3>
                </div>

                <ToggleItem
                  label="Otomatik Konum"
                  description="Uygulama açıldığında konumunuzu otomatik algıla"
                  checked={settings.location.autoDetect}
                  onChange={() => handleToggle('location', 'autoDetect')}
                />

                <ToggleItem
                  label="Konum Paylaşımı"
                  description="Arkadaşlarınız konumunuzu görebilsin"
                  checked={settings.location.shareLocation}
                  onChange={() => handleToggle('location', 'shareLocation')}
                />
              </section>

              {/* Görünüm */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <Moon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Görünüm
                  </h3>
                </div>

                <ToggleItem
                  label="Karanlık Mod"
                  description="Gece modu temasını etkinleştir"
                  checked={settings.appearance.darkMode}
                  onChange={() => handleToggle('appearance', 'darkMode')}
                  icon={settings.appearance.darkMode ? Moon : Sun}
                />

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Dil</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Uygulama dilini seçin
                      </p>
                    </div>
                  </div>
                  <select
                    value={settings.appearance.language}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        appearance: { ...prev.appearance, language: e.target.value },
                      }))
                    }
                    className="px-4 py-2 bg-white dark:bg-slate-600 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </section>

              {/* Şifre Değiştir */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Şifre Değiştir
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mevcut şifre"
                      value={passwordData.current}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, current: e.target.value })
                      }
                      className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Yeni şifre"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                  />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Yeni şifre (tekrar)"
                    value={passwordData.confirm}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirm: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                  />

                  <button
                    onClick={handlePasswordChange}
                    className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Şifreyi Değiştir
                  </button>
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface ToggleItemProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  icon?: any;
}

function ToggleItem({ label, description, checked, onChange, icon: Icon }: ToggleItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        {Icon && <Icon className="w-5 h-5 text-gray-400" />}
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <motion.div
          animate={{ x: checked ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg"
        />
      </button>
    </div>
  );
}
