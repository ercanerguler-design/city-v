import ESP32Dashboard from '@/components/ESP32/Dashboard';

export default function ESP32Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ESP32Dashboard />
    </div>
  );
}