'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, ArrowLeft, Sparkles } from 'lucide-react';
import { useAdminStore } from '@/lib/stores/adminStore';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Client-side only mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sabit yıldız pozisyonları (hydration hatası önlemek için)
  const stars = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: (i * 41.7) % 100,
      top: (i * 67.3) % 100,
      duration: 3 + (i % 3),
      delay: (i % 3) * 0.7,
    })), 
  []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simüle login delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(email, password);
    
    if (success) {
      toast.success('🎉 Admin girişi başarılı!');
      router.push('/admin');
    } else {
      toast.error('❌ Email veya şifre hatalı!');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements - only render on client */}
      {isMounted && (
        <div className="absolute inset-0 overflow-hidden">
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                delay: star.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Back to home button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all z-10"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-2xl blur-xl opacity-75" />
        
        {/* Card content */}
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Admin Girişi
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                City View Yönetim Paneli
              </p>
            </motion.div>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email adresinizi girin"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 
                           rounded-xl focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 
                           outline-none transition-all text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 
                           rounded-xl focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 
                           outline-none transition-all text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 
                       hover:via-pink-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg 
                       hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed
                       transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Giriş yapılıyor...
                </span>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </motion.form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700 text-center"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Bu panel sadece yetkili yöneticiler içindir.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
