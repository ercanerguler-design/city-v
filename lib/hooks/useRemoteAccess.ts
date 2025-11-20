'use client';

import { useState, useEffect } from 'react';
interface NetworkInfo {
  type: 'local' | 'remote';
  ipAddress: string;
  location: string;
  isDetecting: boolean;
}

interface DeviceInfo {
  fingerprint: string;
  name: string;
  userAgent: string;
  platform: string;
}

export function useRemoteAccess() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    type: 'remote',
    ipAddress: '',
    location: 'Detecting...',
    isDetecting: true
  });
  
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [remoteToken, setRemoteToken] = useState<string | null>(null);

  useEffect(() => {
    detectNetworkAndDevice();
  }, []);

  const detectNetworkAndDevice = async () => {
    try {
      setNetworkInfo(prev => ({ ...prev, isDetecting: true }));

      // Get device info
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;
      const fingerprint = generateDeviceFingerprint(userAgent, platform);
      
      const deviceName = getDeviceName(userAgent, platform);
      
      const device: DeviceInfo = {
        fingerprint,
        name: deviceName,
        userAgent,
        platform
      };

      setDeviceInfo(device);

      // Get network info via API
      const networkResponse = await fetch('/api/network-info');
      const networkData = await networkResponse.json();
      
      const networkType = detectNetworkType(networkData.ip);
      const location = await getLocationFromIP(networkData.ip);

      setNetworkInfo({
        type: networkType,
        ipAddress: networkData.ip,
        location,
        isDetecting: false
      });

      console.log(`🌐 Network detected: ${networkType} from ${location}`);

    } catch (error) {
      console.log('🚨 Network detection error:', error);
      setNetworkInfo({
        type: 'remote',
        ipAddress: 'Unknown',
        location: 'Unknown Location',
        isDetecting: false
      });
    }
  };

  const createRemoteToken = async (businessUserId: number): Promise<string | null> => {
    try {
      console.log('🔐 Creating remote token - start');
      console.log('  - businessUserId:', businessUserId);
      console.log('  - deviceInfo:', deviceInfo);
      
      if (!deviceInfo) {
        throw new Error('Device info not available - network detection may not be complete');
      }

      console.log('📡 Sending request to /api/auth/remote-token...');
      
      const response = await fetch('/api/auth/remote-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessUserId,
          deviceInfo
        })
      });

      console.log('📤 Response status:', response.status);
      console.log('📤 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Response error:', errorText);
        throw new Error(`Token creation failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📥 API Response data:', data);
      
      if (!data.token) {
        throw new Error('No token received in response');
      }
      
      setRemoteToken(data.token);
      
      // Store in localStorage for persistence
      localStorage.setItem('cityv_remote_token', data.token);
      
      console.log('✅ Remote token created and stored successfully');
      return data.token;

    } catch (error: any) {
      console.error('🚨 Remote token creation error:', error);
      console.error('  - Error message:', error.message);
      console.error('  - Error stack:', error.stack);
      return null;
    }
  };

  const getStoredToken = (): string | null => {
    return localStorage.getItem('cityv_remote_token');
  };

  const clearRemoteToken = () => {
    setRemoteToken(null);
    localStorage.removeItem('cityv_remote_token');
  };

  return {
    networkInfo,
    deviceInfo,
    remoteToken,
    createRemoteToken,
    getStoredToken,
    clearRemoteToken,
    refreshNetworkInfo: detectNetworkAndDevice
  };
}

// Client-side utility functions
function generateDeviceFingerprint(userAgent: string, platform: string): string {
  const canvas = typeof window !== 'undefined' ? getCanvasFingerprint() : '';
  const timezone = typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : '';
  const screen = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '';
  
  const fingerprint = `${userAgent}-${platform}-${canvas}-${timezone}-${screen}`;
  return btoa(fingerprint).slice(0, 32);
}

function getCanvasFingerprint(): string {
  if (typeof window === 'undefined') return '';
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('CityV Fingerprint', 2, 2);
    
    return canvas.toDataURL().slice(-32);
  } catch {
    return '';
  }
}

function detectNetworkType(ipAddress: string): 'local' | 'remote' {
  const localRanges = [
    /^192\.168\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^127\./,
    /^::1$/,
    /^localhost$/
  ];
  
  const isLocal = localRanges.some(range => range.test(ipAddress));
  return isLocal ? 'local' : 'remote';
}

async function getLocationFromIP(ipAddress: string): Promise<string> {
  try {
    if (ipAddress === '127.0.0.1' || ipAddress.startsWith('192.168.')) {
      return 'Local Network';
    }

    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
    const data = await response.json();
    
    return `${data.city || 'Unknown'}, ${data.country_name || 'Unknown'}`;
    
  } catch (error) {
    console.log('🌍 Location detection error:', error);
    return 'Unknown Location';
  }
}

function getDeviceName(userAgent: string, platform: string): string {
  // Mobile devices
  if (/iPhone/.test(userAgent)) return 'iPhone';
  if (/iPad/.test(userAgent)) return 'iPad';
  if (/Android/.test(userAgent)) return 'Android Device';
  
  // Desktop browsers
  if (/Chrome/.test(userAgent)) return `Chrome on ${platform}`;
  if (/Firefox/.test(userAgent)) return `Firefox on ${platform}`;
  if (/Safari/.test(userAgent)) return `Safari on ${platform}`;
  if (/Edge/.test(userAgent)) return `Edge on ${platform}`;
  
  return `${platform} Device`;
}

// Hook for camera streaming with remote support
export function useRemoteCamera(cameraId: string, isRemote: boolean = false) {
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const { remoteToken, getStoredToken } = useRemoteAccess();

  useEffect(() => {
    if (!cameraId) return;
    
    generateStreamUrl();
  }, [cameraId, isRemote, remoteToken]);

  const generateStreamUrl = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isRemote) {
        // Remote access through secure proxy
        const token = remoteToken || getStoredToken();
        
        if (!token) {
          throw new Error('Remote token required');
        }

        const url = `/api/secure-stream/${cameraId}`;
        setStreamUrl(url);
        
        console.log(`🌐 Remote stream URL: ${url}`);
        
      } else {
        // Local network access (existing functionality)
        setStreamUrl(`http://192.168.1.${cameraId}:80/stream`);
        console.log(`🏠 Local stream URL set`);
      }

    } catch (error) {
      console.log('🚨 Stream URL generation error:', error);
      setError(error instanceof Error ? error.message : 'Stream unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (): Promise<boolean> => {
    try {
      if (isRemote) {
        const token = remoteToken || getStoredToken();
        const response = await fetch(`/api/secure-stream/${cameraId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setIsOnline(response.ok);
        return response.ok;
        
      } else {
        // Test local connection
        const response = await fetch(`http://192.168.1.${cameraId}:80/`, {
          mode: 'no-cors'
        });
        
        setIsOnline(true);
        return true;
      }
      
    } catch (error) {
      setIsOnline(false);
      return false;
    }
  };

  return {
    streamUrl,
    isLoading,
    error,
    isOnline,
    refreshStream: generateStreamUrl,
    testConnection
  };
}

export default useRemoteAccess;