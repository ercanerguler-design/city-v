'use client';

import { useEffect } from 'react';
import { initializePWA } from '@/lib/stores/pwaStore';
import PWAInstallPrompt from '@/components/PWA/PWAInstallPrompt';
import OnlineStatusIndicator from '@/components/PWA/OnlineStatusIndicator';

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize PWA features
    initializePWA();
  }, []);

  return (
    <>
      {children}
      <PWAInstallPrompt />
      <OnlineStatusIndicator />
    </>
  );
}
