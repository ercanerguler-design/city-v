'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, Users, Camera, MapPin, DollarSign, 
  Activity, Clock, Target, Award, Bell, Settings, 
  UserPlus, Package, Wifi, Thermometer, Eye, AlertCircle,
  CheckCircle, XCircle, BarChart3, Calendar, Zap
} from 'lucide-react'

export default function BusinessPage() {
  const [isAuth, setIsAuth] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [realTimeData, setRealTimeData] = useState({
    visitors: 187,
    revenue: 27500,
    cameras: 12,
    avgStay: 22
  })

  useEffect(() => {
    setIsAuth(!!localStorage.getItem('business_token'))
  }, [])

  // Gerçek zamanlı veri güncelleme
  useEffect(() => {
    if (isAuth) {
      const interval = setInterval(() => {
        setRealTimeData({
          visitors: Math.floor(Math.random() * 50) + 150,
          revenue: Math.floor(Math.random() * 5000) + 25000,
          cameras: 12,
          avgStay: Math.floor(Math.random() * 10) + 15
        })
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isAuth])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('business_token', 'active')
    setIsAuth(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('business_token')
    setIsAuth(false)
  }

  // VERİLER
  const personeller = [
    { id: 1, isim: 'Ahmet Yılmaz', rol: 'Müdür', durum: 'aktif', vardiya: 'Sabah', telefon: '0532 XXX XX XX' },
    { id: 2, isim: 'Ayşe Kaya', rol: 'Satış Sorumlusu', durum: 'aktif', vardiya: 'Öğlen', telefon: '0533 XXX XX XX' },
    { id: 3, isim: 'Mehmet Demir', rol: 'Teknik Destek', durum: 'aktif', vardiya: 'Akşam', telefon: '0534 XXX XX XX' },
    { id: 4, isim: 'Fatma Şahin', rol: 'Kasa Görevlisi', durum: 'izinli', vardiya: 'Sabah', telefon: '0535 XXX XX XX' }
  ]

  const kampanyalar = [
    { id: 1, ad: 'Yaz İndirimi', indirim: 25, durum: true, erisim: 2840, etkilesim: 87, baslangic: '01.06.2025', bitis: '31.08.2025' },
    { id: 2, ad: 'Yeni Üye Kampanyası', indirim: 15, durum: true, erisim: 1520, etkilesim: 92, baslangic: '15.05.2025', bitis: '15.12.2025' },
    { id: 3, ad: 'Hafta Sonu Özel', indirim: 30, durum: true, erisim: 3210, etkilesim: 78, baslangic: 'Her Hafta Sonu', bitis: '-' },
    { id: 4, ad: 'VIP Müşteri', indirim: 40, durum: false, erisim: 890, etkilesim: 95, baslangic: '01.01.2025', bitis: '31.12.2025' }
  ]

  const bildirimler = [
    { id: 1, tip: 'kampanya', mesaj: 'Yaz İndirimi kampanyası başladı', zaman: '2 dk önce', okundu: false },
    { id: 2, tip: 'iot', mesaj: 'Kamera #7 bağlantısı kuruldu', zaman: '15 dk önce', okundu: false },
    { id: 3, tip: 'personel', mesaj: 'Ahmet Yılmaz mesaiye giriş yaptı', zaman: '1 saat önce', okundu: true },
    { id: 4, tip: 'sistem', mesaj: 'Günlük rapor hazırlandı', zaman: '2 saat önce', okundu: true }
  ]

  const iotCihazlar = [
    { id: 'CAM-001', konum: 'Giriş Kapısı', durum: 'online', fps: 30, sicaklik: 24, son_veri: '2 sn önce' },
    { id: 'CAM-002', konum: 'Ana Salon', durum: 'online', fps: 28, sicaklik: 23, son_veri: '1 sn önce' },
    { id: 'CAM-003', konum: 'Kasa Bölümü', durum: 'online', fps: 30, sicaklik: 25, son_veri: '3 sn önce' },
    { id: 'CAM-004', konum: 'Arka Giriş', durum: 'online', fps: 29, sicaklik: 22, son_veri: '2 sn önce' },
    { id: 'SENS-001', konum: 'Depo', durum: 'online', fps: 0, sicaklik: 18, son_veri: '5 sn önce' },
    { id: 'SENS-002', konum: 'Klima Sistemi', durum: 'online', fps: 0, sicaklik: 21, son_veri: '4 sn önce' }
  ]

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-500/30 p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-3">CityV Business</h1>
            <p className="text-blue-200 text-lg">Profesyonel İşletme Yönetim Platformu</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-blue-200 mb-3 font-semibold">E-posta Adresi</label>
              <input type="email" required className="w-full px-5 py-4 rounded-xl bg-white/10 border-2 border-blue-500/30 text-white placeholder-blue-300/50 focus:outline-none focus:ring-4 focus:ring-blue-500/50" placeholder="ornek@isletme.com" />
            </div>
            <div>
              <label className="block text-blue-200 mb-3 font-semibold">Şifre</label>
              <input type="password" required className="w-full px-5 py-4 rounded-xl bg-white/10 border-2 border-blue-500/30 text-white placeholder-blue-300/50 focus:outline-none focus:ring-4 focus:ring-blue-500/50" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              İşletme Paneline Giriş Yap
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
      {/* HEADER */}
      <div className="border-b border-blue-900/30 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">CityV Business Dashboard</h1>
                <p className="text-blue-300 text-sm">Profesyonel İşletme Yönetimi</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-lg border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 font-semibold">Canlı</span>
              </div>
              <button onClick={handleLogout} className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 px-6 py-2 rounded-lg font-semibold">Çıkış Yap</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-8 py-8">
        {/* ANA METRIKLER */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:scale-105 transition-transform cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-bold">+12.5%</span>
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-2">Anlık Ziyaretçi</h3>
            <p className="text-4xl font-bold text-white">{realTimeData.visitors}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:scale-105 transition-transform cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-bold">+8.3%</span>
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-2">Günlük Gelir</h3>
            <p className="text-4xl font-bold text-white">₺{realTimeData.revenue.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:scale-105 transition-transform cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-bold">100%</span>
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-2">Aktif Kamera</h3>
            <p className="text-4xl font-bold text-white">{realTimeData.cameras}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:scale-105 transition-transform cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-bold">+5.7%</span>
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-2">Ort. Kalış Süresi</h3>
            <p className="text-4xl font-bold text-white">{realTimeData.avgStay} dk</p>
          </div>
        </div>

        {/* PERSONELLER VE BİLDİRİMLER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* PERSONELLER */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900/50 to-blue-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-blue-400" />
                Personel Yönetimi
              </h2>
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors">
                + Yeni Personel
              </button>
            </div>
            <div className="space-y-3">
              {personeller.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${p.durum === 'aktif' ? 'bg-green-500' : 'bg-gray-500'}`}>
                      {p.isim.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-bold">{p.isim}</p>
                      <p className="text-gray-400 text-sm">{p.rol} • {p.vardiya}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">{p.telefon}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.durum === 'aktif' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                      {p.durum.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BİLDİRİMLER */}
          <div className="bg-gradient-to-br from-slate-900/50 to-purple-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Bell className="w-6 h-6 text-purple-400" />
              Bildirimler
            </h2>
            <div className="space-y-3">
              {bildirimler.map((b) => (
                <div key={b.id} className={`p-3 rounded-lg transition-colors ${b.okundu ? 'bg-white/5' : 'bg-purple-500/10 border border-purple-500/30'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${b.tip === 'kampanya' ? 'bg-orange-500' : b.tip === 'iot' ? 'bg-blue-500' : b.tip === 'personel' ? 'bg-green-500' : 'bg-gray-500'}`}>
                      {b.tip === 'kampanya' && <Target className="w-4 h-4 text-white" />}
                      {b.tip === 'iot' && <Wifi className="w-4 h-4 text-white" />}
                      {b.tip === 'personel' && <Users className="w-4 h-4 text-white" />}
                      {b.tip === 'sistem' && <Settings className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium mb-1">{b.mesaj}</p>
                      <p className="text-gray-400 text-xs">{b.zaman}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KAMPANYALAR */}
        <div className="bg-gradient-to-br from-slate-900/50 to-indigo-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-indigo-400" />
              Kampanya Yönetimi
            </h2>
            <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-semibold transition-colors">
              + Yeni Kampanya
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kampanyalar.map((k) => (
              <div key={k.id} className={`p-5 rounded-xl border-2 ${k.durum ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30' : 'bg-slate-800/50 border-gray-700'}`}>
                <div className="flex justify-between items-start mb-3">
                  <Award className={`w-5 h-5 ${k.durum ? 'text-green-400' : 'text-gray-500'}`} />
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${k.durum ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'}`}>
                    {k.durum ? 'AKTİF' : 'PASİF'}
                  </span>
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{k.ad}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">İndirim:</span>
                    <span className="text-orange-400 font-bold">%{k.indirim}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Erişim:</span>
                    <span className="text-blue-400 font-bold">{k.erisim.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Etkileşim:</span>
                    <span className="text-purple-400 font-bold">%{k.etkilesim}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-white/10">
                    <p className="text-xs text-gray-400">{k.baslangic} - {k.bitis}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* IOT İZLEME VE ANALİZ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-slate-900/50 to-blue-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Camera className="w-6 h-6 text-blue-400" />
                IoT Cihaz İzleme
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm font-semibold">{iotCihazlar.filter(c => c.durum === 'online').length} Aktif</span>
              </div>
            </div>
            <div className="space-y-3">
              {iotCihazlar.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.durum === 'online' ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gray-600'}`}>
                      {c.id.startsWith('CAM') ? <Camera className="w-5 h-5 text-white" /> : <Wifi className="w-5 h-5 text-white" />}
                    </div>
                    <div>
                      <p className="text-white font-bold">{c.id}</p>
                      <p className="text-gray-400 text-sm">{c.konum}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {c.fps > 0 && <p className="text-blue-300 text-sm">{c.fps} FPS</p>}
                      <p className="text-orange-300 text-sm flex items-center gap-1">
                        <Thermometer className="w-3 h-3" />
                        {c.sicaklik}°C
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`w-3 h-3 rounded-full ${c.durum === 'online' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                      <p className="text-xs text-gray-500 mt-1">{c.son_veri}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DETAYLI ANALİZ */}
          <div className="bg-gradient-to-br from-slate-900/50 to-purple-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-400" />
              Detaylı Analiz
            </h2>
            <div className="space-y-4">
              {[
                { baslik: 'Merkez Şube', ziyaretci: 1245, kapasite: 85, trend: 'up' },
                { baslik: 'Kuzey Şube', ziyaretci: 892, kapasite: 72, trend: 'up' },
                { baslik: 'Güney Şube', ziyaretci: 1056, kapasite: 91, trend: 'down' },
                { baslik: 'Batı Şube', ziyaretci: 723, kapasite: 65, trend: 'up' }
              ].map((a, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <h3 className="text-white font-bold">{a.baslik}</h3>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${a.trend === 'up' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      {a.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">{a.ziyaretci.toLocaleString()} ziyaretçi</span>
                    <span className="text-blue-400 font-bold">%{a.kapasite} kapasite</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${a.kapasite > 80 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`} style={{width: `${a.kapasite}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}