'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, Wifi, Activity, Users, CheckCircle, AlertCircle, 
  BarChart3, TrendingUp, Target, Clock
} from 'lucide-react';
import { useBusinessStore } from '@/store/businessStore';

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
    esp32Connected
  } = useBusinessStore();

  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [currentCount, setCurrentCount] = useState(12);

  // Basit demo data
  const demoAnalytics = {
    roi: 145,
    costSavings: 24500,
    operationalEfficiency: 87.5,
    customerSatisfaction: 92
  };

  useEffect(() => {
    // Basit demo güncellemesi
    const interval = setInterval(() => {
      const newCount = Math.floor(Math.random() * 30) + 5;
      setCurrentCount(newCount);
      
      updateLiveCrowd({
        locationId,
        currentCount: newCount,
        maxCapacity,
        timestamp: new Date().toISOString(),
        trend: newCount > currentCount ? 'increasing' : 'decreasing',
        businessId: locationId,
        locationName: businessName,
        peakHours: ['09:00', '12:00', '18:00'],
        averageStayTime: 25
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [locationId, businessName, maxCapacity, currentCount, updateLiveCrowd]);

  const startCamera = () => {
    setCameraLoading(true);
    setIsStreaming(true);
    setESP32Connection(true);
    setCameraError(null);
    
    setTimeout(() => {
      setCameraLoading(false);
    }, 2000);
  };

  const crowdLevel = currentCount / maxCapacity;
  const crowdStatus = crowdLevel > 0.8 ? 'High' : crowdLevel > 0.5 ? 'Medium' : 'Low';
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{businessName}</h2>
            <p className="text-gray-600">Live Crowd Analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              esp32Connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <Wifi className="w-4 h-4" />
              <span>{esp32Connected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          className="bg-white rounded-lg shadow-sm border p-6"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Count</p>
              <p className="text-3xl font-bold text-blue-600">{currentCount}</p>
              <p className="text-sm text-gray-500">of {maxCapacity} capacity</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  crowdLevel > 0.8 ? 'bg-red-500' : crowdLevel > 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(crowdLevel * 100, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">Crowd Level: {crowdStatus}</p>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-sm border p-6"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROI</p>
              <p className="text-3xl font-bold text-green-600">{demoAnalytics.roi}%</p>
              <p className="text-sm text-green-600">+12% from last month</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-sm border p-6"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cost Savings</p>
              <p className="text-3xl font-bold text-purple-600">₺{demoAnalytics.costSavings.toLocaleString()}</p>
              <p className="text-sm text-purple-600">Monthly</p>
            </div>
            <Target className="w-8 h-8 text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-sm border p-6"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Efficiency</p>
              <p className="text-3xl font-bold text-orange-600">{demoAnalytics.operationalEfficiency}%</p>
              <p className="text-sm text-orange-600">Operational</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-600" />
          </div>
        </motion.div>
      </div>

      {/* Camera Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Live Camera Feed</h3>
          <button
            onClick={startCamera}
            disabled={cameraLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            <span>{cameraLoading ? 'Connecting...' : 'Start Camera'}</span>
          </button>
        </div>

        {cameraError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{cameraError}</span>
            </div>
          </div>
        )}

        <div className="relative bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
          {isStreaming ? (
            <div className="text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Camera feed will appear here</p>
              <p className="text-sm text-gray-400">ESP32-CAM @ {esp32Ip}</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gray-300 mx-auto mb-2 flex items-center justify-center">
                <Camera className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-gray-500">Click "Start Camera" to begin</p>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-gray-700">Analytics Running</span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-gray-700">Data Collection Active</span>
          </div>
          <div className="flex items-center space-x-3">
            {esp32Connected ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="text-gray-700">ESP32 Connection</span>
          </div>
        </div>
      </div>
    </div>
  );
}