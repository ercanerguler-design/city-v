'use client';

import { useState } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { categories, getCategoryById } from '@/lib/categories';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterPanel({ isOpen, onClose }: FilterPanelProps) {
  const {
    selectedCategories,
    crowdLevelFilter,
    searchQuery,
    setSelectedCategories,
    setCrowdLevelFilter,
    setSearchQuery,
    clearFilters,
  } = useFilterStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);

  const toggleCategory = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(newCategories);
  };

  const crowdLevels = [
    { value: 'empty', label: 'Boş', color: 'bg-green-500' },
    { value: 'low', label: 'Az', color: 'bg-lime-500' },
    { value: 'moderate', label: 'Orta', color: 'bg-yellow-500' },
    { value: 'high', label: 'Kalabalık', color: 'bg-orange-500' },
    { value: 'very_high', label: 'Çok Kalabalık', color: 'bg-red-500' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center md:justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Filtrele</h2>
                    <p className="text-sm text-white/80">
                      {selectedCategories.length > 0
                        ? `${selectedCategories.length} kategori seçili`
                        : 'Kategorileri seçin'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Search className="w-4 h-4 inline mr-2" />
                  Mekan Ara
                </label>
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => {
                    setLocalSearch(e.target.value);
                    setSearchQuery(e.target.value);
                  }}
                  placeholder="Kafe, banka, hastane..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-colors"
                />
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Kategoriler
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((category) => {
                    const isSelected = selectedCategories.includes(category.id);
                    return (
                      <motion.button
                        key={category.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleCategory(category.id)}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all text-left',
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{category.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                'font-semibold text-sm truncate',
                                isSelected ? 'text-indigo-700' : 'text-gray-700'
                              )}
                            >
                              {category.name}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="mt-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center"
                          >
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Crowd Level Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Yoğunluk Durumu
                </label>
                <div className="flex flex-wrap gap-2">
                  {crowdLevels.map((level) => {
                    const isSelected = crowdLevelFilter.includes(level.value as any);
                    return (
                      <motion.button
                        key={level.value}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const newLevels = isSelected
                            ? crowdLevelFilter.filter((l) => l !== level.value)
                            : [...crowdLevelFilter, level.value as any];
                          setCrowdLevelFilter(newLevels);
                        }}
                        className={cn(
                          'px-4 py-2 rounded-full font-semibold text-sm transition-all',
                          isSelected
                            ? `${level.color} text-white shadow-lg`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        {level.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={() => {
                  clearFilters();
                  setLocalSearch('');
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Temizle
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Uygula ({selectedCategories.length})
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
