// Google Places API ile adres → lat/lng dönüşümü

interface LocationResult {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
  placeId?: string;
}

export async function getLocationFromAddress(address: string): Promise<LocationResult | null> {
  try {
    // Google Places API Geocoding kullan
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ Google Places API key bulunamadı - NEXT_PUBLIC_GOOGLE_PLACES_API_KEY');
      return null;
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;

      return {
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id
      };
    } else {
      console.error('❌ Google Geocoding API hatası:', data.status, data.error_message);
      return null;
    }
  } catch (error) {
    console.error('❌ Konum alınamadı:', error);
    return null;
  }
}

// Browser'da konum almak için (client-side)
export async function getLocationFromAddressClient(address: string): Promise<LocationResult | null> {
  try {
    const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
    
    if (!response.ok) {
      throw new Error('Geocoding API hatası');
    }

    const data = await response.json();
    return data.location || null;
  } catch (error) {
    console.error('❌ Konum alınamadı (client):', error);
    return null;
  }
}
