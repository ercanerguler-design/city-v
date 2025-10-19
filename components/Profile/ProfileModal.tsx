'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Calendar, Crown, Camera, Save, Edit2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateProfile, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  if (!user) return null;

  const handleSave = () => {
    updateProfile({
      name: formData.name,
      email: formData.email,
    });
    setIsEditing(false);
    toast.success('Profil güncellendi!');
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Profilim</h2>
                    <p className="text-white/80 text-sm">Hesap bilgilerinizi yönetin</p>
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
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors group-hover:scale-110">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                
                {user.membershipTier && user.membershipTier !== 'free' ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full shadow-lg">
                      <Crown className="w-5 h-5" />
                      <span className="font-bold">Premium Üye ({user.membershipTier})</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      AI Krediler: {user.aiCredits || 0}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={() => {
                        window.location.href = '/pricing';
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                    >
                      <Crown className="w-5 h-5" />
                      Premium'a Yükselt
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Premium özelliklerden yararlanın
                    </p>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Hesap Bilgileri
                  </h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    {isEditing ? 'İptal' : 'Düzenle'}
                  </button>
                </div>

                {/* Name Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <User className="w-4 h-4" />
                    İsim
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 dark:bg-slate-700 rounded-xl text-gray-900 dark:text-white font-medium">
                      {user.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Mail className="w-4 h-4" />
                    E-posta
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 dark:bg-slate-700 rounded-xl text-gray-900 dark:text-white font-medium">
                      {user.email}
                    </p>
                  )}
                </div>

                {/* Join Date */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Calendar className="w-4 h-4" />
                    Kayıt Tarihi
                  </label>
                  <p className="px-4 py-3 bg-gray-50 dark:bg-slate-700 rounded-xl text-gray-900 dark:text-white font-medium">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.floor(Math.random() * 50) + 10}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Rapor
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.floor(Math.random() * 30) + 5}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Check-in
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl">
                  <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                    {Math.floor(Math.random() * 20) + 3}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Takip
                  </p>
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <Save className="w-5 h-5" />
                  Değişiklikleri Kaydet
                </motion.button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
