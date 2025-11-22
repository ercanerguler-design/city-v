// Location object render hatalarını önlemek için utility functions

export function safeRenderLocation(location: any): string {
  if (!location) return '';
  
  if (typeof location === 'string') {
    return location;
  }
  
  if (typeof location === 'object' && location !== null) {
    // {lat, lng, address} formatında object
    if ('address' in location) {
      return location.address;
    }
    
    // {lat, lng} formatında object
    if ('lat' in location && 'lng' in location) {
      return `${location.lat}, ${location.lng}`;
    }
    
    // Diğer object formatları
    return JSON.stringify(location);
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