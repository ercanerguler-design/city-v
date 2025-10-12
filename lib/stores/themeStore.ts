import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDarkMode: false,
      
      toggleTheme: () => {
        set((state) => {
          const newMode = !state.isDarkMode;
          
          // Update DOM immediately
          if (typeof window !== 'undefined') {
            if (newMode) {
              document.documentElement.classList.add('dark');
              localStorage.setItem('theme', 'dark');
            } else {
              document.documentElement.classList.remove('dark');
              localStorage.setItem('theme', 'light');
            }
          }
          
          return { isDarkMode: newMode };
        });
      },
      
      setTheme: (isDark: boolean) => {
        set({ isDarkMode: isDark });
        
        // Update DOM immediately
        if (typeof window !== 'undefined') {
          if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
          } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
          }
        }
      },
    }),
    {
      name: 'cityv-theme',
      
      // Hydrate from localStorage on mount
      onRehydrateStorage: () => (state) => {
        if (typeof window !== 'undefined') {
          // Check localStorage directly for reliability
          const savedTheme = localStorage.getItem('theme');
          const isDark = savedTheme === 'dark' || state?.isDarkMode;
          
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
    }
  )
);
