import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Location, CrowdLevel } from '@/types';

export interface UserPreferences {
  favoriteCategories: string[];
  visitHistory: {
    locationId: string;
    category: string;
    visitTime: number;
    crowdLevel: CrowdLevel;
  }[];
  preferredTimes: number[]; // Saat (0-23)
  preferredCrowdLevel: CrowdLevel | 'any';
}

export interface SmartRecommendation {
  location: Location;
  score: number; // 0-100
  reasons: string[];
  predictedCrowdLevel?: CrowdLevel;
  bestVisitTime?: string;
  weatherSuitability?: number; // 0-100
}

export interface CrowdPrediction {
  locationId: string;
  predictions: {
    hour: number;
    predictedLevel: CrowdLevel;
    confidence: number; // 0-1
  }[];
}

interface RecommendationStore {
  preferences: UserPreferences;
  recommendations: SmartRecommendation[];
  predictions: CrowdPrediction[];
  
  // Preference Actions
  updateFavoriteCategories: (categories: string[]) => void;
  addVisitToHistory: (locationId: string, category: string, crowdLevel: CrowdLevel) => void;
  updatePreferredTimes: (times: number[]) => void;
  updatePreferredCrowdLevel: (level: CrowdLevel | 'any') => void;
  
  // Recommendation Actions
  generateRecommendations: (locations: Location[], userLocation?: [number, number], weather?: any) => SmartRecommendation[];
  predictCrowdLevels: (locationId: string, currentLevel: CrowdLevel) => CrowdPrediction;
  
  // Smart Notifications
  shouldNotify: (location: Location) => boolean;
}

export const useRecommendationStore = create<RecommendationStore>()(
  persist(
    (set, get) => ({
      preferences: {
        favoriteCategories: [],
        visitHistory: [],
        preferredTimes: [],
        preferredCrowdLevel: 'any',
      },
      recommendations: [],
      predictions: [],

      updateFavoriteCategories: (categories) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            favoriteCategories: categories,
          },
        }));
      },

      addVisitToHistory: (locationId, category, crowdLevel) => {
        set((state) => {
          const newVisit = {
            locationId,
            category,
            visitTime: Date.now(),
            crowdLevel,
          };

          // Son 100 ziyareti tut
          const updatedHistory = [newVisit, ...state.preferences.visitHistory].slice(0, 100);

          // Favori kategorileri otomatik güncelle
          const categoryCounts = updatedHistory.reduce((acc, visit) => {
            acc[visit.category] = (acc[visit.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const topCategories = Object.entries(categoryCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([cat]) => cat);

          return {
            preferences: {
              ...state.preferences,
              visitHistory: updatedHistory,
              favoriteCategories: topCategories,
            },
          };
        });
      },

      updatePreferredTimes: (times) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            preferredTimes: times,
          },
        }));
      },

      updatePreferredCrowdLevel: (level) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            preferredCrowdLevel: level,
          },
        }));
      },

      generateRecommendations: (locations, userLocation, weather) => {
        const { preferences } = get();
        const currentHour = new Date().getHours();

        const recommendations: SmartRecommendation[] = locations.map((location) => {
          let score = 50; // Base score
          const reasons: string[] = [];

          // 1. Kategori tercihi (0-25 puan)
          if (preferences.favoriteCategories.includes(location.category)) {
            const categoryScore = 25;
            score += categoryScore;
            reasons.push(`✨ Favori kategoriniz: ${location.category}`);
          }

          // 2. Yoğunluk tercihi (0-20 puan)
          if (preferences.preferredCrowdLevel !== 'any') {
            if (location.currentCrowdLevel === preferences.preferredCrowdLevel) {
              score += 20;
              reasons.push(`🎯 Tercih ettiğiniz yoğunluk seviyesi`);
            } else if (
              preferences.preferredCrowdLevel === 'empty' &&
              (location.currentCrowdLevel === 'low' || location.currentCrowdLevel === 'empty')
            ) {
              score += 15;
              reasons.push(`✅ Yoğunluk az`);
            }
          }

          // 3. Ziyaret geçmişi (0-15 puan)
          const visitCount = preferences.visitHistory.filter(
            (v) => v.category === location.category
          ).length;
          if (visitCount > 0) {
            const historyScore = Math.min(visitCount * 3, 15);
            score += historyScore;
            reasons.push(`📊 Bu tür mekanları sık ziyaret ediyorsunuz`);
          }

          // 4. Mesafe (eğer kullanıcı konumu varsa) (0-20 puan)
          if (userLocation && location.coordinates) {
            const distance = calculateDistance(
              userLocation,
              location.coordinates as [number, number]
            );
            if (distance < 0.5) {
              score += 20;
              reasons.push(`📍 Çok yakınınızda (${Math.round(distance * 1000)}m)`);
            } else if (distance < 1) {
              score += 15;
              reasons.push(`📍 Yürüme mesafesinde (${distance.toFixed(1)}km)`);
            } else if (distance < 2) {
              score += 10;
              reasons.push(`📍 Yakınınızda (${distance.toFixed(1)}km)`);
            }
          }

          // 5. Saat tercihi (0-10 puan)
          if (preferences.preferredTimes.includes(currentHour)) {
            score += 10;
            reasons.push(`⏰ Tercih ettiğiniz saat dilimi`);
          }

          // 6. Hava durumu uygunluğu (0-10 puan)
          if (weather) {
            const weatherScore = calculateWeatherSuitability(location, weather);
            score += weatherScore;
            if (weatherScore > 5) {
              reasons.push(`🌤️ Hava durumu uygun`);
            }
          }

          // 7. Açık/Kapalı durumu (-20 puan penalty)
          // Basit kontrol: çalışma saatleri varsa ve kapalıysa
          if (location.description?.includes('Kapali')) {
            score -= 20;
            reasons.push(`⚠️ Şu an kapalı`);
          }

          // 8. Rating (varsa) (0-10 puan)
          // Sosyal store'dan rating al
          const socialStorage = JSON.parse(localStorage.getItem('social-storage') || '{}');
          const rating = socialStorage?.state?.ratings?.[location.id];
          if (rating && rating.averageRating >= 4) {
            score += 10;
            reasons.push(`⭐ Yüksek puanlı (${rating.averageRating.toFixed(1)})`);
          }

          // Score'u 0-100 arası sınırla
          score = Math.max(0, Math.min(100, score));

          // Yoğunluk tahmini
          const prediction = get().predictCrowdLevels(location.id, location.currentCrowdLevel);
          const nextHourPrediction = prediction.predictions.find((p) => p.hour === currentHour + 1);

          return {
            location,
            score,
            reasons,
            predictedCrowdLevel: nextHourPrediction?.predictedLevel,
            bestVisitTime: calculateBestVisitTime(location),
            weatherSuitability: weather ? calculateWeatherSuitability(location, weather) * 10 : undefined,
          };
        });

        // En yüksek puanlı önerileri filtrele ve sırala
        const topRecommendations = recommendations
          .filter((r) => r.score >= 60) // Sadece 60+ puan alanlar
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);

        set({ recommendations: topRecommendations });
        return topRecommendations;
      },

      predictCrowdLevels: (locationId, currentLevel) => {
        const currentHour = new Date().getHours();
        const predictions: CrowdPrediction['predictions'] = [];

        // Basit tahmin algoritması: mevcut duruma göre gelecek saatleri tahmin et
        for (let i = 1; i <= 6; i++) {
          const targetHour = (currentHour + i) % 24;
          let predictedLevel = currentLevel;
          let confidence = 0.7;

          // Peak hours tahmini (sabah 8-10, öğle 12-14, akşam 17-19)
          const isPeakHour =
            (targetHour >= 8 && targetHour <= 10) ||
            (targetHour >= 12 && targetHour <= 14) ||
            (targetHour >= 17 && targetHour <= 19);

          if (isPeakHour) {
            // Peak saatlerde yoğunluk artabilir
            if (currentLevel === 'empty') predictedLevel = 'low';
            else if (currentLevel === 'low') predictedLevel = 'moderate';
            else if (currentLevel === 'moderate') predictedLevel = 'high';
            confidence = 0.65;
          } else {
            // Peak olmayan saatlerde yoğunluk azalabilir
            if (currentLevel === 'very_high') predictedLevel = 'high';
            else if (currentLevel === 'high') predictedLevel = 'moderate';
            else if (currentLevel === 'moderate') predictedLevel = 'low';
            confidence = 0.6;
          }

          // Gece saatleri (22-06) - yoğunluk düşük
          if (targetHour >= 22 || targetHour <= 6) {
            predictedLevel = 'empty';
            confidence = 0.8;
          }

          predictions.push({
            hour: targetHour,
            predictedLevel,
            confidence,
          });
        }

        const prediction: CrowdPrediction = {
          locationId,
          predictions,
        };

        set((state) => ({
          predictions: [...state.predictions.filter((p) => p.locationId !== locationId), prediction],
        }));

        return prediction;
      },

      shouldNotify: (location) => {
        const { preferences } = get();
        
        // Favori kategorilerde ve boş/az kalabalık ise bildir
        if (
          preferences.favoriteCategories.includes(location.category) &&
          (location.currentCrowdLevel === 'empty' || location.currentCrowdLevel === 'low')
        ) {
          return true;
        }

        return false;
      },
    }),
    {
      name: 'recommendation-storage',
    }
  )
);

// Helper functions
function calculateDistance(
  point1: [number, number],
  point2: [number, number]
): number {
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;

  const R = 6371; // Dünya'nın yarıçapı (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function calculateWeatherSuitability(location: Location, weather: any): number {
  // Basit hava durumu uygunluk hesaplaması
  let suitability = 5; // Base 5/10

  // Park gibi açık alanlar için hava durumu önemli
  if (location.category === 'park') {
    if (weather.temperature > 15 && weather.temperature < 28) {
      suitability = 10;
    } else if (weather.temperature < 10 || weather.temperature > 30) {
      suitability = 3;
    }
    if (weather.condition?.includes('rain')) {
      suitability = 1;
    }
  } else {
    // Kapalı alanlar için hava durumu daha az önemli
    suitability = 7;
  }

  return suitability;
}

function calculateBestVisitTime(location: Location): string {
  // Kategori bazlı en iyi ziyaret zamanı önerisi
  const currentHour = new Date().getHours();

  const bestTimes: Record<string, string> = {
    cafe: currentHour < 11 ? 'Sabah 08:00-10:00' : 'Öğleden sonra 15:00-17:00',
    bank: 'Sabah 10:00-11:00 veya Öğleden sonra 14:00-15:00',
    hospital: 'Sabah 08:00-09:00 (En az kalabalık)',
    pharmacy: 'Sabah 09:00-11:00',
    market: currentHour < 12 ? 'Sabah 10:00-11:00' : 'Akşam 20:00-21:00',
    park: 'Akşam 17:00-19:00 (Hava uygunsa)',
  };

  return bestTimes[location.category] || 'Her zaman uygun';
}
