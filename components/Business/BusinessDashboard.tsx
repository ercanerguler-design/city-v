'use client';

import { useState, useEffect } from 'react';
import { useBusinessStore, type Business } from '@/store/businessStore';
import BusinessSidebar from './BusinessSidebar';
import DashboardOverview from './DashboardOverview';
import AnalyticsDashboard from './AnalyticsDashboard';
import StaffManagement from './StaffManagement';
import CampaignManagement from './CampaignManagement';
import ReservationManagement from './ReservationManagement';
import FeedbackManagement from './FeedbackManagement';
import BusinessSettings from './BusinessSettings';
import BusinessProfileEdit from './BusinessProfileEdit';
import WorkingHoursEdit from './WorkingHoursEdit';

interface BusinessDashboardProps {
  business: Business;
}

export default function BusinessDashboard({ business }: BusinessDashboardProps) {
  const { activeView, setActiveView, logout } = useBusinessStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showHoursEdit, setShowHoursEdit] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // 🔥 DEBUG: Modal state'lerini takip et
  useEffect(() => {
    console.log('🔧 BusinessDashboard Debug:', {
      showProfileEdit,
      showHoursEdit,
      businessName: business.name
    });
  }, [showProfileEdit, showHoursEdit, business.name]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardOverview business={business} />;
      case 'analytics':
        return <AnalyticsDashboard business={business} />;
      case 'staff':
        return <StaffManagement business={business} />;
      case 'campaigns':
        return <CampaignManagement business={business} />;
      case 'reservations':
        return <ReservationManagement business={business} />;
      case 'feedback':
        return <FeedbackManagement business={business} />;
      case 'settings':
        return <BusinessSettings business={business} />;
      default:
        return <DashboardOverview business={business} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 📱 Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{business.name}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">İşletme Paneli</p>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <div className={`${
        isMobileSidebarOpen ? 'block' : 'hidden'
      } md:block md:w-64 bg-white dark:bg-gray-800 shadow-lg ${
        isMobileSidebarOpen ? 'fixed left-0 top-16 bottom-0 z-50 overflow-y-auto' : ''
      }`}>
        <BusinessSidebar 
          business={business}
          activeView={activeView}
          setActiveView={(view) => {
            setActiveView(view);
            setIsMobileSidebarOpen(false); // Close mobile sidebar on selection
          }}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onLogout={logout}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 🖥️ Desktop Header */}
        <header className="hidden md:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
                <p className="text-sm text-gray-600">{business.address}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Edit Buttons */}
              <button
                onClick={() => {
                  console.log('🔵 Profili Düzenle butonu tıklandı');
                  setShowProfileEdit(true);
                  console.log('🔵 showProfileEdit state:', true);
                }}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Profili Düzenle
              </button>
              <button
                onClick={() => {
                  console.log('🟢 Saatler butonu tıklandı');
                  setShowHoursEdit(true);
                  console.log('🟢 showHoursEdit state:', true);
                }}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Saatler
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v4" />
                </svg>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              {/* Business Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  business.verified ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-sm text-gray-600">
                  {business.verified ? 'Doğrulanmış' : 'Doğrulama Bekliyor'}
                </span>
              </div>

              {/* Subscription Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                business.subscription === 'premium' 
                  ? 'bg-purple-100 text-purple-800'
                  : business.subscription === 'basic'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {business.subscription.toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-3 md:p-6">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Edit Modals */}
      {showProfileEdit && (
        <BusinessProfileEdit
          business={business}
          onClose={() => {
            setShowProfileEdit(false);
          }}
        />
      )}

      {showHoursEdit && (
        <WorkingHoursEdit
          business={business}
          onClose={() => {
            setShowHoursEdit(false);
          }}
        />
      )}
    </div>
  );
}