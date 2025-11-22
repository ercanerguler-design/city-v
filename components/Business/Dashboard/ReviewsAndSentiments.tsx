'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, ThumbsUp, Heart, Star, TrendingUp, Users, Smile, Meh, Frown } from 'lucide-react';
import { motion } from 'framer-motion';
import BusinessSentimentWidget from '@/components/Business/SentimentWidget';

interface Review {
  id: number;
  location_id: string;
  user_name: string;
  user_email: string;
  rating: number | null;
  comment: string | null;
  sentiment: string | null;
  price_rating: string | null;
  created_at: string;
}

interface ReviewsStatsProps {
  businessUserId: number;
}

const sentimentEmojis: { [key: string]: string } = {
  positive: '😊',
  neutral: '😐',
  negative: '😢'
};

const sentimentLabels: { [key: string]: string } = {
  positive: 'Olumlu',
  neutral: 'Normal',
  negative: 'Olumsuz'
};

export default function ReviewsAndSentiments({ businessUserId }: ReviewsStatsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'positive' | 'negative'>('all');

  const loadReviews = async () => {
    try {
      const response = await fetch(`/api/locations/reviews?businessUserId=${businessUserId}&limit=100`);
      const data = await response.json();

      if (data.success) {
        setReviews(data.reviews);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('❌ Reviews yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessUserId) {
      loadReviews();
      
      // Refresh every 30 seconds
      const interval = setInterval(loadReviews, 30000);
      return () => clearInterval(interval);
    }
  }, [businessUserId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const positiveReviews = reviews.filter(r => 
    r.sentiment && r.sentiment === 'positive'
  );
  const negativeReviews = reviews.filter(r => 
    r.sentiment && r.sentiment === 'negative'
  );

  const displayReviews = activeTab === 'all' ? reviews :
                         activeTab === 'positive' ? positiveReviews :
                         negativeReviews;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 shadow-lg border border-purple-200 dark:border-purple-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Duygular
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Müşteri geri bildirimleri
            </p>
          </div>
        </div>
        
        {stats && (
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-700">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.avgRating}
            </span>
            <span className="text-sm text-gray-500">/ 5.0</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-purple-200 dark:border-purple-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Toplam</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.total || 0}
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-200 dark:border-green-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <Smile className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Olumlu</span>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {positiveReviews.length}
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-red-200 dark:border-red-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <Frown className="w-4 h-4 text-red-600" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Olumsuz</span>
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {negativeReviews.length}
          </div>
        </motion.div>
      </div>

      {/* City-V Map Sentiment Widget - Gerçek Zamanlı Duygu Bildirimleri */}
      <div className="mb-6">
        <BusinessSentimentWidget businessUserId={businessUserId} />
      </div>

      {/* Sentiment Distribution */}
      {stats?.sentimentCounts && Object.keys(stats.sentimentCounts).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-purple-200 dark:border-purple-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Duygu Dağılımı
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.sentimentCounts).map(([sentiment, count]: [string, any]) => (
              <div 
                key={sentiment}
                className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-lg"
              >
                <span className="text-xl">{sentimentEmojis[sentiment]}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {sentimentLabels[sentiment]}
                </span>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
          }`}
        >
          Tümü ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab('positive')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'positive'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20'
          }`}
        >
          Olumlu ({positiveReviews.length})
        </button>
        <button
          onClick={() => setActiveTab('negative')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'negative'
              ? 'bg-red-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20'
          }`}
        >
          Olumsuz ({negativeReviews.length})
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {displayReviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Henüz yorum yok</p>
          </div>
        ) : (
          displayReviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {review.user_name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {review.user_name || 'Anonim'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {review.sentiment && (
                    <span className="text-2xl">
                      {sentimentEmojis[review.sentiment]}
                    </span>
                  )}
                  {review.rating && (
                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">
                        {review.rating}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {review.comment && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  {review.comment}
                </p>
              )}
              
              {review.price_rating && (
                <div className="mt-2 inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded text-xs">
                  <span className="text-blue-600 dark:text-blue-400">
                    Fiyat: {typeof review.price_rating === 'string' ? review.price_rating.replace('_', ' ') : review.price_rating}
                  </span>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
