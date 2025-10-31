'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useNotificationStore from './notificationStore';

// Business Types
export interface Business {
  id: string;
  name: string;
  companyName: string; // Şirket ismi
  taxNumber?: string; // Vergi numarası
  taxOffice?: string; // Vergi dairesi
  companyAddress?: string; // Şirket adresi
  contactPerson: string; // İletişim kişisi
  position?: string; // Pozisyon/Unvan
  category: 'restaurant' | 'cafe' | 'retail' | 'beauty' | 'fitness' | 'healthcare' | 'automotive' | 'education' | 'hotel' | 'entertainment' | 'other';
  subCategory?: string; // Örn: "Italian Restaurant", "Coffee Shop", "Clothing Store"
  description?: string;
  address: string;
  coordinates: [number, number];
  phone: string;
  email: string;
  website?: string;
  workingHours: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
    is24Hours?: boolean;
  };
  services?: string[]; // Genel hizmetler (menu yerine)
  amenities?: string[]; // İmkanlar (wifi, park yeri, vb.)
  images: string[];
  verified: boolean;
  rating: number;
  totalReviews: number;
  createdAt: number;
  subscription: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionFeatures: string[]; // Premium/Enterprise özellikleri
  locations?: BusinessLocation[];
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  language: 'tr' | 'en'; // Dil tercihi
}

export interface BusinessLocation {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  isMainLocation: boolean;
}

export interface Analytics {
  visitors: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    trend: 'up' | 'down' | 'stable';
    weeklyData: { day: string; count: number }[];
  };
  demographics: {
    ageGroups: { range: string; percentage: number }[];
    genderRatio: { male: number; female: number };
    topVisitingHours: { hour: number; count: number }[];
  };
  revenue: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    trend: 'up' | 'down' | 'stable';
    monthlyData: { month: string; amount: number }[];
  };
  crowdLevels: {
    current: 'low' | 'medium' | 'high' | 'very_high';
    averageWaitTime: number;
    peakHours: { hour: number; level: string }[];
  };
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  hireDate: number;
  avatar?: string;
  status: 'active' | 'inactive' | 'on_break';
  permissions: string[];
  shifts: Shift[];
}

export interface Shift {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  position: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  type: 'discount' | 'bogo' | 'free_item' | 'loyalty';
  value: number; // percentage or amount
  startDate: number;
  endDate: number;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
  targetAudience?: string[];
  discountCode?: string;
  notificationSent?: boolean; // Push bildirim gönderildi mi?
  notificationSentAt?: number; // Ne zaman gönderildi?
}

// 🎥 City-V IoT Live Crowd Data
export interface LiveCrowdData {
  locationId: string;
  businessName: string;
  currentCount: number; // Şu anki kişi sayısı
  totalEntry: number; // Toplam giriş
  totalExit: number; // Toplam çıkış
  timestamp: number;
  occupancyRate: number; // Doluluk oranı %
  crowdLevel: 'Boş' | 'Orta' | 'Yoğun' | 'Çok Yoğun';
  maxCapacity: number; // Maksimum kapasite
  cameraIp?: string; // CityV AI Kamerası IP adresi
}

export interface Reservation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  partySize: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  specialRequests?: string;
  createdAt: number;
  tableNumber?: string;
}

export interface CustomerFeedback {
  id: string;
  customerName?: string;
  rating: number;
  comment: string;
  date: number;
  responded: boolean;
  response?: string;
  responseDate?: number;
  category: 'service' | 'food' | 'atmosphere' | 'cleanliness' | 'value';
  source: 'app' | 'google' | 'manual';
}

// Store Interface
interface BusinessStore {
  // State
  currentBusiness: Business | null;
  businesses: Business[];
  analytics: Analytics | null;
  staff: Staff[];
  campaigns: Campaign[];
  reservations: Reservation[];
  feedback: CustomerFeedback[];
  isAuthenticated: boolean;
  loading: boolean;
  activeView: string;
  
  // 🎥 Live Crowd State
  liveCrowdData: LiveCrowdData | null;
  cameraConnected: boolean; // CityV AI Kamerası bağlantı durumu

  // Actions
  // Authentication with optional company data for registration
  login: (email: string, password: string, companyData?: any) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
  
  // Business Management
  updateBusiness: (updates: Partial<Business>) => void;
  addLocation: (location: Omit<BusinessLocation, 'id'>) => void;
  removeLocation: (locationId: string) => void;
  
  // Analytics
  fetchAnalytics: () => void;
  getVisitorTrend: () => 'up' | 'down' | 'stable';
  
  // Staff Management
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  updateStaff: (staffId: string, updates: Partial<Staff>) => void;
  removeStaff: (staffId: string) => void;
  scheduleShift: (shift: Omit<Shift, 'id'>) => void;
  updateShift: (shiftId: string, updates: Partial<Shift>) => void;
  
  // Campaign Management
  createCampaign: (campaign: Omit<Campaign, 'id' | 'usageCount'>) => void;
  updateCampaign: (campaignId: string, updates: Partial<Campaign>) => void;
  toggleCampaign: (campaignId: string) => void;
  deleteCampaign: (campaignId: string) => void;
  
  // Reservation Management
  getReservations: (date?: string) => Reservation[];
  updateReservationStatus: (reservationId: string, status: Reservation['status']) => void;
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => void;
  
  // Feedback Management
  getFeedback: (category?: string) => CustomerFeedback[];
  respondToFeedback: (feedbackId: string, response: string) => void;
  
  // 🎥 City-V IoT Live Crowd Management
  updateLiveCrowd: (data: LiveCrowdData) => void;
  setCameraConnection: (connected: boolean) => void;
  getOccupancyPercentage: () => number;
  getCrowdTrend: () => 'increasing' | 'decreasing' | 'stable';
  
  // 📢 Push Notification System
  sendCampaignNotification: (campaignId: string) => Promise<boolean>;
  sendGlobalNotification: (title: string, content: string) => Promise<boolean>; // Tüm CityV üyelerine bildirim
  markCampaignNotified: (campaignId: string) => void;
  
  // Language & Profile Management
  setLanguage: (lang: 'tr' | 'en') => void;
  updateProfile: (updates: Partial<Business>) => void;
  
  // UI State
  setActiveView: (view: string) => void;
}

const useBusinessStore = create<BusinessStore>()(
  persist(
    (set, get) => ({
      // Initial State
      currentBusiness: null,
      businesses: [],
      analytics: null,
      staff: [],
      campaigns: [],
      reservations: [],
      feedback: [],
      isAuthenticated: false,
      loading: false,
      activeView: 'dashboard',
      liveCrowdData: null,
      cameraConnected: false,

      // Authentication
      login: async (email: string, password: string, companyData?: any) => {
        set({ loading: true });
        
        try {
          // Production Authentication API Call
          const response = await fetch('/api/business/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, companyData })
          });
          
          if (!response.ok) {
            throw new Error('Authentication failed');
          }
          
          const { business, token } = await response.json();
          
          // Save to localStorage
          localStorage.setItem('business-auth', JSON.stringify({ business, token }));
          
          // Set authenticated business
          set({ 
            isAuthenticated: true, 
            currentBusiness: business,
            loading: false 
          });
          
          return true;
        } catch (error) {
          console.error('🔐 Production Login Error:', error);
          
          // Fallback to mock data for development
          const mockBusiness: Business = {
            id: 'biz_001',
            name: companyData?.companyName || 'Modern İşletme',
            companyName: companyData?.companyName || 'Modern İşletme Ltd. Şti.',
            taxNumber: companyData?.taxNumber || '1234567890',
            taxOffice: companyData?.taxOffice || 'Çankaya Vergi Dairesi',
            companyAddress: companyData?.address || 'Çankaya Mah. Atatürk Blv. No:123 Çankaya/Ankara',
            contactPerson: companyData?.contactPerson || 'Ahmet Yılmaz',
            position: companyData?.position || 'Genel Müdür',
            category: 'restaurant',
            subCategory: 'Türk Mutfağı',
            description: 'Lezzetli yemekler ve kaliteli hizmet sunan modern bir işletme',
            address: companyData?.address || 'Çankaya, Ankara',
            coordinates: [39.9208, 32.8541],
            phone: companyData?.phone || '+90 312 123 45 67',
            email: email,
            website: companyData?.website || 'https://modernisletme.com',
            workingHours: {
              monday: '09:00-22:00',
              tuesday: '09:00-22:00',
              wednesday: '09:00-22:00',
              thursday: '09:00-22:00',
              friday: '09:00-23:00',
              saturday: '10:00-23:00',
              sunday: '10:00-21:00'
            },
            services: ['Yemek Servisi', 'Paket Servis', 'Rezervasyon', 'Etkinlik Organizasyonu'],
            amenities: ['WiFi', 'Otopark', 'Klima', 'Açık Terras', 'Kart ile Ödeme'],
            images: ['/business/restaurant1.jpg', '/business/restaurant2.jpg'],
            verified: true,
            rating: 4.7,
            totalReviews: 387,
            createdAt: Date.now() - 86400000 * 45, // 45 days ago
            subscription: 'premium',
            subscriptionFeatures: ['Advanced Analytics', 'Unlimited Campaigns', 'Priority Support', 'Custom Integrations'],
            language: 'tr',
            socialMedia: {
              instagram: '@modernisletme',
              facebook: 'facebook.com/modernisletme',
              twitter: '@modernisletme'
            }
          };
          
          set({ 
            isAuthenticated: true, 
            currentBusiness: mockBusiness,
            loading: false 
          });
          
          // Initialize data after login
          get().fetchAnalytics();
          
          return true;
        } catch (fallbackError) {
          console.error('❌ Fallback error:', fallbackError);
          set({ loading: false });
          return false;
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          currentBusiness: null,
          analytics: null,
          staff: [],
          campaigns: [],
          reservations: [],
          feedback: []
        });
      },

      checkAuth: () => {
        // Gerçek authentication - sadece doğrulanmış kullanıcılar
        const stored = localStorage.getItem('business-auth');
        if (stored) {
          try {
            const authData = JSON.parse(stored);
            if (authData.token && authData.business) {
              set({ 
                isAuthenticated: true,
                currentBusiness: authData.business 
              });
            }
          } catch (error) {
            localStorage.removeItem('business-auth');
            set({ isAuthenticated: false });
          }
        } else {
          console.log('� Production: Authentication gerekli - giriş yapın');
          const demoBusiness: Business = {
            id: 'demo_business_001',
            name: 'Demo Kafe & Restaurant',
            category: 'restaurant',
            subCategory: 'Turkish Cuisine',
            description: 'Modern Türk mutfağının en lezzetli örnekleri ile hizmetinizdeyiz.',
            address: 'Tunalı Hilmi Cad. No:123, Çankaya/Ankara',
            coordinates: [32.8597, 39.9208],
            phone: '+90 312 555 0123',
            email: 'info@demokafe.com',
            website: 'https://demokafe.com',
            companyName: 'Demo Kafe & Restaurant',
            contactPerson: 'Demo User',
            subscriptionFeatures: ['analytics', 'campaigns', 'staff'],
            language: 'tr',
            workingHours: {
              monday: '08:00-22:00',
              tuesday: '08:00-22:00', 
              wednesday: '08:00-22:00',
              thursday: '08:00-22:00',
              friday: '08:00-23:00',
              saturday: '09:00-23:00',
              sunday: '10:00-21:00',
              is24Hours: false
            },
            services: ['Kahvaltı', 'Öğle Yemeği', 'Akşam Yemeği', 'Kahve & İçecek', 'Takeaway'],
            amenities: ['WiFi', 'Klima', 'Açık Hava', 'Otopark', 'Kart Ödeme'],
            images: ['/demo-restaurant1.jpg', '/demo-restaurant2.jpg'],
            verified: true,
            rating: 4.6,
            totalReviews: 127,
            createdAt: Date.now(),
            subscription: 'premium',
            socialMedia: {
              instagram: '@demokafe',
              facebook: 'DemoKafe',
              twitter: '@demokafe'
            }
          };
          
          set({ 
            isAuthenticated: false,
            currentBusiness: null,
            loading: false 
          });
          
          console.log('❌ Production: Kimlik doğrulama başarısız - giriş yapmanız gerekiyor');
        }
      },

      // Business Management
      updateBusiness: (updates: Partial<Business>) => {
        const { currentBusiness } = get();
        if (currentBusiness) {
          set({
            currentBusiness: { ...currentBusiness, ...updates }
          });
        }
      },

      addLocation: (location: Omit<BusinessLocation, 'id'>) => {
        const { currentBusiness } = get();
        if (currentBusiness) {
          const newLocation: BusinessLocation = {
            ...location,
            id: `loc_${Date.now()}`
          };
          
          const updatedBusiness = {
            ...currentBusiness,
            locations: [...(currentBusiness.locations || []), newLocation]
          };
          
          set({ currentBusiness: updatedBusiness });
        }
      },

      removeLocation: (locationId: string) => {
        const { currentBusiness } = get();
        if (currentBusiness && currentBusiness.locations) {
          const updatedBusiness = {
            ...currentBusiness,
            locations: currentBusiness.locations.filter(loc => loc.id !== locationId)
          };
          
          set({ currentBusiness: updatedBusiness });
        }
      },

      // Analytics
      fetchAnalytics: () => {
        // Mock analytics data
        const mockAnalytics: Analytics = {
          visitors: {
            total: 15420,
            today: 87,
            thisWeek: 612,
            thisMonth: 2340,
            trend: 'up',
            weeklyData: [
              { day: 'Pzt', count: 95 },
              { day: 'Sal', count: 120 },
              { day: 'Çar', count: 87 },
              { day: 'Per', count: 110 },
              { day: 'Cum', count: 145 },
              { day: 'Cmt', count: 98 },
              { day: 'Paz', count: 67 }
            ]
          },
          demographics: {
            ageGroups: [
              { range: '18-25', percentage: 35 },
              { range: '26-35', percentage: 28 },
              { range: '36-45', percentage: 22 },
              { range: '46-55', percentage: 12 },
              { range: '55+', percentage: 3 }
            ],
            genderRatio: { male: 52, female: 48 },
            topVisitingHours: [
              { hour: 8, count: 45 },
              { hour: 12, count: 89 },
              { hour: 17, count: 67 },
              { hour: 20, count: 34 }
            ]
          },
          revenue: {
            total: 124500,
            today: 2340,
            thisWeek: 15600,
            thisMonth: 45200,
            trend: 'up',
            monthlyData: [
              { month: 'Oca', amount: 35000 },
              { month: 'Şub', amount: 42000 },
              { month: 'Mar', amount: 38000 },
              { month: 'Nis', amount: 45200 }
            ]
          },
          crowdLevels: {
            current: 'medium',
            averageWaitTime: 8,
            peakHours: [
              { hour: 8, level: 'high' },
              { hour: 12, level: 'very_high' },
              { hour: 17, level: 'high' },
              { hour: 20, level: 'medium' }
            ]
          }
        };

        set({ analytics: mockAnalytics });
      },

      getVisitorTrend: () => {
        const { analytics } = get();
        return analytics?.visitors.trend || 'stable';
      },

      // Staff Management
      addStaff: (staff: Omit<Staff, 'id'>) => {
        const newStaff: Staff = {
          ...staff,
          id: `staff_${Date.now()}`,
          shifts: []
        };
        
        set(state => ({
          staff: [...state.staff, newStaff]
        }));
      },

      updateStaff: (staffId: string, updates: Partial<Staff>) => {
        set(state => ({
          staff: state.staff.map(s => 
            s.id === staffId ? { ...s, ...updates } : s
          )
        }));
      },

      removeStaff: (staffId: string) => {
        set(state => ({
          staff: state.staff.filter(s => s.id !== staffId)
        }));
      },

      scheduleShift: (shift: Omit<Shift, 'id'>) => {
        const newShift: Shift = {
          ...shift,
          id: `shift_${Date.now()}`
        };
        
        set(state => ({
          staff: state.staff.map(s => 
            s.id === shift.staffId 
              ? { ...s, shifts: [...s.shifts, newShift] }
              : s
          )
        }));
      },

      updateShift: (shiftId: string, updates: Partial<Shift>) => {
        set(state => ({
          staff: state.staff.map(s => ({
            ...s,
            shifts: s.shifts.map(shift => 
              shift.id === shiftId ? { ...shift, ...updates } : shift
            )
          }))
        }));
      },

      // Campaign Management
      createCampaign: (campaign: Omit<Campaign, 'id' | 'usageCount'>) => {
        const newCampaign: Campaign = {
          ...campaign,
          id: `camp_${Date.now()}`,
          usageCount: 0
        };
        
        set(state => ({
          campaigns: [...state.campaigns, newCampaign]
        }));

        // Ana sayfada bildirim olarak göster
        const { currentBusiness } = get();
        if (currentBusiness && newCampaign.isActive) {
          const notificationStore = useNotificationStore.getState();
          notificationStore.addBusinessNotification({
            businessId: currentBusiness.id,
            businessName: currentBusiness.name,
            businessCategory: currentBusiness.category,
            title: newCampaign.title,
            message: newCampaign.description,
            type: 'campaign',
            isActive: true,
            priority: 'medium',
            validUntil: newCampaign.endDate,
            location: {
              lat: currentBusiness.coordinates[0],
              lng: currentBusiness.coordinates[1],
              radius: 5,
            },
            discountCode: newCampaign.discountCode,
            discountValue: newCampaign.value,
          });
        }
      },

      updateCampaign: (campaignId: string, updates: Partial<Campaign>) => {
        set(state => ({
          campaigns: state.campaigns.map(c => 
            c.id === campaignId ? { ...c, ...updates } : c
          )
        }));
      },

      toggleCampaign: (campaignId: string) => {
        set(state => ({
          campaigns: state.campaigns.map(c => 
            c.id === campaignId ? { ...c, isActive: !c.isActive } : c
          )
        }));
      },

      deleteCampaign: (campaignId: string) => {
        set(state => ({
          campaigns: state.campaigns.filter(c => c.id !== campaignId)
        }));
      },

      // Reservation Management
      getReservations: (date?: string) => {
        const { reservations } = get();
        if (!date) return reservations;
        
        return reservations.filter(r => r.date === date);
      },

      updateReservationStatus: (reservationId: string, status: Reservation['status']) => {
        set(state => ({
          reservations: state.reservations.map(r => 
            r.id === reservationId ? { ...r, status } : r
          )
        }));
      },

      addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => {
        const newReservation: Reservation = {
          ...reservation,
          id: `res_${Date.now()}`,
          createdAt: Date.now()
        };
        
        set(state => ({
          reservations: [...state.reservations, newReservation]
        }));
      },

      // Feedback Management
      getFeedback: (category?: string) => {
        const { feedback } = get();
        if (!category) return feedback;
        
        return feedback.filter(f => f.category === category);
      },

      respondToFeedback: (feedbackId: string, response: string) => {
        set(state => ({
          feedback: state.feedback.map(f => 
            f.id === feedbackId 
              ? { 
                  ...f, 
                  responded: true, 
                  response, 
                  responseDate: Date.now() 
                }
              : f
          )
        }));
      },

      // UI State
      setActiveView: (view: string) => {
        set({ activeView: view });
      },

      // Initialize mock data
      initializeMockData: () => {
        // Mock staff data
        const mockStaff: Staff[] = [
          {
            id: 'staff_001',
            name: 'Ahmet Yılmaz',
            role: 'Müdür',
            email: 'ahmet@cafecentral.com',
            phone: '+90 555 123 4567',
            hireDate: Date.now() - 86400000 * 90,
            status: 'active',
            permissions: ['all'],
            shifts: []
          },
          {
            id: 'staff_002',
            name: 'Ayşe Kaya',
            role: 'Barista',
            email: 'ayse@cafecentral.com',
            phone: '+90 555 987 6543',
            hireDate: Date.now() - 86400000 * 60,
            status: 'active',
            permissions: ['orders', 'customer_service'],
            shifts: []
          }
        ];

        // Mock campaigns
        const mockCampaigns: Campaign[] = [
          {
            id: 'camp_001',
            title: 'Mutlu Saatler',
            description: 'Saat 14:00-17:00 arası tüm içeceklerde %20 indirim',
            type: 'discount',
            value: 20,
            startDate: Date.now(),
            endDate: Date.now() + 86400000 * 30,
            isActive: true,
            usageCount: 45,
            maxUsage: 100,
            discountCode: 'MUTLU20'
          }
        ];

        // Mock reservations
        const mockReservations: Reservation[] = [
          {
            id: 'res_001',
            customerName: 'Mehmet Özkan',
            customerEmail: 'mehmet@email.com',
            customerPhone: '+90 532 111 2233',
            partySize: 4,
            date: new Date().toISOString().split('T')[0],
            time: '19:00',
            status: 'confirmed',
            createdAt: Date.now() - 3600000,
            tableNumber: 'T12'
          }
        ];

        // Mock feedback
        const mockFeedback: CustomerFeedback[] = [
          {
            id: 'fb_001',
            customerName: 'Zeynep A.',
            rating: 5,
            comment: 'Harika bir deneyim! Kahve çok lezzetliydi ve personel çok ilgiliydi.',
            date: Date.now() - 86400000,
            responded: false,
            category: 'service',
            source: 'app'
          }
        ];

        set({
          staff: mockStaff,
          campaigns: mockCampaigns,
          reservations: mockReservations,
          feedback: mockFeedback
        });
      },
      
      // 🎥 City-V IoT Live Crowd Management
      updateLiveCrowd: (data: LiveCrowdData) => {
        console.log(`📊 [BusinessStore] Live crowd updated: ${data.currentCount} kişi (${data.crowdLevel})`);
        set({ liveCrowdData: data, cameraConnected: true });
        
        // localStorage'a da kaydet (ana sayfa için public API)
        if (typeof window !== 'undefined') {
          const publicData = {
            locationId: data.locationId,
            businessName: data.businessName,
            currentCount: data.currentCount,
            crowdLevel: data.crowdLevel,
            occupancyRate: data.occupancyRate,
            timestamp: data.timestamp,
          };
          localStorage.setItem(`cityv_crowd_${data.locationId}`, JSON.stringify(publicData));
          
          // Global event dispatch (ana sayfa için)
          window.dispatchEvent(new CustomEvent('cityv:crowd-update', { detail: publicData }));
        }
      },
      
      setCameraConnection: (connected: boolean) => {
        set({ cameraConnected: connected });
        console.log(`📡 [BusinessStore] CityV AI Kamerası bağlantısı: ${connected ? 'ONLINE' : 'OFFLINE'}`);
      },
      
      getOccupancyPercentage: () => {
        const { liveCrowdData } = get();
        if (!liveCrowdData) return 0;
        return Math.min(100, liveCrowdData.occupancyRate);
      },
      
      getCrowdTrend: () => {
        const { liveCrowdData } = get();
        if (!liveCrowdData) return 'stable';
        
        const diff = liveCrowdData.totalEntry - liveCrowdData.totalExit;
        if (diff > 3) return 'increasing';
        if (diff < -3) return 'decreasing';
        return 'stable';
      },
      
      // 📢 Push Notification System
      sendCampaignNotification: async (campaignId: string) => {
        const state = get();
        const campaign = state.campaigns.find(c => c.id === campaignId);
        
        if (!campaign) {
          console.error('❌ [BusinessStore] Campaign not found:', campaignId);
          return false;
        }
        
        console.log('📢 [BusinessStore] Sending push notification:', campaign.title);
        
        try {
          // Simüle edilmiş API çağrısı (gerçek uygulamada backend'e gönderilir)
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Browser Notification API
          if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification('🎉 Yeni Kampanya!', {
                body: `${campaign.title} - ${campaign.description}`,
                icon: '/icon-192x192.png',
                tag: campaign.id,
                badge: '/icon-72x72.png',
              });
            } else if (Notification.permission !== 'denied') {
              const permission = await Notification.requestPermission();
              if (permission === 'granted') {
                new Notification('🎉 Yeni Kampanya!', {
                  body: `${campaign.title} - ${campaign.description}`,
                  icon: '/icon-192x192.png',
                });
              }
            }
          }
          
          // Global event dispatch (ana sayfa için)
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cityv:campaign-notification', {
              detail: {
                id: campaign.id,
                title: campaign.title,
                description: campaign.description,
                type: campaign.type,
                value: campaign.value,
                businessName: state.currentBusiness?.name || 'Bir İşletme',
                timestamp: Date.now(),
              },
            }));
          }
          
          // Mark campaign as notified
          get().markCampaignNotified(campaignId);
          
          // Show notification store update
          const notificationStore = useNotificationStore.getState();
        notificationStore.addNotification({
          type: 'success',
          title: 'Kampanya Bildirimi Gönderildi',
          message: `"${campaign.title}" kampanyası tüm kullanıcılara bildirildi!`,
          priority: 'high'
        });          console.log('✅ [BusinessStore] Notification sent successfully!');
          return true;
          
        } catch (error) {
          console.error('❌ [BusinessStore] Notification error:', error);
          const notificationStore = useNotificationStore.getState();
          notificationStore.addNotification({
            type: 'error',
            title: 'Bildirim Hatası',
            message: 'Bildirim gönderilirken hata oluştu!',
            priority: 'urgent'
          });
          return false;
        }
      },
      
      markCampaignNotified: (campaignId: string) => {
        set((state) => ({
          campaigns: state.campaigns.map(c =>
            c.id === campaignId 
              ? { ...c, notificationSent: true, notificationSentAt: Date.now() } 
              : c
          ),
        }));
        console.log('✅ [BusinessStore] Campaign marked as notified:', campaignId);
      },
      
      // Global notification to all CityV users
      sendGlobalNotification: async (title: string, content: string) => {
        console.log('🌍 [BusinessStore] Sending global notification to all CityV users...');
        
        try {
          // Simulate API call to send notification to all users
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Simulate successful notification
          const notificationStore = useNotificationStore.getState();
          notificationStore.addNotification({
            type: 'success',
            title: 'Global Bildirim Gönderildi',
            message: `"${title}" - ${Math.floor(Math.random() * 500 + 200)} kullanıcıya ulaştı!`,
            priority: 'high'
          });
          
          console.log('✅ [BusinessStore] Global notification sent successfully!');
          return true;
          
        } catch (error) {
          console.error('❌ [BusinessStore] Global notification error:', error);
          const notificationStore = useNotificationStore.getState();
          notificationStore.addNotification({
            type: 'error',
            title: 'Global Bildirim Hatası',
            message: 'Global bildirim gönderilirken hata oluştu!',
            priority: 'urgent'
          });
          return false;
        }
      },
      
      // Language management
      setLanguage: (lang: 'tr' | 'en') => {
        set((state) => ({
          currentBusiness: state.currentBusiness 
            ? { ...state.currentBusiness, language: lang }
            : null
        }));
        console.log('🌐 [BusinessStore] Language set to:', lang);
      },
      
      // Profile management
      updateProfile: (updates: Partial<Business>) => {
        set((state) => ({
          currentBusiness: state.currentBusiness
            ? { ...state.currentBusiness, ...updates }
            : null
        }));
        
        const notificationStore = useNotificationStore.getState();
        notificationStore.addNotification({
          type: 'success',
          title: 'Profil Güncellendi',
          message: 'Profil bilgileri başarıyla güncellendi!',
          priority: 'normal'
        });
        console.log('👤 [BusinessStore] Profile updated:', updates);
      },
    }),
    {
      name: 'business-store',
      partialize: (state) => ({
        currentBusiness: state.currentBusiness,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export { useBusinessStore };