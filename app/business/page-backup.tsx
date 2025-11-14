'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BusinessProfessionalDashboard from '@/components/Business/BusinessProfessionalDashboard';
import BusinessMembershipAuth from '@/components/Business/BusinessMembershipAuth';
import { useBusinessStore } from '@/store/businessStore';

export default function BusinessPage() {
  const { isAuthenticated, currentBusiness, checkAuth, loading } = useBusinessStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Business üyesi değilse giriş sayfası göster
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-400 mx-auto"></div>
          <p className="text-white mt-4 text-lg">Loading CityV Business Platform...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentBusiness) {
    return <BusinessMembershipAuth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <BusinessProfessionalDashboard business={currentBusiness} />
    </div>
  );
}