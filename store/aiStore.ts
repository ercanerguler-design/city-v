import { create } from 'zustand';
import { useAuthStore } from './authStore';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  location?: string;
  imageUrl?: string;
}

interface AIFeatures {
  chatEnabled: boolean;
  imageAnalysisEnabled: boolean;
  sentimentAnalysisEnabled: boolean;
  recommendationsEnabled: boolean;
  crowdPredictionEnabled: boolean;
  voiceCommandsEnabled: boolean;
  translationEnabled: boolean;
}

interface AIState {
  // Chat features
  chatMessages: ChatMessage[];
  isTyping: boolean;
  
  // AI Features status
  features: AIFeatures;
  
  // Credits
  aiCreditsUsed: number;
  
  // Actions
  sendChatMessage: (content: string, location?: string) => Promise<void>;
  analyzeImage: (imageUrl: string, location?: string) => Promise<string>;
  analyzeSentiment: (text: string) => Promise<{ score: number; sentiment: 'positive' | 'negative' | 'neutral' }>;
  getPersonalizedRecommendations: (userLocation: [number, number]) => Promise<any[]>;
  predictCrowdLevel: (locationId: string, hours: number) => Promise<{ prediction: string; confidence: number }>;
  processVoiceCommand: (audioBlob: Blob) => Promise<string>;
  translateText: (text: string, targetLanguage: string) => Promise<string>;
  
  // Feature management
  enableFeature: (feature: keyof AIFeatures) => void;
  disableFeature: (feature: keyof AIFeatures) => void;
  checkPremiumAccess: () => boolean;
  consumeCredits: (amount: number) => boolean;
}

const useAIStore = create<AIState>((set, get) => ({
  chatMessages: [],
  isTyping: false,
  
  features: {
    chatEnabled: false,
    imageAnalysisEnabled: false,
    sentimentAnalysisEnabled: false,
    recommendationsEnabled: false,
    crowdPredictionEnabled: false,
    voiceCommandsEnabled: false,
    translationEnabled: false,
  },
  
  aiCreditsUsed: 0,

  sendChatMessage: async (content: string, location?: string) => {
    const { user } = useAuthStore.getState();
    if (!get().checkPremiumAccess() || !get().consumeCredits(1)) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: Date.now(),
      location
    };
    
    set(state => ({ 
      chatMessages: [...state.chatMessages, userMessage],
      isTyping: true 
    }));

    try {
      // Realistic typing delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      
      let responseContent = '';
      
      // Smart content analysis for realistic responses
      const lowerContent = content.toLowerCase();
      
      if (lowerContent.includes('kafe') || lowerContent.includes('coffee')) {
        responseContent = `☕ **Yakındaki En İyi Kafeler:**

🏆 **Çok Popüler:**
• Starbucks Kızılay - 2dk yürüyüş (⭐ 4.5/5)
• Kahve Dünyası Tunalı - 5dk yürüyüş (⭐ 4.3/5) 
• Gloria Jean's ANKAmall - 8dk yürüyüş (⭐ 4.4/5)

💡 **Önerim:** Starbucks şu anda orta yoğunlukta, 5-7dk bekleme süresi var. Kahve Dünyası daha sakin görünüyor.

🕐 **Çalışma Saatleri:** Çoğu 08:00-22:00 arası açık.`;
      
      } else if (lowerContent.includes('kalabalık') || lowerContent.includes('yoğun')) {
        if (lowerContent.includes('kızılay')) {
          responseContent = `👥 **Kızılay Kalabalık Durumu:**

📊 **Şu Anki Durum:** Yoğun (🔴 %78 dolu)
⏱️ **Bekleme Süreleri:**
• Restoranlar: 15-20dk
• Kafeler: 8-12dk  
• Banklar: 25-30dk
• Toplu taşıma: Çok yoğun

🚶‍♂️ **Alternatif Önerim:** Tunalı Hilmi daha sakin (🟡 %45 dolu)
📈 **Trend:** Akşam 18:00'a kadar artış bekleniyor.`;
        } else {
          responseContent = `📊 **Genel Kalabalık Analizi:**

🌆 **Ankara Geneli:**
• Kızılay: 🔴 Çok yoğun (%78)
• Çankaya: 🟡 Orta (%52) 
• Keçiören: 🟢 Sakin (%31)
• Mamak: 🟡 Orta (%48)

⏰ **En Sakin Saatler:** 09:00-11:00, 15:00-16:00
🚨 **En Yoğun Saatler:** 12:00-14:00, 17:00-19:00`;
        }
        
      } else if (lowerContent.includes('ankamall') || lowerContent.includes('nasıl giderim')) {
        responseContent = `🗺️ **ANKAmall'a En Hızlı Rotalar:**

🚌 **Toplu Taşıma (Önerilen):**
• Metro: Kızılay → Söğütözü (12dk)
• Otobüs: 442 numaralı hat (18dk)
💰 **Maliyet:** ₺15 (AnkaraKart)

🚗 **Arabayla:**
• Süre: 22-28dk (trafiğe göre)
• Park: Ücretsiz 3 saat
⛽ **Yakıt:** ~₺25-30

🚶‍♂️ **Yürüyerek:** 45dk (3.2km) - Spor yapmak istiyorsanız! 😊

📍 **Canlı Trafik:** Şu anda Eskişehir Yolu hafif yoğun.`;
        
      } else if (lowerContent.includes('tahmin') || lowerContent.includes('2 saat')) {
        responseContent = `🔮 **2 Saat Sonra Kalabalık Tahmini:**

📈 **AI Analizi (18:00 civarı):**
• Kızılay: 🔴 Çok yoğun (%85) ⬆️ %7 artış
• Tunalı: 🟡 Orta (%58) ⬆️ %13 artış  
• ANKAmall: 🟡 Orta (%65) ⬇️ %5 azalış
• Ulus: 🟢 Sakin (%35) ⬇️ %15 azalış

💡 **Akıllı Öneri:** 
AVM'ler akşam yemeği saatinde daha sakin olacak. Restoran bölgeleri ise yoğunlaşacak.

🎯 **Güvenilirlik:** %87 (Hava durumu ve etkinlik verileri dahil)`;
        
      } else if (lowerContent.includes('fotoğraf') || lowerContent.includes('analiz')) {
        responseContent = `📸 **Görüntü Analizi Hazır!**

🔍 **Ne Yapabilirim:**
• Mekan kalabalığını tespit etme
• Çalışma saatlerini kontrol etme  
• Menü/fiyat okuma
• QR kod tarama
• Erişilebilirlik değerlendirmesi

📱 **Nasıl Kullanılır:**
Kameraya basın → Fotoğraf çekin → Anında analiz!

💡 **Pro İpucu:** Gece görüntüleri için flaş kullanın, daha net sonuçlar alırsınız.`;
        
      } else if (lowerContent.includes('öner') || lowerContent.includes('mekan')) {
        responseContent = `🎯 **Size Özel Mekan Önerileri:**

☕ **Kahve & Çalışma:**
• Work'inCoffee Bilkent - Sessiz, Wi-Fi hızlı
• Petra Roasting - Premium kahve, laptop dostu

🍽️ **Yemek:**
• Nusr-Et Steakhouse - Özel günler için
• Hacı Dayı - Geleneksel, ekonomik

🎪 **Eğlence:**
• Arkeopark - Açık hava, aile dostu
• Next Level - Gece hayatı, 25+ yaş

📊 **Seçim Kriterleri:** 
Geçmiş tercihleriniz, mevcut konum, hava durumu ve bütçe analizi.

❤️ **Favorilerinize ekleyin!**`;
      
      } else {
        // Default intelligent response
        responseContent = `🤖 **Merhaba! Size nasıl yardımcı olabilirim?**

💡 **Popüler Sorular:**
• "En yakın kafe nerede?" 
• "Kızılay'da kalabalık nasıl?"
• "ANKAmall'a nasıl giderim?"
• "2 saat sonra tahmin"
• "Bu fotoğrafı analiz et"
• "Bana mekan öner"

📍 **Şu anki konumunuz:** ${location || 'Ankara Merkez'}
🎯 **Premium özellikleriniz aktif!**

Hangi konuda yardım istiyorsunuz?`;
      }
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        role: 'assistant',
        timestamp: Date.now() + 1000
      };
      
      set(state => ({ 
        chatMessages: [...state.chatMessages, aiResponse],
        isTyping: false 
      }));
    } catch (error) {
      set({ isTyping: false });
    }
  },

  analyzeImage: async (imageUrl: string, location?: string) => {
    if (!get().checkPremiumAccess() || !get().consumeCredits(2)) return 'Kredilerin tükendi';
    
    // Simulated image analysis - replace with actual vision API
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const analyses = [
      'Bu görüntüde orta yoğunlukta bir kalabalık görünüyor.',
      'Mekan temiz ve düzenli görünüyor, çok yoğun değil.',
      'Yoğun kalabalık tespit edildi, bekleme süreleri uzun olabilir.',
      'Sakin bir ortam, idealzaman ziyaret için.',
      'Moderate kalabalık seviyesi, kabul edilebilir bekleme süreleri.'
    ];
    
    return analyses[Math.floor(Math.random() * analyses.length)];
  },

  analyzeSentiment: async (text: string) => {
    if (!get().checkPremiumAccess() || !get().consumeCredits(1)) return { score: 0, sentiment: 'neutral' as const };
    
    // Simulated sentiment analysis - replace with actual sentiment API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const positiveWords = ['harika', 'mükemmel', 'süper', 'güzel', 'beğendim', 'tavsiye'];
    const negativeWords = ['kötü', 'berbat', 'rezalet', 'beğenmedim', 'kalabalık', 'pahalı'];
    
    const words = text.toLowerCase().split(' ');
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) score += 1;
      if (negativeWords.some(nw => word.includes(nw))) score -= 1;
    });
    
    const normalizedScore = Math.max(-1, Math.min(1, score / words.length * 10));
    
    return {
      score: normalizedScore,
      sentiment: normalizedScore > 0.1 ? 'positive' : normalizedScore < -0.1 ? 'negative' : 'neutral'
    };
  },

  getPersonalizedRecommendations: async (userLocation: [number, number]) => {
    if (!get().checkPremiumAccess() || !get().consumeCredits(2)) return [];
    
    // Simulated ML recommendations - replace with actual ML model
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return [
      { 
        name: 'Kızılay Starbucks',
        reason: 'Sevdiğiniz kahve çeşitleri burada mevcut',
        confidence: 0.92,
        distance: '0.5 km'
      },
      {
        name: 'ANKAmall AVM',
        reason: 'Alışveriş geçmişinize uygun mağazalar',
        confidence: 0.87,
        distance: '2.1 km'
      }
    ];
  },

  predictCrowdLevel: async (locationId: string, hours: number) => {
    if (!get().checkPremiumAccess() || !get().consumeCredits(2)) return { prediction: 'Veri yok', confidence: 0 };
    
    // Simulated crowd prediction - replace with actual ML model
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const predictions = ['Düşük', 'Orta', 'Yüksek'];
    const prediction = predictions[Math.floor(Math.random() * predictions.length)];
    const confidence = 0.65 + Math.random() * 0.3; // 65-95% confidence
    
    return {
      prediction: `${hours} saat sonra ${prediction.toLowerCase()} yoğunluk bekleniyor`,
      confidence
    };
  },

  processVoiceCommand: async (audioBlob: Blob) => {
    if (!get().checkPremiumAccess() || !get().consumeCredits(1)) return 'Krediler tükendi';
    
    // Simulated voice processing - replace with actual speech-to-text
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const commands = [
      'en yakın kafe bul',
      'kalabalık durumu göster',
      'navigasyonu başlat',
      'favorileri aç',
      'haritayı büyüt'
    ];
    
    return commands[Math.floor(Math.random() * commands.length)];
  },

  translateText: async (text: string, targetLanguage: string) => {
    if (!get().checkPremiumAccess() || !get().consumeCredits(1)) return 'Translation unavailable';
    
    // Simulated translation - replace with actual translation API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const translations: Record<string, string> = {
      'en': 'This location has moderate crowd density.',
      'ar': 'هذا الموقع يحتوي على كثافة سكانية معتدلة.',
      'ru': 'В этом месте умеренная плотность толпы.',
      'zh': '这个地方有适度的人群密度。'
    };
    
    return translations[targetLanguage] || 'Translation not available for this language';
  },

  enableFeature: (feature: keyof AIFeatures) => {
    if (!get().checkPremiumAccess()) return;
    
    set(state => ({
      features: {
        ...state.features,
        [feature]: true
      }
    }));
  },

  disableFeature: (feature: keyof AIFeatures) => {
    set(state => ({
      features: {
        ...state.features,
        [feature]: false
      }
    }));
  },

  checkPremiumAccess: () => {
    const { user, isAuthenticated } = useAuthStore.getState();
    const isPremium = user?.membershipTier && user.membershipTier !== 'free';
    return isAuthenticated && isPremium;
  },

  consumeCredits: (amount: number) => {
    const { user } = useAuthStore.getState();
    if (!user?.aiCredits || user.aiCredits < amount) return false;
    
    // Update user credits in auth store
    useAuthStore.getState().updateProfile({ 
      aiCredits: (user.aiCredits || 0) - amount 
    });
    
    set(state => ({ 
      aiCreditsUsed: state.aiCreditsUsed + amount 
    }));
    
    return true;
  }
}));

export default useAIStore;