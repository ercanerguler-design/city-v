import ProfessionalBusinessDashboard from '@/components/Business/ProfessionalBusinessDashboard';
import VideoAccessGuard from '@/components/Auth/VideoAccessGuard';
import PremiumGuard from '@/components/Auth/PremiumGuard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Intelligence IoT Dashboard | City-V Enterprise',
  description: 'Professional multi-location business analytics with AI-powered insights, real-time customer flow analysis, and revenue optimization for enterprises.',
  keywords: 'business intelligence, IoT dashboard, customer analytics, AI insights, enterprise analytics, retail analytics, restaurant analytics'
};

export default function BusinessIoTPage() {
  return (
    <PremiumGuard>
      <VideoAccessGuard deviceType="business-iot" deviceId="BIZ-IOT-001">
        <ProfessionalBusinessDashboard />
      </VideoAccessGuard>
    </PremiumGuard>
  );
}
