import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  membershipTier: 'free' | 'premium' | 'professional';
  avatar?: string;
  xp?: number;
  level?: number;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  useEffect(() => {
    // Demo için varsayılan kullanıcı bilgileri
    const demoUser: User = {
      id: 1,
      name: 'Demo Kullanıcı',
      email: 'demo@city-v.com',
      membershipTier: 'premium',
      avatar: undefined,
      xp: 1250,
      level: 5
    };

    // Simüle edilmiş auth check
    setTimeout(() => {
      setAuthState({
        isAuthenticated: true,
        user: demoUser,
        loading: false
      });
    }, 100);
  }, []);

  return authState;
}