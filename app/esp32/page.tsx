import ESP32CamDashboard from '@/components/ESP32/ESP32CamDashboard';
import PremiumGuard from '@/components/Auth/PremiumGuard';

export default function ESP32Page() {
  return (
    <PremiumGuard>
      <ESP32CamDashboard />
    </PremiumGuard>
  );
}