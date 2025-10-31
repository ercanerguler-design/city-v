'use client';

import { useState } from 'react';
import { Camera, CheckCircle, XCircle, Wifi, AlertTriangle } from 'lucide-react';

export default function ESP32DebugPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const defaultIPs = [
    '192.168.1.9',
    '192.168.1.10',
    '192.168.1.11',
    '192.168.1.12'
  ];

  const testCamera = async (ip: string, index: number) => {
    const testUrl = `http://${ip}/status`;
    const streamUrl = `http://${ip}/stream`;
    
    try {
      const response = await fetch(testUrl, { 
        method: 'GET',
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          ip,
          index: index + 1,
          status: 'online',
          streamUrl,
          data
        };
      } else {
        return {
          ip,
          index: index + 1,
          status: 'error',
          streamUrl,
          error: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        ip,
        index: index + 1,
        status: 'offline',
        streamUrl,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  };

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);
    
    const results = await Promise.all(
      defaultIPs.map((ip, index) => testCamera(ip, index))
    );
    
    setTestResults(results);
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                <Camera className="w-10 h-10 text-purple-600" />
                ESP32-CAM Debug Tool
              </h1>
              <p className="text-gray-600 mt-2">Kamera bağlantılarını test edin</p>
            </div>
            <button
              onClick={runTests}
              disabled={testing}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? 'Test Ediliyor...' : '🔍 Test Başlat'}
            </button>
          </div>

          {/* IP List */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-lg mb-3">Test Edilecek IP Adresleri:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {defaultIPs.map((ip, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border-2 border-purple-200">
                  <p className="text-sm text-gray-600">Kamera {idx + 1}</p>
                  <p className="font-mono font-bold text-purple-600">{ip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testResults.map((result, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden ${
                  result.status === 'online' 
                    ? 'border-4 border-green-500' 
                    : result.status === 'error'
                    ? 'border-4 border-yellow-500'
                    : 'border-4 border-red-500'
                }`}
              >
                <div className={`p-4 ${
                  result.status === 'online' 
                    ? 'bg-green-500' 
                    : result.status === 'error'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                } text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {result.status === 'online' ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : result.status === 'error' ? (
                        <AlertTriangle className="w-6 h-6" />
                      ) : (
                        <XCircle className="w-6 h-6" />
                      )}
                      <div>
                        <h3 className="font-bold text-lg">Kamera {result.index}</h3>
                        <p className="text-sm opacity-90">{result.ip}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      result.status === 'online' 
                        ? 'bg-green-600' 
                        : result.status === 'error'
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}>
                      {result.status.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {result.status === 'online' ? (
                    <>
                      <div className="mb-4">
                        <h4 className="font-bold text-gray-700 mb-2">📊 Cihaz Bilgileri:</h4>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Device ID:</span>
                            <span className="font-mono font-bold">{result.data?.device_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Device Name:</span>
                            <span className="font-bold">{result.data?.device_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Konum:</span>
                            <span className="font-bold">{result.data?.stop_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">WiFi RSSI:</span>
                            <span className="font-bold">{result.data?.wifi_rssi} dBm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Uptime:</span>
                            <span className="font-bold">{result.data?.uptime} sec</span>
                          </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-bold text-gray-700 mb-2">📹 Stream URL:</h4>
                        <code className="block bg-green-50 border-2 border-green-200 rounded-lg p-2 text-xs break-all">
                          {result.streamUrl}
                        </code>
                      </div>
                      <div className="bg-black rounded-lg overflow-hidden">
                        <img 
                          src={result.streamUrl} 
                          alt={`Camera ${result.index}`}
                          className="w-full h-auto"
                          crossOrigin="anonymous"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h4 className="font-bold text-red-700 mb-2">❌ Hata:</h4>
                        <p className="text-red-600 bg-red-50 rounded-lg p-3">{result.error}</p>
                      </div>
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                        <h4 className="font-bold text-yellow-800 mb-2">💡 Çözüm Önerileri:</h4>
                        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                          <li>ESP32 cihazının açık olduğundan emin olun</li>
                          <li>WiFi bağlantısını kontrol edin</li>
                          <li>IP adresinin doğru olduğunu doğrulayın</li>
                          <li>CORS ayarlarını kontrol edin</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        {testResults.length === 0 && !testing && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-4">📋 Kullanım Talimatları</h2>
            <ol className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="font-bold text-purple-600">1.</span>
                <span>ESP32-CAM cihazlarınızın açık ve WiFi'ye bağlı olduğundan emin olun</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-purple-600">2.</span>
                <span>"Test Başlat" butonuna tıklayın</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-purple-600">3.</span>
                <span>Yeşil işaretli kameralar çalışıyor demektir</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-purple-600">4.</span>
                <span>Kırmızı işaretli kameraların sorununu çözün</span>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
