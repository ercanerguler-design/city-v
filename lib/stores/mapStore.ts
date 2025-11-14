import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MapViewMode = 'standard' | 'heatmap' | 'cluster';
export type RouteMode = 'none' | 'walking' | 'driving' | 'cycling';

interface MapSettings {
  viewMode: MapViewMode;
  showTraffic: boolean;
  show3DBuildings: boolean;
  showLabels: boolean;
  heatmapRadius: number;
  heatmapBlur: number;
  heatmapMaxZoom: number;
  clusterRadius: number;
  clusterMaxZoom: number;
}

interface RouteData {
  mode: RouteMode;
  startPoint: [number, number] | null;
  endPoint: [number, number] | null;
  waypoints: [number, number][];
  distance: number | null;
  duration: number | null;
  instructions: string[];
}

interface DrawingState {
  isDrawing: boolean;
  drawMode: 'marker' | 'circle' | 'polygon' | 'polyline' | null;
  drawnItems: any[];
}

interface MapStore {
  // Harita Ayarları
  settings: MapSettings;
  updateSettings: (settings: Partial<MapSettings>) => void;
  
  // Görünüm Modu
  viewMode: MapViewMode;
  setViewMode: (mode: MapViewMode) => void;
  
  // Rota Çizimi
  route: RouteData;
  setRouteMode: (mode: RouteMode) => void;
  setRouteStart: (point: [number, number]) => void;
  setRouteEnd: (point: [number, number]) => void;
  addWaypoint: (point: [number, number]) => void;
  removeWaypoint: (index: number) => void;
  clearRoute: () => void;
  calculateRoute: () => Promise<void>;
  
  // Çizim Araçları
  drawing: DrawingState;
  startDrawing: (mode: 'marker' | 'circle' | 'polygon' | 'polyline') => void;
  stopDrawing: () => void;
  addDrawnItem: (item: any) => void;
  removeDrawnItem: (index: number) => void;
  clearAllDrawings: () => void;
  
  // Isı Haritası
  heatmapIntensity: number;
  setHeatmapIntensity: (intensity: number) => void;
  
  // Cluster Ayarları
  clusteringEnabled: boolean;
  toggleClustering: () => void;
  
  // İstatistikler
  stats: {
    totalMarkersShown: number;
    clustersCount: number;
    routesDrawn: number;
    drawingsCount: number;
  };
  updateStats: (stats: Partial<MapStore['stats']>) => void;
  
  // Reset
  resetAll: () => void;
}

const defaultSettings: MapSettings = {
  viewMode: 'standard',
  showTraffic: false,
  show3DBuildings: false,
  showLabels: true,
  heatmapRadius: 25,
  heatmapBlur: 15,
  heatmapMaxZoom: 18,
  clusterRadius: 80,
  clusterMaxZoom: 17,
};

const defaultRoute: RouteData = {
  mode: 'none',
  startPoint: null,
  endPoint: null,
  waypoints: [],
  distance: null,
  duration: null,
  instructions: [],
};

const defaultDrawing: DrawingState = {
  isDrawing: false,
  drawMode: null,
  drawnItems: [],
};

export const useMapStore = create<MapStore>()(
  persist(
    (set, get) => ({
      // Harita Ayarları
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      
      // Görünüm Modu
      viewMode: 'standard',
      setViewMode: (mode) =>
        set({
          viewMode: mode,
          settings: { ...get().settings, viewMode: mode },
        }),
      
      // Rota Çizimi
      route: defaultRoute,
      setRouteMode: (mode) =>
        set((state) => ({
          route: { ...state.route, mode },
        })),
      
      setRouteStart: (point) =>
        set((state) => ({
          route: { ...state.route, startPoint: point },
        })),
      
      setRouteEnd: (point) =>
        set((state) => ({
          route: { ...state.route, endPoint: point },
        })),
      
      addWaypoint: (point) =>
        set((state) => ({
          route: {
            ...state.route,
            waypoints: [...state.route.waypoints, point],
          },
        })),
      
      removeWaypoint: (index) =>
        set((state) => ({
          route: {
            ...state.route,
            waypoints: state.route.waypoints.filter((_, i) => i !== index),
          },
        })),
      
      clearRoute: () =>
        set({
          route: defaultRoute,
        }),
      
      calculateRoute: async () => {
        const { route } = get();
        if (!route.startPoint || !route.endPoint) return;
        
        // Basit mesafe hesaplama (gerçek rota için API kullanılabilir)
        const [lat1, lng1] = route.startPoint;
        const [lat2, lng2] = route.endPoint;
        
        // Haversine formülü
        const R = 6371; // Dünya yarıçapı (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        // Ortalama yürüme hızı: 5 km/h
        // Ortalama araç hızı: 40 km/h
        // Ortalama bisiklet hızı: 15 km/h
        let speed = 5;
        if (route.mode === 'driving') speed = 40;
        else if (route.mode === 'cycling') speed = 15;
        
        const duration = (distance / speed) * 60; // dakika
        
        set((state) => ({
          route: {
            ...state.route,
            distance: Math.round(distance * 100) / 100,
            duration: Math.round(duration),
            instructions: [
              `Başlangıç noktasından çıkın`,
              `${distance.toFixed(1)} km ${route.mode === 'walking' ? 'yürüyün' : route.mode === 'driving' ? 'araç kullanın' : 'bisiklet sürün'}`,
              `Hedefe ulaşın`,
            ],
          },
          stats: {
            ...state.stats,
            routesDrawn: state.stats.routesDrawn + 1,
          },
        }));
      },
      
      // Çizim Araçları
      drawing: defaultDrawing,
      
      startDrawing: (mode) =>
        set({
          drawing: {
            isDrawing: true,
            drawMode: mode,
            drawnItems: get().drawing.drawnItems,
          },
        }),
      
      stopDrawing: () =>
        set((state) => ({
          drawing: {
            ...state.drawing,
            isDrawing: false,
            drawMode: null,
          },
        })),
      
      addDrawnItem: (item) =>
        set((state) => ({
          drawing: {
            ...state.drawing,
            drawnItems: [...state.drawing.drawnItems, item],
          },
          stats: {
            ...state.stats,
            drawingsCount: state.stats.drawingsCount + 1,
          },
        })),
      
      removeDrawnItem: (index) =>
        set((state) => ({
          drawing: {
            ...state.drawing,
            drawnItems: state.drawing.drawnItems.filter((_, i) => i !== index),
          },
        })),
      
      clearAllDrawings: () =>
        set((state) => ({
          drawing: {
            ...state.drawing,
            drawnItems: [],
          },
        })),
      
      // Isı Haritası
      heatmapIntensity: 0.6,
      setHeatmapIntensity: (intensity) =>
        set({ heatmapIntensity: intensity }),
      
      // Cluster Ayarları
      clusteringEnabled: true,
      toggleClustering: () =>
        set((state) => ({
          clusteringEnabled: !state.clusteringEnabled,
        })),
      
      // İstatistikler
      stats: {
        totalMarkersShown: 0,
        clustersCount: 0,
        routesDrawn: 0,
        drawingsCount: 0,
      },
      updateStats: (newStats) =>
        set((state) => ({
          stats: { ...state.stats, ...newStats },
        })),
      
      // Reset
      resetAll: () =>
        set({
          settings: defaultSettings,
          viewMode: 'standard',
          route: defaultRoute,
          drawing: defaultDrawing,
          heatmapIntensity: 0.6,
          clusteringEnabled: true,
          stats: {
            totalMarkersShown: 0,
            clustersCount: 0,
            routesDrawn: 0,
            drawingsCount: 0,
          },
        }),
    }),
    {
      name: 'cityview-map-store',
    }
  )
);
