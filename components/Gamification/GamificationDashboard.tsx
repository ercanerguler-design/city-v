'use client';

import { motion } from 'framer-motion';
import { X, Trophy, Star, Target, Award, Zap, TrendingUp, Flame, Lock } from 'lucide-react';
import { useGamificationStore } from '@/lib/stores/gamificationStore';
import { useAuthStore } from '@/store/authStore';
import PremiumGuard from '@/components/Premium/PremiumGuard';

interface GamificationDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GamificationDashboard({ isOpen, onClose }: GamificationDashboardProps) {
  const { stats, badges, achievements, getProgress } = useGamificationStore();
  const { user } = useAuthStore();

  if (!isOpen) return null;

  const levelProgress = getProgress();
  const unlockedBadges = badges.filter(b => b.unlockedAt);
  const completedAchievements = achievements.filter(a => a.completed);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-500';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400';
      default: return 'border-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            🎮 Oyuncu Profili
          </h2>
          <p className="text-white/90">{user?.name || 'Misafir'}</p>
        </div>

        {/* Content with Premium Guard */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <PremiumGuard 
            featureName="Oyuncu Profili" 
            onUpgradeClick={onClose}
          >
          {/* Level Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm mb-1">Seviye</p>
                <p className="text-5xl font-bold">{stats.level}</p>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm mb-1">Toplam Puan</p>
                <p className="text-3xl font-bold flex items-center gap-2">
                  <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                  {stats.totalPoints}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Seviye {stats.level}</span>
                <span>Seviye {stats.level + 1}</span>
              </div>
              <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 flex items-center justify-center"
                >
                  <span className="text-xs font-bold text-purple-900">
                    {Math.round(levelProgress)}%
                  </span>
                </motion.div>
              </div>
              <p className="text-white/80 text-xs mt-1 text-center">
                {stats.currentLevelPoints} / {stats.nextLevelPoints} XP
              </p>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white text-center"
            >
              <Target className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalCheckIns}</p>
              <p className="text-sm text-blue-100">Ziyaret</p>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white text-center"
            >
              <Zap className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalReports}</p>
              <p className="text-sm text-green-100">Rapor</p>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white text-center"
            >
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalRoutes}</p>
              <p className="text-sm text-orange-100">Rota</p>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white text-center"
            >
              <Flame className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.streak}</p>
              <p className="text-sm text-red-100">Gün Serisi</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Badges */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Rozetler ({unlockedBadges.length}/{badges.length})
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                {badges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className={`relative group ${
                      badge.unlockedAt ? 'cursor-pointer' : 'opacity-50'
                    }`}
                  >
                    <div
                      className={`
                        w-full aspect-square rounded-xl p-4 flex flex-col items-center justify-center
                        ${badge.unlockedAt
                          ? `bg-gradient-to-br ${getRarityColor(badge.rarity)} border-2 ${getRarityBorder(badge.rarity)}`
                          : 'bg-gray-300 dark:bg-slate-600 border-2 border-gray-400 dark:border-slate-500'
                        }
                        transition-transform hover:scale-110
                      `}
                    >
                      {badge.unlockedAt ? (
                        <span className="text-4xl">{badge.icon}</span>
                      ) : (
                        <Lock className="w-8 h-8 text-gray-500" />
                      )}
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-gray-900 text-white text-xs rounded-lg p-2 whitespace-nowrap shadow-xl">
                        <p className="font-bold">{badge.name}</p>
                        <p className="text-gray-300">{badge.description}</p>
                        {badge.unlockedAt && (
                          <p className="text-yellow-400 text-[10px] mt-1">
                            🎉 Kazanıldı!
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-500" />
                Başarımlar ({completedAchievements.length}/{achievements.length})
              </h3>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                    className={`
                      bg-white dark:bg-slate-600 rounded-lg p-4 
                      ${achievement.completed ? 'border-2 border-green-500' : 'border border-gray-300 dark:border-slate-500'}
                      transition-all hover:shadow-md
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        text-3xl p-2 rounded-lg
                        ${achievement.completed 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : 'bg-gray-100 dark:bg-slate-700'
                        }
                      `}>
                        {achievement.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-gray-800 dark:text-white">
                            {achievement.title}
                          </h4>
                          <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                            <Star className="w-4 h-4 fill-current" />
                            {achievement.points}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {achievement.description}
                        </p>
                        
                        {/* Progress Bar */}
                        {!achievement.completed && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                              <span>İlerleme</span>
                              <span>{achievement.progress}/{achievement.total}</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {achievement.completed && (
                          <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">
                            ✅ Tamamlandı!
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Fun Facts */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-6 text-white"
          >
            <h3 className="text-xl font-bold mb-4">📊 İlginç İstatistikler</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">{stats.favoritesCount}</p>
                <p className="text-sm text-cyan-100">Favori Mekan</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.longestStreak}</p>
                <p className="text-sm text-cyan-100">En Uzun Seri</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{unlockedBadges.length}</p>
                <p className="text-sm text-cyan-100">Rozet Kazandı</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{Math.round((stats.totalCheckIns / Math.max(1, stats.level)) * 10) / 10}</p>
                <p className="text-sm text-cyan-100">Seviye Başına</p>
              </div>
            </div>
          </motion.div>
          </PremiumGuard>
        </div>
      </motion.div>
    </div>
  );
}
