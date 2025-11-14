'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, MapPin, Clock, Activity } from 'lucide-react';
import { CrowdStats } from '@/types';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsDashboardProps {
  stats: CrowdStats;
  isOpen: boolean;
}

const hourlyData = [
  { hour: '00:00', yoğunluk: 20 },
  { hour: '03:00', yoğunluk: 15 },
  { hour: '06:00', yoğunluk: 35 },
  { hour: '09:00', yoğunluk: 75 },
  { hour: '12:00', yoğunluk: 85 },
  { hour: '15:00', yoğunluk: 70 },
  { hour: '18:00', yoğunluk: 90 },
  { hour: '21:00', yoğunluk: 60 },
  { hour: '23:59', yoğunluk: 40 },
];

const categoryData = [
  { name: 'Kafeler', value: 450 },
  { name: 'Bankalar', value: 320 },
  { name: 'Hastaneler', value: 280 },
  { name: 'AVM', value: 520 },
  { name: 'Noterler', value: 180 },
];

export default function AnalyticsDashboard({ stats, isOpen }: AnalyticsDashboardProps) {
  if (!isOpen) return null;

  const statCards = [
    {
      title: 'Aktif Kullanıcı',
      value: stats.activeUsers.toLocaleString('tr-TR'),
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Toplam Bildirim',
      value: stats.totalReports.toLocaleString('tr-TR'),
      change: '+8.3%',
      trend: 'up',
      icon: Activity,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Takip Edilen Mekan',
      value: stats.trackedLocations.toLocaleString('tr-TR'),
      change: '+5.1%',
      trend: 'up',
      icon: MapPin,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Ort. Bekleme',
      value: '18 dk',
      change: '-3.2%',
      trend: 'down',
      icon: Clock,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl"
    >
      <div className="container mx-auto px-4 py-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
            
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      stat.trend === 'up'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    <TrendIcon className="w-3 h-3" />
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hourly Trend */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Saatlik Yoğunluk Trendi
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorYoğunluk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="yoğunluk"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorYoğunluk)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Kategori Bazlı Bildirimler
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
