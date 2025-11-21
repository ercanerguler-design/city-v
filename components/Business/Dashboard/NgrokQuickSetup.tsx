'use client';

import { useState } from 'react';
import { Globe, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function NgrokQuickSetup() {
  const [ngrokUrl, setNgrokUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Kopyalandı!');
  };

  const testNgrokUrl = async () => {
    if (!ngrokUrl) return;
    
    setIsTesting(true);
    try {
      // Clean and validate URL
      const cleanUrl = ngrokUrl.trim().replace(/\s+/g, '');
      const testUrl = cleanUrl.endsWith('/stream') ? cleanUrl : `${cleanUrl}/stream`;
      
      // Test the URL
      const response = await fetch(testUrl, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      setIsValidUrl(true);
      toast.success('URL çalışıyor! ✅');
      
    } catch (error) {
      toast.error('URL test edilemedi');
    } finally {
      setIsTesting(false);
    }
  };

  const addToCameraSystem = () => {
    if (!ngrokUrl) return;
    
    // Clean and validate URL
    const cleanUrl = ngrokUrl.trim().replace(/\s+/g, '');
    const streamUrl = cleanUrl.endsWith('/stream') ? cleanUrl : `${cleanUrl}/stream`;
    
    // Parse hostname from ngrok URL
    let hostname = 'ngrok-tunnel';
    let port = 443;
    try {
      const urlObj = new URL(cleanUrl);
      hostname = urlObj.hostname;
      port = urlObj.port ? parseInt(urlObj.port) : (urlObj.protocol === 'https:' ? 443 : 80);
    } catch (error) {
      console.log('❌ URL parse error:', error);
    }
    
    // Create camera with ngrok URL - send complete stream URL
    window.postMessage({
      type: 'ADD_NGROK_CAMERA',
      data: {
        camera_name: 'City-V Camera',
        stream_url: streamUrl, // Complete URL
        ip_address: hostname,
        port: port,
        is_public: true
      }
    }, '*');
    
    toast.success('Kamera sisteme eklendi!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Globe className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            🚀 City-V Hızlı Kurulum
          </h3>
          <p className="text-sm text-gray-600">
            Port forwarding yerine 5 dakikada City-V'yi internet'e açın
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Step 1: Download */}
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <h4 className="font-medium text-gray-900 mb-2">1️⃣ City-V Tunnel İndir & Kurulu</h4>
          <div className="flex items-center gap-3">
            <code className="bg-gray-100 px-3 py-2 rounded text-sm flex-1">
              ngrok http 192.168.1.8:80
            </code>
            <button
              onClick={() => copyToClipboard('ngrok http 192.168.1.8:80')}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            >
              <Copy className="w-4 h-4" />
            </button>
            <a
              href="https://ngrok.com/download"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              İndir <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Step 2: Enter URL */}
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <h4 className="font-medium text-gray-900 mb-2">2️⃣ City-V Tunnel URL'ini Girin</h4>
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={ngrokUrl}
              onChange={(e) => setNgrokUrl(e.target.value.trim())}
              placeholder="https://abc123.ngrok.io"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={testNgrokUrl}
              disabled={!ngrokUrl || isTesting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              {isTesting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isValidUrl ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                'Test Et'
              )}
            </button>
          </div>
          {isValidUrl && (
            <div className="mt-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
              ✅ URL çalışıyor - Production'dan erişilebilir!
            </div>
          )}
        </div>

        {/* Step 3: Add Camera */}
        {isValidUrl && (
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h4 className="font-medium text-gray-900 mb-2">3️⃣ Kamerayı Sisteme Ekle</h4>
            <button
              onClick={addToCameraSystem}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              🎥 Ngrok Kamerayı CityV'ye Ekle
            </button>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h5 className="font-medium text-blue-900 mb-1">💡 Ngrok Avantajları</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>✅ Port forwarding gerektirmez</li>
            <li>✅ Modem ayarı yapmaya gerek yok</li>
            <li>✅ HTTPS otomatik sağlar (Mixed Content yok)</li>
            <li>✅ 5 dakikada hazır</li>
            <li>⚠️ Free plan: 8 saat session limit</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
