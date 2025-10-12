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
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=tr`,
      {
        headers: {
          'User-Agent': 'CityViewPro/1.0', // Nominatim requires user agent
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    
    if (!data || data.error) {
      return null;
    }

    const address = data.address || {};
    
    // Türkçe adres bilgilerini çıkar
    const city = address.city || address.town || address.province || address.state || 'Bilinmeyen Şehir';
    const district = address.county || address.suburb || address.district || '';
    const neighborhood = address.neighbourhood || address.quarter || '';
    const road = address.road || address.street || '';

    // Tam adres oluştur
    const parts = [neighborhood, road, district, city].filter(Boolean);
    const fullAddress = parts.length > 0 ? parts.join(', ') : data.display_name || 'Adres bulunamadı';

    return {
      city,
      district,
      neighborhood,
      road,
      fullAddress,
      country: address.country || 'Türkiye',
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
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
  return info?.city || 'Ankara'; // Varsayılan Ankara
}
