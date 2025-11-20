'use client';

import { useState, useEffect } from 'react';
import { useRemoteAccess } from '@/lib/hooks/useRemoteAccess';
import { useBusinessDashboardStore } from '@/store/businessDashboardStore';
import { Globe, Wifi, MapPin, Clock, Shield, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RemoteAccessPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { businessUser } = useBusinessDashboardStore();
  const { 
    networkInfo, 
    deviceInfo, 
    remoteToken, 
    createRemoteToken, 
    getStoredToken,
    refreshNetworkInfo 
  } = useRemoteAccess();

  const [tokenStatus, setTokenStatus] = useState<'none' | 'creating' | 'active' | 'expired'>('none');

  // Debug business user data
  useEffect(() => {
    console.log('🔍 RemoteAccessPanel - Business User Debug:');
    console.log('  - businessUser:', businessUser);
    console.log('  - businessUser.id:', businessUser?.id);
    console.log('  - businessUser keys:', Object.keys(businessUser || {}));
    console.log('  - typeof businessUser.id:', typeof businessUser?.id);
  }, [businessUser]);

  useEffect(() => {
    checkTokenStatus();
  }, [remoteToken]);

  const checkTokenStatus = () => {
    const storedToken = getStoredToken();
    if (remoteToken || storedToken) {
      setTokenStatus('active');
    } else {
      setTokenStatus('none');
    }
  };

  const handleEnableRemoteAccess = async () => {
    console.log('🔍 Debug - Enable remote access triggered');
    console.log('📊 Business user data:', businessUser);
    console.log('🏢 Business user ID:', businessUser?.id);
    console.log('🌐 Network info:', networkInfo);
    console.log('📱 Device info:', deviceInfo);
    
    if (!businessUser?.id) {
      console.log('❌ No business user ID found');
      console.log('🔍 Available business user fields:', Object.keys(businessUser || {}));
      
      // Try to get user ID from different sources
      const alternativeUserId = businessUser?.user_id || businessUser?.business_user_id;
      if (alternativeUserId) {
        console.log('🔄 Using alternative user ID:', alternativeUserId);
        const userId = parseInt(alternativeUserId.toString());
        await proceedWithRemoteAccess(userId);
        return;
      }
      
      console.log('❌ Cannot find any user ID to proceed');
      setTokenStatus('none');
      return;
    }

    await proceedWithRemoteAccess(businessUser.id);
  };

  const proceedWithRemoteAccess = async (userId: number) => {
    console.log('🔐 Enabling remote access for user:', userId);
    setTokenStatus('creating');
    
    try {
      const token = await createRemoteToken(userId);
      
      if (token) {
        setTokenStatus('active');
        console.log('✅ Remote access enabled successfully');
      } else {
        setTokenStatus('none');
        console.log('❌ Failed to enable remote access');
      }
      
    } catch (error) {
      console.log('🚨 Remote access error:', error);
      setTokenStatus('none');
    }
  };

  const getNetworkIcon = () => {
    if (networkInfo.isDetecting) return <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-600 rounded-full animate-spin" />;
    return networkInfo.type === 'local' ? <Wifi className="w-4 h-4 text-green-600" /> : <Globe className="w-4 h-4 text-blue-600" />;
  };

  const getStatusColor = () => {
    if (networkInfo.isDetecting) return 'bg-gray-100 text-gray-600';
    return networkInfo.type === 'local' 
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 mb-6 overflow-hidden">
      {/* Main Panel Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getNetworkIcon()}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {networkInfo.type === 'local' ? '🏢 Yerel Bağlantı' : '🌐 Uzak Erişim'}
                {tokenStatus === 'active' && <Shield className="w-4 h-4 text-green-600" />}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {networkInfo.isDetecting ? 'Konum tespit ediliyor...' : networkInfo.location}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {networkInfo.isDetecting ? 'Tespit ediliyor...' : 
               networkInfo.type === 'local' ? 'Yerel Ağ' : 'İnternet Bağlantısı'}
            </div>
            {!networkInfo.isDetecting && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                IP: {networkInfo.ipAddress}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t dark:border-gray-700"
          >
            <div className="p-4 space-y-4">
              
              {/* Network Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Bağlantı Bilgileri
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Konum:</span>
                      <span className="font-medium dark:text-white">{networkInfo.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">IP Adresi:</span>
                      <span className="font-mono text-xs dark:text-white">{networkInfo.ipAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Bağlantı Tipi:</span>
                      <span className="font-medium dark:text-white">
                        {networkInfo.type === 'local' ? 'Yerel Ağ' : 'İnternet'}
                      </span>
                    </div>
                  </div>
                </div>

                {deviceInfo && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Cihaz Bilgileri
                    </h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Cihaz:</span>
                        <span className="font-medium dark:text-white">{deviceInfo.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Platform:</span>
                        <span className="font-medium dark:text-white">{deviceInfo.platform}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">ID:</span>
                        <span className="font-mono text-xs dark:text-white">{deviceInfo.fingerprint.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Remote Access Control */}
              <div className="border-t dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Uzak Erişim Kontrolü
                </h4>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Uzak Kamera Erişimi
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {tokenStatus === 'active' 
                        ? 'Etkin - Kameralarınızı dünyanın her yerinden izleyebilirsiniz'
                        : 'Ev, otel veya farklı konumlardan kameralarınıza güvenli erişim'
                      }
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {tokenStatus === 'creating' && (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    
                    <button
                      onClick={tokenStatus === 'active' ? refreshNetworkInfo : handleEnableRemoteAccess}
                      disabled={tokenStatus === 'creating'}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        tokenStatus === 'active'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400'
                      }`}
                    >
                      {tokenStatus === 'creating' ? 'Etkinleştiriliyor...' :
                       tokenStatus === 'active' ? '✓ Aktif' : 'Etkinleştir'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              {networkInfo.type === 'remote' && tokenStatus === 'active' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      i
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Uzak Erişim Aktif
                      </h5>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Artık kameralarınızı bu cihazdan uzaktan izleyebilirsiniz. 
                        Canlı İzleme butonuna tıkladığınızda güvenli bağlantı üzerinden 
                        kameralarınıza erişim sağlanacak.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Last Updated */}
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 pt-2 border-t dark:border-gray-700">
                <Clock className="w-3 h-3" />
                Son güncelleme: {new Date().toLocaleTimeString('tr-TR', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}