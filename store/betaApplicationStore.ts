import { create } from 'zustand';

export interface BetaApplication {
  id: number;
  application_id: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  location: string;
  business_type: string;
  average_daily: string;
  opening_hours: string;
  current_solution?: string;
  goals: string[];
  heard_from?: string;
  website?: string;
  additional_info?: string;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  admin_notes?: string;
  contacted_at?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

interface BetaApplicationState {
  applications: BetaApplication[];
  loading: boolean;
  error: string | null;
  
  // API Actions
  fetchApplications: (status?: string) => Promise<void>;
  updateStatus: (applicationId: string, status: BetaApplication['status'], notes?: string) => Promise<void>;
  deleteApplication: (applicationId: string) => Promise<void>;
  
  // Helpers
  getApplicationById: (applicationId: string) => BetaApplication | undefined;
  getPendingCount: () => number;
  getApplicationsByStatus: (status: BetaApplication['status']) => BetaApplication[];
}

export const useBetaApplicationStore = create<BetaApplicationState>((set, get) => ({
  applications: [],
  loading: false,
  error: null,

  // Postgres'ten başvuruları getir
  fetchApplications: async (status?: string) => {
    try {
      set({ loading: true, error: null });
      
      const url = status && status !== 'all' 
        ? `/api/admin/beta-applications?status=${status}`
        : '/api/admin/beta-applications';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        set({ 
          applications: data.applications, 
          loading: false 
        });
      } else {
        set({ 
          error: 'Başvurular yüklenemedi', 
          loading: false 
        });
      }
    } catch (error) {
      console.error('Başvuru yükleme hatası:', error);
      set({ 
        error: 'Bağlantı hatası', 
        loading: false 
      });
    }
  },

  // Status güncelle
  updateStatus: async (applicationId: string, status: BetaApplication['status'], notes?: string) => {
    try {
      const response = await fetch('/api/admin/beta-applications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status,
          adminNotes: notes
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Local state'i güncelle
        set((state) => ({
          applications: state.applications.map(app =>
            app.application_id === applicationId ? data.application : app
          )
        }));
      } else {
        set({ error: 'Güncelleme başarısız' });
      }
    } catch (error) {
      console.error('Status güncelleme hatası:', error);
      set({ error: 'Bağlantı hatası' });
    }
  },

  // Başvuruyu sil
  deleteApplication: async (applicationId: string) => {
    try {
      const response = await fetch(`/api/admin/beta-applications?applicationId=${applicationId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Local state'ten kaldır
        set((state) => ({
          applications: state.applications.filter(app => app.application_id !== applicationId)
        }));
      } else {
        set({ error: 'Silme başarısız' });
      }
    } catch (error) {
      console.error('Başvuru silme hatası:', error);
      set({ error: 'Bağlantı hatası' });
    }
  },

  // Helpers
  getApplicationById: (applicationId: string) => {
    return get().applications.find(app => app.application_id === applicationId);
  },

  getPendingCount: () => {
    return get().applications.filter(app => app.status === 'pending').length;
  },

  getApplicationsByStatus: (status: BetaApplication['status']) => {
    return get().applications.filter(app => app.status === status);
  }
}));
