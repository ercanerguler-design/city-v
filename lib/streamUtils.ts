/**
 * ESP32-CAM Stream URL Utilities
 * 
 * Browser'lar RTSP protokolünü desteklemez, bu yüzden tüm RTSP URL'lerini
 * HTTP MJPEG formatına çevirmemiz gerekiyor.
 */

/**
 * RTSP URL'ini HTTP MJPEG formatına çevirir
 * @param url - Orijinal stream URL (RTSP veya HTTP)
 * @param ipAddress - Fallback IP adresi
 * @param port - Fallback port (default: 80)
 * @returns HTTP formatında stream URL
 */
export function convertToHttpStream(
  url: string | null | undefined,
  ipAddress?: string | null,
  port?: number | null
): string {
  // URL varsa kontrol et
  if (url) {
    // Zaten HTTP/HTTPS ise direkt döndür
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // RTSP ise HTTP'ye çevir
    if (url.startsWith('rtsp://')) {
      // RTSP formatı: rtsp://user:pass@ip:port/path veya rtsp://ip:port/path
      // Email kullanıcı adı durumunu da handle et (@ karakteri 2 kez olabilir)
      
      // Önce tüm URL'i parse edelim
      const urlWithoutProtocol = url.replace('rtsp://', '');
      
      // Son @ işaretini bulalım (IP öncesi)
      const lastAtIndex = urlWithoutProtocol.lastIndexOf('@');
      
      if (lastAtIndex > -1) {
        // Credentials var
        const ipPortPath = urlWithoutProtocol.substring(lastAtIndex + 1);
        const [ipPort, ...pathParts] = ipPortPath.split('/');
        const [ip, urlPort] = ipPort.split(':');
        const finalPort = urlPort || port || 80;
        const finalPath = pathParts.length > 0 ? '/' + pathParts.join('/') : '/stream';
        return `http://${ip}:${finalPort}${finalPath}`;
      } else {
        // Credentials yok, sadece IP
        const [ipPort, ...pathParts] = urlWithoutProtocol.split('/');
        const [ip, urlPort] = ipPort.split(':');
        const finalPort = urlPort || port || 80;
        const finalPath = pathParts.length > 0 ? '/' + pathParts.join('/') : '/stream';
        return `http://${ip}:${finalPort}${finalPath}`;
      }
    }
  }
  
  // Fallback: IP ve port'tan oluştur
  if (ipAddress) {
    const finalPort = port || 80;
    return `http://${ipAddress}:${finalPort}/stream`;
  }
  
  // Son çare: Demo stream URL (test için)
  // Gerçek çalışan public MJPEG stream
  return 'http://77.223.99.166:8080/mjpg/video.mjpg'; // Demo traffic camera
}

/**
 * Kamera objesinden stream URL'i al ve HTTP formatına çevir
 * @param camera - Kamera objesi (stream_url, rtsp_url, ip_address, port içerebilir)
 * @returns HTTP formatında stream URL
 */
export function getCameraStreamUrl(camera: any): string {
  // Önce stream_url'i dene - zaten HTTP ise direkt döndür
  if (camera.stream_url) {
    // HTTP/HTTPS URL ise direkt döndür (port dahil)
    if (camera.stream_url.startsWith('http://') || camera.stream_url.startsWith('https://')) {
      return camera.stream_url;
    }
    // RTSP ise convert et
    return convertToHttpStream(camera.stream_url, camera.ip_address, camera.port);
  }
  
  // Sonra rtsp_url'i dene
  if (camera.rtsp_url) {
    return convertToHttpStream(camera.rtsp_url, camera.ip_address, camera.port);
  }
  
  // Son çare: IP ve port'tan oluştur
  return convertToHttpStream(null, camera.ip_address, camera.port);
}

/**
 * Stream URL'in geçerli olup olmadığını kontrol eder
 * @param url - Kontrol edilecek URL
 * @returns URL geçerliyse true
 */
export function isValidStreamUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * ESP32-CAM için önerilen stream endpoint'leri
 */
export const ESP32_STREAM_ENDPOINTS = {
  stream: '/stream',        // MJPEG stream
  capture: '/capture',      // Tek frame
  status: '/status',        // Kamera durumu
  control: '/control',      // Kamera kontrol
} as const;

/**
 * Stream URL'e timestamp ve cache-busting parametreleri ekler
 * @param url - Base URL
 * @returns Cache-busting parametreli URL
 */
export function addCacheBusting(url: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}&cache=${Math.random().toString(36).substring(7)}`;
}
