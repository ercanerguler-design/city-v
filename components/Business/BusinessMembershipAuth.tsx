'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BuildingOfficeIcon, 
  ShieldCheckIcon, 
  ChartBarIcon, 
  CameraIcon,
  BoltIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useBusinessStore } from '@/store/businessStore';

export default function BusinessMembershipAuth() {
  const { login, setLanguage } = useBusinessStore();
  const [currentStep, setCurrentStep] = useState<'intro' | 'register' | 'login'>('intro');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguageState] = useState<'tr' | 'en'>('tr');

  const handleLanguageChange = (lang: 'tr' | 'en') => {
    setLanguageState(lang);
    setLanguage(lang);
  };

  const texts = {
    tr: {
      title: 'CityV İş Platformu',
      subtitle: 'Profesyonel IoT İzleme',
      description: 'İşletmenizi AI destekli kalabalık izleme, gerçek zamanlı analitik ve profesyonel IoT çözümleriyle dönüştürün.',
      getStarted: 'Hemen Başla',
      signIn: 'Giriş Yap',
      companyInfo: 'Firma Bilgileri',
      companyName: 'Şirket Adı',
      taxNumber: 'Vergi Numarası',
      taxOffice: 'Vergi Dairesi',
      contactPerson: 'İletişim Kişisi',
      position: 'Pozisyon/Unvan',
      phone: 'Telefon',
      email: 'E-posta',
      password: 'Şifre',
      confirmPassword: 'Şifre Tekrar',
      address: 'Adres',
      website: 'Web Sitesi',
      selectPlan: 'Plan Seçin',
      register: 'Kayıt Ol',
      login: 'Giriş Yap',
      back: 'Geri',
      features: {
        analytics: 'Gelişmiş Analitik',
        monitoring: 'Canlı İzleme',
        automation: 'Otomasyon',
        support: '7/24 Destek'
      },
      plans: {
        professional: {
          name: 'Professional',
          features: [
            'Gelişmiş analitik',
            '10 kampanya/ay',
            'E-posta desteği',
            'Temel AI özellikleri'
          ]
        },
        enterprise: {
          name: 'Enterprise',
          features: [
            'Sınırsız analitik',
            'Sınırsız kampanyalar',
            'Öncelikli destek',
            'Gelişmiş AI özellikleri',
            'CityV platform erişimi'
          ]
        },
        custom: {
          name: 'Özel',
          features: [
            'Özel çözümler',
            'Adanmış destek',
            'Yerinde kurulum',
            'Özel AI modelleri'
          ]
        }
      }
    },
    en: {
      title: 'CityV Business Platform',
      subtitle: 'Professional IoT Monitoring',
      description: 'Transform your business with AI-powered crowd monitoring, real-time analytics, and professional IoT solutions.',
      getStarted: 'Get Started',
      signIn: 'Sign In',
      companyInfo: 'Company Information',
      companyName: 'Company Name',
      taxNumber: 'Tax Number',
      taxOffice: 'Tax Office',
      contactPerson: 'Contact Person',
      position: 'Position/Title',
      phone: 'Phone',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      address: 'Address',
      website: 'Website',
      selectPlan: 'Select Plan',
      register: 'Register',
      login: 'Login',
      back: 'Back',
      features: {
        analytics: 'Advanced Analytics',
        monitoring: 'Live Monitoring',
        automation: 'Automation',
        support: '24/7 Support'
      },
      plans: {
        professional: {
          name: 'Professional',
          features: [
            'Advanced analytics',
            '10 campaigns/month',
            'Email support',
            'Basic AI features'
          ]
        },
        enterprise: {
          name: 'Enterprise',
          features: [
            'Unlimited analytics',
            'Unlimited campaigns',
            'Priority support',
            'Advanced AI features',
            'CityV platform access'
          ]
        },
        custom: {
          name: 'Custom',
          features: [
            'Custom solutions',
            'Dedicated support',
            'On-premise deployment',
            'Custom AI models'
          ]
        }
      }
    }
  };

  const t = texts[language];

  const features = [
    { icon: ChartBarIcon, title: t.features.analytics },
    { icon: CameraIcon, title: t.features.monitoring },
    { icon: BoltIcon, title: t.features.automation },
    { icon: ShieldCheckIcon, title: t.features.support }
  ];

  const plans = [
    {
      name: t.plans.professional.name,
      price: '₺999',
      period: '/ay',
      features: t.plans.professional.features,
      popular: false
    },
    {
      name: t.plans.enterprise.name,
      price: '₺2.999',
      period: '/ay',
      features: t.plans.enterprise.features,
      popular: true
    },
    {
      name: t.plans.custom.name,
      price: 'İletişim',
      period: '',
      features: t.plans.custom.features,
      popular: false
    }
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const businessData = {
      companyName: formData.get('companyName') as string,
      taxNumber: formData.get('taxNumber') as string,
      taxOffice: formData.get('taxOffice') as string,
      contactPerson: formData.get('contactPerson') as string,
      position: formData.get('position') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      website: formData.get('website') as string,
    };
    
    try {
      // Simulate registration API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Login with the company data
      await login(businessData.email, 'demo123', businessData);
      
      console.log('✅ Company registered successfully:', businessData);
    } catch (error) {
      console.error('❌ Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    await login(formData.get('email') as string, formData.get('password') as string);
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <div className="flex bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-1">
          <button
            onClick={() => handleLanguageChange('tr')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              language === 'tr' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            TR
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              language === 'en' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Intro Screen */}
      {currentStep === 'intro' && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-2 bg-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-6 py-3">
                  <BuildingOfficeIcon className="w-6 h-6 text-blue-400" />
                  <span className="text-blue-400 font-semibold">{t.title}</span>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
                {t.subtitle}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400"> Sistemi</span>
              </h1>
              
              <p className="mx-auto max-w-2xl text-lg leading-8 text-gray-300 mb-12">
                {t.description}
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-black/20 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 hover:bg-black/30 transition-all duration-200"
                  >
                    <feature.icon className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-white font-semibold">{feature.title}</h3>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <button
                  onClick={() => setCurrentStep('register')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  {t.getStarted}
                </button>
                <button
                  onClick={() => setCurrentStep('login')}
                  className="bg-black/20 backdrop-blur-sm border border-gray-700/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-black/30 transition-all duration-200"
                >
                  {t.signIn}
                </button>
              </div>

              {/* Pricing Plans */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{t.selectPlan}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  {plans.map((plan, index) => (
                    <div
                      key={index}
                      className={`relative bg-black/20 backdrop-blur-sm border rounded-xl p-6 hover:bg-black/30 transition-all duration-200 ${
                        plan.popular 
                          ? 'border-blue-500/50 ring-2 ring-blue-500/20' 
                          : 'border-gray-700/30'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            En Popüler
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-white">{plan.name}</h4>
                          <div className="flex items-baseline">
                            <span className="text-2xl font-bold text-white">{plan.price}</span>
                            <span className="text-gray-400 ml-1">{plan.period}</span>
                          </div>
                        </div>
                      </div>
                      
                      <ul className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center text-gray-300">
                            <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Form */}
      {currentStep === 'register' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-black/20 backdrop-blur-sm border border-gray-700/30 rounded-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">{t.companyInfo}</h2>
              <p className="text-gray-300">Firma bilgilerinizi girerek CityV Business'a katılın</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">{t.companyName} *</label>
                  <input
                    name="companyName"
                    required
                    className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                    placeholder="Modern İşletme Ltd. Şti."
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">{t.taxNumber}</label>
                  <input
                    name="taxNumber"
                    className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                    placeholder="1234567890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">{t.taxOffice}</label>
                  <input
                    name="taxOffice"
                    className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                    placeholder="Çankaya Vergi Dairesi"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">{t.contactPerson} *</label>
                  <input
                    name="contactPerson"
                    required
                    className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                    placeholder="Ahmet Yılmaz"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">{t.position}</label>
                  <input
                    name="position"
                    className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                    placeholder="Genel Müdür"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">{t.phone} *</label>
                  <input
                    name="phone"
                    required
                    type="tel"
                    className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                    placeholder="+90 312 123 45 67"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">{t.email} *</label>
                  <input
                    name="email"
                    required
                    type="email"
                    className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                    placeholder="info@moderniletme.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">{t.website}</label>
                  <input
                    name="website"
                    type="url"
                    className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                    placeholder="https://moderniletme.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">{t.address} *</label>
                <textarea
                  name="address"
                  required
                  rows={3}
                  className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                  placeholder="Çankaya Mah. Atatürk Blv. No:123 Çankaya/Ankara"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep('intro')}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  {t.back}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Kaydediliyor...' : t.register}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Form */}
      {currentStep === 'login' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-black/20 backdrop-blur-sm border border-gray-700/30 rounded-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">{t.login}</h2>
              <p className="text-gray-300">Hesabınıza giriş yapın</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm mb-2">{t.email}</label>
                <input
                  name="email"
                  required
                  type="email"
                  className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                  placeholder="info@moderniletme.com"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">{t.password}</label>
                <input
                  name="password"
                  required
                  type="password"
                  className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep('intro')}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  {t.back}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Giriş yapılıyor...' : t.login}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}