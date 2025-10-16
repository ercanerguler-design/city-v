import MultiDeviceDashboard from '@/components/ESP32/MultiDeviceDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Multi-Device Dashboard | City-V ESP32-CAM',
  description: 'Tüm ESP32-CAM cihazlarını tek sayfada yönetin ve izleyin',
};

export default function MultiDevicePage() {
  return <MultiDeviceDashboard />;
}
