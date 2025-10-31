import ProfessionalBusinessDashboard from '@/components/Business/ProfessionalBusinessDashboard';
import VideoAccessGuard from '@/components/Auth/VideoAccessGuard';
import PremiumGuard from '@/components/Auth/PremiumGuard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Professional IoT Analytics Dashboard | City-V Enterprise',
  description: 'Enterprise-grade IoT business intelligence dashboard with real-time analytics, AI-powered insights, and comprehensive business metrics.',
  keywords: 'IoT dashboard, business intelligence, enterprise analytics, professional dashboard, AI insights, real-time data'
};

export default function ProfessionalIoTPage() {
  return (
    <PremiumGuard>
      <VideoAccessGuard deviceType="professional-iot" deviceId="PRO-IOT-001">
        <ProfessionalBusinessDashboard />
      </VideoAccessGuard>
    </PremiumGuard>
  );
}