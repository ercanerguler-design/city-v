'use client';

import { useState, useRef, useEffect } from 'react';
import useAIStore from '@/store/aiStore';
import { useAuthStore } from '@/store/authStore';
import { MessageCircle, Send, Brain, Crown, Mic, MicOff, Image, Camera, Globe, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatBot({ isOpen, onClose }: AIChatBotProps) {
  const { 
    chatMessages, 
    isTyping, 
    sendChatMessage, 
    analyzeImage, 
    analyzeSentiment,
    getPersonalizedRecommendations,
    predictCrowdLevel,
    processVoiceCommand,
    translateText,
    checkPremiumAccess 
  } = useAIStore();
  
  const { user, isAuthenticated } = useAuthStore();
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeFeature, setActiveFeature] = useState<'chat' | 'image' | 'voice' | 'predict' | 'recommend'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage;
    if (!messageToSend.trim() || !checkPremiumAccess()) return;
    
    await sendChatMessage(messageToSend);
    setInputMessage('');
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    const analysis = await analyzeImage(imageUrl);
    
    // Add analysis as a chat message
    await sendChatMessage(`Görüntü analizi: ${analysis}`);
  };

  const handleVoiceCommand = async () => {
    if (!navigator.mediaDevices) return;

    if (!isListening) {
      setIsListening(true);
      // Simulated voice recording
      setTimeout(async () => {
        setIsListening(false);
        const command = await processVoiceCommand(new Blob());
        await sendChatMessage(`Ses komutu: "${command}"`);
      }, 3000);
    } else {
      setIsListening(false);
    }
  };

  const handlePredictCrowd = async () => {
    const prediction = await predictCrowdLevel('sample-location', 2);
    await sendChatMessage(`Kalabalık tahmini: ${prediction.prediction} (Güven: ${Math.round(prediction.confidence * 100)}%)`);
  };

  const handleGetRecommendations = async () => {
    const recommendations = await getPersonalizedRecommendations([39.9334, 32.8597]);
    const message = recommendations.map(r => 
      `${r.name}: ${r.reason} (${r.distance})`
    ).join('\n');
    await sendChatMessage(`Kişiselleştirilmiş öneriler:\n${message}`);
  };

  if (!isOpen) return null;

  if (!isAuthenticated || !user?.premium) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">AI Özellikler Premium!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            AI asistanı ve gelişmiş özellikler premium üyelerimize özeldir. Premium'a yükseltin ve AI'nın gücünü keşfedin!
          </p>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-xl"
            >
              Kapat
            </button>
            <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold">
              Premium'a Yükselt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {/* 📱 Mobile: Full Screen | 🖥️ Desktop: Bottom Right */}
      <div className="fixed inset-0 bg-black/50 flex md:items-end md:justify-end md:p-4 z-50">
        <motion.div
          initial={{ 
            opacity: 0, 
            x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 400, 
            y: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 100 
          }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ 
            opacity: 0, 
            x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 400, 
            y: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 100 
          }}
          className="bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-2xl shadow-2xl 
                     w-full h-full md:w-96 md:h-[600px] 
                     flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 md:p-4 safe-area-top">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6" />
                <div>
                  <h3 className="font-bold text-lg md:text-base">AI Asistan</h3>
                  <p className="text-xs opacity-90">Krediler: {user?.aiCredits || 0}</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="text-white/70 hover:text-white p-2 md:p-1 -m-2 md:-m-1 touch-manipulation"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Feature Tabs */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {[
                { id: 'chat', icon: MessageCircle, label: 'Sohbet' },
                { id: 'image', icon: Camera, label: 'Görüntü' },
                { id: 'voice', icon: Mic, label: 'Ses' },
                { id: 'predict', icon: TrendingUp, label: 'Tahmin' },
                { id: 'recommend', icon: Brain, label: 'Öneri' }
              ].map(feature => (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id as any)}
                  className={`flex items-center gap-1 px-3 py-2 md:py-1.5 rounded-lg text-xs font-medium transition-all touch-manipulation ${
                    activeFeature === feature.id 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  <feature.icon className="w-3 h-3" />
                  {feature.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="mb-4">AI asistanınız hazır! Soru sormaya başlayın.</p>
                
                {/* Hazır Sorular */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">💡 Hazır Sorular:</p>
                  <div className="grid gap-2">
                    {[
                      { q: "En yakın kafe nerede?", icon: "☕" },
                      { q: "Kızılay'da kalabalık durumu nasıl?", icon: "👥" },
                      { q: "Bu fotoğrafı analiz et", icon: "📸" },
                      { q: "ANKAmall'a nasıl giderim?", icon: "🗺️" },
                      { q: "2 saat sonra kalabalık tahmini", icon: "🔮" },
                      { q: "Bana mekan öner", icon: "🎯" }
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(item.q)}
                        className="flex items-center gap-2 w-full p-2 text-left text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <span>{item.icon}</span>
                        <span>{item.q}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {chatMessages.map(message => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}>
                  {message.content}
                  {message.location && (
                    <div className="text-xs opacity-70 mt-1">📍 {message.location}</div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Action Buttons for Features */}
          {activeFeature !== 'chat' && (
            <div className="p-3 md:p-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                {activeFeature === 'image' && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 md:py-2 bg-blue-500 text-white rounded-xl text-sm font-medium touch-manipulation"
                    >
                      <Image className="w-4 h-4" />
                      Görüntü Yükle
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </>
                )}
                
                {activeFeature === 'voice' && (
                  <button
                    onClick={handleVoiceCommand}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 md:py-2 rounded-xl text-sm font-medium transition-all touch-manipulation ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    {isListening ? 'Dinliyor...' : 'Ses Komutu'}
                  </button>
                )}
                
                {activeFeature === 'predict' && (
                  <button
                    onClick={handlePredictCrowd}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 md:py-2 bg-orange-500 text-white rounded-xl text-sm font-medium touch-manipulation"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Kalabalık Tahmin Et
                  </button>
                )}
                
                {activeFeature === 'recommend' && (
                  <button
                    onClick={handleGetRecommendations}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 md:py-2 bg-purple-500 text-white rounded-xl text-sm font-medium touch-manipulation"
                  >
                    <Brain className="w-4 h-4" />
                    Öneri Al
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 safe-area-bottom">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="AI'ya sorunuzu yazın..."
                className="flex-1 px-4 py-3 md:py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base md:text-sm"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                className="px-4 py-3 md:py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                <Send className="w-5 h-5 md:w-4 md:h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Her mesaj 1-2 AI kredisi harcar
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}