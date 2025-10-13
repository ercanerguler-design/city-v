'use client';

import { useEffect } from 'react';
import useSocketStore from '@/store/socketStore';
import { Wifi, WifiOff, RotateCcw } from 'lucide-react';

interface ConnectionStatusIndicatorProps {
  showText?: boolean;
  className?: string;
}

export default function ConnectionStatusIndicator({ 
  showText = true, 
  className = '' 
}: ConnectionStatusIndicatorProps) {
  const { 
    isConnected, 
    connectionStatus, 
    reconnectAttempts, 
    maxReconnectAttempts,
    connect 
  } = useSocketStore();

  // Auto-connect on component mount
  useEffect(() => {
    if (connectionStatus === 'disconnected') {
      connect();
    }
  }, [connect, connectionStatus]);

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <Wifi className="w-4 h-4 text-green-500" />,
          text: 'Bağlı',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'connecting':
        return {
          icon: <RotateCcw className="w-4 h-4 text-yellow-500 animate-spin" />,
          text: 'Bağlanıyor...',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200'
        };
      case 'reconnecting':
        return {
          icon: <RotateCcw className="w-4 h-4 text-orange-500 animate-spin" />,
          text: `Yeniden bağlanıyor (${reconnectAttempts}/${maxReconnectAttempts})`,
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200'
        };
      default:
        return {
          icon: <WifiOff className="w-4 h-4 text-red-500" />,
          text: 'Bağlantı yok',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`
      inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium
      ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor}
      ${className}
    `}>
      {statusInfo.icon}
      {showText && (
        <span className="text-xs">
          {statusInfo.text}
        </span>
      )}
    </div>
  );
}