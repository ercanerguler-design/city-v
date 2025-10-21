'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AuthCallback() {
  const router = useRouter();
  const { loginWithGoogle } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL'den credential parametresini al
        const params = new URLSearchParams(window.location.search);
        const credential = params.get('credential');

        if (!credential) {
          // Hash'den de kontrol et (bazı mobil cihazlarda hash'de gelir)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const hashCredential = hashParams.get('credential');
          
          if (!hashCredential) {
            throw new Error('Credential bulunamadı');
          }
          
          // Credential'ı decode et
          const decoded = JSON.parse(atob(hashCredential.split('.')[1]));
          
          await loginWithGoogle({
            email: decoded.email,
            name: decoded.name,
            picture: decoded.picture,
            googleId: decoded.sub
          });

          setStatus('success');
          setTimeout(() => router.push('/'), 1000);
          return;
        }

        // Normal credential işleme
        const decoded = JSON.parse(atob(credential.split('.')[1]));
        
        await loginWithGoogle({
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
          googleId: decoded.sub
        });

        setStatus('success');
        setTimeout(() => router.push('/'), 1000);
      } catch (err: any) {
        console.error('❌ Callback error:', err);
        setStatus('error');
        setError(err.message || 'Giriş işlemi başarısız oldu');
        setTimeout(() => router.push('/'), 3000);
      }
    };

    handleCallback();
  }, [loginWithGoogle, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Giriş yapılıyor...
            </h2>
            <p className="text-gray-600">
              Google hesabınız doğrulanıyor
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Giriş Başarılı! ✅
            </h2>
            <p className="text-gray-600">
              Ana sayfaya yönlendiriliyorsunuz...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Bir Hata Oluştu ❌
            </h2>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <p className="text-sm text-gray-500">
              Ana sayfaya yönlendiriliyorsunuz...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
