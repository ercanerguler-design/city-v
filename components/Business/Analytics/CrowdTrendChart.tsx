'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CrowdTrendChartProps {
  businessId: string;
  timeRange?: '1hour' | '24hours' | '7days';
}

interface HistoricalData {
  timestamp: string;
  peopleCount: number;
  entryCount: number;
  exitCount: number;
}

export default function CrowdTrendChart({ businessId, timeRange = '24hours' }: CrowdTrendChartProps) {
  const [data, setData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState(timeRange);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [businessId, selectedRange]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/business/crowd-analytics?businessId=${businessId}&timeRange=${selectedRange}`);
      const result = await response.json();

      if (result.success && result.historicalData) {
        setData(result.historicalData.reverse()); // Oldest to newest
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      setLoading(false);
    }
  };

  const chartData = {
    labels: data.map(d => {
      const date = new Date(d.timestamp);
      if (selectedRange === '1hour') {
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      } else if (selectedRange === '24hours') {
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
      }
    }),
    datasets: [
      {
        label: 'İnsan Sayısı',
        data: data.map(d => d.peopleCount),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6
      },
      {
        label: 'Giriş',
        data: data.map(d => d.entryCount),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderDash: [5, 5]
      },
      {
        label: 'Çıkış',
        data: data.map(d => d.exitCount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderDash: [5, 5]
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9ca3af',
          font: {
            size: 12
          },
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#fff',
        bodyColor: '#d1d5db',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y} kişi`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(55, 65, 81, 0.5)',
          drawBorder: false
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11
          },
          callback: function(value: any) {
            return value + ' kişi';
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(55, 65, 81, 0.3)',
          drawBorder: false
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 10
          },
          maxRotation: 45,
          minRotation: 0
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-1/4"></div>
          <div className="h-64 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Kalabalık Trendi</h3>
          <p className="text-sm text-gray-400">Gerçek zamanlı analiz</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2">
          {[
            { value: '1hour', label: '1 Saat' },
            { value: '24hours', label: '24 Saat' },
            { value: '7days', label: '7 Gün' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedRange(range.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedRange === range.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        {data.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">Henüz veri bulunmuyor</p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {data.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700">
          <div>
            <p className="text-xs text-gray-400 mb-1">Ortalama</p>
            <p className="text-lg font-semibold text-white">
              {Math.round(data.reduce((sum, d) => sum + d.peopleCount, 0) / data.length)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Maksimum</p>
            <p className="text-lg font-semibold text-orange-400">
              {Math.max(...data.map(d => d.peopleCount))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Minimum</p>
            <p className="text-lg font-semibold text-green-400">
              {Math.min(...data.map(d => d.peopleCount))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Toplam Giriş</p>
            <p className="text-lg font-semibold text-blue-400">
              {data.reduce((sum, d) => sum + d.entryCount, 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
