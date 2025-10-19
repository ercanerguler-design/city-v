import { create } from 'zustand';

export interface BetaApplication {
  id: string;
  applicationId: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  
  // İşletme Bilgileri
  businessName: string;
  businessType: string;
  location: string;
  ownerName: string;
  
  // İletişim
  email: string;
  phone: string;
  website?: string;
  
  // İstatistikler
  averageDaily: string;
  openingHours: string;
  currentSolution: string;
  
  // Beklentiler
  goals: string[];
  heardFrom: string;
  additionalInfo?: string;
  
  // Admin notları
  adminNotes?: string;
  contactedAt?: Date;
  approvedAt?: Date;
}

interface BetaApplicationState {
  applications: BetaApplication[];
  addApplication: (app: Omit<BetaApplication, 'id' | 'timestamp' | 'status'>) => void;
  updateStatus: (id: string, status: BetaApplication['status']) => void;
  addNote: (id: string, note: string) => void;
  getApplicationById: (id: string) => BetaApplication | undefined;
  getPendingCount: () => number;
  getApplicationsByStatus: (status: BetaApplication['status']) => BetaApplication[];
}

export const useBetaApplicationStore = create<BetaApplicationState>((set, get) => ({
  applications: [
    // Demo data - gerçek sistemde API'den gelecek
    {
      id: '1',
      applicationId: 'BETA-12345678',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 saat önce
      status: 'pending',
      businessName: 'Kahve Durağı Cafe',
      businessType: 'cafe',
      location: 'Kızılay, Ankara',
      ownerName: 'Ahmet Yılmaz',
      email: 'ahmet@kahveduragı.com',
      phone: '+90 532 123 4567',
      website: 'https://kahveduragı.com',
      averageDaily: '150-200',
      openingHours: '08:00 - 22:00',
      currentSolution: 'none',
      goals: ['Yoğunluk takibi', 'City-V entegrasyonu', 'Bildirim gönderme'],
      heardFrom: 'social',
      additionalInfo: 'Zincir cafe açmayı planlıyoruz, 3 şube olacak.'
    },
    {
      id: '2',
      applicationId: 'BETA-87654321',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 gün önce
      status: 'contacted',
      businessName: 'Lezzet Evi Restaurant',
      businessType: 'restaurant',
      location: 'Bahçelievler, Ankara',
      ownerName: 'Mehmet Demir',
      email: 'info@lezzetevi.com',
      phone: '+90 533 987 6543',
      averageDaily: '80-120',
      openingHours: '11:00 - 23:00',
      currentSolution: 'manual',
      goals: ['Yoğunluk takibi', 'Müşteri analizi'],
      heardFrom: 'google',
      contactedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      adminNotes: 'Telefon görüşmesi yapıldı. Demo talep etti.'
    }
  ],

  addApplication: (app) => set((state) => ({
    applications: [
      {
        ...app,
        id: Date.now().toString(),
        timestamp: new Date(),
        status: 'pending'
      },
      ...state.applications
    ]
  })),

  updateStatus: (id, status) => set((state) => ({
    applications: state.applications.map(app =>
      app.id === id
        ? {
            ...app,
            status,
            ...(status === 'contacted' && { contactedAt: new Date() }),
            ...(status === 'approved' && { approvedAt: new Date() })
          }
        : app
    )
  })),

  addNote: (id, note) => set((state) => ({
    applications: state.applications.map(app =>
      app.id === id ? { ...app, adminNotes: note } : app
    )
  })),

  getApplicationById: (id) => {
    return get().applications.find(app => app.id === id);
  },

  getPendingCount: () => {
    return get().applications.filter(app => app.status === 'pending').length;
  },

  getApplicationsByStatus: (status) => {
    return get().applications.filter(app => app.status === status);
  }
}));
