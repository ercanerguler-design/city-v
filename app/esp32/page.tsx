import ESP32CamDashboard from '@/components/ESP32/ESP32CamDashboard';
import PremiumGuard from '@/components/Auth/PremiumGuard';
import VideoAccessGuard from '@/components/Auth/VideoAccessGuard';

export default function ESP32Page() {
  return (
    <PremiumGuard>
      <VideoAccessGuard deviceType="esp32-cam" deviceId="ESP32-001">
        <ESP32CamDashboard />
      </VideoAccessGuard>
    </PremiumGuard>
  );
}