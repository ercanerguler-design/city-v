import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    console.log('🌤️ Weather API çağrıldı:', { lat, lon });

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Lat ve lon parametreleri gerekli' },
        { status: 400 }
      );
    }

    // Open-Meteo API - Ücretsiz ve API key gerektirmiyor!
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m&timezone=auto`;

    console.log('🌐 Open-Meteo API çağrılıyor...');

    const response = await fetch(url, {
      next: { revalidate: 600 }, // 10 dakika cache
    });

    if (!response.ok) {
      console.error('❌ Open-Meteo API hatası:', response.status);
      throw new Error('Weather API failed');
    }

    const data = await response.json();

    console.log('📊 Open-Meteo yanıtı:', data.current);

    // Weather code to condition mapping
    const weatherCode = data.current.weather_code;
    let condition = 'clear';
    let description = 'Açık hava';
    let icon = '01d';

    // Weather code mapping (WMO Weather interpretation codes)
    if (weatherCode === 0) {
      condition = 'clear';
      description = 'Açık hava';
      icon = '01d';
    } else if (weatherCode <= 3) {
      condition = 'clouds';
      description = 'Parçalı bulutlu';
      icon = '02d';
    } else if (weatherCode >= 51 && weatherCode <= 67) {
      condition = 'rain';
      description = 'Yağmurlu';
      icon = '10d';
    } else if (weatherCode >= 71 && weatherCode <= 77) {
      condition = 'snow';
      description = 'Karlı';
      icon = '13d';
    } else if (weatherCode >= 80 && weatherCode <= 82) {
      condition = 'rain';
      description = 'Sağanak yağışlı';
      icon = '09d';
    } else if (weatherCode >= 95 && weatherCode <= 99) {
      condition = 'thunderstorm';
      description = 'Fırtınalı';
      icon = '11d';
    } else if (weatherCode >= 45 && weatherCode <= 48) {
      condition = 'fog';
      description = 'Sisli';
      icon = '50d';
    }

    const result = {
      temp: Math.round(data.current.temperature_2m),
      feels_like: Math.round(data.current.apparent_temperature),
      condition: condition,
      description: description,
      humidity: data.current.relative_humidity_2m,
      wind_speed: data.current.wind_speed_10m / 3.6, // km/h to m/s
      icon: icon,
      isMock: false,
    };

    console.log('✅ Hava durumu hazırlandı:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Weather API hatası:', error);
    // Hata durumunda mock data
    return NextResponse.json({
      temp: 18,
      feels_like: 16,
      condition: 'clear',
      description: 'Açık hava',
      humidity: 65,
      wind_speed: 3.5,
      icon: '01d',
      isMock: true,
    });
  }
}
