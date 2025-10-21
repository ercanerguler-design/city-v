'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';

// Google Sign-In tipi
declare global {
  interface Window {
    google?: any;
  }
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogle, register } = useAuthStore();

  // Google Sign-In script yükleme ve buton render
  useEffect(() => {
    if (!isOpen) return;

    const loadGoogleScript = () => {
      if (window.google) {
        // Google script zaten yüklü, butonu render et
        renderGoogleButton();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('✅ Google script yüklendi');
        // Script yüklendikten sonra butonu render et
        setTimeout(renderGoogleButton, 100);
      };
      document.body.appendChild(script);
    };

    const renderGoogleButton = () => {
      if (!window.google) {
        console.warn('⚠️ Google script henüz yüklenmedi');
        return;
      }

      const client_id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '693372259383-c2ge11rus1taeh0dae9sur7kdo6ndiuo.apps.googleusercontent.com';

      const handleCredentialResponse = async (response: any) => {
        try {
          console.log('📦 Google response alındı');
          const decoded = JSON.parse(atob(response.credential.split('.')[1]));
          console.log('✅ Google kullanıcı bilgileri alındı:', decoded.email);
          
          await loginWithGoogle({
            email: decoded.email,
            name: decoded.name,
            picture: decoded.picture,
            googleId: decoded.sub
          } as any);

          console.log('✅ Giriş başarılı!');
          onClose();
        } catch (err: any) {
          console.error('❌ Google login error:', err);
          setError(err.message || 'Google ile giriş başarısız oldu.');
        }
      };

      // Mobil cihaz kontrolü
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

      window.google.accounts.id.initialize({
        client_id: client_id,
        callback: handleCredentialResponse,
        auto_select: false,
        // Mobilde redirect (popup engellenir), masaüstünde popup
        ux_mode: isMobile ? 'redirect' : 'popup',
        // Mobilde redirect URI (Google Console'da eklenmiş olmalı)
        redirect_uri: isMobile ? `${window.location.origin}/auth/callback` : undefined,
      });

      const buttonDiv = document.getElementById('google-signin-button');
      if (buttonDiv && buttonDiv.children.length === 0) {
        // Buton genişliğini mobil için özel ayarla
        const buttonWidth = isMobile ? Math.min(buttonDiv.offsetWidth || 300, 300) : buttonDiv.offsetWidth;
        
        window.google.accounts.id.renderButton(
          buttonDiv,
          {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            width: buttonWidth,
            locale: 'tr',
            // Mobilde daha basit stil
            ...(isMobile && { size: 'medium' })
          }
        );
        console.log('✅ Google Sign-In butonu render edildi (Mode:', isMobile ? 'Mobile-Redirect' : 'Desktop-Popup', ')');
      }
    };

    loadGoogleScript();
  }, [isOpen, loginWithGoogle, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onClose();
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">CityView Pro</h2>
                  <p className="text-sm text-white/80">
                    {mode === 'login' ? 'Tekrar Hoş Geldiniz' : 'Hesap Oluşturun'}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}

                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Soyad
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Adınız ve soyadınız"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="ornek@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şifre
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Yükleniyor...
                    </span>
                  ) : mode === 'login' ? (
                    'Giriş Yap'
                  ) : (
                    'Hesap Oluştur'
                  )}
                </button>
              </form>

              {/* Google Sign In */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">veya</span>
                  </div>
                </div>

                {/* Google Sign-In otomatik buton */}
                <div 
                  id="google-signin-button" 
                  className="mt-4 flex justify-center"
                  style={{ minHeight: '44px' }}
                />
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setError(''); // Clear error when switching modes
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {mode === 'login'
                    ? 'Hesabınız yok mu? Kayıt olun'
                    : 'Zaten hesabınız var mı? Giriş yapın'}
                </button>
              </div>

              {mode === 'login' && (
                <div className="mt-4 text-center">
                  <a href="#" className="text-xs text-gray-500 hover:text-gray-700">
                    Şifrenizi mi unuttunuz?
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
