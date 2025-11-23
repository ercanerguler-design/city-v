'use client';

import { useState, useEffect } from 'react';
import { 
  Camera, Plus, Wifi, WifiOff, Edit, Trash2, Eye, Settings,
  Activity, AlertCircle, CheckCircle, XCircle, Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import authStorage from '@/lib/authStorage';
import { useBusinessDashboardStore } from '@/store/businessDashboardStore';
import AddCameraModal from './AddCameraModal';
import CalibrationModalPro from './CalibrationModalPro';
import ZoneDrawingModalPro from './ZoneDrawingModalPro';
import CameraLiveView from './CameraLiveView';
import RemoteCameraViewer from './RemoteCameraViewer';
import RemoteCameraStream from '../RemoteAccess/RemoteCameraStream';
import NgrokQuickSetup from './NgrokQuickSetup';
import { useRemoteAccess } from '@/lib/hooks/useRemoteAccess';

interface Camera {
  id: number;
  device_id: string;
  camera_name: string;
  ip_address: string;
  port: number;
  rtsp_url: string | null;
  location_description: string;
  status: 'active' | 'offline' | 'error';
  is_active: boolean;
  last_seen: string | null;
  fps: number;
  resolution: string;
  ai_enabled: boolean;
  features: any;
  calibration_line: any;
  entry_direction: string;
  zones: any[];
  total_entries: number;
  total_exits: number;
  current_occupancy: number;
  max_capacity: number;
  stream_url?: string;
  location?: string;
}

export default function CamerasSection({ businessProfile }: { businessProfile: any }) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showLiveView, setShowLiveView] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [planInfo, setPlanInfo] = useState<any>(null);

  // Remote access hook
  const { networkInfo } = useRemoteAccess();

  // Business dashboard store hook
  const { businessUser, businessProfile: storeProfile } = useBusinessDashboardStore();

  // Helper: Check if camera uses ngrok (remote access)
  const isNgrokCamera = (camera: Camera): boolean => {
    if (!camera.stream_url && !camera.ip_address) return false;
    
    // Check stream_url for ngrok domain
    if (camera.stream_url && (
      camera.stream_url.includes('ngrok') ||
      camera.stream_url.includes('.app') ||
      camera.stream_url.includes('cityv-remote')
    )) {
      return true;
    }
    
    // Check if IP is NOT local (192.168.x.x, 10.x.x.x, 127.x.x.x, localhost)
    const ip = camera.ip_address || '';
    const isLocal = ip.startsWith('192.168.') || 
                    ip.startsWith('10.') || 
                    ip.startsWith('127.') ||
                    ip === 'localhost';
    
    return !isLocal;
  };

  useEffect(() => {
    if (businessProfile) {
      loadCameras();
      updatePlanInfo();
    }
  }, [businessProfile]);

  // Plan bilgisini güncelle - Sadece API'den
  const updatePlanInfo = () => {
    if (!businessUser) {
      console.log('⚠️ No user data for plan info update');
      return;
    }

    const membership = businessUser.membership_type || 'free';
    
    const limits: { [key: string]: number } = {
      'free': 1,
      'premium': 10,
      'enterprise': 30,
      'business': 10
    };

    const maxCameras = limits[membership] || 1;
    const remaining = Math.max(0, maxCameras - cameras.length);

    setPlanInfo({
      type: membership,
      maxCameras,
      currentCameras: cameras.length,
      remainingSlots: remaining
    });
    
    console.log('📊 Plan info updated from database:', {
      membership,
      maxCameras,
      currentCount: cameras.length,
      remaining
    });
  };

  // Kamera sayısı değiştiğinde planInfo'yu güncelle
  useEffect(() => {
    updatePlanInfo();
  }, [cameras]);

  // Ngrok kamera ekleme listener
  useEffect(() => {
    const handleNgrokCamera = (event: MessageEvent) => {
      if (event.data.type === 'ADD_NGROK_CAMERA') {
        const cameraData = event.data.data;
        handleAddCamera(cameraData);
      }
    };

    window.addEventListener('message', handleNgrokCamera);
    return () => window.removeEventListener('message', handleNgrokCamera);
  }, []);

  const loadCameras = async () => {
    try {
      setLoading(true);
      const token = authStorage.getToken();
      
      console.log('📷 Cameras loading (DB ONLY), token:', token ? 'exists' : 'missing', 'businessUser:', businessUser?.id);
      
      // Cache bypass için timestamp ekle
      const timestamp = new Date().getTime();
      const userId = businessUser?.id || businessProfile?.user_id;
      const url = userId 
        ? `/api/business/cameras?userId=${userId}&t=${timestamp}` 
        : `/api/business/cameras?t=${timestamp}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store' // Browser cache'i bypass et
      });
      
      const data = await response.json();

      if (data.success) {
        setCameras(data.cameras || []);
        setPlanInfo(data.plan);
      } else {
        toast.error('Kameralar yüklenemedi');
      }
    } catch (error) {
      console.error('Camera load error:', error);
      toast.error('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  // Üyelik limiti kontrolü - Sadece PostgreSQL'den
  const checkCameraLimit = (): boolean => {
    console.log('🔍 ===== CAMERA LIMIT CHECK (DB ONLY) =====');
    
    console.log('📊 Database user info:', {
      businessUser: businessUser ? { id: businessUser.id, email: businessUser.email, membership: businessUser.membership_type } : 'missing',
      storeProfile: storeProfile ? { name: storeProfile.business_name } : 'missing',
      planInfo
    });
    
    if (!businessUser) {
      console.log('❌ No user data from database');
      toast.error('Kullanıcı bilgisi yükleniyor, lütfen bekleyin...');
      return false;
    }

    const membership = businessUser.membership_type || 'free';
    
    // PlanInfo'yu öncelikle kullan (API'den gelen güncel data)
    if (planInfo) {
      console.log('📊 Using planInfo from API:', planInfo);
      
      if (planInfo.remainingSlots <= 0) {
        console.log('❌ No remaining slots:', planInfo);
        toast.error(
          `${membership.toUpperCase()} üyelikte maksimum ${planInfo.maxCameras} kamera ekleyebilirsiniz.\nŞu anda ${planInfo.currentCount} kameranız var.`,
          { duration: 5000 }
        );
        return false;
      }
      
      console.log('✅ Camera limit check passed via planInfo');
      return true;
    }
    
    // Fallback: Local calculation
    const limits: { [key: string]: number } = {
      'free': 1,
      'premium': 10,
      'enterprise': 30,
      'business': 10
    };

    const maxCameras = limits[membership] || 1;
    const currentCount = cameras.length;
    
    console.log('📊 Fallback limit calculation:', {
      membership,
      maxCameras,
      currentCount
    });

    if (currentCount >= maxCameras) {
      console.log('❌ Camera limit exceeded (fallback):', { currentCount, maxCameras });
      toast.error(
        `${membership.toUpperCase()} üyelikte maksimum ${maxCameras} kamera ekleyebilirsiniz.\nŞu anda ${currentCount} kameranız var.`,
        { duration: 5000 }
      );
      return false;
    }

    console.log('✅ Camera limit check passed (fallback)');
    return true;
  };

  const handleAddCamera = async (cameraData: any) => {
    console.log('🎯 ===== HANDLE ADD CAMERA START =====');
    console.log('📋 Input camera data:', cameraData);
    
    // Limit kontrolü
    if (!checkCameraLimit()) {
      console.log('❌ Camera limit exceeded');
      return;
    }

    try {
      const token = authStorage.getToken();
      
      // Sadece database'den al - localStorage yok
      const userId = businessUser?.id || businessProfile?.user_id;
      
      console.log('🔐 Auth info (DB ONLY):', {
        hasToken: !!token,
        tokenLength: token?.length,
        businessUser: businessUser ? { id: businessUser.id, email: businessUser.email, membership: businessUser.membership_type } : null,
        businessProfile: businessProfile ? { user_id: businessProfile.user_id } : null,
        finalUserId: userId
      });
      
      if (!userId) {
        console.log('❌ No userId found from database sources');
        toast.error('Kullanıcı kimliği bulunamadı. Lütfen yeniden giriş yapın.');
        return;
      }
      
      // GEÇİCİ: userId de gönder
      const dataWithUserId = { ...cameraData, userId: userId };
      console.log('📤 Final payload:', dataWithUserId);
      
      console.log('🌐 Making API call to /api/business/cameras');
      const response = await fetch('/api/business/cameras', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataWithUserId)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (data.success) {
        console.log('✅ Camera added successfully');
        toast.success('✅ Kamera başarıyla eklendi!');
        setShowAddModal(false);
        setEditingCamera(null); // Düzenleme modunu sıfırla
        loadCameras();
      } else {
        console.log('❌ API returned error:', data.error);
        toast.error(data.error || 'Kamera eklenemedi');
      }
    } catch (error) {
      console.error('❌ Add camera error:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      toast.error('Bir hata oluştu');
    }
    
    console.log('🎯 ===== HANDLE ADD CAMERA END =====');
  };

  const handleDeleteCamera = async (cameraId: number) => {
    if (!confirm('Bu kamerayı silmek istediğinizden emin misiniz?')) return;

    try {
      const token = authStorage.getToken();
      const user = authStorage.getUser();
      const userId = businessProfile?.user_id || user?.id;
      
      const response = await fetch(`/api/business/cameras?id=${cameraId}&userId=${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        // Optimistic update: State'i hemen güncelle
        setCameras(prevCameras => prevCameras.filter(cam => cam.id !== cameraId));
        toast.success('Kamera silindi');
        // Yine de backend'den güncel listeyi çek (doğrulama için)
        loadCameras();
      } else {
        toast.error(data.error || 'Silinemedi');
      }
    } catch (error) {
      console.error('Delete camera error:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const handleToggleCamera = async (camera: Camera) => {
    try {
      const token = authStorage.getToken();
      
      const response = await fetch('/api/business/cameras', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: camera.id,
          is_active: !camera.is_active
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(camera.is_active ? 'Kamera devre dışı' : 'Kamera aktif');
        loadCameras();
      }
    } catch (error) {
      console.error('Toggle camera error:', error);
      toast.error('Durum değiştirilemedi');
    }
  };

  const handleEditCamera = (camera: Camera) => {
    console.log('📝 Editing camera:', camera);
    setEditingCamera(camera);
    setShowAddModal(true);
  };

  const handleUpdateCamera = async (cameraData: any) => {
    if (!editingCamera) return;

    console.log('🔄 ===== HANDLE UPDATE CAMERA START =====');
    console.log('📋 Camera data to update:', cameraData);
    console.log('📋 Editing camera:', editingCamera);

    try {
      const token = authStorage.getToken();
      
      // Database-first approach: businessUser hook'undan al
      const userId = businessUser?.id || businessProfile?.user_id;
      
      console.log('🔐 Update auth info (DB ONLY):', {
        hasToken: !!token,
        tokenLength: token?.length,
        businessUser: businessUser ? { id: businessUser.id, email: businessUser.email, membership: businessUser.membership_type } : null,
        businessProfile: businessProfile ? { user_id: businessProfile.user_id } : null,
        finalUserId: userId
      });
      
      if (!userId) {
        console.log('❌ No userId found from database sources');
        toast.error('Kullanıcı bilgisi bulunamadı');
        return;
      }
      
      if (!token) {
        console.log('❌ No auth token');
        toast.error('Oturum süresi dolmuş, lütfen tekrar giriş yapın');
        return;
      }
      
      console.log('📤 Sending PUT request to API...');
      const response = await fetch('/api/business/cameras', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: editingCamera.id,
          userId: userId,
          ...cameraData
        })
      });

      console.log('📥 API response status:', response.status);
      const data = await response.json();
      console.log('📥 API response data:', data);

      if (data.success) {
        console.log('✅ Camera update successful');
        toast.success('✅ Kamera güncellendi!');
        setShowAddModal(false);
        setEditingCamera(null);
        loadCameras();
        updatePlanInfo(); // Plan bilgisini güncelle
      } else {
        console.log('❌ Camera update failed:', data.error);
        toast.error(data.error || 'Kamera güncellenemedi');
      }
    } catch (error) {
      console.error('❌ Update camera error:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const openCalibration = (camera: Camera) => {
    setSelectedCamera(camera);
    setShowCalibrationModal(true);
  };

  const openZoneDrawing = (camera: Camera) => {
    setSelectedCamera(camera);
    setShowZoneModal(true);
  };

  const openLiveView = (camera: Camera) => {
    setSelectedCamera(camera);
    setShowLiveView(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'offline':
        return <WifiOff className="w-5 h-5 text-gray-400" />;
      default:
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-700',
      offline: 'bg-gray-100 text-gray-700',
      error: 'bg-red-100 text-red-700'
    };
    return badges[status as keyof typeof badges] || badges.offline;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Kameralar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mixed Content Warning for HTTPS Production */}
      {typeof window !== 'undefined' && window.location.protocol === 'https:' && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-orange-900">Local Kamera Erişim Uyarısı (HTTPS)</h3>
              <p className="text-sm text-orange-700 mt-1">
                Production HTTPS sitesinden local IP kameralar (192.168.x.x) browser security policy nedeniyle erişilemez.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a 
                  href="http://localhost:3000/business/dashboard" 
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-800 text-xs font-medium rounded-lg hover:bg-orange-200"
                >
                  🏠 Local Test (HTTP)
                </a>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-lg">
                  🌐 Public IP önerisi
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ngrok Quick Setup for Production & Local Camera Access */}
      {typeof window !== 'undefined' && (
        <NgrokQuickSetup />
      )}

      {/* Header + Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kamera Yönetimi</h2>
          <p className="text-gray-500 mt-1">
            {cameras.length} / {planInfo?.maxCameras || 10} kamera kullanılıyor
            {planInfo && cameras.length >= planInfo.maxCameras && (
              <span className="text-red-600 font-medium ml-2">
                • Limit doldu
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => {
            if (cameras.length >= (planInfo?.maxCameras || 10)) {
              toast.error(`${planInfo?.type === 'free' ? 'Free' : planInfo?.type === 'premium' ? 'Premium' : 'Enterprise'} planınızda maksimum ${planInfo?.maxCameras} kamera ekleyebilirsiniz. Daha fazla kamera için üyelik yükseltin.`);
            } else {
              setShowAddModal(true);
            }
          }}
          disabled={cameras.length >= (planInfo?.maxCameras || 10)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Kamera Ekle</span>
        </button>
      </div>

      {/* Plan Info */}
      {planInfo && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {planInfo.type?.toUpperCase() || 'PREMIUM'} Planı
                </p>
                <p className="text-sm text-gray-600">
                  {planInfo.remainingSlots} kamera slot kaldı
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                {Math.round((cameras.length / (planInfo.maxCameras || 10)) * 100)}%
              </p>
              <p className="text-xs text-gray-500">Kullanım</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {cameras.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
          <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Henüz kamera eklenmemiş
          </h3>
          <p className="text-gray-500 mb-6">
            Akıllı kameralarınızı bağlayarak AI destekli analiz yapın
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>İlk Kamerayı Ekle</span>
          </button>
        </div>
      ) : (
        /* Camera Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cameras.map((camera, index) => (
            <motion.div
              key={camera.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
            >
              {/* Status Bar */}
              <div className={`h-1 ${
                camera.status === 'active' ? 'bg-green-500' : 
                camera.status === 'offline' ? 'bg-gray-300' : 'bg-red-500'
              }`}></div>

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      camera.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Camera className={`w-6 h-6 ${
                        camera.status === 'active' ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {camera.camera_name}
                        </h3>
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold rounded-full shadow-sm">
                          ID: #{camera.id}
                        </span>
                        {isNgrokCamera(camera) && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                            CityV Remote
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{camera.location_description}</p>
                    </div>
                  </div>
                  {getStatusIcon(camera.status)}
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  {camera.device_id && (
                    <div className="flex items-center justify-between text-sm p-2 bg-blue-50 rounded border border-blue-200">
                      <span className="text-blue-700 font-medium">Device ID:</span>
                      <span className="font-mono text-xs text-blue-900">{camera.device_id}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">IP Adresi:</span>
                    <span className="font-mono text-gray-900">{camera.ip_address}:{camera.port}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Çözünürlük:</span>
                    <span className="text-gray-900">{camera.resolution}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">FPS:</span>
                    <span className="text-gray-900">{camera.fps} fps</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Giriş</p>
                    <p className="text-lg font-bold text-green-600">{camera.total_entries}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Çıkış</p>
                    <p className="text-lg font-bold text-orange-600">{camera.total_exits}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">İçeride</p>
                    <p className="text-lg font-bold text-blue-600">{camera.current_occupancy}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {camera.calibration_line && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      ✓ Kalibre Edildi
                    </span>
                  )}
                  {camera.zones && camera.zones.length > 0 && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {camera.zones.length} Bölge
                    </span>
                  )}
                  {camera.ai_enabled && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      AI Aktif
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openLiveView(camera)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    title={isNgrokCamera(camera) ? 'CityV Remote - Uzak erişim ile canlı izleme' : 'Yerel ağ canlı izleme'}
                  >
                    <Eye className="w-4 h-4" />
                    {isNgrokCamera(camera) ? (
                      <span className="flex items-center gap-1">
                        🌐 Uzaktan İzle
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        🏠 Canlı İzle
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleEditCamera(camera)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => openCalibration(camera)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    Kalibrasyon
                  </button>
                  <button
                    onClick={() => handleDeleteCamera(camera.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Sil
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AddCameraModal
            onClose={() => {
              setShowAddModal(false);
              setEditingCamera(null);
            }}
            onSubmit={editingCamera ? handleUpdateCamera : handleAddCamera}
            editMode={!!editingCamera}
            initialData={editingCamera || undefined}
          />
        )}

        {showCalibrationModal && selectedCamera && (
          <CalibrationModalPro
            camera={selectedCamera}
            onClose={() => {
              setShowCalibrationModal(false);
              setSelectedCamera(null);
            }}
            onSave={async (calibrationData) => {
              try {
                const user = authStorage.getUser();
                const userId = businessProfile?.user_id || user?.id;
                
                const response = await fetch('/api/business/cameras', {
                  method: 'PUT',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStorage.getToken()}`
                  },
                  body: JSON.stringify({
                    id: selectedCamera.id,
                    userId: userId,
                    calibration_line: calibrationData.calibration_line,
                    entry_direction: calibrationData.entry_direction
                  })
                });

                const data = await response.json();
                
                if (data.success) {
                  await loadCameras();
                } else {
                  throw new Error(data.error);
                }
              } catch (error) {
                console.error('Kalibrasyon kayıt hatası:', error);
                throw error;
              }
            }}
          />
        )}

        {showZoneModal && selectedCamera && (
          <ZoneDrawingModalPro
            camera={selectedCamera}
            onClose={() => {
              setShowZoneModal(false);
              setSelectedCamera(null);
            }}
            onSave={async (zones) => {
              try {
                const user = authStorage.getUser();
                const userId = businessProfile?.user_id || user?.id;
                
                const response = await fetch('/api/business/cameras', {
                  method: 'PUT',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStorage.getToken()}`
                  },
                  body: JSON.stringify({
                    id: selectedCamera.id,
                    userId: userId,
                    zones: zones
                  })
                });

                const data = await response.json();
                
                if (data.success) {
                  await loadCameras();
                } else {
                  throw new Error(data.error);
                }
              } catch (error) {
                console.error('Bölge kayıt hatası:', error);
                throw error;
              }
            }}
          />
        )}

        {showLiveView && selectedCamera && (
          <RemoteCameraViewer
            camera={selectedCamera}
            onClose={() => {
              setShowLiveView(false);
              setSelectedCamera(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
