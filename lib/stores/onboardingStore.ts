import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightPulse?: boolean;
};

interface OnboardingState {
  // State
  isActive: boolean;
  currentStep: number;
  hasCompletedOnboarding: boolean;
  steps: OnboardingStep[];
  
  // Actions
  startOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const defaultSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: '👋 Hoş Geldiniz!',
    description: 'CityView\'e hoş geldiniz! Size uygulamayı tanıtalım.',
    target: 'body',
    position: 'center',
  },
  {
    id: 'location',
    title: '📍 Konumunuzu Paylaşın',
    description: 'Yakınınızdaki yerleri görmek için konumunuzu açın.',
    target: '[data-tour="location-button"]',
    position: 'bottom',
    highlightPulse: true,
  },
  {
    id: 'filters',
    title: '🎯 Filtreler',
    description: 'Kategorilere göre filtreleme yaparak istediğiniz yerleri bulun.',
    target: '[data-tour="filters"]',
    position: 'bottom',
  },
  {
    id: 'map',
    title: '🗺️ Harita',
    description: 'Yerleri harita üzerinde görüntüleyin ve detayları keşfedin.',
    target: '[data-tour="map"]',
    position: 'top',
  },
  {
    id: 'map-controls',
    title: '🎨 Harita Kontrolleri',
    description: 'Isı haritası, kümeleme ve rota çizimi gibi gelişmiş özellikler.',
    target: '[data-tour="map-controls"]',
    position: 'left',
    highlightPulse: true,
  },
  {
    id: 'gamification',
    title: '🎮 Rozet ve Puanlar',
    description: 'Yer bildirimleri yaparak rozet kazanın ve liderlik tablosunda yükselün!',
    target: '[data-tour="gamification"]',
    position: 'bottom',
  },
  {
    id: 'theme',
    title: '🌙 Tema',
    description: 'İstediğiniz temayı seçerek deneyiminizi kişiselleştirin.',
    target: '[data-tour="theme"]',
    position: 'bottom',
  },
  {
    id: 'complete',
    title: '🎉 Tamamlandı!',
    description: 'Artık uygulamayı kullanmaya hazırsınız. İyi keşifler!',
    target: 'body',
    position: 'center',
  },
];

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      // Initial state
      isActive: false,
      currentStep: 0,
      hasCompletedOnboarding: false,
      steps: defaultSteps,

      // Actions
      startOnboarding: () => {
        set({ isActive: true, currentStep: 0 });
      },

      nextStep: () => {
        const { currentStep, steps } = get();
        if (currentStep < steps.length - 1) {
          set({ currentStep: currentStep + 1 });
        } else {
          get().completeOnboarding();
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
        }
      },

      skipOnboarding: () => {
        set({ 
          isActive: false, 
          currentStep: 0,
          hasCompletedOnboarding: true 
        });
      },

      completeOnboarding: () => {
        set({ 
          isActive: false, 
          currentStep: 0,
          hasCompletedOnboarding: true 
        });
      },

      resetOnboarding: () => {
        set({ 
          isActive: false, 
          currentStep: 0,
          hasCompletedOnboarding: false 
        });
      },
    }),
    {
      name: 'cityview-onboarding',
    }
  )
);
