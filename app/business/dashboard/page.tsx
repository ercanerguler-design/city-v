'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Camera, MapPin, Menu as MenuIcon, 
  Settings, LogOut, Users, TrendingUp, Activity,
  Bell, Search, ChevronDown, UserCheck, Megaphone
} from 'lucide-react';
import toast from 'react-hot-toast';
import authStorage from '@/lib/authStorage';
import { useBusinessDashboardStore } from '@/store/businessDashboardStore';
import NotificationsDropdown from '@/components/Business/Dashboard/NotificationsDropdown';
import RemoteAccessPanel from '@/components/Business/RemoteAccess/RemoteAccessPanel';

// Dashboard Sections
import OverviewSection from '@/components/Business/Dashboard/OverviewSection';
import CamerasSection from '@/components/Business/Dashboard/CamerasSection';
import LocationSection from '@/components/Business/Dashboard/LocationSection';
import MenuSection from '@/components/Business/Dashboard/MenuSection';
import PersonelSection from '@/components/Business/Dashboard/PersonelSection';
import AnalyticsSection from '@/components/Business/Dashboard/AnalyticsSection';
import AIAnalyticsSection from '@/components/Business/Dashboard/AIAnalyticsSection';
import ReviewsAndSentiments from '@/components/Business/Dashboard/ReviewsAndSentiments';
import CampaignsSection from '@/components/Business/Dashboard/CampaignsSection';
import SettingsSection from '@/components/Business/Dashboard/SettingsSection';

interface NavItem {
  id: string;
  label: string;
  icon: any;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
  { id: 'cameras', label: 'Kameralar', icon: Camera },
  { id: 'ai-analytics', label: 'AI Analytics', icon: Activity },
  { id: 'reviews', label: 'Duygular', icon: Users },
  { id: 'campaigns', label: 'Kampanyalar', icon: Megaphone }, // Yeni!
  { id: 'location', label: 'Konum Yönetimi', icon: MapPin },
  { id: 'menu', label: 'Menü & Fiyatlar', icon: MenuIcon },
  { id: 'personel', label: 'Personel Yönetimi', icon: UserCheck },
  { id: 'analytics', label: 'Analitik', icon: TrendingUp },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
];

export default function BusinessDashboard() {
  const router = useRouter();
  
  // Zustand Store - persist edilecek veriler (logout'ta silinmez)
  const { 
    businessProfile, 
    businessUser, 
    activeSection,
    setBusinessProfile, 
    setBusinessUser, 
    setActiveSection
  } = useBusinessDashboardStore();
  
  // Geçici UI state'leri (persist edilmeyecek)
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobil için kapalı başlat
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Mobil kontrol
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true); // Desktop'ta sidebar açık
      } else {
        setSidebarOpen(false); // Mobilde kapalı
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auth kontrolü - Basit token kontrolü
  useEffect(() => {
    const loadUserData = async () => {
      console.log('🔐 Dashboard auth check...');
      
      // Token kontrolü - localStorage'dan direkt
      const token = localStorage.getItem('business_token');
      
      console.log('📋 Token check:', { 
        hasToken: !!token, 
        tokenLength: token?.length || 0
      });

      if (!token) {
        console.log('❌ No token found, redirecting to login...');
        router.push('/business/login');
        return;
      }

      try {
        // Database'den user data çek
        console.log('🔄 Fetching user data...');
        const response = await fetch('/api/business/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.log('❌ API call failed, clearing token');
          localStorage.removeItem('business_token');
          router.push('/business/login');
          return;
        }

        const data = await response.json();
        console.log('✅ User data loaded:', {
          email: data.user?.email,
          membership: data.user?.membership_type,
          hasProfile: !!data.profile
        });

        if (data.success) {
          // User data'yı set et (database'den fresh)
          console.log('📊 Çekilen user data:', {
            membership_type: data.user.membership_type,
            campaign_credits: data.user.campaign_credits,
            max_cameras: data.user.max_cameras
          });
          
          setBusinessUser(data.user);
          
          // Profile varsa set et
          if (data.profile) {
            const profileWithUserId = {
              ...data.profile,
              user_id: data.user.id
            };
            setBusinessProfile(profileWithUserId);
          } else {
            // ✅ FIX: Profile yoksa dummy profile oluştur (user_id ile)
            setBusinessProfile({
              user_id: data.user.id,
              business_name: data.user.fullName || 'İşletmem',
              category: 'Genel'
            });
          }
          
          // Kredi bilgisini getir
          console.log('💳 Kredi bilgisi yükleniyor...');
          const creditsResponse = await fetch(`/api/business/credits?userId=${data.user.id}`);
          const creditsData = await creditsResponse.json();
          
          if (creditsData.success) {
            // ❌ YANLIŞ: Zustand callback desteklemiyor!
            // setBusinessUser((prev: any) => ({ ...prev, ... }));
            
            // ✅ DOĞRU: Önce mevcut user'ı al, sonra güncelle
            const currentUser = data.user; // veya get() ile store'dan al
            setBusinessUser({
              ...currentUser,
              campaign_credits: creditsData.credits.current,
              total_campaigns_created: creditsData.credits.totalCampaigns
            });
            console.log('✅ Kredi bilgisi yüklendi:', creditsData.credits.current);
          }
          
          setLoading(false);
        } else {
          throw new Error(data.error || 'User data yüklenemedi');
        }
      } catch (error) {
        console.error('❌ Dashboard auth error:', error);
        localStorage.removeItem('business_token');
        router.push('/business/login');
      }
    };
    
    loadUserData();
  }, [router]);

  // Quick Actions navigation listener
  useEffect(() => {
    const handleNavigation = (e: any) => {
      const section = e.detail;
      setActiveSection(section);
      if (isMobile) setSidebarOpen(false);
    };

    window.addEventListener('navigateToSection', handleNavigation as EventListener);
    return () => window.removeEventListener('navigateToSection', handleNavigation as EventListener);
  }, [isMobile]);

  // Reload user data from database (for updates)
  const reloadUserData = async () => {
    if (!businessUser?.id) return;
    
    try {
      const token = authStorage.getToken();
      if (!token) return;

      console.log('🔄 Reloading user data...');
      const response = await fetch('/api/business/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setBusinessUser(data.user);
        if (data.profile) {
          setBusinessProfile({ ...data.profile, user_id: data.user.id });
        }
        console.log('✅ User data reloaded');
      }
    } catch (error) {
      console.error('❌ Reload error:', error);
    }
  };

  const handleLogout = () => {
    authStorage.clear(); // Sadece token temizlenir
    // NOT: Store'daki profil/konum verileri SİLİNMEZ - tekrar login'de kullanılır
    // Günlük veriler zaten database'de, 23:59'da arşivlenir
    toast.success('Çıkış yapıldı');
    window.location.href = '/business/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`${
          isMobile 
            ? sidebarOpen 
              ? 'translate-x-0' 
              : '-translate-x-full'
            : sidebarOpen 
              ? 'w-64' 
              : 'w-20'
        } ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-64' : 'relative'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CV</span>
              </div>
              <span className="font-bold text-gray-900">CityV Business</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">CV</span>
            </div>
          )}
        </div>

        {/* Professional Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                    : 'text-gray-600 hover:bg-slate-100 hover:text-gray-900 border border-transparent hover:border-gray-200'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'drop-shadow-sm' : 'group-hover:text-blue-500'} transition-colors duration-200`} />
                {(sidebarOpen || isMobile) && (
                  <span className={`font-medium ${isActive ? 'text-white' : ''}`}>
                    {item.label}
                  </span>
                )}
                
                {/* Active Indicator */}
                {isActive && (sidebarOpen || isMobile) && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full shadow-sm" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-3 border-t border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                {businessUser?.fullName?.charAt(0) || 'B'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {businessUser?.fullName || 'Business User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {businessUser?.membership_type === 'enterprise' ? '⭐ ENTERPRISE' : 
                   businessUser?.membership_type === 'premium' ? '💎 PREMIUM' : 
                   '🆓 FREE'}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium mx-auto">
              {businessUser?.fullName?.charAt(0) || 'B'}
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all ${
              sidebarOpen ? '' : 'px-2'
            }`}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Çıkış</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation flex-shrink-0"
              aria-label="Toggle menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
              {navItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            {/* Membership Badge */}
            {businessUser && (() => {
              console.log('🏷️ Rendering membership badge:', businessUser.membership_type);
              return (
                <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                  businessUser.membership_type === 'enterprise' 
                    ? 'bg-purple-100 text-purple-700' 
                    : businessUser.membership_type === 'premium'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {businessUser.membership_type === 'enterprise' ? '⭐' : 
                   businessUser.membership_type === 'premium' ? '💎' : 
                   '🆓'}
                  <span className="hidden sm:inline ml-1">
                    {businessUser.membership_type === 'enterprise' ? 'Enterprise' : 
                     businessUser.membership_type === 'premium' ? 'Premium' : 
                     'Free'}
                  </span>
                  {businessUser.membership_expiry_date && (
                    <span className="ml-1 opacity-70 hidden md:inline">
                      ({new Date(businessUser.membership_expiry_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short' })})
                    </span>
                  )}
                </div>
              );
            })()}

            {/* Notifications */}
            {businessUser && (
              <NotificationsDropdown businessUserId={businessUser.id} />
            )}

            {/* Campaign Credits Badge */}
            {businessUser && (() => {
              console.log('💳 Rendering credits badge:', businessUser.campaign_credits);
              return (
                <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 flex items-center gap-2">
                  <span className="text-amber-600 font-bold text-sm">{businessUser.campaign_credits || 0}</span>
                  <span className="text-xs text-amber-700 font-medium">⭐ Kredi</span>
                </div>
              );
            })()}
            
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="hidden md:block h-8 w-px bg-gray-200"></div>
            <div className="hidden md:block text-sm">
              <p className="text-gray-500">İşletme</p>
              <p className="font-medium text-gray-900">
                {businessProfile ? businessProfile.business_name : businessUser?.fullName || businessUser?.email || 'İşletme'}
              </p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-2 sm:p-3 md:p-6 pb-20 sm:pb-6">
          {/* Remote Access Panel - Always Visible */}
          <RemoteAccessPanel />
          
          {activeSection === 'overview' && <OverviewSection businessProfile={businessProfile} businessUser={businessUser} />}
          {activeSection === 'cameras' && <CamerasSection businessProfile={businessProfile} />}
          {activeSection === 'ai-analytics' && <AIAnalyticsSection businessId={businessUser?.id?.toString() || '6'} />}
          {activeSection === 'reviews' && <ReviewsAndSentiments businessUserId={businessUser?.id} />}
          {activeSection === 'campaigns' && <CampaignsSection businessProfile={businessProfile} />}
          {activeSection === 'location' && <LocationSection businessProfile={businessProfile} />}
          {activeSection === 'menu' && <MenuSection businessProfile={businessProfile} />}
          {activeSection === 'personel' && <PersonelSection businessProfile={businessProfile} />}
          {activeSection === 'analytics' && <AnalyticsSection businessProfile={businessProfile} />}
          {activeSection === 'settings' && <SettingsSection businessProfile={businessProfile} onUpdate={reloadUserData} />}
        </main>

        {/* Footer */}
        <footer className="border-t bg-white py-4 px-6">
          <div className="text-center text-sm text-gray-500">
            <p>City-V 2025 | SCE INNOVATION Her hakkı saklıdır.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
