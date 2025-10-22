'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { MapPin, BarChart3, User, LogOut, Crown, Bell, Settings, Trophy, Brain, Map as MapIcon, HelpCircle, Star, Wifi, WifiOff, Activity } from 'lucide-react';
import { CrowdStats } from '@/types';
import CameraButton from '../Camera/CameraButton';
import { motion, AnimatePresence } from 'framer-motion';
import { getTimeOfDay } from '@/lib/utils';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { useTrackedStore } from '@/lib/stores/trackedStore';
import useSocketStore from '@/store/socketStore';
import useCrowdStore from '@/store/crowdStore';

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
  onAIClick?: () => void;
  onLiveCrowdClick?: () => void;
  onPhotoGalleryClick?: () => void;
}

export default function Header({ stats, onAnalyticsClick, onAuthClick, onPremiumClick, onGamificationClick, onRecommendationsClick, onPWASettingsClick, onMapControlsClick, onTrackedLocationsClick, onProfileClick, onSettingsClick, onNotificationsClick, onAIClick, onLiveCrowdClick, onPhotoGalleryClick }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { startOnboarding } = useOnboardingStore();
  const { trackedLocationIds } = useTrackedStore();
  const { isConnected, connectionStatus } = useSocketStore();
  const { crowdData } = useCrowdStore();

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
            className="flex items-center gap-2 sm:gap-3"
          >
            <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
                CityView
                <span className="text-xs bg-yellow-400 text-purple-900 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold">
                  PRO
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-white/80 hidden sm:block">Akıllı Şehir Yoğunluk Haritası</p>
            </div>
          </motion.div>

          {/* Right Section - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {/* ESP32-CAM IoT Dashboard */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('/esp32', '_blank')}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl shadow-lg transition-all"
              title="ESP32-CAM IoT Dashboard"
            >
              <Activity className="w-5 h-5" />
              <span className="hidden md:inline font-semibold text-sm">IoT Cam</span>
            </motion.button>

            {/* Theme Toggle */}
            <div data-tour="theme">
              <ThemeToggle />
            </div>

            {/* Camera Features */}
            <div data-tour="camera">
              <CameraButton onPhotoGallery={onPhotoGalleryClick} />
            </div>

            {/* AI Assistant Button - Premium only */}
            {isAuthenticated && user?.membershipTier && user.membershipTier !== 'free' && onAIClick && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAIClick}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-xl backdrop-blur-sm transition-all shadow-lg"
                title="AI Asistan"
              >
                <Brain className="w-5 h-5" />
                <span className="hidden md:inline font-semibold text-sm">AI</span>
              </motion.button>
            )}

            {/* Real-Time Status Icon */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLiveCrowdClick}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all border border-white/20"
                title={`Canlı İzleme: ${isConnected ? 'Aktif' : 'Kapalı'} - ${crowdData.size} lokasyon`}
              >
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-400" />
                )}
                
                <Activity className={`w-3 h-3 ${isConnected ? 'text-green-400 animate-pulse' : 'text-red-400'}`} />
                
                {crowdData.size > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                    {crowdData.size}
                  </span>
                )}
              </motion.button>
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
            {isAuthenticated && user?.membershipTier && user.membershipTier !== 'free' && (
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
                            {user?.membershipTier && user.membershipTier !== 'free' && (
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
                              const isPremium = user?.membershipTier && user.membershipTier !== 'free';
                              if (!isPremium) {
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
                            {!(user?.membershipTier && user.membershipTier !== 'free') && (
                              <Crown className="w-4 h-4 ml-auto text-amber-500" />
                            )}
                          </button>
                        )}

                        {/* Akıllı Öneriler */}
                        {isAuthenticated && (
                          <button 
                            onClick={() => {
                              const isPremium = user?.membershipTier && user.membershipTier !== 'free';
                              if (!isPremium) {
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
                            {!(user?.membershipTier && user.membershipTier !== 'free') && (
                              <Crown className="w-4 h-4 ml-auto text-amber-500" />
                            )}
                          </button>
                        )}                        {/* Takip Edilenler */}
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

          {/* Mobile Section - Right */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Real-Time Status - Mobile */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-2 py-1 bg-white/20 rounded-lg backdrop-blur-sm"
            >
              {isConnected ? (
                <Activity className="w-4 h-4 text-green-400" />
              ) : (
                <Activity className="w-4 h-4 text-red-400" />
              )}
            </motion.div>

            {/* Theme Toggle - Mobile */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 pt-4 border-t border-white/20 space-y-3"
            >
              {/* User Section */}
              {user ? (
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border-2 border-white/50"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-white/70">
                      {user.premium ? '👑 Premium' : 'Ücretsiz'}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onAuthClick();
                  }}
                  className="w-full p-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-white/90 transition-all"
                >
                  Giriş Yap
                </button>
              )}

              {/* Menu Items Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* ESP32-CAM IoT */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.open('/esp32', '_blank');
                  }}
                  className="flex flex-col items-center gap-2 p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl"
                >
                  <Activity className="w-5 h-5" />
                  <span className="text-xs font-medium">IoT Cam</span>
                </button>

                {/* Camera Features */}
                <div className="flex flex-col items-center gap-2 p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <CameraButton 
                    onPhotoGallery={() => {
                      setIsMobileMenuOpen(false);
                      onPhotoGalleryClick?.();
                    }} 
                    className="w-8 h-8"
                  />
                  <span className="text-xs font-medium">Kamera</span>
                </div>

                {/* AI Assistant */}
                {isAuthenticated && user?.membershipTier && user.membershipTier !== 'free' && onAIClick && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onAIClick();
                    }}
                    className="flex flex-col items-center gap-2 p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl"
                  >
                    <Brain className="w-5 h-5" />
                    <span className="text-xs font-medium">AI Asistan</span>
                  </button>
                )}

                {/* Analytics */}
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onAnalyticsClick();
                    }}
                    className="flex flex-col items-center gap-2 p-3 bg-white/20 hover:bg-white/30 rounded-xl"
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-xs font-medium">Analitik</span>
                  </button>
                )}

                {/* Live Crowd */}
                {onLiveCrowdClick && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLiveCrowdClick();
                    }}
                    className="flex flex-col items-center gap-2 p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl"
                  >
                    <Activity className="w-5 h-5" />
                    <span className="text-xs font-medium">Canlı Takip</span>
                  </button>
                )}

                {/* Map Controls */}
                {onMapControlsClick && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onMapControlsClick();
                    }}
                    className="flex flex-col items-center gap-2 p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"
                  >
                    <MapIcon className="w-5 h-5" />
                    <span className="text-xs font-medium">Harita</span>
                  </button>
                )}
              </div>

              {/* User Actions - Only when logged in */}
              {user && (
                <div className="space-y-2 pt-3 border-t border-white/20">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onProfileClick?.();
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Profilim</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onSettingsClick?.();
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Ayarlar</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-all text-red-300"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Çıkış Yap</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-2 sm:gap-4"
        >
          <div className="text-center">
            <p className="text-xs sm:text-xs text-white/70">Aktif Kullanıcı</p>
            <p className="text-lg sm:text-xl font-bold">{stats.activeUsers.toLocaleString('tr-TR')}</p>
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-xs text-white/70">Toplam Bildirim</p>
            <p className="text-lg sm:text-xl font-bold">{stats.totalReports.toLocaleString('tr-TR')}</p>
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-xs text-white/70">Takip Edilen</p>
            <p className="text-lg sm:text-xl font-bold">{stats.trackedLocations.toLocaleString('tr-TR')}</p>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
