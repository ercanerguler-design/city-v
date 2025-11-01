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
  // Distance from user
  distance?: number; // km cinsinden mesafe
  // Business view tracking için
  businessId?: number; // Business profiles ID
  // Business sistemine özel veriler
  businessData?: {
    businessId: string;
    hasMenu: boolean;
    hasCampaign: boolean;
    activeCampaigns: number;
    currentOccupancy?: number;
    maxCapacity?: number;
    openingHours?: string;
    socialMedia?: any;
    lastUpdate?: string;
    campaigns?: any[];
    features?: {
      aiCamera: boolean;
      realTimeData: boolean;
      campaigns: boolean;
      menu: boolean;
    };
  };
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

// Business types
export interface Business {
  id: string;
  name: string;
  email: string;
  category: string;
  subscriptionPlan: string;
  isActive: boolean;
  companyName?: string;
  contactPerson?: string;
  subscriptionFeatures?: string[];
  language?: 'tr' | 'en';
}

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isActive?: boolean;
  joinDate?: string;
}

export interface StoredUser extends User {
  id: string;
  email: string;
  name?: string;
  isActive?: boolean;
  joinDate?: string;
}

// IoT Device types
export interface IoTDevice {
  id: string;
  name: string;
  type: 'camera' | 'sensor' | 'counter' | 'station';
  status: 'active' | 'inactive' | 'maintenance';
  location: string;
  lastUpdate: Date;
  batteryLevel?: number;
  dataPoints?: any[];
}

export interface CrowdAnalysis {
  id: string;
  deviceId: string;
  timestamp: Date;
  crowdCount: number;
  averageAge: number;
  genderDistribution: {
    male: number;
    female: number;
  };
  emotionalState: {
    happy: number;
    neutral: number;
    sad: number;
  };
}

// Vehicle types
export interface VehicleArrival {
  id: string;
  vehicle_number: string;
  route_name: string;
  stop_name: string;
  arrival_time: string;
  arrival_status: 'approaching' | 'at_stop' | 'departed';
  vehicle_type: 'bus' | 'metro' | 'tram';
  vehicle_occupancy_percent: number;
  delay_minutes: number;
}

export interface CrowdStats {
  totalReports: number;
  activeUsers: number;
  trackedLocations: number;
  averageCrowdLevel: CrowdLevel;
}
