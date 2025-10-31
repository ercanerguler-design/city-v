'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChartBarIcon, 
  CameraIcon, 
  UsersIcon, 
  UserIcon,
  FireIcon,
  BoltIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  Cog6ToothIcon,
  HomeIcon,
  UserGroupIcon,
  BellIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CalendarDaysIcon,
  ChartPieIcon,
  MegaphoneIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import BusinessLiveCrowd from './BusinessLiveCrowd';

interface Business {
  id: string;
  name: string;
  email: string;
  type: string;
  location: string;
}

interface BusinessProfessionalDashboardProps {
  business: Business;
}

export default function BusinessProfessionalDashboard({ business }: BusinessProfessionalDashboardProps) {
  const [activeTab, setActiveTab] = useState('analytics');
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');
  
  // Profil güncelleme state'leri
  const [companyName, setCompanyName] = useState(business.name);
  const [profileUpdateStatus, setProfileUpdateStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Çeviri metinleri
  const texts = {
    tr: {
      // Header
      welcome: 'Hoş Geldiniz',
      professionalDashboard: 'Profesyonel Dashboard',
      businessType: 'İşletme',
      
      // Stats
      todayVisitors: 'Bugünkü Ziyaretçiler',
      weeklyGrowth: 'Haftalık Büyüme',
      currentOccupancy: 'Mevcut Doluluk',
      avgStayTime: 'Ort. Kalış Süresi',
      totalRevenue: 'Toplam Gelir',
      activeCampaigns: 'Aktif Kampanyalar',
      staffOnDuty: 'Görevdeki Personel',
      customerSatisfaction: 'Müşteri Memnuniyeti',
      
      // Tabs
      analytics: 'Analytics',
      liveCamera: 'Live Camera',
      staffManagement: 'Staff Management',
      campaigns: 'Campaigns',
      reports: 'Reports',
      profileSettings: 'Profile Settings',
      systemSettings: 'System Settings',
      
      // Analytics
      entryExitAnalysis: 'Giriş/Çıkış Analizi',
      ageDemographics: 'Yaş Demografisi',
      hourlyTraffic: 'Saatlik Trafik',
      peakHours: 'Yoğun Saatler',
      averageAge: 'Ortalama Yaş',
      
      // Staff Management
      addNewStaff: 'Yeni Personel Ekle',
      editStaff: 'Personeli Düzenle',
      staffName: 'Personel Adı',
      position: 'Pozisyon',
      department: 'Departman',
      shift: 'Vardiya',
      status: 'Durum',
      active: 'Aktif',
      inactive: 'Pasif',
      
      // Campaigns
      createCampaign: 'Kampanya Oluştur',
      campaignTitle: 'Kampanya Başlığı',
      campaignDescription: 'Kampanya Açıklaması',
      discountPercentage: 'İndirim Yüzdesi',
      validUntil: 'Geçerlilik Tarihi',
      sendGlobalNotification: 'Global Bildirim Gönder',
      
      // Profile Settings
      companyInformation: 'Şirket Bilgileri',
      companyName: 'Şirket Adı',
      taxNumber: 'Vergi Numarası',
      taxOffice: 'Vergi Dairesi',
      contactInformation: 'İletişim Bilgileri',
      contactPerson: 'İletişim Kişisi',
      phone: 'Telefon',
      email: 'E-posta',
      subscriptionPlan: 'Abonelik Planı',
      preferences: 'Tercihler',
      language: 'Dil',
      timezone: 'Saat Dilimi',
      dateFormat: 'Tarih Formatı',
      saveChanges: 'Değişiklikleri Kaydet',
      
      // System Settings
      systemConfiguration: 'Sistem Konfigürasyonu',
      detectionSettings: 'Algılama Ayarları',
      sensitivityLevel: 'Hassasiyet Seviyesi',
      analysisInterval: 'Analiz Aralığı',
      notificationSettings: 'Bildirim Ayarları',
      crowdAlerts: 'Kalabalık Uyarıları',
      campaignNotifications: 'Kampanya Bildirimleri',
      staffNotifications: 'Personel Bildirimleri',
      dailyReports: 'Günlük Raporlar',
      
      // Common
      save: 'Kaydet',
      cancel: 'İptal',
      edit: 'Düzenle',
      delete: 'Sil',
      add: 'Ekle',
      update: 'Güncelle',
      close: 'Kapat',
      loading: 'Yükleniyor...',
      success: 'Başarılı',
      error: 'Hata',
      high: 'Yüksek',
      medium: 'Orta',
      low: 'Düşük'
    },
    en: {
      // Header
      welcome: 'Welcome',
      professionalDashboard: 'Professional Dashboard',
      businessType: 'Business',
      
      // Stats
      todayVisitors: 'Today\'s Visitors',
      weeklyGrowth: 'Weekly Growth',
      currentOccupancy: 'Current Occupancy',
      avgStayTime: 'Avg. Stay Time',
      totalRevenue: 'Total Revenue',
      activeCampaigns: 'Active Campaigns',
      staffOnDuty: 'Staff on Duty',
      customerSatisfaction: 'Customer Satisfaction',
      
      // Tabs
      analytics: 'Analytics',
      liveCamera: 'Live Camera',
      staffManagement: 'Staff Management',
      campaigns: 'Campaigns',
      reports: 'Reports',
      profileSettings: 'Profile Settings',
      systemSettings: 'System Settings',
      
      // Analytics
      entryExitAnalysis: 'Entry/Exit Analysis',
      ageDemographics: 'Age Demographics',
      hourlyTraffic: 'Hourly Traffic',
      peakHours: 'Peak Hours',
      averageAge: 'Average Age',
      
      // Staff Management
      addNewStaff: 'Add New Staff',
      editStaff: 'Edit Staff',
      staffName: 'Staff Name',
      position: 'Position',
      department: 'Department',
      shift: 'Shift',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      
      // Campaigns
      createCampaign: 'Create Campaign',
      campaignTitle: 'Campaign Title',
      campaignDescription: 'Campaign Description',
      discountPercentage: 'Discount Percentage',
      validUntil: 'Valid Until',
      sendGlobalNotification: 'Send Global Notification',
      
      // Profile Settings
      companyInformation: 'Company Information',
      companyName: 'Company Name',
      taxNumber: 'Tax Number',
      taxOffice: 'Tax Office',
      contactInformation: 'Contact Information',
      contactPerson: 'Contact Person',
      phone: 'Phone',
      email: 'Email',
      subscriptionPlan: 'Subscription Plan',
      preferences: 'Preferences',
      language: 'Language',
      timezone: 'Timezone',
      dateFormat: 'Date Format',
      saveChanges: 'Save Changes',
      
      // System Settings
      systemConfiguration: 'System Configuration',
      detectionSettings: 'Detection Settings',
      sensitivityLevel: 'Sensitivity Level',
      analysisInterval: 'Analysis Interval',
      notificationSettings: 'Notification Settings',
      crowdAlerts: 'Crowd alerts',
      campaignNotifications: 'Campaign notifications',
      staffNotifications: 'Staff notifications',
      dailyReports: 'Daily reports',
      
      // Common
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      add: 'Add',
      update: 'Update',
      close: 'Close',
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    }
  };

  const t = texts[language];
  
  // Gerçek zamanlı veriler
  const [realTimeData, setRealTimeData] = useState({
    currentCrowd: 0,
    avgDensity: 0,
    totalDetections: 0,
    systemStatus: 'active',
    lastUpdate: new Date(),
    entryCount: 0,
    exitCount: 0,
    avgAge: 0,
    peakHour: '14:00',
    activeStaff: 0,
    activeCampaigns: 0
  });

  // Personel listesi - Gerçek verilerden yüklenecek
  const [staff, setStaff] = useState([]);

  // Kampanyalar
  const [campaigns, setCampaigns] = useState([
    { id: 1, title: 'Yaz İndirimi', content: '%30 indirim tüm ürünlerde!', status: 'active', sent: 245, opened: 156 },
    { id: 2, title: 'Yoğunluk Uyarısı', content: 'Dükkan yoğun, alternatif saatleri deneyin', status: 'sent', sent: 89, opened: 67 }
  ]);

  // Saatlik yoğunluk verileri
  const hourlyData = [
    { hour: '09:00', count: 12, density: 2.1 },
    { hour: '10:00', count: 18, density: 3.2 },
    { hour: '11:00', count: 25, density: 4.5 },
    { hour: '12:00', count: 32, density: 5.8 },
    { hour: '13:00', count: 41, density: 7.2 },
    { hour: '14:00', count: 55, density: 8.9 },
    { hour: '15:00', count: 48, density: 7.8 },
    { hour: '16:00', count: 39, density: 6.5 },
    { hour: '17:00', count: 28, density: 4.9 },
    { hour: '18:00', count: 35, density: 6.1 }
  ];

  const router = useRouter();

  // Gerçek zamanlı veri simülasyonu - geliştirilmiş
  useEffect(() => {
    const interval = setInterval(() => {
      const currentHour = new Date().getHours();
      const baseMultiplier = currentHour >= 12 && currentHour <= 18 ? 1.5 : 1;
      
      setRealTimeData(prev => ({
        currentCrowd: Math.floor((Math.random() * 25 + 5) * baseMultiplier),
        avgDensity: Number(((Math.random() * 8 + 1) * baseMultiplier).toFixed(1)),
        totalDetections: prev.totalDetections + Math.floor(Math.random() * 3),
        systemStatus: 'active',
        lastUpdate: new Date(),
        entryCount: prev.entryCount + Math.floor(Math.random() * 2),
        exitCount: prev.exitCount + Math.floor(Math.random() * 2),
        avgAge: Math.floor(Math.random() * 20 + 25),
        peakHour: '14:00',
        activeStaff: staff.filter(s => s.status === 'active').length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [staff, campaigns]);

  const navigateToHome = () => {
    router.push('/');
  };

  // Profil güncelleme fonksiyonu
  const handleSaveProfile = async () => {
    if (!companyName.trim()) {
      setProfileUpdateStatus('error');
      alert('Firma adı boş olamaz!');
      return;
    }

    setProfileUpdateStatus('saving');
    
    try {
      // Profil güncelleme API çağrısı (simüle edilmiş)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Başarılı güncelleme
      business.name = companyName.trim();
      setProfileUpdateStatus('success');
      alert('Profil başarıyla güncellendi!');
      
      // Success durumunu 2 saniye sonra idle'a çevir
      setTimeout(() => {
        setProfileUpdateStatus('idle');
      }, 2000);
      
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      setProfileUpdateStatus('error');
      alert('Profil güncellenirken bir hata oluştu!');
      
      // Error durumunu 3 saniye sonra idle'a çevir
      setTimeout(() => {
        setProfileUpdateStatus('idle');
      }, 3000);
    }
  };

  // Enterprise üyeliğe geçiş fonksiyonu
  const handleUpgradeToEnterprise = () => {
    // Beta başvuru formuna yönlendir
    window.open('https://forms.gle/CityVEnterpriseBeta2024', '_blank');
    alert('CityV Enterprise Beta başvuru formuna yönlendiriliyorsunuz...');
  };

  const stats = [
    { 
      name: language === 'tr' ? 'Mevcut Kalabalık' : 'Current Crowd',
      value: realTimeData.currentCrowd, 
      icon: UsersIcon, 
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      unit: language === 'tr' ? 'kişi' : 'people'
    },
    { 
      name: language === 'tr' ? 'Bugün Giren' : 'Entry Today',
      value: realTimeData.entryCount, 
      icon: ArrowRightIcon, 
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      unit: language === 'tr' ? 'giriş' : 'entered'
    },
    { 
      name: language === 'tr' ? 'Bugün Çıkan' : 'Exit Today',
      value: realTimeData.exitCount, 
      icon: ArrowLeftIcon, 
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      unit: language === 'tr' ? 'çıkış' : 'exited'
    },
    { 
      name: language === 'tr' ? 'Ortalama Yaş' : 'Avg Age',
      value: realTimeData.avgAge, 
      icon: UserGroupIcon, 
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      unit: language === 'tr' ? 'yaş' : 'years'
    },
    { 
      name: language === 'tr' ? 'Yoğun Saat' : 'Peak Hour',
      value: realTimeData.peakHour, 
      icon: ClockIcon, 
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      unit: language === 'tr' ? 'saat' : 'time'
    },
    { 
      name: language === 'tr' ? 'Aktif Personel' : 'Active Staff',
      value: realTimeData.activeStaff, 
      icon: UserGroupIcon, 
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      unit: language === 'tr' ? 'çalışan' : 'working'
    },
    { 
      name: language === 'tr' ? 'Kampanyalar' : 'Campaigns',
      value: realTimeData.activeCampaigns, 
      icon: MegaphoneIcon, 
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      unit: language === 'tr' ? 'aktif' : 'active'
    },
    { 
      name: language === 'tr' ? 'Sistem Durumu' : 'System Status',
      value: language === 'tr' ? 'AKTİF' : 'ACTIVE',
      icon: ShieldCheckIcon, 
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      unit: language === 'tr' ? 'çevrimiçi' : 'online'
    }
  ];

  const tabs = [
    { id: 'analytics', name: t.analytics, icon: ChartBarIcon },
    { id: 'monitoring', name: t.liveCamera, icon: CameraIcon },
    { id: 'staff', name: t.staffManagement, icon: UserGroupIcon },
    { id: 'campaigns', name: t.campaigns, icon: MegaphoneIcon },
    { id: 'reports', name: t.reports, icon: ChartPieIcon },
    { id: 'profile', name: t.profileSettings, icon: UserIcon },
    { id: 'settings', name: t.systemSettings, icon: Cog6ToothIcon }
  ];

  // Personel ekleme fonksiyonu
  const addStaff = (staffData: any) => {
    const newStaff = {
      id: Date.now(),
      ...staffData,
      status: 'active'
    };
    setStaff([...staff, newStaff]);
    setShowAddStaff(false);
  };

  // Kampanya ekleme fonksiyonu
  const addCampaign = (campaignData: any) => {
    const newCampaign = {
      id: Date.now(),
      ...campaignData,
      status: 'active',
      sent: 0,
      opened: 0
    };
    setCampaigns([...campaigns, newCampaign]);
    setShowAddCampaign(false);
    // Push notification gönder
    sendPushNotification(campaignData.title, campaignData.content);
  };

  // Push notification gönderme
  const sendPushNotification = (title: string, content: string) => {
    // Simüle edilmiş push notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`CityV Business: ${title}`, {
        body: content,
        icon: '/favicon.ico'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <BoltIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{t.welcome} - {t.professionalDashboard}</h1>
                  <p className="text-blue-200 text-sm">{business.name} {t.businessType}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live</span>
              </div>

              {/* Language Toggle */}
              <div className="flex bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('tr')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    language === 'tr' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  TR
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    language === 'en' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>
              
              <button
                onClick={navigateToHome}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
              >
                <HomeIcon className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">Go to CityV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-xs font-medium uppercase tracking-wide">{stat.name}</p>
                    <p className="text-xl font-bold text-white mt-1">
                      {typeof stat.value === 'string' ? stat.value : stat.value}
                      <span className="text-xs font-normal text-gray-400 ml-1">{stat.unit}</span>
                    </p>
                  </div>
                  <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
          <div className="border-b border-white/10">
            <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">Real-Time Analytics Dashboard</h3>
                
                {/* Giren/Çıkan Analizi */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/5 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4 flex items-center">
                      <ArrowRightIcon className="w-5 h-5 text-green-400 mr-2" />
                      Entry/Exit Analysis
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                        <span className="text-gray-300">Today's Entries</span>
                        <span className="text-green-400 font-bold text-lg">{realTimeData.entryCount}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg">
                        <span className="text-gray-300">Today's Exits</span>
                        <span className="text-red-400 font-bold text-lg">{realTimeData.exitCount}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                        <span className="text-gray-300">Current Inside</span>
                        <span className="text-blue-400 font-bold text-lg">{realTimeData.entryCount - realTimeData.exitCount}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4 flex items-center">
                      <UserGroupIcon className="w-5 h-5 text-purple-400 mr-2" />
                      Age Demographics
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Average Age Today</span>
                        <span className="text-purple-400 font-bold text-lg">{realTimeData.avgAge} years</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">18-25</span>
                          <span className="text-blue-400">25%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '25%'}}></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">26-40</span>
                          <span className="text-green-400">45%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '45%'}}></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">40+</span>
                          <span className="text-orange-400">30%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{width: '30%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Saatlik Yoğunluk Analizi */}
                <div className="bg-white/5 rounded-lg p-6">
                  <h4 className="text-white font-medium mb-4 flex items-center">
                    <ClockIcon className="w-5 h-5 text-orange-400 mr-2" />
                    Hourly Traffic Analysis
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {hourlyData.map((hour, index) => (
                      <div key={index} className="text-center">
                        <div className="bg-gray-700 rounded-lg p-3 mb-2">
                          <div className="text-xs text-gray-400 mb-1">{hour.hour}</div>
                          <div className="text-white font-bold">{hour.count}</div>
                          <div className="text-xs text-orange-400">Density: {hour.density}</div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${(hour.density / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* LIVE CAMERA TAB */}
            {activeTab === 'monitoring' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">{language === 'tr' ? 'Canlı Kamera İzleme' : 'Live Camera Monitoring'}</h3>
                
                {/* ESP32-CAM Control Panel */}
                <div className="mb-6 bg-white/5 rounded-lg p-6">
                  <h4 className="text-white font-medium mb-4 flex items-center">
                    <CameraIcon className="w-5 h-5 text-blue-400 mr-2" />
                    {language === 'tr' ? 'ESP32-CAM Kontrol Paneli' : 'ESP32-CAM Control Panel'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">{language === 'tr' ? 'Durum' : 'Status'}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-400 text-sm font-medium">{language === 'tr' ? 'Aktif' : 'Active'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">{language === 'tr' ? 'IP Adresi' : 'IP Address'}</span>
                        <span className="text-white text-sm font-mono">192.168.1.2</span>
                      </div>
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">{language === 'tr' ? 'FPS' : 'FPS'}</span>
                        <span className="text-blue-400 text-sm font-bold">20</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/esp32/control', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'get-status', esp32_ip: '192.168.1.2' })
                          });
                          const result = await response.json();
                          alert(language === 'tr' ? 
                            `ESP32 Durumu: ${result.success ? 'Başarılı' : 'Hata'}` : 
                            `ESP32 Status: ${result.success ? 'Success' : 'Error'}`
                          );
                        } catch (error) {
                          alert(language === 'tr' ? 'ESP32-CAM bağlantı hatası!' : 'ESP32-CAM connection error!');
                        }
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      <CheckCircleIcon className="w-4 h-4 text-white" />
                      <span className="text-white text-sm">{language === 'tr' ? 'Durumu Kontrol Et' : 'Check Status'}</span>
                    </button>
                    
                    <button 
                      onClick={async () => {
                        if (confirm(language === 'tr' ? 
                          'ESP32-CAM WiFi ayarları sıfırlanacak. Devam etmek istiyor musunuz?' : 
                          'ESP32-CAM WiFi settings will be reset. Do you want to continue?'
                        )) {
                          try {
                            const response = await fetch('/api/esp32/control', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'reset-wifi', esp32_ip: '192.168.1.2' })
                            });
                            const result = await response.json();
                            alert(language === 'tr' ? 
                              'WiFi sıfırlama komutu gönderildi. Cihaz yeniden başlayacak.' : 
                              'WiFi reset command sent. Device will restart.'
                            );
                          } catch (error) {
                            alert(language === 'tr' ? 'WiFi sıfırlama hatası!' : 'WiFi reset error!');
                          }
                        }
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                      <ExclamationTriangleIcon className="w-4 h-4 text-white" />
                      <span className="text-white text-sm">{language === 'tr' ? 'WiFi Sıfırla' : 'Reset WiFi'}</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        window.open('http://192.168.1.2/stream', '_blank');
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                    >
                      <CameraIcon className="w-4 h-4 text-white" />
                      <span className="text-white text-sm">{language === 'tr' ? 'Canlı Stream' : 'Live Stream'}</span>
                    </button>
                  </div>
                </div>
                
                <BusinessLiveCrowd 
                  locationId="main-location"
                  businessName={business.name}
                  cameraIp="192.168.1.2"
                  maxCapacity={50}
                />
              </div>
            )}

            {/* STAFF MANAGEMENT TAB */}
            {activeTab === 'staff' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-white">Staff Management</h3>
                  <button
                    onClick={() => setShowAddStaff(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                  >
                    <PlusIcon className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">Add Staff</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {staff.map((member) => (
                    <div key={member.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-white font-medium">{member.name}</h4>
                          <p className="text-gray-400 text-sm">{member.role}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {member.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-300">{member.shift}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="text-gray-300">{member.phone}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <button className="flex-1 px-3 py-1 bg-blue-600/20 text-blue-400 text-xs rounded hover:bg-blue-600/30 transition-colors">
                          <PencilIcon className="w-3 h-3 inline mr-1" />
                          Edit
                        </button>
                        <button className="flex-1 px-3 py-1 bg-red-600/20 text-red-400 text-xs rounded hover:bg-red-600/30 transition-colors">
                          <TrashIcon className="w-3 h-3 inline mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Staff Modal */}
                {showAddStaff && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
                      <h3 className="text-lg font-semibold text-white mb-4">Add New Staff Member</h3>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target as HTMLFormElement);
                        addStaff({
                          name: formData.get('name'),
                          role: formData.get('role'),
                          shift: formData.get('shift'),
                          phone: formData.get('phone')
                        });
                      }}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">Name</label>
                            <input name="name" required className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm" />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">Role</label>
                            <select name="role" required className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm">
                              <option value="">Select Role</option>
                              <option value="Manager">Manager</option>
                              <option value="Cashier">Cashier</option>
                              <option value="Security">Security</option>
                              <option value="Sales">Sales</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">Shift</label>
                            <input name="shift" required placeholder="09:00-17:00" className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm" />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">Phone</label>
                            <input name="phone" required placeholder="555-0123" className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm" />
                          </div>
                        </div>
                        <div className="flex space-x-3 mt-6">
                          <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            Add Staff
                          </button>
                          <button type="button" onClick={() => setShowAddStaff(false)} className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CAMPAIGNS TAB */}
            {activeTab === 'campaigns' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-white">Campaign Management</h3>
                  <button
                    onClick={() => setShowAddCampaign(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors duration-200"
                  >
                    <MegaphoneIcon className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">New Campaign</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{campaign.title}</h4>
                          <p className="text-gray-400 text-sm mt-1">{campaign.content}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ml-4 ${
                          campaign.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-blue-500/10 rounded p-3 text-center">
                          <div className="text-blue-400 font-bold text-lg">{campaign.sent}</div>
                          <div className="text-gray-400 text-xs">Messages Sent</div>
                        </div>
                        <div className="bg-green-500/10 rounded p-3 text-center">
                          <div className="text-green-400 font-bold text-lg">{campaign.opened}</div>
                          <div className="text-gray-400 text-xs">Opened</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Campaign Modal */}
                {showAddCampaign && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
                      <h3 className="text-lg font-semibold text-white mb-4">Create New Campaign</h3>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target as HTMLFormElement);
                        addCampaign({
                          title: formData.get('title'),
                          content: formData.get('content')
                        });
                      }}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">Campaign Title</label>
                            <input name="title" required className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm" />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">Message Content</label>
                            <textarea name="content" required rows={3} className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm" />
                          </div>
                        </div>
                        <div className="flex space-x-3 mt-6">
                          <button type="submit" className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors">
                            Send Campaign
                          </button>
                          <button type="button" onClick={() => setShowAddCampaign(false)} className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* REPORTS TAB */}
            {activeTab === 'reports' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">Business Intelligence Reports</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Daily Summary */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4 flex items-center">
                      <CalendarDaysIcon className="w-5 h-5 text-blue-400 mr-2" />
                      Today's Summary
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-green-500/10 rounded">
                        <span className="text-gray-300">Total Visitors</span>
                        <span className="text-green-400 font-bold">{realTimeData.entryCount}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-blue-500/10 rounded">
                        <span className="text-gray-300">Peak Hour</span>
                        <span className="text-blue-400 font-bold">14:00-15:00</span>
                      </div>
                      <div className="flex justify-between p-3 bg-purple-500/10 rounded">
                        <span className="text-gray-300">Avg. Visit Duration</span>
                        <span className="text-purple-400 font-bold">23 min</span>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Trends */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4 flex items-center">
                      <ArrowTrendingUpIcon className="w-5 h-5 text-green-400 mr-2" />
                      Weekly Trends
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Visitor Growth</span>
                          <span className="text-green-400">+12%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '72%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Campaign Engagement</span>
                          <span className="text-blue-400">+8%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '58%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Staff Efficiency</span>
                          <span className="text-orange-400">+5%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PROFILE SETTINGS TAB */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">Profile Settings</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Company Information */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4 flex items-center">
                      <UserIcon className="w-5 h-5 mr-2" />
                      {t.companyInformation}
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">{t.companyName}</label>
                        <input 
                          type="text" 
                          className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">{t.taxNumber}</label>
                        <input 
                          type="text" 
                          className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                          defaultValue="1234567890"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">{t.taxOffice}</label>
                        <input 
                          type="text" 
                          className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                          defaultValue="Çankaya Vergi Dairesi"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Business Type</label>
                        <select className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none">
                          <option>Restaurant</option>
                          <option>Retail Store</option>
                          <option>Office</option>
                          <option>Hotel</option>
                          <option>Cafe</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4 flex items-center">
                      <BellIcon className="w-5 h-5 mr-2" />
                      Contact Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Contact Person</label>
                        <input 
                          type="text" 
                          className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                          defaultValue="Ahmet Yılmaz"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Position</label>
                        <input 
                          type="text" 
                          className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                          defaultValue="General Manager"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Email</label>
                        <input 
                          type="email" 
                          className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                          defaultValue={business.email}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Phone</label>
                        <input 
                          type="tel" 
                          className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                          defaultValue="+90 312 123 45 67"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subscription Plan */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4 flex items-center">
                      <ShieldCheckIcon className="w-5 h-5 mr-2" />
                      Subscription Plan
                    </h4>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-4 border border-purple-500/30">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-purple-400 font-semibold">Enterprise Plan</span>
                          <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold">ACTIVE</span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">Unlimited analytics, campaigns & priority support</p>
                        <div className="text-white font-bold text-lg">₺2,999 / month</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-gray-300">Next Billing: <span className="text-white">Dec 15, 2024</span></div>
                        <div className="text-gray-300">Status: <span className="text-green-400">Active</span></div>
                      </div>
                      <button 
                        onClick={handleUpgradeToEnterprise}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                      >
                        Beta Başvuru Formu
                      </button>
                    </div>
                  </div>

                  {/* Language & Preferences */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4 flex items-center">
                      <Cog6ToothIcon className="w-5 h-5 mr-2" />
                      Preferences
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">{t.language}</label>
                        <select 
                          value={language}
                          onChange={(e) => setLanguage(e.target.value as 'tr' | 'en')}
                          className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                        >
                          <option value="tr">Türkçe</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Timezone</label>
                        <select className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none">
                          <option>Istanbul (UTC+3)</option>
                          <option>London (UTC+0)</option>
                          <option>New York (UTC-5)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Date Format</label>
                        <select className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none">
                          <option>DD/MM/YYYY</option>
                          <option>MM/DD/YYYY</option>
                          <option>YYYY-MM-DD</option>
                        </select>
                      </div>
                      <div className="pt-2">
                        <button 
                          onClick={handleSaveProfile}
                          disabled={profileUpdateStatus === 'saving'}
                          className={`w-full py-2 rounded-lg transition-colors font-medium ${
                            profileUpdateStatus === 'saving' 
                              ? 'bg-yellow-600 cursor-not-allowed' 
                              : profileUpdateStatus === 'success'
                              ? 'bg-green-600 hover:bg-green-700'
                              : profileUpdateStatus === 'error'
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-green-600 hover:bg-green-700'
                          } text-white`}
                        >
                          {profileUpdateStatus === 'saving' && 'Kaydediliyor...'}
                          {profileUpdateStatus === 'success' && 'Başarıyla Kaydedildi!'}
                          {profileUpdateStatus === 'error' && 'Hata! Tekrar Deneyin'}
                          {profileUpdateStatus === 'idle' && 'Değişiklikleri Kaydet'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">System Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Detection Settings</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Sensitivity Level</label>
                        <select className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm">
                          <option>High (90%)</option>
                          <option>Medium (70%)</option>
                          <option>Low (50%)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Analysis Interval</label>
                        <select className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm">
                          <option>1 second</option>
                          <option>5 seconds</option>
                          <option>10 seconds</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Notification Settings</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-gray-300 text-sm">Crowd alerts</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-gray-300 text-sm">Campaign notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-gray-300 text-sm">Staff notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-gray-300 text-sm">Daily reports</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Push Notification Banner */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-start space-x-3">
            <BellIcon className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium text-sm">System Active</p>
              <p className="text-blue-100 text-xs">Real-time monitoring enabled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );  
}