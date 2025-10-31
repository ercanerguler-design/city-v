'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
      <Globe className="w-4 h-4 text-gray-400" />
      <button
        onClick={() => setLanguage('tr')}
        className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
          language === 'tr'
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        TR
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
          language === 'en'
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );
}
