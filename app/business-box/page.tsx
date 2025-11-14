'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Wifi, 
  Shield, 
  Zap, 
  CheckCircle2,
  ArrowRight,
  PlayCircle,
  Star,
  Building2,
  Coffee,
  ShoppingBag,
  ChevronDown,
  MessageSquare,
  Clock,
  Award,
  Globe,
  Sparkles,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function BusinessBoxLanding() {
  const [activeTab, setActiveTab] = useState('cafe');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showDemoVideo, setShowDemoVideo] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CV</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                City-V Business Box
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition">Özellikler</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition">Nasıl Çalışır</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition">Fiyatlandırma</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition">Hakkımızda</a>
              <Link 
                href="/business-box/beta"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition"
              >
                Beta Başvurusu
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Türkiye'nin İlk IoT Kalabalık Analiz Sistemi</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                İşletmenizi
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Akıllı </span>
                Hale Getirin
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                City-V Business Box ile müşteri yoğunluğunu gerçek zamanlı izleyin, 
                verimliliği artırın ve karar alma süreçlerinizi güçlendirin. 
                <strong className="text-gray-900"> Tak-Çalıştır</strong> sistemi ile 5 dakikada kurulum!
                Cafe, restaurant, retail mağaza, otel ve tüm perakende sektörü için ideal.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">%40</div>
                  <div className="text-sm text-gray-600">Verimlilik Artışı</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-1">5dk</div>
                  <div className="text-sm text-gray-600">Kurulum Süresi</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">24/7</div>
                  <div className="text-sm text-gray-600">Canlı Takip</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/business-box/beta"
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-2"
                >
                  <span className="font-semibold">Ücretsiz Beta'ya Katıl</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button 
                  onClick={() => setShowDemoVideo(true)}
                  className="group px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-xl hover:border-blue-600 transition-all flex items-center justify-center space-x-2"
                >
                  <PlayCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">Demo İzle</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Kolay Kurulum</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span>KVKK Uyumlu</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span>1 Yıl Garanti</span>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Product Image/Animation */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 shadow-2xl">
                {/* Floating Cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-6 -left-6 bg-white rounded-xl shadow-xl p-4 z-10"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Canlı Doluluk</div>
                      <div className="text-xl font-bold text-gray-900">%73</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-4 z-10"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Şu An İçeride</div>
                      <div className="text-xl font-bold text-gray-900">24 Kişi</div>
                    </div>
                  </div>
                </motion.div>

                {/* Main Device */}
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                    {/* Prototip Görseli - Gerçek cihaz fotoğrafı placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* IoT Cihaz Temsili Görsel */}
                        <div className="relative w-48 h-32 bg-gradient-to-br from-blue-900 to-indigo-900 rounded-lg shadow-2xl border-2 border-blue-400">
                          {/* Kamera Lens */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-inner">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-black rounded-full flex items-center justify-center">
                              <Camera className="w-6 h-6 text-blue-400" />
                            </div>
                          </div>
                          {/* LED Indicator */}
                          <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                          {/* USB Port */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-gray-600 rounded-sm"></div>
                          {/* City-V Logo */}
                          <div className="absolute bottom-2 right-2 text-xs text-blue-400 font-bold">CV</div>
                        </div>
                      </div>
                      {/* Scan Lines Effect */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent animate-pulse"></div>
                    </div>
                    <div className="absolute top-4 right-4 z-10">
                      <div className="flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>CANLI</span>
                      </div>
                    </div>
                    {/* Analiz Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 z-10">
                      <div className="flex items-center justify-between text-white text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>24 Kişi Algılandı</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4" />
                          <span>%73 Doluluk</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">City-V Business Box</div>
                      <div className="font-semibold text-gray-900">Prototip v1.0 • IoT Cihaz</div>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Wifi className="w-5 h-5 text-green-600 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Decoration */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-blue-200 to-indigo-200 blur-3xl opacity-30 rounded-full"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Perakende İşletmeleri İçin <span className="text-red-600">Büyük Sorunlar</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cafe, restaurant, retail, otel ve tüm perakende sektöründe müşteri yoğunluğunu 
              tahmin edememe, personel planlaması yapamama ve verimsiz operasyonlar...
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Belirsiz Müşteri Akışı',
                problem: 'Hangi saatlerde yoğun olacağınızı bilemiyorsunuz',
                impact: '%30 personel verimsizliği'
              },
              {
                icon: Clock,
                title: 'Zaman Kaybı',
                problem: 'Manuel sayım ve tahminlerle vakit harcıyorsunuz',
                impact: 'Günde 2 saat kayıp'
              },
              {
                icon: BarChart3,
                title: 'Veri Eksikliği',
                problem: 'Stratejik kararlar almak için veriye sahip değilsiniz',
                impact: '%25 gelir kaybı'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 hover:shadow-lg transition"
              >
                <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.problem}</p>
                <div className="text-red-600 font-semibold text-sm">❌ {item.impact}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sektör Çeşitliliği Section - YENİ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tüm Perakende Sektörü İçin <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Tek Çözüm</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              City-V Business Box, her türlü işletme için özelleştirilebilir akıllı analiz sistemi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Coffee,
                title: 'Cafe & Restaurant',
                description: 'Masa doluluk oranı, müşteri akışı, sipariş yoğunluğu analizi',
                color: 'from-amber-500 to-orange-500',
                examples: ['Starbucks tarzı kafeler', 'Fast-food zincirleri', 'Fine dining']
              },
              {
                icon: ShoppingBag,
                title: 'Retail & Mağaza',
                description: 'Mağaza trafiği, ürün bölgesi yoğunluğu, kasa kuyruğu takibi',
                color: 'from-pink-500 to-rose-500',
                examples: ['Giyim mağazaları', 'Market zincirleri', 'Elektronik']
              },
              {
                icon: Building2,
                title: 'Otel & Konaklama',
                description: 'Resepsiyon yoğunluğu, lobi kullanımı, restaurant doluluk',
                color: 'from-blue-500 to-cyan-500',
                examples: ['Butik oteller', 'Zincir oteller', 'Hostel']
              },
              {
                icon: Globe,
                title: 'Diğer İşletmeler',
                description: 'Spor salonu, güzellik merkezi, ofis, co-working alanları',
                color: 'from-purple-500 to-indigo-500',
                examples: ['Gym', 'Beauty center', 'Co-working']
              }
            ].map((sector, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-blue-200"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${sector.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <sector.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{sector.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{sector.description}</p>
                <div className="space-y-1">
                  {sector.examples.map((example, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs text-gray-500">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      <span>{example}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Prototip Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-white rounded-3xl p-8 shadow-2xl border-2 border-blue-200"
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Gerçek Cihaz Prototip</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Yapay Zeka Tabanlı IoT Çözüm
                </h3>
                <p className="text-gray-600 mb-6">
                  Prototip cihazımız gerçek zamanlı görüntü işleme ve yapay zeka ile 
                  müşteri sayımı yapıyor. Kompakt tasarımı sayesinde her türlü mekana 
                  kolayca kurulabiliyor.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Doğruluk Oranı', value: '%95+', icon: CheckCircle2 },
                    { label: 'Gerçek Zamanlı', value: '<1sn', icon: Zap },
                    { label: 'WiFi Bağlantı', value: '2.4GHz', icon: Wifi },
                    { label: 'Pil Ömrü', value: '4-5 saat', icon: Shield }
                  ].map((spec, i) => (
                    <div key={i} className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <spec.icon className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-gray-500">{spec.label}</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                {/* Prototip Image Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20"></div>
                  {/* IoT Cihaz 3D Visualization */}
                  <div className="relative z-10">
                    <div className="w-64 h-40 bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl shadow-2xl border-4 border-blue-400 relative">
                      {/* Kamera Lens - Büyük ve merkezi */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-600 rounded-full flex items-center justify-center shadow-2xl">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-black rounded-full flex items-center justify-center border-4 border-blue-500">
                          <Camera className="w-10 h-10 text-blue-400" />
                        </div>
                      </div>
                      {/* LED - Animasyonlu */}
                      <div className="absolute top-4 right-4 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/70"></div>
                      {/* USB Port */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-3 bg-gray-600 rounded"></div>
                      {/* Antenna indicator */}
                      <div className="absolute top-4 left-4">
                        <Wifi className="w-5 h-5 text-blue-400 animate-pulse" />
                      </div>
                      {/* City-V Branding */}
                      <div className="absolute bottom-4 right-4 text-sm text-blue-400 font-bold tracking-wider">CITY-V</div>
                    </div>
                  </div>
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 to-transparent"></div>
                </div>
                {/* Floating Stats */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-xl p-4 border-2 border-green-200">
                  <div className="text-xs text-gray-500 mb-1">Canlı Test</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-gray-900">Aktif Çalışıyor</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              City-V Business Box ile <span className="text-green-600">Çözüm Çok Basit</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tak-çalıştır sistemi ile 5 dakikada kurulum, anında veri akışı!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Gerçek Zamanlı Takip',
                solution: 'Canlı kalabalık göstergesi ile anlık durumu görün',
                benefit: '%40 daha iyi planlama'
              },
              {
                icon: TrendingUp,
                title: 'Akıllı Analizler',
                solution: 'AI destekli raporlar ve öngörüler alın',
                benefit: '%35 maliyet tasarrufu'
              },
              {
                icon: Globe,
                title: 'Bulut Entegrasyonu',
                solution: 'Her yerden erişim, City-V uygulamasında yayın',
                benefit: '%50 daha fazla müşteri'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border-2 border-green-200 rounded-2xl p-8 hover:shadow-2xl transition"
              >
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.solution}</p>
                <div className="text-green-600 font-semibold text-sm">✅ {item.benefit}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nasıl Çalışır?</h2>
            <p className="text-xl text-gray-600">3 basit adımda başlayın</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-1 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200"></div>

            {[
              {
                step: '01',
                title: 'Cihazı Takın',
                description: 'Business Box\'ı prize takın ve kafenizde uygun bir yere yerleştirin. Kurulum 5 dakika sürer.',
                icon: Camera,
                color: 'blue'
              },
              {
                step: '02',
                title: 'WiFi Bağlayın',
                description: 'Otomatik WiFi kurulum portalı açılır. Şifrenizi girin, cihaz kendini kaydeder.',
                icon: Wifi,
                color: 'indigo'
              },
              {
                step: '03',
                title: 'Verileri İzleyin',
                description: 'Dashboard\'dan canlı yoğunluk, raporlar ve City-V uygulamasında yayınınızı görün.',
                icon: BarChart3,
                color: 'purple'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative text-center"
              >
                {/* Step Number */}
                <div className="relative inline-block mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br from-${item.color}-100 to-${item.color}-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg relative z-10`}>
                    <item.icon className={`w-8 h-8 text-${item.color}-600`} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {item.step}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Güçlü Özellikler</h2>
            <p className="text-xl text-gray-600">İşletmenizi bir üst seviyeye taşıyacak teknoloji</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Camera, title: 'HD Kamera', desc: '1080p çözünürlük' },
              { icon: Wifi, title: 'Bulut Sync', desc: 'Otomatik yedekleme' },
              { icon: Shield, title: 'KVKK Uyumlu', desc: 'Yüz tanıma yok' },
              { icon: Zap, title: 'Hızlı Kurulum', desc: '5 dakika' },
              { icon: TrendingUp, title: 'AI Analiz', desc: 'Akıllı öngörüler' },
              { icon: BarChart3, title: 'Detaylı Raporlar', desc: 'Günlük/haftalık' },
              { icon: Users, title: 'Kişi Sayma', desc: '%95 doğruluk' },
              { icon: Globe, title: 'City-V Entegre', desc: 'Otomatik yayın' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition text-center group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Kimler Kullanabilir?</h2>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              { id: 'cafe', label: 'Kafeler', icon: Coffee },
              { id: 'restaurant', label: 'Restoranlar', icon: Building2 },
              { id: 'retail', label: 'Perakende', icon: ShoppingBag },
              { id: 'mall', label: 'AVM', icon: Building2 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  {activeTab === 'cafe' && 'Kafeler İçin Özel Çözüm'}
                  {activeTab === 'restaurant' && 'Restoranlar İçin Optimize'}
                  {activeTab === 'retail' && 'Perakende Mağazaları İçin İdeal'}
                  {activeTab === 'mall' && 'AVM\'ler İçin Profesyonel Çözüm'}
                </h3>
                <ul className="space-y-4">
                  {activeTab === 'cafe' && (
                    <>
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                        <span className="text-gray-700"><strong>Yoğun saatleri</strong> öğrenin, personel planlaması yapın</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                        <span className="text-gray-700"><strong>City-V uygulamasında</strong> "Şu an boş" göstergesiyle müşteri çekin</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                        <span className="text-gray-700"><strong>Kampanya zamanlaması</strong> için veri bazlı kararlar alın</span>
                      </li>
                    </>
                  )}
                  {activeTab === 'restaurant' && (
                    <>
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                        <span className="text-gray-700"><strong>Masa doluluk oranını</strong> gerçek zamanlı izleyin</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                        <span className="text-gray-700"><strong>Rezervasyon optimizasyonu</strong> için veri toplayan</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                        <span className="text-gray-700"><strong>Mutfak-servis koordinasyonu</strong> için öngörü sağlayın</span>
                      </li>
                    </>
                  )}
                  {activeTab === 'retail' && (
                    <>
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                        <span className="text-gray-700"><strong>Ziyaretçi sayısını</strong> ve trafik desenlerini analiz edin</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                        <span className="text-gray-700"><strong>Vitrin performansını</strong> ölçün, düzen optimizasyonu yapın</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                        <span className="text-gray-700"><strong>Personel verimliliğini</strong> yoğunluk verisiyle artırın</span>
                      </li>
                    </>
                  )}
                  {activeTab === 'mall' && (
                    <>
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                        <span className="text-gray-700"><strong>Kat bazında yoğunluk</strong> haritası oluşturun</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                        <span className="text-gray-700"><strong>Trafik akış analizi</strong> ile yerleşim planı optimize edin</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                        <span className="text-gray-700"><strong>Kiracı raporlama</strong> sistemi ile şeffaf veri paylaşımı</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                        <span className="text-gray-700"><strong>Güvenlik entegrasyonu</strong> ile anlık alarm sistemi</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-xl">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-6">
                  {activeTab === 'cafe' && <Coffee className="w-24 h-24 text-gray-400" />}
                  {activeTab === 'restaurant' && <Building2 className="w-24 h-24 text-gray-400" />}
                  {activeTab === 'retail' && <ShoppingBag className="w-24 h-24 text-gray-400" />}
                  {activeTab === 'mall' && <Building2 className="w-24 h-24 text-gray-400" />}
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">Ortalama ROI</div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    3-6 Ay
                  </div>
                  <div className="text-sm text-gray-600">Yatırımınızı geri kazanın</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* İlk 5 İşletme Kampanyası - YENİ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-red-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full mb-6 shadow-lg"
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="font-bold text-lg">ÖZEL KAMPANYA</span>
              <Sparkles className="w-5 h-5 animate-pulse" />
            </motion.div>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              İlk <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">5 Perakende Sektörü</span> İçin
            </h2>
            <p className="text-2xl text-gray-600 mb-2">Özel Fırsat Fiyatları!</p>
            <div className="inline-flex items-center space-x-2 text-red-600 font-semibold">
              <Clock className="w-5 h-5" />
              <span>Sınırlı Kontenjan - İlk 5 İşletme</span>
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-6 mb-12">
            {[
              { sector: 'Cafe & Restaurant', icon: Coffee, remaining: 2, discount: '%40' },
              { sector: 'Retail Mağaza', icon: ShoppingBag, remaining: 1, discount: '%40' },
              { sector: 'Otel & Konaklama', icon: Building2, remaining: 3, discount: '%40' },
              { sector: 'Gym & Spor', icon: Users, remaining: 4, discount: '%40' },
              { sector: 'Güzellik Merkezi', icon: Globe, remaining: 5, discount: '%40' }
            ].map((sector, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200 relative overflow-hidden group hover:shadow-2xl transition"
              >
                <div className="absolute top-0 right-0 bg-gradient-to-br from-red-500 to-orange-500 text-white px-3 py-1 rounded-bl-xl text-xs font-bold">
                  {sector.discount} İNDİRİM
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <sector.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{sector.sector}</h3>
                <div className="flex items-center space-x-2 text-sm">
                  <div className={`w-2 h-2 ${sector.remaining <= 2 ? 'bg-red-500' : 'bg-green-500'} rounded-full animate-pulse`}></div>
                  <span className="text-gray-600">
                    <span className="font-bold text-red-600">{sector.remaining}</span> Kontenjan Kaldı
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-white to-orange-50 rounded-3xl p-8 shadow-2xl border-4 border-orange-300"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Kampanya Fiyatı
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 line-through mb-1">Normal Fiyat: ₺7,499</div>
                    <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
                      ₺4,499
                    </div>
                    <div className="text-lg text-gray-600">tek seferlik cihaz bedeli</div>
                  </div>
                  <div className="border-t-2 border-orange-200 pt-4">
                    <div className="text-sm text-gray-500 line-through mb-1">Normal: ₺349/ay</div>
                    <div className="text-3xl font-bold text-orange-600">₺249/ay</div>
                    <div className="text-sm text-gray-600">aylık abonelik (ilk 6 ay)</div>
                  </div>
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-green-800">Toplam Tasarruf</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">₺3,600</div>
                    <div className="text-sm text-gray-600">(ilk 6 ay için)</div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-8 text-white">
                <h4 className="text-2xl font-bold mb-4">Kampanyaya Dahil:</h4>
                <ul className="space-y-3">
                  {[
                    '1x Business Box Cihazı (IoT)',
                    'Ücretsiz Kurulum & Eğitim',
                    'İlk 6 Ay İndirimli Abonelik',
                    '7/24 Öncelikli Teknik Destek',
                    'Gerçek Zamanlı Müşteri Analizi',
                    'AI Destekli Tahmin Algoritmaları',
                    'City-V Premium Entegrasyonu',
                    'Aylık Detaylı Raporlama'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/business-box/beta">
                  <button className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition transform hover:scale-105">
                    Hemen Başvur - Kontenjan Kapanmadan! 🔥
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Standart Fiyatlandırma</h2>
            <p className="text-xl text-gray-600">Kampanya sonrası geçerli fiyatlar</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Starter */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tek Cihaz</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">₺7,499</span>
                <span className="text-gray-600">/tek seferlik</span>
              </div>
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-1">+ Aylık Abonelik</div>
                <div className="text-2xl font-bold text-blue-600">₺349/ay</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">1 Business Box cihazı</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Gerçek zamanlı takip</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Temel raporlar</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">City-V entegrasyonu</span>
                </li>
              </ul>
              <Link href="/business-box/beta">
                <button className="w-full py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition">
                  Başvur
                </button>
              </Link>
            </motion.div>

            {/* Professional (Popular) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-2xl transform scale-105 relative"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                KURUMSAL
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Çoklu Cihaz Paketi</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">₺13,999</span>
                <span className="text-blue-100">/tek seferlik</span>
              </div>
              <div className="mb-6">
                <div className="text-sm text-blue-100 mb-1">+ Aylık Abonelik</div>
                <div className="text-2xl font-bold text-white">₺599/ay</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-yellow-300" />
                  <span className="text-white">2 Business Box cihazı</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-yellow-300" />
                  <span className="text-white">AI destekli analizler</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-yellow-300" />
                  <span className="text-white">Gelişmiş raporlar</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-yellow-300" />
                  <span className="text-white">Merkezi yönetim paneli</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-yellow-300" />
                  <span className="text-white">7/24 öncelikli destek</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-yellow-300" />
                  <span className="text-white">API erişimi</span>
                </li>
              </ul>
              <a href="mailto:sce@scegrup.com?subject=City-V Business Box - Çoklu Cihaz Paketi Teklifi">
                <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition">
                  İletişime Geç
                </button>
              </a>
            </motion.div>
          </div>

          {/* Not */}
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              💡 <span className="font-semibold">İlk 5 işletme kampanyası</span>ndan yararlanmak için yukarıdaki özel fiyatları kontrol edin
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Beta Kullanıcılarımız Ne Diyor?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Ahmet Yılmaz',
                role: 'Kafe Ankara - Sahibi',
                content: 'Business Box sayesinde personel planlaması çok daha kolay. Yoğun saatleri önceden biliyoruz ve müşteri memnuniyeti %40 arttı!',
                rating: 5,
                avatar: 'AY'
              },
              {
                name: 'Zeynep Kaya',
                role: 'Coffee Break - İşletme Müdürü',
                content: 'City-V uygulamasında "şu an boş" göstergesi müthiş işe yarıyor. Yeni müşteri akışı %30 arttı. Kesinlikle tavsiye ederim!',
                rating: 5,
                avatar: 'ZK'
              },
              {
                name: 'Mehmet Demir',
                role: 'Kahve Durağı - Franchise Sahibi',
                content: '3 şubemizde kullanıyoruz. Raporlar sayesinde hangi şubenin ne zaman yoğun olduğunu görüyorum. ROI 4 ayda gerçekleşti.',
                rating: 5,
                avatar: 'MD'
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hakkımızda - SCE Grup */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full mb-4 shadow-lg"
            >
              <Building2 className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">SCE GRUP</span>
            </motion.div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Hakkımızda</h2>
            <p className="text-xl text-gray-600">Teknoloji ile geleceği inşa ediyoruz</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  SCE Grup olarak, <span className="text-blue-600">inovasyon</span> ve <span className="text-indigo-600">teknoloji</span> odaklı çözümler üretiyoruz
                </h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong className="text-gray-900">SCE Grup</strong>, Türkiye'nin önde gelen teknoloji şirketlerinden biri olarak, 
                    yazılım geliştirme, IoT çözümleri ve dijital dönüşüm alanlarında faaliyet göstermektedir.
                  </p>
                  <p>
                    <strong className="text-blue-600">City-V</strong>, SCE Grup'un akıllı şehir ve işletme çözümleri markasıdır. 
                    Yapay zeka destekli IoT teknolojileri ile işletmelerin verimliliğini artırıyor, 
                    müşteri deneyimini iyileştiriyor ve operasyonel maliyetleri düşürüyoruz.
                  </p>
                  <p>
                    Misyonumuz, teknolojinin gücünü kullanarak işletmelerin dijital dönüşüm süreçlerinde 
                    güvenilir bir iş ortağı olmak ve sürdürülebilir büyüme sağlamaktır.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-blue-600">5+</div>
                      <div className="text-sm text-gray-600">Yıllık Deneyim</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-indigo-600">50+</div>
                      <div className="text-sm text-gray-600">Mutlu Müşteri</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-purple-600">100%</div>
                      <div className="text-sm text-gray-600">Memnuniyet</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {[
                {
                  icon: Zap,
                  title: 'İnovasyon',
                  description: 'Sürekli araştırma ve geliştirme ile sektörde öncü konumdayız',
                  color: 'from-yellow-500 to-orange-500'
                },
                {
                  icon: Users,
                  title: 'Müşteri Odaklı',
                  description: 'Müşterilerimizin başarısı bizim başarımızdır',
                  color: 'from-blue-500 to-indigo-500'
                },
                {
                  icon: Shield,
                  title: 'Güvenilirlik',
                  description: 'Kaliteli ürün ve hizmet sunmak önceliğimizdir',
                  color: 'from-green-500 to-teal-500'
                },
                {
                  icon: TrendingUp,
                  title: 'Sürdürülebilir Büyüme',
                  description: 'İşletmelerin uzun vadeli başarısı için çalışıyoruz',
                  color: 'from-purple-500 to-pink-500'
                }
              ].map((value, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition group"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <value.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h4>
                      <p className="text-gray-600 text-sm">{value.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Sıkça Sorulan Sorular</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Kurulum ne kadar sürer?',
                a: 'Kurulum sadece 5 dakika sürer. Cihazı prize takın, otomatik WiFi portalından şifrenizi girin ve hazır! Teknik bilgiye gerek yok.'
              },
              {
                q: 'KVKK\'ya uygun mu?',
                a: 'Evet, %100 KVKK uyumlu. Yüz tanıma teknolojisi kullanmıyoruz, sadece kişi sayısı ve hareket analizi yapıyoruz. Müşterilerinizin gizliliği tam korunur.'
              },
              {
                q: 'İnternet kesintisinde ne olur?',
                a: 'Cihaz yerel olarak veri kaydeder ve internet bağlantısı geri geldiğinde otomatik senkronize eder. Hiçbir veri kaybı olmaz.'
              },
              {
                q: 'City-V uygulamasında nasıl görünürüz?',
                a: 'Business Box kullanan işletmeler otomatik olarak City-V haritasında "Canlı Yoğunluk" göstergesi ile görünür. Kullanıcılar hangi kafelerin boş olduğunu görebilir.'
              },
              {
                q: 'Destek aldınız mı?',
                a: 'Evet! Email, telefon ve WhatsApp üzerinden 7/24 destek veriyoruz. Ayrıca kurulum için video kılavuzumuz ve online dokümantasyonumuz mevcut.'
              },
              {
                q: 'Beta programı nasıl çalışır?',
                a: 'İlk 5 kafeye 3 ay tamamen ücretsiz + sonraki 9 ay %50 indirim sunuyoruz. Sadece dürüst geri bildirim ve başarı hikayenizi paylaşmanızı bekliyoruz.'
              }
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              İşletmenizi Akıllı Hale Getirmeye Hazır mısınız?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Beta programımıza katılın, 3 ay ücretsiz kullanın + %50 indirim kazanın
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/business-box/beta"
                className="group px-8 py-4 bg-white text-blue-600 rounded-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-2 font-semibold text-lg"
              >
                <span>Beta'ya Başvur</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-8 py-4 bg-blue-700 text-white border-2 border-blue-400 rounded-xl hover:bg-blue-800 transition-all flex items-center justify-center space-x-2 font-semibold text-lg">
                <MessageSquare className="w-6 h-6" />
                <span>Satış Ekibiyle Konuş</span>
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center space-x-6 text-blue-100">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Kredi kartı gereksiz</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>5 dakikada kurulum</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Para iade garantisi</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CV</span>
                </div>
                <span className="text-white font-bold">City-V</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                İşletmeleri akıllı hale getiren IoT çözümleri
              </p>
              <p className="text-xs text-gray-500">
                Bir <span className="text-blue-400 font-semibold">SCE Grup</span> şirketidir
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Ürün</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Özellikler</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Fiyatlandırma</a></li>
                <li><Link href="/business-box/demo" className="hover:text-white transition">Demo</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Şirket</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white transition">Hakkımızda</a></li>
                <li><span className="text-gray-600 cursor-not-allowed">Blog (Yakında)</span></li>
                <li><span className="text-gray-600 cursor-not-allowed">Kariyer (Yakında)</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">İletişim</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="tel:+908508881889" className="hover:text-white transition flex items-center space-x-2">
                    <span>📞</span>
                    <span>+90 850 888 1 889</span>
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/905433929230" target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center space-x-2">
                    <span>💬</span>
                    <span>+90 543 392 92 30</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:sce@scegrup.com" className="hover:text-white transition flex items-center space-x-2">
                    <span>📧</span>
                    <span>sce@scegrup.com</span>
                  </a>
                </li>
                <li className="text-gray-400 text-xs pt-2">
                  📍 Çetin Emeç Bulvarı 25/3
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">© 2025 City-V by SCE Grup. Tüm hakları saklıdır.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition">LinkedIn</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Instagram</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Video Modal */}
      {showDemoVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowDemoVideo(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6 text-gray-900" />
            </button>

            {/* Video Container */}
            <div className="aspect-video bg-gray-900">
              {/* YouTube Embed Placeholder */}
              <div className="w-full h-full flex flex-col items-center justify-center text-white">
                <PlayCircle className="w-24 h-24 mb-6 opacity-50" />
                <h3 className="text-2xl font-bold mb-2">Demo Video Yakında!</h3>
                <p className="text-gray-400 mb-6">City-V Business Box tanıtım videomuz hazırlanıyor.</p>
                
                {/* Temporary Content */}
                <div className="max-w-md text-center space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h4 className="font-semibold mb-3">Videoda Göreceğiniz İçerikler:</h4>
                    <ul className="text-sm text-left space-y-2">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                        <span>5 dakikada kurulum süreci</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                        <span>Dashboard canlı demo</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                        <span>AI analiz özellikleri</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                        <span>Gerçek kafe kullanım senaryoları</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href="/business-box/beta"
                      onClick={() => setShowDemoVideo(false)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition font-semibold"
                    >
                      Beta'ya Başvur
                    </Link>
                    <button
                      onClick={() => setShowDemoVideo(false)}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition font-semibold"
                    >
                      Kapat
                    </button>
                  </div>
                </div>

                {/* When you have real video, replace above with: */}
                {/* <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                  title="City-V Business Box Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                /> */}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
