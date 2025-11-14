'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, Shield, Key, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface VideoAccessGuardProps {
  children: React.ReactNode;
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  requireAuth?: boolean;
  requirePremium?: boolean;
  requireBusiness?: boolean;
}

/**
 * VideoAccessGuard - Secure Video Access Control
 * 
 * Provides multi-layer security for ESP32-CAM video recordings:
 * 1. Authentication check
 * 2. Membership tier validation  
 * 3. Device-specific password verification
 * 4. Access logging
 */
export default function VideoAccessGuard({
  children,
  deviceId = 'default',
  deviceName,
  deviceType = 'esp32-cam',
  requireAuth = true,
  requirePremium = true,
  requireBusiness = false
}: VideoAccessGuardProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  // Video access passwords (production da database de olmali)
  const devicePasswords: { [key: string]: string } = {
    'esp32-cam-001': 'cityv2024secure',
    'esp32-cam-002': 'cityv2024secure', 
    'esp32-cam-003': 'cityv2024secure',
    'multi-device': 'cityv2024admin',
    'business-iot': 'cityv2024business',
    'transport-cam': 'cityv2024transport',
    'default': 'cityv2024'
  };

  // Check authentication and membership requirements
  useEffect(() => {
    // Skip auth checks if not required
    if (!requireAuth) {
      setIsUnlocked(false); // Still require password
      return;
    }

    // Check authentication
    if (!isAuthenticated || !user) {
      return; // Will show login screen
    }

    // Check premium requirement
    if (requirePremium && !user?.isPremium) {
      return; // Will show premium upgrade screen
    }

    // Check business requirement  
    if (requireBusiness && !user?.isBusiness && !user?.isEnterprise) {
      return; // Will show business upgrade screen
    }

    // Auth checks passed, but still need password for video access
    setIsUnlocked(false);
  }, [isAuthenticated, user, requireAuth, requirePremium, requireBusiness]);

  // Handle password submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (attempts >= maxAttempts) {
      setError('Too many failed attempts. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const deviceKey = deviceId || 'default';
      const expectedPassword = devicePasswords[deviceKey] || devicePasswords['default'];
      
      if (password === expectedPassword) {
        // Success!
        setIsUnlocked(true);
        setError('');
        
        // Log successful access
        console.log('🔓 Video access granted:', {
          deviceId,
          deviceType,
          user: user?.email,
          timestamp: new Date().toISOString()
        });

        // Send access log to backend
        try {
          await fetch('/api/admin/access-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user?.id,
              deviceId,
              deviceType,
              action: 'video_access_granted',
              timestamp: new Date().toISOString()
            })
          });
        } catch (error) {
          console.warn('Access logging failed:', error);
        }
      } else {
        // Wrong password
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setError(`Wrong password. ${maxAttempts - newAttempts} attempts remaining.`);
        setPassword('');
      }
    } catch (error) {
      setError('Security verification failed. Please try again.');
    }

    setLoading(false);
  };

  // Authentication check
  if (requireAuth && (!isAuthenticated || !user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">You need to login to access video recordings.</p>
          <button 
            onClick={() => window.location.href = '/auth/login'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </motion.div>
      </div>
    );
  }

  // Premium check
  if (requirePremium && !user?.isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Premium Membership Required</h2>
          <p className="text-gray-600 mb-6">Premium membership is required to access video recordings.</p>
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Upgrade to Premium
          </button>
        </motion.div>
      </div>
    );
  }

  // Business check
  if (requireBusiness && !user?.isBusiness && !user?.isEnterprise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Business Membership Required</h2>
          <p className="text-gray-600 mb-6">This feature is only available for Business and Enterprise members.</p>
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Upgrade to Business
          </button>
        </motion.div>
      </div>
    );
  }

  // Password check for unlocked content
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Video Access Control</h2>
            <p className="text-gray-600">
              Password required to access {deviceName || 'Camera'} recordings
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter security password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading || attempts >= maxAttempts}
                required
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || attempts >= maxAttempts || !password.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>View Video Recordings</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Security: {user?.membershipTier?.toUpperCase()} | Device: {deviceId}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Success - show protected content
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}