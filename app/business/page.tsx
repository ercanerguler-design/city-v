'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BusinessPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/business/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Yeni dashboard'a yönlendiriliyor...</p>
      </div>
    </div>
  );
}
