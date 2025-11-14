import MultiDeviceDashboard from '@/components/ESP32/MultiDeviceDashboard';
import PremiumGuard from '@/components/Auth/PremiumGuard';
import VideoAccessGuard from '@/components/Auth/VideoAccessGuard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Multi-Device Dashboard | City-V ESP32-CAM',
  description: 'Tüm ESP32-CAM cihazlarını tek sayfada yönetin ve izleyin',
};

export default function MultiDevicePage() {
  return (
    // Temporarily disable guards for debugging
    <MultiDeviceDashboard />
    // <PremiumGuard>
    //   <VideoAccessGuard deviceType="esp32-multi" deviceId="ESP32-MULTI-001">
    //     <MultiDeviceDashboard />
    //   </VideoAccessGuard>
    // </PremiumGuard>
  );
}
