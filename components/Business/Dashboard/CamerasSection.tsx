'use client';

import { useState, useEffect } from 'react';
import { 
  Camera, Plus, Wifi, WifiOff, Edit, Trash2, Eye, Settings,
  Activity, AlertCircle, CheckCircle, XCircle, Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import AddCameraModal from './AddCameraModal';
import CalibrationModalPro from './CalibrationModalPro';
import ZoneDrawingModalPro from './ZoneDrawingModalPro';
import CameraLiveView from './CameraLiveView';

interface Camera {
  id: number;
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
}

export default function CamerasSection({ businessProfile }: { businessProfile: any }) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showLiveView, setShowLiveView] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [planInfo, setPlanInfo] = useState<any>(null);

  useEffect(() => {
    if (businessProfile) {
      loadCameras();
      updatePlanInfo();
    }
  }, [businessProfile]);

  // Plan bilgisini güncelle
  const updatePlanInfo = () => {
    const userStr = localStorage.getItem('business_user');
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr);
      const membership = user.membership_type || 'free';
      
      const limits: { [key: string]: number } = {
        'free': 1,
        'premium': 10,
        'enterprise': 50,
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
    } catch (error) {
      console.error('Plan info error:', error);
    }
  };

  // Kamera sayısı değiştiğinde planInfo'yu güncelle
  useEffect(() => {
    updatePlanInfo();
  }, [cameras]);

  const loadCameras = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('business_token');
      
      const response = await fetch('/api/business/cameras', {
        headers: { 'Authorization': `Bearer ${token}` }
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

  // Üyelik limiti kontrolü
  const checkCameraLimit = (): boolean => {
    const userStr = localStorage.getItem('business_user');
    if (!userStr) return false;

    try {
      const user = JSON.parse(userStr);
      const membership = user.membership_type || 'free';
      
      // Üyelik limitlheri
      const limits: { [key: string]: number } = {
        'free': 1,
        'premium': 10,
        'enterprise': 50,
        'business': 10 // business tier de 10 kamera
      };

      const maxCameras = limits[membership] || 1;
      const currentCount = cameras.length;

      if (currentCount >= maxCameras) {
        toast.error(
          `${membership.toUpperCase()} üyelikte maksimum ${maxCameras} kamera ekleyebilirsiniz.\nŞu anda ${currentCount} kameranız var.`,
          { duration: 5000 }
        );
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  const handleAddCamera = async (cameraData: any) => {
    // Limit kontrolü
    if (!checkCameraLimit()) {
      return;
    }

    try {
      const token = localStorage.getItem('business_token');
      
      const response = await fetch('/api/business/cameras', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cameraData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('✅ Kamera başarıyla eklendi!');
        setShowAddModal(false);
        loadCameras();
      } else {
        toast.error(data.error || 'Kamera eklenemedi');
      }
    } catch (error) {
      console.error('Add camera error:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const handleDeleteCamera = async (cameraId: number) => {
    if (!confirm('Bu kamerayı silmek istediğinizden emin misiniz?')) return;

    try {
      const token = localStorage.getItem('business_token');
      
      const response = await fetch(`/api/business/cameras?id=${cameraId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Kamera silindi');
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
      const token = localStorage.getItem('business_token');
      
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
            ESP32-CAM cihazlarınızı bağlayarak AI destekli analiz yapın
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
                    <div>
                      <h3 className="font-semibold text-gray-900">{camera.camera_name}</h3>
                      <p className="text-sm text-gray-500">{camera.location_description}</p>
                    </div>
                  </div>
                  {getStatusIcon(camera.status)}
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
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
                  >
                    <Eye className="w-4 h-4" />
                    Canlı İzle
                  </button>
                  <button
                    onClick={() => openCalibration(camera)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    Kalibrasyon
                  </button>
                  <button
                    onClick={() => openZoneDrawing(camera)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                  >
                    <Maximize2 className="w-4 h-4" />
                    Bölgeler
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
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddCamera}
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
                const response = await fetch('/api/business/cameras', {
                  method: 'PUT',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('business_token')}`
                  },
                  body: JSON.stringify({
                    id: selectedCamera.id,
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
                const response = await fetch('/api/business/cameras', {
                  method: 'PUT',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('business_token')}`
                  },
                  body: JSON.stringify({
                    id: selectedCamera.id,
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
          <CameraLiveView
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
