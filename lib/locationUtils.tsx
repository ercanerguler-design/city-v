// Location object render hatalarını önlemek için utility functions

export function safeRenderLocation(location: any): string {
  if (!location) return '';
  
  if (typeof location === 'string') {
    return location;
  }
  
  if (typeof location === 'object' && location !== null) {
    // {lat, lng, address} formatında object
    if ('address' in location && location.address) {
      return String(location.address);
    }
    
    // {lat, lng} formatında object
    if ('lat' in location && 'lng' in location) {
      return `${location.lat}, ${location.lng}`;
    }
    
    // name property varsa onu kullan
    if ('name' in location && location.name) {
      return String(location.name);
    }
    
    // title property varsa onu kullan
    if ('title' in location && location.title) {
      return String(location.title);
    }
    
    // Hiçbiri yoksa, object render edilmesin
    console.warn('⚠️ Location object could not be safely rendered:', Object.keys(location));
    return 'Konum bilgisi mevcut değil';
  }
  
  return String(location);
}

// React Error #31 önleyici wrapper
export function SafeLocationRender({ location, fallback = 'Konum bilgisi yok' }: {
  location: any;
  fallback?: string;
}) {
  return <>{safeRenderLocation(location) || fallback}</>;
}