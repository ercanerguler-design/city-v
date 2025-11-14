import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocationVisit {
  locationId: string;
  locationName: string;
  category: string;
  timestamp: number;
  crowdLevel: string;
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  visitCount: number;
  avgCrowdLevel: number;
  lastVisit?: number;
}

export interface HourlyStats {
  hour: number;
  visitCount: number;
  avgCrowdLevel: number;
}

interface AnalyticsStore {
  visits: LocationVisit[];
  totalVisits: number;
  
  // Actions
  trackVisit: (locationId: string, locationName: string, category: string, crowdLevel: string) => void;
  getTopLocations: (limit?: number) => Array<{ locationId: string; locationName: string; count: number; category: string }>;
  getCategoryStats: () => CategoryStats[];
  getHourlyStats: () => HourlyStats[];
  getTrendingLocations: (hours?: number) => Array<{ locationId: string; locationName: string; count: number; trend: number }>;
  clearAnalytics: () => void;
}

export const useAnalyticsStore = create<AnalyticsStore>()(
  persist(
    (set, get) => ({
      visits: [],
      totalVisits: 0,

      trackVisit: (locationId, locationName, category, crowdLevel) => {
        const visit: LocationVisit = {
          locationId,
          locationName,
          category,
          timestamp: Date.now(),
          crowdLevel,
        };

        set((state) => ({
          visits: [...state.visits, visit],
          totalVisits: state.totalVisits + 1,
        }));

        console.log('📊 Ziyaret kaydedildi:', locationName);
      },

      getTopLocations: (limit = 10) => {
        const { visits } = get();
        const locationCounts = new Map<string, { count: number; name: string; category: string }>();

        visits.forEach((visit) => {
          const current = locationCounts.get(visit.locationId);
          if (current) {
            current.count++;
          } else {
            locationCounts.set(visit.locationId, {
              count: 1,
              name: visit.locationName,
              category: visit.category,
            });
          }
        });

        return Array.from(locationCounts.entries())
          .map(([locationId, data]) => ({
            locationId,
            locationName: data.name,
            count: data.count,
            category: data.category,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
      },

      getCategoryStats: () => {
        const { visits } = get();
        const categoryMap = new Map<string, { count: number; totalCrowd: number; lastVisit: number; name: string }>();

        const crowdLevelValues: Record<string, number> = {
          empty: 1,
          low: 2,
          moderate: 3,
          high: 4,
          very_high: 5,
        };

        visits.forEach((visit) => {
          const current = categoryMap.get(visit.category);
          const crowdValue = crowdLevelValues[visit.crowdLevel] || 1;

          if (current) {
            current.count++;
            current.totalCrowd += crowdValue;
            current.lastVisit = Math.max(current.lastVisit, visit.timestamp);
          } else {
            categoryMap.set(visit.category, {
              count: 1,
              totalCrowd: crowdValue,
              lastVisit: visit.timestamp,
              name: visit.category,
            });
          }
        });

        return Array.from(categoryMap.entries())
          .map(([categoryId, data]) => ({
            categoryId,
            categoryName: data.name,
            visitCount: data.count,
            avgCrowdLevel: data.totalCrowd / data.count,
            lastVisit: data.lastVisit,
          }))
          .sort((a, b) => b.visitCount - a.visitCount);
      },

      getHourlyStats: () => {
        const { visits } = get();
        const hourlyMap = new Map<number, { count: number; totalCrowd: number }>();

        const crowdLevelValues: Record<string, number> = {
          empty: 1,
          low: 2,
          moderate: 3,
          high: 4,
          very_high: 5,
        };

        visits.forEach((visit) => {
          const hour = new Date(visit.timestamp).getHours();
          const crowdValue = crowdLevelValues[visit.crowdLevel] || 1;
          const current = hourlyMap.get(hour);

          if (current) {
            current.count++;
            current.totalCrowd += crowdValue;
          } else {
            hourlyMap.set(hour, {
              count: 1,
              totalCrowd: crowdValue,
            });
          }
        });

        const result: HourlyStats[] = [];
        for (let hour = 0; hour < 24; hour++) {
          const data = hourlyMap.get(hour);
          result.push({
            hour,
            visitCount: data?.count || 0,
            avgCrowdLevel: data ? data.totalCrowd / data.count : 0,
          });
        }

        return result;
      },

      getTrendingLocations: (hours = 24) => {
        const { visits } = get();
        const now = Date.now();
        const cutoff = now - hours * 60 * 60 * 1000;

        // Son X saat içindeki ziyaretler
        const recentVisits = visits.filter((v) => v.timestamp >= cutoff);
        
        // Önceki dönem (aynı süre)
        const previousCutoff = cutoff - hours * 60 * 60 * 1000;
        const previousVisits = visits.filter((v) => v.timestamp >= previousCutoff && v.timestamp < cutoff);

        const countVisits = (visitList: LocationVisit[]) => {
          const counts = new Map<string, { count: number; name: string }>();
          visitList.forEach((v) => {
            const current = counts.get(v.locationId);
            if (current) {
              current.count++;
            } else {
              counts.set(v.locationId, { count: 1, name: v.locationName });
            }
          });
          return counts;
        };

        const recentCounts = countVisits(recentVisits);
        const previousCounts = countVisits(previousVisits);

        return Array.from(recentCounts.entries())
          .map(([locationId, data]) => {
            const prevCount = previousCounts.get(locationId)?.count || 0;
            const trend = prevCount > 0 ? ((data.count - prevCount) / prevCount) * 100 : 100;
            
            return {
              locationId,
              locationName: data.name,
              count: data.count,
              trend: Math.round(trend),
            };
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      },

      clearAnalytics: () => {
        set({ visits: [], totalVisits: 0 });
      },
    }),
    {
      name: 'analytics-storage',
    }
  )
);
