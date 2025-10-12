'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/lib/stores/themeStore';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full" />
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        relative w-14 h-7 rounded-full p-1 transition-colors duration-300
        ${isDarkMode 
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600' 
          : 'bg-gradient-to-r from-yellow-400 to-orange-400'
        }
        shadow-lg hover:shadow-xl
      `}
      whileTap={{ scale: 0.95 }}
      title={isDarkMode ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
    >
      {/* Sliding Circle */}
      <motion.div
        className="w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
        animate={{
          x: isDarkMode ? 28 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        {isDarkMode ? (
          <Moon className="w-3 h-3 text-indigo-600" />
        ) : (
          <Sun className="w-3 h-3 text-orange-500" />
        )}
      </motion.div>
    </motion.button>
  );
}
