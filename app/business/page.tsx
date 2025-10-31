'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Business Dashboard Redirect Page
 * Bu sayfa artık kullanılmıyor - yeni dashboard /business/dashboard yolunda
 * Otomatik olarak yeni dashboard'a yönlendirme yapılıyor
 */
export default function BusinessPage() {
  const router = useRouter();

  useEffect(() => {
    // Yeni dashboard'a yönlendir
    router.push('/business/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Yeni dashboard'a yönlendiriliyor...</p>
      </div>
    </div>
  );
}
  const [businessId] = useState(1);
  const [realTimeData, setRealTimeData] = useState({
    visitors: 0,
    revenue: 0,
    cameras: 0,
    avgStay: 0
  });
  const [cameraAnalytics, setCameraAnalytics] = useState<any>(null);

  // Kameraları yükle
  const loadCameras = async () => {
    const token = localStorage.getItem('business_token');
    if (!token) return;

    try {
      const response = await fetch('/api/business/cameras', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setCameras(data.cameras);
        setPlanInfo(data.plan);
        setRealTimeData(prev => ({ ...prev, cameras: data.cameras.length }));
      }
    } catch (error) {
      console.error('❌ Kamera yükleme hatası:', error);
    }
  };

  // Kamera ekle
  const handleAddCamera = async (cameraData: any) => {
    const token = localStorage.getItem('business_token');
    if (!token) throw new Error('Unauthorized');

    const response = await fetch('/api/business/cameras', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cameraData)
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error);
    }

    await loadCameras();
  };

  // Kamera sil
  const handleDeleteCamera = async (id: number) => {
    if (!confirm('Bu kamerayı silmek istediğinizden emin misiniz?')) return;

    const token = localStorage.getItem('business_token');
    const response = await fetch(`/api/business/cameras?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (data.success) {
      await loadCameras();
    }
  };

  // Lisans kontrolü
  const checkLicense = async () => {
    const token = localStorage.getItem('business_token');
    if (!token) return;

    try {
      const response = await fetch('/api/business/license-check', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setLicenseStatus(data.status);
        setLicenseInfo(data.license);
        
        if (data.status === 'expired') {
          alert('⚠️ Lisansınızın süresi dolmuş! Lütfen yöneticinizle iletişime geçin.');
        }
      }
    } catch (error) {
      console.error('License check error:', error);
    }
  };

  // Authentication kontrolü
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      const token = localStorage.getItem('business_token');
      const userStr = localStorage.getItem('business_user');
      
      if (!token || !userStr) {
        // Token yoksa login'e yönlendir
        window.location.href = '/business/login';
        return;
      }

      try {
        const user = JSON.parse(userStr);
        
        // Token geçerliliğini kontrol et
        const response = await fetch('/api/business/auth/verify', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Token geçersiz');
        }

        const data = await response.json();
        
        if (!data.valid) {
          throw new Error('Token süresi dolmuş');
        }

        // Abonelik kontrolü
        if (data.subscriptionExpired) {
          toast.error('Aboneliğinizin süresi dolmuş! Lütfen yönetici ile iletişime geçin.');
          setTimeout(() => {
            localStorage.removeItem('business_token');
            localStorage.removeItem('business_user');
            window.location.href = '/business/login';
          }, 2000);
          return;
        }

        setBusinessUser(user);
        setIsAuth(true);
        
        // Plan bilgilerini ayarla
        setPlanInfo({
          planName: user.planType === 'premium' ? 'Premium' : 'Enterprise',
          maxCameras: user.maxCameras,
          currentCount: 0, // loadCameras'dan gelecek
          monthlyPrice: user.monthlyPrice,
          subscriptionEnd: user.subscriptionEnd
        });

        checkLicense();
        loadCameras();
      } catch (error: any) {
        console.error('Auth check error:', error);
        toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        localStorage.removeItem('business_token');
        localStorage.removeItem('business_user');
        window.location.href = '/business/login';
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Gerçek zamanlı ESP32 verilerini çek
  useEffect(() => {
    if (isAuth && activeTab === 'dashboard' && cameras.length > 0) {
      const fetchRealTimeData = async () => {
        try {
          const token = localStorage.getItem('business_token');
          const response = await fetch('/api/business/analytics/realtime', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          
          if (data.success) {
            // Gerçek ESP32 kameralarından gelen verileri kullan
            setRealTimeData({
              visitors: data.totalVisitors || 0,
              revenue: data.estimatedRevenue || 0,
              cameras: cameras.length,
              avgStay: data.averageStayTime || 0
            });
          }
        } catch (error) {
          console.error('❌ Gerçek zamanlı veri alınamadı:', error);
        }
      };

      // İlk yükleme
      fetchRealTimeData();

      // Her 10 saniyede bir güncelle
      const interval = setInterval(fetchRealTimeData, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuth, activeTab, cameras]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('/api/business/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (data.success && data.token) {
        localStorage.setItem('business_token', data.token);
        setIsAuth(true);
      } else {
        alert(data.error || 'Giriş başarısız');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Fallback: Demo mode
      localStorage.setItem('business_token', 'demo-token');
      setIsAuth(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('business_token');
    setIsAuth(false);
  };

  const handleAnalyticsUpdate = (analytics: any) => {
    setCameraAnalytics(analytics);
    setRealTimeData({
      visitors: analytics.currentPeople,
      revenue: realTimeData.revenue, // Revenue kameradan gelmiyor
      cameras: realTimeData.cameras,
      avgStay: analytics.averageDwellTime || realTimeData.avgStay
    });
  };

  // Loading Screen
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Not authenticated (should not happen because of redirect)
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-br from-slate-900/80 to-blue-900/60 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 mb-4">
                <BarChart3 className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">CityV Business</h1>
              <p className="text-gray-300">İşletme Yönetim Paneli</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">{t('email')}</label>
                <input
                  type="email"
                  name="email"
                  placeholder="ornek@business.com"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">{t('password')}</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl text-white font-bold text-lg transition-all shadow-lg"
              >
                {t('login')}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">CityV Business</h1>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-300 text-sm font-semibold">{t('live')}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t('logout')}
            </button>
          </div>
        </div>
      </header>

      {/* License Status Banner */}
      {licenseInfo && (
        <div className={`${
          licenseStatus === 'expired' 
            ? 'bg-red-500/20 border-red-500/50' 
            : licenseStatus === 'trial'
            ? 'bg-orange-500/20 border-orange-500/50'
            : 'bg-blue-500/20 border-blue-500/50'
        } border-b backdrop-blur-xl`}>
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className={`w-5 h-5 ${
                  licenseStatus === 'expired' ? 'text-red-400' : licenseStatus === 'trial' ? 'text-orange-400' : 'text-blue-400'
                }`} />
                <div>
                  <p className="text-white font-semibold">
                    {licenseStatus === 'expired' && '⚠️ Lisans Süresi Dolmuş'}
                    {licenseStatus === 'trial' && '⏰ Deneme Sürümü'}
                    {licenseStatus === 'valid' && '✓ Lisans Aktif'}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {licenseInfo.plan_type === 'enterprise' ? '⭐ Enterprise' : '💎 Premium'} Plan
                    {' • '}
                    Bitiş: {new Date(licenseInfo.end_date).toLocaleDateString('tr-TR')}
                    {licenseInfo.daysLeft > 0 && licenseInfo.daysLeft <= 30 && (
                      <span className="ml-2 text-orange-400">
                        ({licenseInfo.daysLeft} gün kaldı)
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {licenseStatus === 'expired' && (
                <a
                  href="mailto:admin@cityv.com"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
                >
                  Yönetici ile İletişime Geç
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', icon: Home, label: t('dashboard') },
            { id: 'cameras', icon: Video, label: 'Kameralar' },
            { id: 'campaigns', icon: MessageSquare, label: t('campaignManagement') },
            { id: 'profile', icon: Building2, label: t('businessProfile') }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:scale-105 transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-bold">+12.5%</span>
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm mb-2">{t('realTimeVisitors')}</h3>
                <p className="text-4xl font-bold text-white">{realTimeData.visitors}</p>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:scale-105 transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-bold">+8.3%</span>
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm mb-2">{t('dailyRevenue')}</h3>
                <p className="text-4xl font-bold text-white">₺{realTimeData.revenue.toLocaleString()}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:scale-105 transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300">
                    <span className="text-sm font-bold">100%</span>
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm mb-2">{t('activeCamera')}</h3>
                <p className="text-4xl font-bold text-white">{realTimeData.cameras}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:scale-105 transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-bold">+5.7%</span>
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm mb-2">{t('avgStayTime')}</h3>
                <p className="text-4xl font-bold text-white">{realTimeData.avgStay} dk</p>
              </div>
            </div>

            {/* Analytics Summary */}
            {cameraAnalytics && (
              <div className="bg-gradient-to-br from-slate-900/50 to-blue-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Gerçek Zamanlı Analiz</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-gray-400 text-sm mb-1">{t('entries')}</p>
                    <p className="text-2xl font-bold text-green-400">{cameraAnalytics.entriesCount}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-gray-400 text-sm mb-1">{t('exits')}</p>
                    <p className="text-2xl font-bold text-orange-400">{cameraAnalytics.exitsCount}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-gray-400 text-sm mb-1">{t('density')}</p>
                    <p className="text-2xl font-bold text-purple-400">{cameraAnalytics.densityLevel.toUpperCase()}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-gray-400 text-sm mb-1">Bölgeler</p>
                    <p className="text-2xl font-bold text-blue-400">{Object.keys(cameraAnalytics.zones || {}).length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cameras Tab - YENİ PROFESYONEL TASARIM */}
        {activeTab === 'cameras' && (
          <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">📹 Kamera Yönetimi</h2>
                {planInfo && (
                  <p className="text-gray-400">
                    {planInfo.type === 'premium' && '💎 Premium Plan - Maksimum 10 Kamera'}
                    {planInfo.type === 'enterprise' && '⭐ Enterprise Plan - Maksimum 50 Kamera'}
                    {' • '}
                    <span className={planInfo.remainingSlots > 5 ? 'text-green-400' : 'text-orange-400'}>
                      {planInfo.currentCount} / {planInfo.maxCameras} kullanılıyor
                    </span>
                  </p>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddCameraModal(true)}
                disabled={planInfo && planInfo.remainingSlots <= 0}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                Yeni Kamera Ekle
              </motion.button>
            </div>

            {/* Plan Progress Bar */}
            {planInfo && (
              <div className="bg-gradient-to-r from-slate-900/50 to-blue-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300 font-medium">Kullanım</span>
                  <span className="text-white font-bold">{planInfo.currentCount} / {planInfo.maxCameras}</span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(planInfo.currentCount / planInfo.maxCameras) * 100}%` }}
                    className={`h-full rounded-full ${
                      planInfo.remainingSlots > 5 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                        : planInfo.remainingSlots > 0
                        ? 'bg-gradient-to-r from-orange-500 to-yellow-500'
                        : 'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Seçili Kamera - Tam Ekran Analytics */}
            {selectedCamera && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">
                    🎥 {selectedCamera.camera_name} - Canlı Analiz
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="text-gray-400 text-sm font-mono">
                      {selectedCamera.ip_address}:{selectedCamera.port}
                    </div>
                    <button
                      onClick={() => setSelectedCamera(null)}
                      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-red-300 font-semibold transition-all"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
                <ProfessionalCameraAnalytics
                  cameraId={selectedCamera.id}
                  cameraName={selectedCamera.camera_name}
                  streamUrl={(() => {
                    // RTSP'yi HTTP'ye dönüştür (browser RTSP desteklemez)
                    if (selectedCamera.stream_url?.startsWith('rtsp://')) {
                      // rtsp://user:pass@192.168.1.2:80/stream → http://192.168.1.2:80/stream
                      const rtspUrl = selectedCamera.stream_url;
                      // SON @ işaretinden sonrasını al (IP:port/path kısmı)
                      const lastAtIndex = rtspUrl.lastIndexOf('@');
                      const afterAt = lastAtIndex !== -1 
                        ? rtspUrl.substring(lastAtIndex + 1) 
                        : rtspUrl.replace('rtsp://', '');
                      return `http://${afterAt}`;
                    }
                    return selectedCamera.stream_url || `http://${selectedCamera.ip_address}:${selectedCamera.port}/stream`;
                  })()}
                  onAnalyticsUpdate={handleAnalyticsUpdate}
                />
              </motion.div>
            )}

            {/* Camera Grid */}
            {cameras.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-slate-900/50 to-blue-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Henüz Kamera Eklenmemiş</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  İşletmenizde kalabalık analizi yapmak için ESP32-CAM veya IP kamera ekleyin. 
                  Gerçek zamanlı müşteri sayımı ve davranış analizi yapabilirsiniz.
                </p>
                <button
                  onClick={() => setShowAddCameraModal(true)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-bold shadow-lg transition-all"
                >
                  İlk Kameranızı Ekleyin
                </button>
              </motion.div>
            ) : selectedCamera ? null : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {cameras.map((camera, index) => (
                  <motion.div
                    key={camera.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-slate-900/80 to-blue-900/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:shadow-2xl transition-all group"
                  >
                    {/* Camera Preview/Status */}
                    <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
                      <Camera className="w-16 h-16 text-white/30" />
                      <button
                        onClick={() => setSelectedCamera(camera)}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold">
                          <Eye className="w-5 h-5" />
                          Canlı Analizi Aç
                        </div>
                      </button>
                    </div>

                    {/* Camera Info */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">{camera.camera_name}</h3>
                          <p className="text-gray-400 text-sm">{camera.location_description || 'Konum belirtilmemiş'}</p>
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                          camera.status === 'active' 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {camera.status === 'active' ? (
                            <>
                              <Wifi className="w-4 h-4" />
                              <span className="text-xs font-bold">Aktif</span>
                            </>
                          ) : (
                            <>
                              <WifiOff className="w-4 h-4" />
                              <span className="text-xs font-bold">Pasif</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* IP Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Activity className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-mono">{camera.ip_address}:{camera.port}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Eklendi: {new Date(camera.created_at).toLocaleDateString('tr-TR')}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          onClick={() => {
                            setSelectedCamera(camera);
                            setTimeout(() => setShowZoneDrawing(true), 500);
                          }}
                          className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg text-purple-300 text-sm font-semibold transition-all flex items-center justify-center gap-1"
                        >
                          <Settings className="w-4 h-4" />
                          Bölge Çiz
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCamera(camera);
                            setTimeout(() => setShowCalibration(true), 500);
                          }}
                          className="px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 rounded-lg text-orange-300 text-sm font-semibold transition-all flex items-center justify-center gap-1"
                        >
                          <Activity className="w-4 h-4" />
                          Kalibrasyon
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedCamera(camera)}
                          className="flex-1 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 rounded-lg text-blue-300 font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Canlı Analiz
                        </button>
                        <button
                          onClick={() => handleDeleteCamera(camera.id)}
                          className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-red-300 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">🎯 Profesyonel Kampanya Yönetimi</h2>
              <button
                onClick={() => setShowProfessionalCampaignModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700 rounded-xl text-white font-bold shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Yeni Kampanya Oluştur
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-slate-900/50 to-blue-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-50" />
              <p className="text-gray-400 mb-2">Profesyonel kampanyalar oluşturun</p>
              <p className="text-gray-500 text-sm">Push bildirim ile tüm kullanıcılara ulaşın</p>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <BusinessProfileEditor businessId={businessId} />
        )}
      </div>

      {/* Campaign Modal (Eski) */}
      <CreateCampaignModal
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        businessId={businessId}
        onSuccess={() => {
          setShowCampaignModal(false);
        }}
      />

      {/* Professional Campaign Modal (Yeni) */}
      <ProfessionalCampaignModal
        isOpen={showProfessionalCampaignModal}
        onClose={() => setShowProfessionalCampaignModal(false)}
        businessId={businessId}
        onSuccess={() => {
          setShowProfessionalCampaignModal(false);
          toast.success('✅ Kampanya başarıyla oluşturuldu!');
        }}
      />

      {/* Zone Drawing Tool */}
      {showZoneDrawing && selectedCamera && videoRef.current && (
        <ZoneDrawingTool
          videoRef={videoRef}
          cameraId={selectedCamera.id}
          onSaveZones={async (zones) => {
            try {
              const token = localStorage.getItem('business_token');
              await fetch(`/api/business/cameras/${selectedCamera.id}/zones`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ zones })
              });
              toast.success('✅ Bölgeler kaydedildi!');
            } catch (error) {
              toast.error('❌ Bölgeler kaydedilemedi!');
              throw error;
            }
          }}
          onClose={() => setShowZoneDrawing(false)}
        />
      )}

      {/* Calibration Tool */}
      {showCalibration && selectedCamera && videoRef.current && (
        <CalibrationTool
          videoRef={videoRef}
          cameraId={selectedCamera.id}
          onSaveLine={async (line) => {
            try {
              const token = localStorage.getItem('business_token');
              await fetch(`/api/business/cameras/${selectedCamera.id}/calibration`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ calibrationLine: line })
              });
              toast.success('✅ Kalibrasyon kaydedildi!');
            } catch (error) {
              toast.error('❌ Kalibrasyon kaydedilemedi!');
              throw error;
            }
          }}
          onClose={() => setShowCalibration(false)}
        />
      )}

      {/* Add Camera Modal */}
      {planInfo && (
        <AddCameraModal
          isOpen={showAddCameraModal}
          onClose={() => setShowAddCameraModal(false)}
          onAdd={handleAddCamera}
          planInfo={planInfo}
        />
      )}
    </div>
  );
}

export default function BusinessPage() {
  return (
    <LanguageProvider>
      <BusinessDashboardContent />
    </LanguageProvider>
  );
}
