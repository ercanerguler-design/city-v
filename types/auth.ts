// Auth types
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

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  business: Business | null;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  businessName?: string;
  category?: string;
}