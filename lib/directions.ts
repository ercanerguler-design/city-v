export interface RouteInfo {
  distance: {
    text: string;
    value: number; // metre
  };
  duration: {
    text: string;
    value: number; // saniye
  };
  startAddress: string;
  endAddress: string;
  steps: RouteStep[];
  polyline: string;
}

export interface RouteStep {
  distance: string;
  duration: string;
  instruction: string;
  maneuver?: string;
}

export type TravelMode = 'walking' | 'driving' | 'transit' | 'bicycling';

/**
 * Google Directions API ile iki nokta arası rota bilgisi al
 */
export async function getDirections(
  origin: [number, number], // [lat, lng]
  destination: [number, number], // [lat, lng]
  mode: TravelMode = 'walking'
): Promise<RouteInfo | null> {
  try {
    const originStr = `${origin[0]},${origin[1]}`;
    const destinationStr = `${destination[0]},${destination[1]}`;

    const response = await fetch(
      `/api/directions?origin=${originStr}&destination=${destinationStr}&mode=${mode}`
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Directions API hatası:', error);
      
      // Kullanıcıya anlamlı hata mesajı
      if (error.error === 'API key yapılandırılmamış') {
        console.warn('⚠️ API key eksik, demo modu aktif');
      }
      
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getDirections hatası:', error);
    return null;
  }
}

/**
 * Mesafeyi okunabilir formata çevir
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Süreyi okunabilir formata çevir
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  
  if (minutes < 60) {
    return `${minutes} dakika`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} saat`;
  }
  
  return `${hours} saat ${remainingMinutes} dakika`;
}

/**
 * Seyahat modu ikonu al
 */
export function getTravelModeIcon(mode: TravelMode): string {
  const icons = {
    walking: '🚶',
    driving: '🚗',
    transit: '🚌',
    bicycling: '🚴',
  };
  return icons[mode];
}

/**
 * Seyahat modu adı al
 */
export function getTravelModeName(mode: TravelMode): string {
  const names = {
    walking: 'Yürüyerek',
    driving: 'Araçla',
    transit: 'Toplu Taşıma',
    bicycling: 'Bisikletle',
  };
  return names[mode];
}
