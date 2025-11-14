'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import authStorage from '@/lib/authStorage';

export default function BusinessLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState('');

  // Zaten login olmuş mu kontrol et
  useEffect(() => {
    const checkExistingAuth = async () => {
      console.log('🔍 Checking existing auth...');
      const token = authStorage.getToken();
      
      if (!token) {
        console.log('❌ No existing token, showing login form');
        setIsChecking(false);
        return;
      }

      // GEÇİCİ: Verify-token bypass - token varsa direkt dashboard'a yönlendir
      console.log('✅ Token found, redirecting to dashboard (verify skipped)');
      toast.success('Giriş bilgileriniz bulundu! Yönlendiriliyorsunuz...');
      window.location.href = '/business/dashboard';
      return;

      /* ESKI KOD - verify-token
      console.log('📋 Token found, verifying...');
      
      try {
        // Token'ı verify et
        const response = await fetch('/api/business/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.valid) {
          console.log('✅ Valid token, redirecting to dashboard...');
          toast.success('Zaten giriş yapmışsınız! Yönlendiriliyorsunuz...');
          window.location.href = '/business/dashboard';
        } else {
          console.log('❌ Invalid token, clearing and showing login');
          authStorage.clear();
          setIsChecking(false);
        }
      } catch (error) {
        console.error('❌ Token check error:', error);
        authStorage.clear();
        setIsChecking(false);
      }
      */
    };

    checkExistingAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Detailed mobile debugging
    const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent);
    const userAgent = navigator.userAgent;
    
    console.log('🔐 ============ LOGIN DEBUG START ============');
    console.log('📱 Device Info:', {
      isMobile,
      userAgent,
      platform: navigator.platform,
      language: navigator.language
    });
    console.log('📧 Credentials:', { email, passwordLength: password.length });

    try {
      console.log('🌐 Fetching login API...');
      
      const response = await fetch('/api/business/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      const data = await response.json();
      console.log('📋 Login response data:', {
        success: response.ok,
        hasToken: !!data.token,
        hasUser: !!data.user,
        error: data.error,
        tokenLength: data.token?.length || 0
      });

      if (!response.ok) {
        console.error('❌ Login failed:', {
          status: response.status,
          error: data.error
        });
        throw new Error(data.error || 'Giriş başarısız');
      }

      console.log('✅ Login API success');

      // Storage availability check
      const storageAvail = authStorage.isAvailable();
      console.log('💾 Storage availability:', storageAvail);

      if (!storageAvail.localStorage && !storageAvail.cookies) {
        throw new Error('Tarayıcı depolama devre dışı. Lütfen gizli modu kapatın ve çerezleri etkinleştirin.');
      }

      // Token ve user'ı kaydet (cross-platform storage)
      console.log('💾 Saving token to storage...');
      const tokenSaved = authStorage.setToken(data.token);
      console.log('💾 Token saved:', tokenSaved);
      
      console.log('💾 Saving user to storage...');
      const userSaved = authStorage.setUser(data.user);
      console.log('💾 User saved:', userSaved);

      if (!tokenSaved || !userSaved) {
        console.error('❌ Storage save failed:', { tokenSaved, userSaved });
        throw new Error('Veri kaydetme hatası. Tarayıcı ayarlarınızı kontrol edin.');
      }
      
      // Doğrulama: Kaydedilen veriyi oku
      console.log('🔍 Verifying saved data...');
      const verifyToken = authStorage.getToken();
      const verifyUser = authStorage.getUser();
      
      console.log('🔍 Verification result:', {
        hasToken: !!verifyToken,
        hasUser: !!verifyUser,
        tokenLength: verifyToken?.length || 0,
        userEmail: verifyUser?.email || 'none'
      });
      
      if (!verifyToken || !verifyUser) {
        console.error('❌ Verification failed');
        throw new Error('Tarayıcı depolama doğrulaması başarısız. Lütfen çerezleri etkinleştirin.');
      }

      console.log('✅ All checks passed!');
      toast.success('✅ Giriş başarılı! Yönlendiriliyorsunuz...');
      
      console.log('🚀 Redirecting to dashboard in 800ms...');
      console.log('🔐 ============ LOGIN DEBUG END ============');
      
      // Redirect için window.location kullan (mobilde daha güvenilir)
      setTimeout(() => {
        console.log('🚀 Executing redirect now...');
        window.location.href = '/business/dashboard';
      }, 800);

    } catch (err: any) {
      console.error('❌ ============ LOGIN ERROR ============');
      console.error('❌ Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      console.error('❌ ============ ERROR END ============');
      
      setError(err.message || 'Giriş başarısız. Email ve şifrenizi kontrol edin.');
      toast.error(err.message || 'Giriş başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  // Checking existing auth
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium">Oturum kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo ve Başlık */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-2xl"
          >
            <Building2 className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">
            CityV <span className="text-blue-400">Business</span>
          </h1>
          <p className="text-gray-400">
            İşletme Yönetim Paneli
          </p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl"
        >
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="ornek@firma.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-200 text-sm">
              <strong>ℹ️ Not:</strong> Business paneline sadece admin tarafından eklenen üyeler giriş yapabilir.
            </p>
          </div>

          {/* Ana Sayfa Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Ana sayfaya dön
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2024 CityV Business. Tüm hakları saklıdır.</p>
        </div>
      </motion.div>
    </div>
  );
}
