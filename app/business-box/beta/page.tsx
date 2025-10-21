'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Users,
  Calendar,
  Sparkles,
  Gift
} from 'lucide-react';
import Link from 'next/link';

export default function BetaApplicationPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  
  const [formData, setFormData] = useState({
    // Step 1: İşletme Bilgileri
    businessName: '',
    businessType: 'cafe',
    location: '',
    ownerName: '',
    
    // Step 2: İletişim
    email: '',
    phone: '',
    website: '',
    
    // Step 3: İstatistikler
    averageDaily: '',
    openingHours: '',
    currentSolution: 'none',
    
    // Step 4: Beklentiler
    goals: [] as string[],
    heardFrom: 'social',
    additionalInfo: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckboxChange = (goal: string) => {
    setFormData({
      ...formData,
      goals: formData.goals.includes(goal)
        ? formData.goals.filter(g => g !== goal)
        : [...formData.goals, goal]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // API'ye başvuru gönder
      const response = await fetch('/api/beta/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Beta Application başarılı:', formData);
        console.log('✅ Application ID:', result.applicationId);
        console.log('📝 Başvuru Postgres\'e kaydedildi!');
        
        setApplicationId(result.applicationId);
        setSubmitted(true);
      } else {
        alert('Başvuru gönderilirken hata oluştu: ' + result.error);
      }
      
    } catch (error) {
      console.error('❌ Form gönderim hatası:', error);
      alert('Başvuru gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Başvurunuz Alındı!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            <strong>{formData.businessName}</strong> için beta başvurunuz başarıyla kaydedildi.
            Ekibimiz 48 saat içinde sizinle iletişime geçecek.
          </p>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">📦 Beta Paketiniz Hazırlanıyor</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-3">
                <Gift className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">1x City-V Business Box (₺2,990 değerinde)</span>
              </div>
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-yellow-600" />
                <span className="text-gray-700">3 Ay Ücretsiz Premium Hizmet (₺597 değerinde)</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Sonraki 9 Ay %50 İndirim (₺897 tasarruf)</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Toplam Beta Avantajı:</span>
                <span className="text-2xl font-bold text-blue-600">₺4,484</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/business-box"
              className="block w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              Ana Sayfaya Dön
            </Link>
            
            <a
              href="mailto:sce@scegrup.com"
              className="block w-full py-4 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              Bizimle İletişime Geç
            </a>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Başvuru No: <strong>BETA-{Date.now().toString().slice(-6)}</strong>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/business-box" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6">
            <span>← Geri Dön</span>
          </Link>
          
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-100 rounded-full mb-6">
            <Gift className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-600">₺4,484 Değerinde Beta Avantajları</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Beta Programına Başvur
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            İlk 5 kafeden biri olun, 3 ay ücretsiz kullanın + %50 indirim kazanın
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                    s <= step
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {s < step ? <CheckCircle2 className="w-6 h-6" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition ${
                      s < step ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>İşletme</span>
            <span>İletişim</span>
            <span>İstatistikler</span>
            <span>Beklentiler</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
          >
            {/* Step 1: İşletme Bilgileri */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">İşletme Bilgileri</h2>
                  <p className="text-gray-600">İşletmeniz hakkında temel bilgiler</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İşletme Adı *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                    placeholder="Örn: Kafe Ankara"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İşletme Türü *
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="cafe">Kafe</option>
                    <option value="restaurant">Restoran</option>
                    <option value="bakery">Pastane</option>
                    <option value="bar">Bar</option>
                    <option value="retail">Perakende Mağazası</option>
                    <option value="mall">AVM (Alışveriş Merkezi)</option>
                    <option value="chain">Zincir Mağaza</option>
                    <option value="franchise">Franchise</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konum (Şehir/İlçe) *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="Örn: Ankara / Çankaya"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İşletme Sahibi / Yetkili *
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    required
                    placeholder="Adınız Soyadınız"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Step 2: İletişim */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">İletişim Bilgileri</h2>
                  <p className="text-gray-600">Sizinle nasıl iletişime geçebiliriz?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="ornek@email.com"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="05XX XXX XX XX"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website / Instagram (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="www.isletmem.com veya @instagram"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Step 3: İstatistikler */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">İşletme İstatistikleri</h2>
                  <p className="text-gray-600">İşletmeniz hakkında bazı rakamlar</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ortalama Günlük Müşteri Sayısı *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="averageDaily"
                      value={formData.averageDaily}
                      onChange={handleInputChange}
                      required
                      placeholder="Örn: 150"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Çalışma Saatleri *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="openingHours"
                      value={formData.openingHours}
                      onChange={handleInputChange}
                      required
                      placeholder="Örn: 08:00 - 22:00"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şu An Kalabalık Takibi İçin Ne Kullanıyorsunuz? *
                  </label>
                  <select
                    name="currentSolution"
                    value={formData.currentSolution}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="none">Hiçbir şey kullanmıyorum</option>
                    <option value="manual">Manuel sayım yapıyorum</option>
                    <option value="security">Güvenlik kamerası var (analiz yok)</option>
                    <option value="competitor">Rakip ürün kullanıyorum</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 4: Beklentiler */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Beklentileriniz</h2>
                  <p className="text-gray-600">City-V Business Box'tan ne bekliyorsunuz?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Hedefleriniz (Birden fazla seçebilirsiniz) *
                  </label>
                  <div className="space-y-3">
                    {[
                      'Müşteri yoğunluğunu gerçek zamanlı izlemek',
                      'Personel planlaması yapmak',
                      'City-V uygulamasında görünürlük artırmak',
                      'Veri bazlı kararlar almak',
                      'Kampanya zamanlaması optimize etmek',
                      'Maliyet tasarrufu sağlamak'
                    ].map((goal) => (
                      <label key={goal} className="flex items-start space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.goals.includes(goal)}
                          onChange={() => handleCheckboxChange(goal)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-600 mt-0.5"
                        />
                        <span className="text-gray-700 group-hover:text-gray-900">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bizi Nereden Duydunuz? *
                  </label>
                  <select
                    name="heardFrom"
                    value={formData.heardFrom}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="social">Sosyal Medya</option>
                    <option value="google">Google Arama</option>
                    <option value="friend">Arkadaş Tavsiyesi</option>
                    <option value="event">Etkinlik/Fuar</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eklemek İstediğiniz Notlar (Opsiyonel)
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Özel istekleriniz, sorularınız veya eklemek istedikleriniz..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Geri
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center space-x-2"
                >
                  <span>İleri</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="group px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Başvuruyu Gönder</span>
                </button>
              )}
            </div>
          </motion.div>
        </form>

        {/* Benefits Reminder */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">🎁 Beta Programı Avantajları</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">₺2,990</div>
              <div className="text-gray-600">Business Box Ücretsiz</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">3 Ay</div>
              <div className="text-gray-600">Tamamen Ücretsiz Hizmet</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">%50</div>
              <div className="text-gray-600">9 Ay Süre İndirim</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
