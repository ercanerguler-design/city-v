'use client';

import { useState } from 'react';
import { useBusinessStore } from '@/store/businessStore';
// import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';

export default function BusinessAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    phone: ''
  });
  
  const { login, loading } = useBusinessStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      const success = await login(formData.email, formData.password);
      if (!success) {
        alert('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } else {
      // Registration logic here
      alert('Kayıt özelliği yakında eklenecek!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            City-V Business
          </h1>
          <p className="text-blue-200">
            İşletmenizi yönetmenin en kolay yolu
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Tab Selector */}
          <div className="flex bg-white/5 rounded-lg p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isLogin 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isLogin 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    İşletme Adı
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cafe Central"
                    required={!isLogin}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+90 312 123 45 67"
                    required={!isLogin}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                E-posta
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@cafecentral.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Şifre
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414l-1.414-1.414m4.242 4.242l1.414 1.414M14.828 14.828l-1.414-1.414m1.414 1.414l1.414 1.414M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-blue-200">
                  <input type="checkbox" className="rounded mr-2" />
                  Beni hatırla
                </label>
                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Şifremi unuttum
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Giriş yapılıyor...
                </div>
              ) : (
                isLogin ? 'Giriş Yap' : 'Kayıt Ol'
              )}
            </button>
          </form>

          {/* Production Ready */}
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-200 text-center">
              🚀 Production Ready - Gerçek hesabınızla giriş yapın
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-blue-300 text-sm">
          <p>© 2025 City-V Business Panel</p>
          <p>Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
}