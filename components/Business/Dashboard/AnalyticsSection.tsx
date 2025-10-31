'use client';

import { TrendingUp } from 'lucide-react';

export default function AnalyticsSection({ businessProfile }: { businessProfile: any }) {
  return (
    <div className="text-center py-12">
      <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Analitik Paneli</h3>
      <p className="text-gray-500">Grafikler ve raporlar yakında eklenecek</p>
    </div>
  );
}
