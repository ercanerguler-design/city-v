'use client';

import { useState, useEffect } from 'react';
import BusinessDashboard from '@/components/Business/BusinessDashboard';
import BusinessAuth from '@/components/Business/BusinessAuth';
import PremiumGuard from '@/components/Auth/PremiumGuard';
import { useBusinessStore } from '@/store/businessStore';

export default function BusinessPage() {
  const { isAuthenticated, currentBusiness, checkAuth, loading } = useBusinessStore();

  useEffect(() => {
    console.log('📊 BusinessPage mounted:', { isAuthenticated, currentBusiness: currentBusiness?.name, loading });
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    console.log('📊 BusinessPage state changed:', { isAuthenticated, currentBusiness: currentBusiness?.name, loading });
  }, [isAuthenticated, currentBusiness, loading]);

  return (
    <PremiumGuard>
      {loading ? (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Yükleniyor...</p>
          </div>
        </div>
      ) : !isAuthenticated || !currentBusiness ? (
        <BusinessAuth />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <BusinessDashboard business={currentBusiness} />
        </div>
      )}
    </PremiumGuard>
  );
}