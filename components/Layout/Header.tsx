'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { MapPin, BarChart3, User, LogOut, Crown, Bell, Settings, Trophy, Brain, Map as MapIcon, HelpCircle, Star } from 'lucide-react';
import { CrowdStats } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { getTimeOfDay } from '@/lib/utils';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { useTrackedStore } from '@/lib/stores/trackedStore';

interface HeaderProps {
  stats: CrowdStats;
  onAnalyticsClick: () => void;
  onAuthClick: () => void;
  onPremiumClick?: () => void;
  onGamificationClick?: () => void;
  onRecommendationsClick?: () => void;
  onPWASettingsClick?: () => void;
  onMapControlsClick?: () => void;
  onTrackedLocationsClick?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
}

export default function Header({ stats, onAnalyticsClick, onAuthClick, onPremiumClick, onGamificationClick, onRecommendationsClick, onPWASettingsClick, onMapControlsClick, onTrackedLocationsClick, onProfileClick, onSettingsClick, onNotificationsClick }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { startOnboarding } = useOnboardingStore();
  const { trackedLocationIds } = useTrackedStore();

  return (
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl relative overflow-visible">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                CityView
                <span className="text-xs bg-yellow-400 text-purple-900 px-2 py-1 rounded-full font-bold">
                  PRO
                </span>
              </h1>
              <p className="text-sm text-white/80">Akıllı Şehir Yoğunluk Haritası</p>
            </div>
          </motion.div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Tour Button - Only when logged in */}
            {isAuthenticated && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startOnboarding}
                className="hidden md:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl backdrop-blur-sm transition-all shadow-lg"
                title="Rehberli Tur"
              >
                <HelpCircle className="w-5 h-5" />
                <span className="font-semibold text-sm">Tur</span>
              </motion.button>
            )}

            {/* Theme Toggle */}
            <div data-tour="theme">
              <ThemeToggle />
            </div>

            {/* Map Controls Button */}
            {onMapControlsClick && (
              <motion.button
                data-tour="map-controls"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onMapControlsClick}
                className="hidden md:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl backdrop-blur-sm transition-all shadow-lg"
                title="Harita Kontrolleri"
              >
                <MapIcon className="w-5 h-5" />
              </motion.button>
            )}

            {/* PWA Settings Button */}
            {onPWASettingsClick && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onPWASettingsClick}
                className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition-all"
                title="PWA Ayarları"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            )}

            {/* Analytics Button - Only when logged in */}
            {isAuthenticated && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAnalyticsClick}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition-all"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-semibold text-sm">Analytics</span>
              </motion.button>
            )}

            {/* Notifications (Premium) */}
            {isAuthenticated && user?.premium && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNotificationsClick}
                className="relative p-3 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition-all"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold animate-pulse">
                  2
                </span>
              </motion.button>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition-all"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-white/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-white/70">
                      {user.premium ? '👑 Premium' : 'Ücretsiz'}
                    </p>
                  </div>
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl overflow-visible z-[9999]"
                    >
                      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                        <p className="font-bold text-gray-800">{getTimeOfDay()}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      
                      <div className="p-2 max-h-[400px] overflow-y-auto">
                        {/* Profilim */}
                        <button 
                          onClick={() => {
                            setShowUserMenu(false);
                            onProfileClick?.();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <User className="w-5 h-5" />
                          <span className="font-medium">Profilim</span>
                        </button>

                        {/* Premium */}
                        {isAuthenticated && (
                          <button 
                            onClick={() => {
                              setShowUserMenu(false);
                              onPremiumClick?.();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Crown className="w-5 h-5" />
                            <span className="font-medium">Premium</span>
                            {user?.premium && (
                              <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full">
                                PRO
                              </span>
                            )}
                          </button>
                        )}

                        {/* Oyuncu Profili */}
                        {isAuthenticated && (
                          <button 
                            onClick={() => {
                              if (!user?.premium) {
                                setShowUserMenu(false);
                                onPremiumClick?.();
                                return;
                              }
                              setShowUserMenu(false);
                              onGamificationClick?.();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors relative"
                          >
                            <Trophy className="w-5 h-5" />
                            <span className="font-medium">Oyuncu Profili</span>
                            {!user?.premium && (
                              <Crown className="w-4 h-4 ml-auto text-amber-500" />
                            )}
                          </button>
                        )}

                        {/* Akıllı Öneriler */}
                        {isAuthenticated && (
                          <button 
                            onClick={() => {
                              if (!user?.premium) {
                                setShowUserMenu(false);
                                onPremiumClick?.();
                                return;
                              }
                              setShowUserMenu(false);
                              onRecommendationsClick?.();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors relative"
                          >
                            <Brain className="w-5 h-5" />
                            <span className="font-medium">Akıllı Öneriler</span>
                            {!user?.premium && (
                              <Crown className="w-4 h-4 ml-auto text-amber-500" />
                            )}
                          </button>
                        )}

                        {/* Takip Edilenler */}
                        {isAuthenticated && (
                          <button 
                            onClick={() => {
                              setShowUserMenu(false);
                              onTrackedLocationsClick?.();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                          >
                            <Star className="w-5 h-5" />
                            <span className="font-medium">Takip Edilenler</span>
                          </button>
                        )}
                        
                        <hr className="my-2" />

                        {/* Premium'a Geç - Sadece free users için */}
                        {!user.premium && false && (
                          <button 
                            onClick={() => {
                              setShowUserMenu(false);
                              onPremiumClick?.();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Crown className="w-5 h-5" />
                            <span className="font-medium">Premium'a Geç</span>
                          </button>
                        )}
                        
                        {/* Ayarlar */}
                        <button 
                          onClick={() => {
                            setShowUserMenu(false);
                            onSettingsClick?.();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Settings className="w-5 h-5" />
                          <span className="font-medium">Ayarlar</span>
                        </button>
                        
                        <hr className="my-2" />
                        
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="font-medium">Çıkış Yap</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAuthClick}
                className="px-6 py-2 bg-white text-indigo-600 rounded-xl font-bold hover:bg-white/90 transition-all shadow-lg"
              >
                Giriş Yap
              </motion.button>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-4"
        >
          <div className="text-center">
            <p className="text-xs text-white/70">Aktif Kullanıcı</p>
            <p className="text-xl font-bold">{stats.activeUsers.toLocaleString('tr-TR')}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-white/70">Toplam Bildirim</p>
            <p className="text-xl font-bold">{stats.totalReports.toLocaleString('tr-TR')}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-white/70">Takip Edilen Mekan</p>
            <p className="text-xl font-bold">{stats.trackedLocations.toLocaleString('tr-TR')}</p>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
