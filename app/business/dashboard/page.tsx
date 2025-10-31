'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Camera, MapPin, Menu as MenuIcon, 
  Settings, LogOut, Users, TrendingUp, Activity,
  Bell, Search, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

// Dashboard Sections
import OverviewSection from '@/components/Business/Dashboard/OverviewSection';
import CamerasSection from '@/components/Business/Dashboard/CamerasSection';
import LocationSection from '@/components/Business/Dashboard/LocationSection';
import MenuSection from '@/components/Business/Dashboard/MenuSection';
import AnalyticsSection from '@/components/Business/Dashboard/AnalyticsSection';
import SettingsSection from '@/components/Business/Dashboard/SettingsSection';

interface NavItem {
  id: string;
  label: string;
  icon: any;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
  { id: 'cameras', label: 'Kameralar', icon: Camera },
  { id: 'location', label: 'Konum Yönetimi', icon: MapPin },
  { id: 'menu', label: 'Menü & Fiyatlar', icon: MenuIcon },
  { id: 'analytics', label: 'Analitik', icon: TrendingUp },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
];

export default function BusinessDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobil için kapalı başlat
  const [businessUser, setBusinessUser] = useState<any>(null);
  const [businessProfile, setBusinessProfile] = useState<any>(null);
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

  // Auth kontrolü
  useEffect(() => {
    const token = localStorage.getItem('business_token');
    const userStr = localStorage.getItem('business_user');

    if (!token || !userStr) {
      router.push('/business/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setBusinessUser(user);
      loadBusinessProfile(user.id);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/business/login');
    }
  }, [router]);

  const loadBusinessProfile = async (userId: number) => {
    try {
      // Business profili getir - businessId olarak userId'yi kullan
      console.log('🔍 Profile yükleniyor, userId:', userId);
      const response = await fetch(`/api/business/profile?businessId=${userId}`);
      const data = await response.json();

      console.log('📋 Profile yanıtı:', data);

      if (data.success) {
        // Profile'a user_id de ekleyelim (LocationSection için)
        const profileWithUserId = {
          ...data.profile,
          user_id: userId
        };
        setBusinessProfile(profileWithUserId);
        console.log('✅ Profile yüklendi:', profileWithUserId);
      } else {
        console.error('❌ Profile yüklenemedi:', data.error);
      }
    } catch (error) {
      console.error('❌ Profile loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('business_token');
    localStorage.removeItem('business_user');
    toast.success('Çıkış yapıldı');
    router.push('/business/login');
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

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  if (isMobile) setSidebarOpen(false); // Mobilde section değişince sidebar'ı kapat
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {(sidebarOpen || isMobile) && <span>{item.label}</span>}
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
                  {businessUser?.planType?.toUpperCase() || 'Premium'}
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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">
              {navItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="hidden md:block h-8 w-px bg-gray-200"></div>
            <div className="hidden md:block text-sm">
              <p className="text-gray-500">İşletme</p>
              <p className="font-medium text-gray-900">{businessProfile?.business_name || 'Yükleniyor...'}</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-3 md:p-6">
          {activeSection === 'overview' && <OverviewSection businessProfile={businessProfile} />}
          {activeSection === 'cameras' && <CamerasSection businessProfile={businessProfile} />}
          {activeSection === 'location' && <LocationSection businessProfile={businessProfile} />}
          {activeSection === 'menu' && <MenuSection businessProfile={businessProfile} />}
          {activeSection === 'analytics' && <AnalyticsSection businessProfile={businessProfile} />}
          {activeSection === 'settings' && <SettingsSection businessProfile={businessProfile} onUpdate={() => loadBusinessProfile(businessUser.id)} />}
        </main>
      </div>
    </div>
  );
}
