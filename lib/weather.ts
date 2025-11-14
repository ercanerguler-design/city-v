// Weather Types
export interface WeatherData {
  temp: number;
  feels_like: number;
  condition: WeatherCondition;
  description: string;
  humidity: number;
  wind_speed: number;
  icon: string;
  isMock?: boolean;
}

export type WeatherCondition =
  | 'clear'
  | 'clouds'
  | 'rain'
  | 'drizzle'
  | 'thunderstorm'
  | 'snow'
  | 'mist'
  | 'fog'
  | 'haze'
  | 'dust'
  | 'sand'
  | 'smoke'
  | 'tornado'
  | 'squall';

// Fetch weather from our API
export async function getWeather(
  lat: number,
  lon: number
): Promise<WeatherData | null> {
  try {
    const response = await fetch(
      `/api/weather?lat=${lat}&lon=${lon}`,
      {
        next: { revalidate: 600 }, // 10 dakika cache
      }
    );

    if (!response.ok) {
      throw new Error('Weather fetch failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
}

// Get weather emoji based on condition
export function getWeatherIcon(condition: WeatherCondition): string {
  const icons: Record<WeatherCondition, string> = {
    clear: '☀️',
    clouds: '☁️',
    rain: '🌧️',
    drizzle: '🌦️',
    thunderstorm: '⛈️',
    snow: '❄️',
    mist: '🌫️',
    fog: '🌫️',
    haze: '🌫️',
    dust: '🌫️',
    sand: '🌫️',
    smoke: '💨',
    tornado: '🌪️',
    squall: '💨',
  };

  return icons[condition] || '🌤️';
}

// Format temperature with unit
export function formatTemperature(temp: number): string {
  return `${Math.round(temp)}°C`;
}

// Get weather description in Turkish
export function getWeatherDescription(
  condition: WeatherCondition,
  temp: number
): string {
  if (condition === 'clear') {
    if (temp > 25) return 'Güneşli ve sıcak';
    if (temp < 10) return 'Güneşli ama soğuk';
    return 'Güneşli';
  }

  if (condition === 'rain' || condition === 'drizzle') {
    return 'Yağmurlu';
  }

  if (condition === 'thunderstorm') {
    return 'Fırtınalı';
  }

  if (condition === 'snow') {
    return 'Karlı';
  }

  if (condition === 'clouds') {
    return 'Bulutlu';
  }

  return 'Değişken';
}

// Check if weather is good for outdoor activities
export function isGoodForOutdoor(condition: WeatherCondition, temp: number): boolean {
  // Bad conditions
  const badConditions: WeatherCondition[] = [
    'rain',
    'drizzle',
    'thunderstorm',
    'snow',
    'tornado',
  ];

  if (badConditions.includes(condition)) {
    return false;
  }

  // Temperature check (too hot or too cold)
  if (temp < 0 || temp > 35) {
    return false;
  }

  return true;
}

// Get location recommendations based on weather
export function getWeatherBasedRecommendation(
  condition: WeatherCondition,
  temp: number
): {
  message: string;
  preferIndoor: boolean;
  preferOutdoor: boolean;
} {
  // Rain or storm - stay inside
  if (
    condition === 'rain' ||
    condition === 'drizzle' ||
    condition === 'thunderstorm'
  ) {
    return {
      message: '☔ Yağmur yağıyor, kapalı mekanlar öneriyoruz',
      preferIndoor: true,
      preferOutdoor: false,
    };
  }

  // Snow - indoor or snow activities
  if (condition === 'snow') {
    return {
      message: '❄️ Kar yağıyor, sıcak bir mekan bulalım',
      preferIndoor: true,
      preferOutdoor: false,
    };
  }

  // Too cold
  if (temp < 5) {
    return {
      message: '🥶 Hava çok soğuk, sıcak bir kafe iyi gider',
      preferIndoor: true,
      preferOutdoor: false,
    };
  }

  // Too hot
  if (temp > 32) {
    return {
      message: '🥵 Hava çok sıcak, kliması olan yerler iyi olur',
      preferIndoor: true,
      preferOutdoor: false,
    };
  }

  // Perfect weather
  if (condition === 'clear' && temp >= 15 && temp <= 28) {
    return {
      message: '🌞 Hava harika! Açık hava aktiviteleri için ideal',
      preferIndoor: false,
      preferOutdoor: true,
    };
  }

  // Cloudy but okay
  if (condition === 'clouds' && temp >= 10 && temp <= 28) {
    return {
      message: '☁️ Bulutlu ama yürüyüş için uygun',
      preferIndoor: false,
      preferOutdoor: true,
    };
  }

  // Default - no strong preference
  return {
    message: '🌤️ Hava değişken, size uygun mekanları bulalım',
    preferIndoor: false,
    preferOutdoor: false,
  };
}

// Get clothing recommendation
export function getClothingRecommendation(
  condition: WeatherCondition,
  temp: number
): string {
  if (condition === 'rain' || condition === 'drizzle') {
    return '☔ Şemsiye almayı unutmayın';
  }

  if (condition === 'snow') {
    return '🧥 Kalın giyinin, kar var';
  }

  if (temp < 5) {
    return '🧥 Kalın giyinin, hava çok soğuk';
  }

  if (temp < 15) {
    return '🧥 Ceket almayı unutmayın';
  }

  if (temp > 28) {
    return '👕 Hafif giyin, hava sıcak';
  }

  return '👔 Normal kıyafetler yeterli';
}

// Get OpenWeatherMap icon URL
export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
