'use client';

import { motion } from 'framer-motion';
import { Heart, Trash2, MapPin } from 'lucide-react';
import { useFavoritesStore } from '@/lib/stores/favoritesStore';

export default function FavoritesPage() {
  const { favorites, clearFavorites } = useFavoritesStore();

  const handleClearAll = () => {
    if (confirm('Tüm favorilerinizi silmek istediğinizden emin misiniz?')) {
      clearFavorites();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-full">
                <Heart className="w-6 h-6 text-red-500 fill-current" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Favorilerim</h1>
                <p className="text-sm text-gray-500">
                  {favorites.length} favori mekan
                </p>
              </div>
            </div>

            {favorites.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Tümünü Temizle</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Henüz favori mekanınız yok
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Beğendiğiniz mekanları favorilerinize ekleyerek hızlıca erişebilirsiniz
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <MapPin className="w-5 h-5" />
              Mekanları Keşfet
            </a>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteLocations.map((location, index) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <LocationCard
                  location={location}
                  onReportClick={() => {}}
                  onLocationClick={() => {}}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* İstatistikler */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">İstatistikler</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {favorites.length}
                </div>
                <div className="text-sm text-gray-600">Toplam Favori</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {new Set(favoriteLocations.map(l => l.category)).size}
                </div>
                <div className="text-sm text-gray-600">Farklı Kategori</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {favoriteLocations.filter(l => l.rating && l.rating >= 4).length}
                </div>
                <div className="text-sm text-gray-600">4+ Yıldız</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {favoriteLocations.filter(l => l.currentCrowdLevel === 'empty' || l.currentCrowdLevel === 'low').length}
                </div>
                <div className="text-sm text-gray-600">Az Kalabalık</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
