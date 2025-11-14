'use client';

import { useEffect, useState } from 'react';
import { Smile, Meh, Frown, Angry, TrendingUp } from 'lucide-react';

interface SentimentStats {
  happy: number;
  neutral: number;
  sad: number;
  angry: number;
}

interface SentimentData {
  totalSentiments: number;
  stats: SentimentStats;
  timeRange: string;
}

export default function BusinessSentimentWidget({ businessUserId }: { businessUserId: number }) {
  const [data, setData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    fetchSentiments();
  }, [businessUserId, timeRange]);

  const fetchSentiments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/business/sentiments?businessUserId=${businessUserId}&timeRange=${timeRange}`);
      const result = await response.json();
      if (result.success) {
        setData(result);
      }
    } catch (error) {
      console.error('Sentiment fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!data || data.totalSentiments === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Smile className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Müşteri Duyguları</h3>
        </div>
        <p className="text-gray-500 text-sm">Henüz duygu bildirimi yok</p>
      </div>
    );
  }

  const sentiments = [
    { 
      label: 'Mutlu', 
      count: data.stats.happy, 
      emoji: '😊', 
      color: 'bg-green-500',
      icon: Smile,
      textColor: 'text-green-700'
    },
    { 
      label: 'Normal', 
      count: data.stats.neutral, 
      emoji: '😐', 
      color: 'bg-blue-500',
      icon: Meh,
      textColor: 'text-blue-700'
    },
    { 
      label: 'Üzgün', 
      count: data.stats.sad, 
      emoji: '😞', 
      color: 'bg-orange-500',
      icon: Frown,
      textColor: 'text-orange-700'
    },
    { 
      label: 'Kızgın', 
      count: data.stats.angry, 
      emoji: '😡', 
      color: 'bg-red-500',
      icon: Angry,
      textColor: 'text-red-700'
    },
  ];

  const maxCount = Math.max(...sentiments.map(s => s.count));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Müşteri Duyguları</h3>
        </div>
        
        {/* Time Range Selector */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="text-xs px-2 py-1 border border-gray-300 rounded-md"
        >
          <option value="24h">Son 24 Saat</option>
          <option value="7d">Son 7 Gün</option>
          <option value="30d">Son 30 Gün</option>
        </select>
      </div>

      {/* Total Count */}
      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <p className="text-sm text-gray-600">Toplam Duygu Bildirimi</p>
        <p className="text-2xl font-bold text-indigo-700">{data.totalSentiments}</p>
      </div>

      {/* Sentiment Bars */}
      <div className="space-y-3">
        {sentiments.map((sentiment) => {
          const percentage = maxCount > 0 ? (sentiment.count / maxCount) * 100 : 0;
          const Icon = sentiment.icon;
          
          return (
            <div key={sentiment.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{sentiment.emoji}</span>
                  <span className="text-sm font-medium text-gray-700">{sentiment.label}</span>
                </div>
                <span className={`text-sm font-bold ${sentiment.textColor}`}>
                  {sentiment.count}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`${sentiment.color} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sentiment Percentage */}
      {data.totalSentiments > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Memnuniyet Oranı: {' '}
            <span className="font-bold text-green-600">
              {Math.round(((data.stats.happy + data.stats.neutral) / data.totalSentiments) * 100)}%
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
