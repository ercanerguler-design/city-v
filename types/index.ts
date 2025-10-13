export interface Location {
  id: string;
  name: string;
  category: string;
  coordinates: [number, number];
  address: string;
  currentCrowdLevel: CrowdLevel;
  averageWaitTime: number;
  lastUpdated: Date;
  description?: string;
  imageUrl?: string;
  workingHours?: WorkingHours;
  phone?: string;
  isOpen?: boolean;
  rating?: number; // Google rating (1-5)
  reviewCount?: number; // Google review count
  estimatedWaitTime?: number; // Real-time estimated wait time in minutes
  // Google API entegrasyonu için yeni alanlar
  googlePlaceId?: string; // Google Place ID
  isCurrentlyOpen?: boolean; // Google API'den gelen gerçek zamanlı durum
  lastWorkingHoursUpdate?: number; // Son güncelleme timestamp'i
}

export interface WorkingHours {
  weekday: string; // "09:00-18:00"
  saturday?: string; // "09:00-14:00" veya "Kapalı"
  sunday?: string; // "Kapalı"
  is24Hours?: boolean;
}

export interface CrowdReport {
  id: string;
  locationId: string;
  userId: string;
  crowdLevel: CrowdLevel;
  waitTime: number;
  timestamp: Date;
  verified: boolean;
  comment?: string;
}

export type CrowdLevel = 'empty' | 'low' | 'moderate' | 'high' | 'very_high';

export interface MapViewport {
  center: [number, number];
  zoom: number;
}

export interface CrowdStats {
  totalReports: number;
  activeUsers: number;
  trackedLocations: number;
  averageCrowdLevel: CrowdLevel;
}
