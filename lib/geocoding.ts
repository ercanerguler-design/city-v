// Koordinatlardan adres bilgisi al (Reverse Geocoding)
// Nominatim OpenStreetMap API kullanıyoruz (ücretsiz)

export interface AddressInfo {
  city?: string;
  district?: string;
  neighborhood?: string;
  road?: string;
  fullAddress: string;
  country?: string;
}

export async function reverseGeocode(lat: number, lng: number): Promise<AddressInfo | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'CityV-App/1.0',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Geocoding response not OK:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data || data.error) {
      console.error('Geocoding data error:', data?.error);
      return null;
    }

    const address = data.address || {};
    
    // Global adres bilgilerini çıkar - Daha kapsamlı
    const city = address.city || address.town || address.village || address.municipality || 
                 address.state || address.province || address.county || '';
    const district = address.county || address.suburb || address.district || address.municipality || '';
    const neighborhood = address.neighbourhood || address.quarter || address.suburb || '';
    const road = address.road || address.street || address.pedestrian || '';

    // Tam adres oluştur
    const parts = [road, neighborhood, district, city].filter(Boolean);
    const fullAddress = parts.length > 0 ? parts.join(', ') : data.display_name || 'Adres bulunamadı';

    console.log('✅ Geocoding başarılı:', { city, district, country: address.country });

    return {
      city: city || 'Bilinmeyen',
      district,
      neighborhood,
      road,
      fullAddress,
      country: address.country || 'Bilinmeyen',
    };
  } catch (error) {
    console.error('❌ Reverse geocoding hatası:', error);
    return null;
  }
}

// Basit adres formatlama
export function formatAddress(info: AddressInfo | null): string {
  if (!info) return 'Konum alınıyor...';
  
  const parts: string[] = [];
  
  if (info.neighborhood) parts.push(info.neighborhood);
  if (info.district) parts.push(info.district);
  if (info.city) parts.push(info.city);
  
  return parts.length > 0 ? parts.join(', ') : info.fullAddress;
}

// Koordinatlardan şehir ismi al
export async function getCityName(lat: number, lng: number): Promise<string> {
  const info = await reverseGeocode(lat, lng);
  return info?.city || 'Bilinmeyen'; // Global - herhangi bir konum
}
