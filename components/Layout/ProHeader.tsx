'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePremiumStore } from '@/lib/stores/premiumStore';
import { MapPin, User, Crown, Bell, Settings, Brain, Activity, Sparkles, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ui/ThemeToggle';
import CameraButton from '../Camera/CameraButton';
import CampaignNotificationPanel from '@/components/Notifications/CampaignNotificationPanel';

interface ProHeaderProps {
  onAuthClick: () => void;
  onPremiumClick?: () => void;
  onNotificationsClick?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onAIClick?: () => void;
  onPhotoGalleryClick?: () => void;
}

/**
 * 🎨 Ultra-Professional City-V Header
 * 
 * - Glassmorphism Design
 * - Smooth Animations
 * - Real-time Campaign Notifications
 * - Live Crowd Badges
 * - Responsive Mobile Menu
 * 
 * @author City-V Team
 * @version 2.0.0 - Lansman Edition
 */

export default function ProHeader({
  onAuthClick,
  onPremiumClick,
  onNotificationsClick,
  onProfileClick,
  onSettingsClick,
  onAIClick,
  onPhotoGalleryClick,
}: ProHeaderProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { checkSubscriptionStatus } = usePremiumStore();
  const isPremium = checkSubscriptionStatus();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [campaignNotifications, setCampaignNotifications] = useState<any[]>([]);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [lastShownCampaignId, setLastShownCampaignId] = useState<string | null>(null);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [currentNotificationCampaign, setCurrentNotificationCampaign] = useState<any>(null);

  // Chrome Push Notification sistemi
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if ('Notification' in window && 'serviceWorker' in navigator) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('🔔 Notification permission granted');
        }
      }
    };
    requestNotificationPermission();
  }, []);

  // Gerçek kampanyaları API'den çek (sadece CityV anasayfası için)
  useEffect(() => {
    const loadActiveCampaigns = async () => {
      try {
        console.log('🔄 [CAMPAIGN CHECK]', new Date().toLocaleTimeString());
        const response = await fetch('/api/campaigns/active');
        const data = await response.json();
        
        console.log('📊 Kampanya yanıtı:', {
          success: data.success,
          count: data.campaigns?.length || 0,
          campaigns: data.campaigns,
          lastShownId: lastShownCampaignId
        });
        
        if (data.success && data.campaigns.length > 0) {
          setCampaignNotifications(data.campaigns);
          
          // Yeni bir kampanya varsa popup ve Chrome notification göster
          const latestCampaign = data.campaigns[0];
          const campaignId = String(latestCampaign.id || latestCampaign.campaign_id);
          
          console.log('🎯 Latest campaign ID:', campaignId, 'Last shown:', lastShownCampaignId);
          
          if (campaignId && campaignId !== String(lastShownCampaignId)) {
            console.log('🎉 YENİ KAMPANYA TESPİT EDİLDİ! Bildirim gösteriliyor...');
            setShowNotificationPopup(true);
            setLastShownCampaignId(String(campaignId));
            setTimeout(() => setShowNotificationPopup(false), 5000);
            
            // Sağdan Kayan Panel
            setCurrentNotificationCampaign({
              id: campaignId,
              title: latestCampaign.title,
              description: latestCampaign.description,
              businessName: latestCampaign.businessName,
              discountPercent: latestCampaign.discount_percent || latestCampaign.value,
              discountAmount: latestCampaign.discount_amount,
              validUntil: latestCampaign.valid_until,
              location: latestCampaign.location
            });
            setShowNotificationPanel(true);

            // Chrome Desktop Notification + Sesli Bildirim
            if ('Notification' in window && Notification.permission === 'granted') {
              // Sesli bildirim çal
              try {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYHGmm98OScTgwOUKrj8LZjHAU5k9nyz3ksBSR3yPDdkUELFF60+...');
                audio.volume = 0.5;
                audio.play().catch(e => console.log('🔇 Audio play failed:', e));
              } catch (e) {
                console.log('🔇 Audio creation failed:', e);
              }
              
              const notification = new Notification('🎉 ' + latestCampaign.title, {
                body: latestCampaign.description,
                icon: '/icon-192x192.png',
                badge: '/icon-72x72.png',
                tag: 'campaign-' + campaignId,
                requireInteraction: false,
                silent: false, // Native notification sesi
                data: {
                  campaignId: campaignId,
                  businessId: latestCampaign.businessId,
                  businessName: latestCampaign.businessName
                }
              });
              
              notification.onclick = () => {
                window.focus();
                notification.close();
                // Panel aç
                setShowNotificationPanel(true);
              };
            }
          }
        }
      } catch (error) {
        console.error('Kampanyalar yüklenemedi:', error);
      }
    };

    // İlk yükleme
    loadActiveCampaigns();
    
    // Her 10 saniyede bir güncelle (yeni kampanyalar için)
    const interval = setInterval(loadActiveCampaigns, 10 * 1000);
    
    // ✅ Kampanya oluşturulduğunda hemen fetch et
    const handleCampaignCreated = () => {
      console.log('🎉 Yeni kampanya oluşturuldu! Fetch ediliyor...');
      loadActiveCampaigns();
    };
    
    window.addEventListener('campaignCreated', handleCampaignCreated);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('campaignCreated', handleCampaignCreated);
    };
  }, [lastShownCampaignId]);

  // Listen for crowd updates
  const [crowdUpdates, setCrowdUpdates] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    const handleCrowdUpdate = (event: any) => {
      const data = event.detail;
      setCrowdUpdates(prev => new Map(prev).set(data.locationId, data));
    };

    window.addEventListener('cityv:crowd-update', handleCrowdUpdate);
    
    return () => {
      window.removeEventListener('cityv:crowd-update', handleCrowdUpdate);
    };
  }, []);

  return (
    <>
      {/* Campaign Notification Popup */}
      <AnimatePresence>
        {showNotificationPopup && campaignNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            className="fixed top-24 right-4 z-[9999] max-w-md"
          >
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl p-6 shadow-2xl border border-white/20 backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1">🎉 Yeni Kampanya!</h4>
                  <p className="text-sm text-white/90 mb-2">
                    {campaignNotifications[0]?.businessName}
                  </p>
                  <p className="font-semibold text-base mb-1">
                    {campaignNotifications[0]?.title}
                  </p>
                  <p className="text-sm text-white/80">
                    {campaignNotifications[0]?.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                      %{campaignNotifications[0]?.value} İndirim
                    </span>
                    <button
                      onClick={() => setShowNotificationPopup(false)}
                      className="ml-auto text-white/60 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 backdrop-blur-xl border-b border-white/10 shadow-2xl"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-pink-300 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 py-4 relative z-10">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => window.location.href = '/'}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white blur-xl opacity-50 rounded-2xl" />
                <div className="relative p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-100">
                    City-V
                  </h1>
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900 text-xs font-black rounded-full shadow-lg"
                  >
                    PRO
                  </motion.span>
                </div>
                <p className="text-xs text-white/80 font-medium hidden sm:block">
                  Akıllı Şehir Yoğunluk Platformu
                </p>
              </div>
            </motion.div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Transport Demo - Herkes için açık */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open('/transport', '_blank')}
                className="group relative px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/20 transition-all shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-300 group-hover:animate-pulse" />
                  <span className="font-semibold text-sm">Transport Demo</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full" />
              </motion.button>

              {/* Business Demo - Herkes için açık, business-box/demo sayfasına yönlendirme */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open('/business-box/demo', '_blank')}
                className="group relative px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/20 transition-all shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-300 group-hover:animate-pulse" />
                  <span className="font-semibold text-sm">Business Demo</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full" />
              </motion.button>

              {/* CityV Demo - Herkes için açık, cityvdemo sayfasına yönlendirme */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open('/cityvdemo', '_blank')}
                className="group relative px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/20 transition-all shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-300 group-hover:animate-pulse" />
                  <span className="font-semibold text-sm">CityV Demo</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-ping" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full" />
              </motion.button>

              {/* Theme Toggle */}
              <div className="p-0.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <ThemeToggle />
              </div>

              {/* Camera Button */}
              <div className="relative">
                <CameraButton onPhotoGallery={onPhotoGalleryClick} />
              </div>

              {/* AI Assistant (Premium) */}
              {isAuthenticated && user?.isPremium && onAIClick && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onAIClick}
                  className="group relative px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 backdrop-blur-md rounded-xl shadow-lg border border-white/30 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="relative flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    <span className="font-bold text-sm">AI Asistan</span>
                  </div>
                </motion.button>
              )}

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNotificationsClick}
                className="relative p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/20 transition-all"
              >
                <Bell className="w-5 h-5" />
                {campaignNotifications.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {campaignNotifications.length}
                  </motion.span>
                )}
              </motion.button>

              {/* User Menu */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/20 transition-all"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full border-2 border-white/30"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center border-2 border-white/30">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="hidden xl:block text-left">
                      <p className="text-sm font-bold leading-none">{user.name}</p>
                      {user.membershipTier && user.membershipTier !== 'free' && (
                        <p className="text-xs text-yellow-300 flex items-center gap-1 mt-0.5">
                          <Crown className="w-3 h-3" />
                          Premium
                        </p>
                      )}
                    </div>
                  </motion.button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                          <p className="font-bold text-lg">{user.name}</p>
                          <p className="text-sm text-white/80">{user.email}</p>
                          {user.membershipTier && user.membershipTier !== 'free' && (
                            <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg w-fit">
                              <Crown className="w-4 h-4 text-yellow-300" />
                              <span className="text-sm font-semibold">Premium Üye</span>
                            </div>
                          )}
                        </div>

                        <div className="p-2">
                          <button
                            onClick={() => {
                              onProfileClick?.();
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                          >
                            <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            <span className="font-medium text-gray-900 dark:text-white">Profilim</span>
                          </button>

                          <button
                            onClick={() => {
                              onSettingsClick?.();
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                          >
                            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            <span className="font-medium text-gray-900 dark:text-white">Ayarlar</span>
                          </button>

                          {(!user.membershipTier || user.membershipTier === 'free') && onPremiumClick && (
                            <button
                              onClick={() => {
                                onPremiumClick();
                                setShowUserMenu(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all mt-2"
                            >
                              <Crown className="w-5 h-5" />
                              <span className="font-bold">Premium'a Geç</span>
                            </button>
                          )}

                          <hr className="my-2 border-gray-200 dark:border-gray-700" />

                          <button
                            onClick={() => {
                              logout();
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left text-red-600 dark:text-red-400"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="font-medium">Çıkış Yap</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onAuthClick}
                  className="px-6 py-2.5 bg-white text-purple-600 hover:bg-white/90 font-bold rounded-xl shadow-lg transition-all"
                >
                  Giriş Yap
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-white/10 bg-white/5 backdrop-blur-xl"
            >
              <div className="container mx-auto px-4 py-4 space-y-2">
                {/* Demo Buttons - Herkes için görünür */}
                <div className="space-y-2 pb-4 border-b border-white/10">
                  <button 
                    onClick={() => {
                      window.open('/transport', '_blank');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl text-left font-medium transition-all flex items-center gap-2"
                  >
                    <Activity className="w-5 h-5 text-blue-300" />
                    <span>Transport Demo</span>
                  </button>
                  <button 
                    onClick={() => {
                      window.open('/business-box/demo', '_blank');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl text-left font-medium transition-all flex items-center gap-2"
                  >
                    <Activity className="w-5 h-5 text-emerald-300" />
                    <span>Business Demo</span>
                  </button>
                  <button 
                    onClick={() => {
                      window.open('/cityvdemo', '_blank');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl text-left font-medium transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5 text-purple-300" />
                    <span>CityV Demo</span>
                  </button>
                </div>

                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl border border-white/20">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border-2 border-white/30" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center border-2 border-white/30">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold">{user.name}</p>
                        <p className="text-sm text-white/80">{user.email}</p>
                      </div>
                    </div>

                    <button onClick={onProfileClick} className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-left font-medium transition-all">
                      Profilim
                    </button>
                    <button onClick={onSettingsClick} className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-left font-medium transition-all">
                      Ayarlar
                    </button>
                    <button onClick={logout} className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-left font-medium text-red-300 transition-all">
                      Çıkış Yap
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onAuthClick}
                    className="w-full px-4 py-3 bg-white text-purple-600 hover:bg-white/90 font-bold rounded-xl transition-all"
                  >
                    Giriş Yap
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Sağdan Kayan Bildirim Paneli */}
      {currentNotificationCampaign && (
        <CampaignNotificationPanel
          show={showNotificationPanel}
          onClose={() => setShowNotificationPanel(false)}
          campaign={currentNotificationCampaign}
        />
      )}
    </>
  );
}
