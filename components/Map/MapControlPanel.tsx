'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  Navigation, 
  Flame, 
  CircleDot, 
  Route, 
  Pencil,
  Circle,
  Square,
  MapPin,
  Trash2,
  X,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useMapStore, MapViewMode, RouteMode } from '@/lib/stores/mapStore';
import toast from 'react-hot-toast';

interface MapControlPanelProps {
  onClose?: () => void;
}

export default function MapControlPanel({ onClose }: MapControlPanelProps) {
  const {
    viewMode,
    setViewMode,
    route,
    setRouteMode,
    clearRoute,
    calculateRoute,
    drawing,
    startDrawing,
    stopDrawing,
    clearAllDrawings,
    heatmapIntensity,
    setHeatmapIntensity,
    clusteringEnabled,
    toggleClustering,
    settings,
    updateSettings,
    stats,
  } = useMapStore();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const viewModes: { id: MapViewMode; label: string; icon: any; color: string }[] = [
    { id: 'standard', label: 'Standart', icon: Layers, color: 'blue' },
    { id: 'heatmap', label: 'Isı Haritası', icon: Flame, color: 'red' },
    { id: 'cluster', label: 'Kümelenmiş', icon: CircleDot, color: 'purple' },
  ];

  const routeModes: { id: RouteMode; label: string; icon: any }[] = [
    { id: 'none', label: 'Yok', icon: X },
    { id: 'walking', label: 'Yürüyerek', icon: Navigation },
    { id: 'driving', label: 'Araçla', icon: Route },
    { id: 'cycling', label: 'Bisikletle', icon: Route },
  ];

  const drawModes: { id: 'marker' | 'circle' | 'polygon' | 'polyline'; label: string; icon: any }[] = [
    { id: 'marker', label: 'İşaretçi', icon: MapPin },
    { id: 'circle', label: 'Daire', icon: Circle },
    { id: 'polygon', label: 'Alan', icon: Square },
    { id: 'polyline', label: 'Çizgi', icon: Pencil },
  ];

  const handleViewModeChange = (mode: MapViewMode) => {
    setViewMode(mode);
    toast.success(`Görünüm modu: ${viewModes.find(m => m.id === mode)?.label}`, {
      icon: React.createElement(viewModes.find(m => m.id === mode)!.icon, { size: 20 }),
    });
  };

  const handleRouteModeChange = (mode: RouteMode) => {
    setRouteMode(mode);
    if (mode === 'none') {
      clearRoute();
    }
    toast.success(`Rota modu: ${routeModes.find(m => m.id === mode)?.label}`);
  };

  const handleCalculateRoute = async () => {
    if (!route.startPoint || !route.endPoint) {
      toast.error('Başlangıç ve bitiş noktası seçin');
      return;
    }
    
    await calculateRoute();
    toast.success(
      `Rota hesaplandı: ${route.distance?.toFixed(1)} km, ${route.duration} dk`,
      { icon: '🗺️', duration: 4000 }
    );
  };

  const handleDrawingStart = (mode: 'marker' | 'circle' | 'polygon' | 'polyline') => {
    if (drawing.isDrawing && drawing.drawMode === mode) {
      stopDrawing();
      toast.success('Çizim durduruldu');
    } else {
      startDrawing(mode);
      toast.success(`Çizim başladı: ${drawModes.find(m => m.id === mode)?.label}`, {
        icon: '✏️',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed right-4 top-20 z-[1000] w-80 max-h-[calc(100vh-120px)] overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
    >
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-white" />
          <h2 className="text-lg font-bold text-white">Harita Kontrolleri</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Görünüm Modu */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Görünüm Modu
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {viewModes.map((mode) => {
              const Icon = mode.icon;
              const isActive = viewMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => handleViewModeChange(mode.id)}
                  className={`
                    relative p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1
                    ${isActive
                      ? `border-${mode.color}-500 bg-${mode.color}-50 dark:bg-${mode.color}-900/20`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <Icon 
                    className={`w-5 h-5 ${
                      isActive 
                        ? `text-${mode.color}-600 dark:text-${mode.color}-400` 
                        : 'text-gray-600 dark:text-gray-400'
                    }`} 
                  />
                  <span className={`text-xs font-medium ${
                    isActive 
                      ? `text-${mode.color}-700 dark:text-${mode.color}-300` 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {mode.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="viewModeIndicator"
                      className={`absolute inset-0 border-2 border-${mode.color}-500 rounded-xl`}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Isı Haritası Ayarları */}
        <AnimatePresence>
          {viewMode === 'heatmap' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-500" />
                Isı Haritası Yoğunluğu
              </h4>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={heatmapIntensity}
                  onChange={(e) => setHeatmapIntensity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-blue-200 via-yellow-200 to-red-500 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Düşük</span>
                  <span className="font-medium">{(heatmapIntensity * 100).toFixed(0)}%</span>
                  <span>Yüksek</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kümeleme */}
        <AnimatePresence>
          {viewMode === 'cluster' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <CircleDot className="w-4 h-4 text-purple-500" />
                  Kümeleme Aktif
                </h4>
                <button
                  onClick={toggleClustering}
                  className={`
                    relative w-12 h-6 rounded-full transition-colors
                    ${clusteringEnabled ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}
                  `}
                >
                  <motion.div
                    className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                    animate={{ x: clusteringEnabled ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rota Modu */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Route className="w-4 h-4" />
            Rota Çizimi
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {routeModes.map((mode) => {
              const Icon = mode.icon;
              const isActive = route.mode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => handleRouteModeChange(mode.id)}
                  className={`
                    p-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2
                    ${isActive
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{mode.label}</span>
                </button>
              );
            })}
          </div>

          {route.mode !== 'none' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 space-y-2"
            >
              {route.distance && route.duration && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Mesafe:</span>
                    <span className="font-bold text-green-700 dark:text-green-300">{route.distance} km</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600 dark:text-gray-400">Süre:</span>
                    <span className="font-bold text-green-700 dark:text-green-300">{route.duration} dk</span>
                  </div>
                </div>
              )}
              <button
                onClick={handleCalculateRoute}
                disabled={!route.startPoint || !route.endPoint}
                className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Rota Hesapla
              </button>
              <button
                onClick={() => {
                  clearRoute();
                  toast.success('Rota temizlendi');
                }}
                className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Rotayı Temizle
              </button>
            </motion.div>
          )}
        </div>

        {/* Çizim Araçları */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Pencil className="w-4 h-4" />
            Çizim Araçları
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {drawModes.map((mode) => {
              const Icon = mode.icon;
              const isActive = drawing.isDrawing && drawing.drawMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => handleDrawingStart(mode.id)}
                  className={`
                    p-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2
                    ${isActive
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{mode.label}</span>
                </button>
              );
            })}
          </div>

          {drawing.drawnItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3"
            >
              <button
                onClick={() => {
                  clearAllDrawings();
                  toast.success('Tüm çizimler temizlendi');
                }}
                className="w-full py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Çizimleri Temizle ({drawing.drawnItems.length})
              </button>
            </motion.div>
          )}
        </div>

        {/* İstatistikler */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
          >
            <span>İstatistikler</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-2"
              >
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.totalMarkersShown}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">İşaretçi</div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.clustersCount}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Küme</div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.routesDrawn}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Rota</div>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.drawingsCount}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Çizim</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
