'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Wifi, Activity, Users, Bell, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useBusinessStore, type LiveCrowdData } from '@/store/businessStore';
import { useTensorFlowDetection } from '@/lib/hooks/useTensorFlowDetection';

/**
 * 🎥 Business Live Crowd Monitor
 * 
 * City-V IoT Integration + Push Notification System
 * Business dashboard için canlı yoğunluk takibi
 * 
 * @author City-V Team
 * @version 1.0.0
 */

interface BusinessLiveCrowdProps {
  locationId: string;
  businessName: string;
  esp32Ip?: string;
  maxCapacity: number;
}

export default function BusinessLiveCrowd({ 
  locationId, 
  businessName,
  esp32Ip = '192.168.1.9',
  maxCapacity = 50 
}: BusinessLiveCrowdProps) {
  const { 
    updateLiveCrowd, 
    setESP32Connection, 
    liveCrowdData,
    esp32Connected,
    campaigns,
    sendCampaignNotification 
  } = useBusinessStore();

  const [isStreaming, setIsStreaming] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [sendingNotification, setSendingNotification] = useState(false);

  const streamRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { isModelLoaded, isDetecting, detect } = useTensorFlowDetection();

  // Analysis tracking
  const [totalEntry, setTotalEntry] = useState(0);
  const [totalExit, setTotalExit] = useState(0);
  const trackedPersonsRef = useRef<Map<string, { y: number; timestamp: number; lastCrossing?: number; }>>(new Map());

  const ENTRY_LINE_Y = 240;

  // AI Analysis Function
  const runAnalysis = async () => {
    if (!isModelLoaded || isDetecting || !streamRef.current?.complete) return;

    try {
      const detectionResult = await detect(streamRef.current);
      if (!detectionResult) return;

      const newPersonCount = detectionResult.personCount;
      const currentTime = Date.now();

      // Tracking logic
      const trackedPersons = trackedPersonsRef.current;
      const detectedPeople = detectionResult.objects.filter(o => o.class === 'person');

      let entryCount = 0;
      let exitCount = 0;

      detectedPeople.forEach((obj, index) => {
        const [x, y, width, height] = obj.bbox;
        const centerY = y + (height / 2);
        const personId = `person_${index}`;

        const prevData = trackedPersons.get(personId);

        if (prevData && (currentTime - prevData.timestamp) < 10000) {
          const prevY = prevData.y;
          const crossedLineDown = (prevY < ENTRY_LINE_Y && centerY > ENTRY_LINE_Y);
          const crossedLineUp = (prevY > ENTRY_LINE_Y && centerY < ENTRY_LINE_Y);

          const lastCrossing = prevData.lastCrossing || 0;
          const canCross = (currentTime - lastCrossing) >= 3000;

          if (canCross) {
            if (crossedLineDown) {
              entryCount++;
              trackedPersons.set(personId, { y: centerY, timestamp: currentTime, lastCrossing: currentTime });
              return;
            } else if (crossedLineUp) {
              exitCount++;
              trackedPersons.set(personId, { y: centerY, timestamp: currentTime, lastCrossing: currentTime });
              return;
            }
          }
        }

        trackedPersons.set(personId, { y: centerY, timestamp: currentTime, lastCrossing: prevData?.lastCrossing || 0 });
      });

      if (entryCount > 0) setTotalEntry(prev => prev + entryCount);
      if (exitCount > 0) setTotalExit(prev => prev + exitCount);

      // Update live crowd data
      const occupancyRate = Math.min(100, (newPersonCount / maxCapacity) * 100);
      let crowdLevel: 'Boş' | 'Orta' | 'Yoğun' | 'Çok Yoğun' = 'Boş';
      if (occupancyRate > 75) crowdLevel = 'Çok Yoğun';
      else if (occupancyRate > 50) crowdLevel = 'Yoğun';
      else if (occupancyRate > 25) crowdLevel = 'Orta';

      const crowdData: LiveCrowdData = {
        locationId,
        businessName,
        currentCount: newPersonCount,
        totalEntry,
        totalExit,
        timestamp: currentTime,
        occupancyRate,
        crowdLevel,
        maxCapacity,
        esp32Ip,
      };

      updateLiveCrowd(crowdData);

      // Draw canvas
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = 640;
          canvas.height = 480;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Entry line
          ctx.strokeStyle = '#00FF00';
          ctx.lineWidth = 3;
          ctx.setLineDash([10, 5]);
          ctx.beginPath();
          ctx.moveTo(0, ENTRY_LINE_Y);
          ctx.lineTo(canvas.width, ENTRY_LINE_Y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Bounding boxes
          detectionResult.objects.forEach(obj => {
            const [x, y, width, height] = obj.bbox;
            let color = obj.class === 'person' ? '#FF0000' : '#0000FF';
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);

            ctx.fillStyle = color;
            ctx.fillRect(x, y - 20, width, 20);
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(`${obj.class} ${Math.round(obj.score * 100)}%`, x + 5, y - 5);
          });
        }
      }

    } catch (error) {
      console.error('❌ Analysis error:', error);
    }
  };

  // Start stream
  const startStream = async () => {
    setIsStreaming(true);
    setESP32Connection(true);
    
    if (streamRef.current) {
      streamRef.current.src = `http://${esp32Ip}/stream`;
    }

    await runAnalysis();
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(runAnalysis, 5000);
  };

  // Stop stream
  const stopStream = () => {
    setIsStreaming(false);
    setESP32Connection(false);
    
    if (streamRef.current) {
      streamRef.current.src = '';
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Send campaign notification
  const handleSendNotification = async () => {
    if (!selectedCampaign) {
      alert('Lütfen bir kampanya seçin!');
      return;
    }

    setSendingNotification(true);
    
    try {
      const success = await sendCampaignNotification(selectedCampaign);
      if (success) {
        alert('✅ Kampanya bildirimi gönderildi!');
        setShowCampaignModal(false);
        setSelectedCampaign('');
      }
    } catch (error) {
      console.error('Notification error:', error);
      alert('❌ Bildirim gönderilemedi!');
    } finally {
      setSendingNotification(false);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const activeCampaigns = campaigns.filter(c => c.isActive && !c.notificationSent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Camera className="w-7 h-7 text-blue-600" />
            Canlı Yoğunluk İzleme
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            City-V IoT ile gerçek zamanlı müşteri takibi
          </p>
        </div>

        <button
          onClick={() => setShowCampaignModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Bell className="w-5 h-5" />
          Kampanya Bildirimi Gönder
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Şu An İçeride</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {liveCrowdData?.currentCount || 0}
              </p>
            </div>
            <Users className="w-10 h-10 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Doluluk Oranı</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {liveCrowdData?.occupancyRate.toFixed(0) || 0}%
              </p>
            </div>
            <Activity className="w-10 h-10 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Toplam Giriş</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{totalEntry}</p>
            </div>
            <div className="text-2xl">📥</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Toplam Çıkış</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{totalExit}</p>
            </div>
            <div className="text-2xl">📤</div>
          </div>
        </div>
      </div>

      {/* Stream & Canvas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Wifi className={`w-5 h-5 ${esp32Connected ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="text-sm font-medium">
              {esp32Connected ? '✅ Bağlı' : '⚪ Bağlantı Yok'}
            </span>
          </div>

          <button
            onClick={isStreaming ? stopStream : startStream}
            disabled={!isModelLoaded}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isStreaming
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50'
            }`}
          >
            {isStreaming ? 'Durdur' : 'Başlat'}
          </button>
        </div>

        <div className="relative bg-black rounded-lg overflow-hidden">
          <img
            ref={streamRef}
            alt="City-V IoT Stream"
            className="w-full h-auto"
            crossOrigin="anonymous"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
        </div>
      </div>

      {/* Campaign Notification Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell className="w-6 h-6 text-purple-600" />
              Kampanya Bildirimi
            </h3>

            {activeCampaigns.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  Aktif ve henüz bildirilmemiş kampanya yok.
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Hangi kampanyayı tüm kullanıcılara göndermek istersiniz?
                </p>

                <div className="space-y-3 mb-6">
                  {activeCampaigns.map((campaign) => (
                    <label
                      key={campaign.id}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedCampaign === campaign.id
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="campaign"
                        value={campaign.id}
                        checked={selectedCampaign === campaign.id}
                        onChange={(e) => setSelectedCampaign(e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {campaign.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {campaign.description}
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                          %{campaign.value} İndirim • {campaign.type}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCampaignModal(false);
                      setSelectedCampaign('');
                    }}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSendNotification}
                    disabled={!selectedCampaign || sendingNotification}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sendingNotification ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Gönder
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
