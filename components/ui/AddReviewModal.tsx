'use client';

import { useState } from 'react';
import { X, Smile, Frown, Meh, Heart, ThumbsUp, ThumbsDown, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: string;
  locationName: string;
}

const sentiments = [
  { id: 'positive', key: 'positive-happy', label: 'Mutlu', icon: '😊', color: 'bg-green-500' },
  { id: 'positive', key: 'positive-excited', label: 'Heyecanlı', icon: '🤩', color: 'bg-purple-500' },
  { id: 'neutral', key: 'neutral', label: 'Normal', icon: '😐', color: 'bg-gray-500' },
  { id: 'negative', key: 'negative-disappointed', label: 'Hayal Kırıklığı', icon: '😕', color: 'bg-orange-500' },
  { id: 'negative', key: 'negative-sad', label: 'Üzgün', icon: '😢', color: 'bg-blue-500' },
  { id: 'negative', key: 'negative-angry', label: 'Kızgın', icon: '😡', color: 'bg-red-500' }
];

// Database price_rating enum: 'very_cheap', 'cheap', 'fair', 'expensive', 'very_expensive'
const priceRatings = [
  { id: 'very_cheap', label: 'Çok Ucuz', icon: '$', color: 'text-green-600' },
  { id: 'cheap', label: 'Ucuz', icon: '$$', color: 'text-green-500' },
  { id: 'fair', label: 'Normal', icon: '$$$', color: 'text-yellow-500' },
  { id: 'expensive', label: 'Pahalı', icon: '$$$$', color: 'text-orange-500' },
  { id: 'very_expensive', label: 'Çok Pahalı', icon: '$$$$$', color: 'text-red-500' }
];

export default function AddReviewModal({ isOpen, onClose, locationId, locationName }: AddReviewModalProps) {
  const { user } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [priceRating, setPriceRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sentiment && !priceRating && !comment && rating === 0) {
      toast.error('Lütfen en az bir değerlendirme yapın');
      return;
    }

    setLoading(true);

    try {
      // Map sentiment key to database enum values (happy, sad, angry, neutral, excited, disappointed)
      // Database CHECK constraint: sentiment IN ('happy', 'sad', 'angry', 'neutral', 'excited', 'disappointed')
      let sentimentValue = null;
      if (sentiment) {
        if (sentiment === 'positive-happy') sentimentValue = 'happy';
        else if (sentiment === 'positive-excited') sentimentValue = 'excited';
        else if (sentiment === 'negative-sad') sentimentValue = 'sad';
        else if (sentiment === 'negative-angry') sentimentValue = 'angry';
        else if (sentiment === 'negative-disappointed') sentimentValue = 'disappointed';
        else if (sentiment === 'neutral') sentimentValue = 'neutral';
        
        console.log('🎭 Sentiment mapping:', { original: sentiment, mapped: sentimentValue });
      }

      const payload = {
        locationId,
        userId: user?.id,
        userEmail: user?.email,
        userName: user?.fullName || user?.name,
        rating: rating > 0 ? rating : null,
        comment: comment.trim() || null,
        sentiment: sentimentValue,
        priceRating
      };

      console.log('📤 Sending review:', payload);

      const response = await fetch('/api/locations/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('📥 Response status:', response.status, response.statusText);

      const data = await response.json();
      console.log('📥 Response data:', data);

      if (data.success) {
        toast.success('✅ Yorumunuz eklendi!');
        
        // Dispatch event for refresh
        window.dispatchEvent(new CustomEvent('cityv:review-added', {
          detail: { locationId }
        }));
        
        // Reset and close
        setRating(0);
        setComment('');
        setSentiment(null);
        setPriceRating(null);
        onClose();
      } else {
        toast.error(data.error || 'Yorum eklenemedi');
      }
    } catch (error) {
      console.error('Review submit error:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Deneyiminizi Paylaşın</h2>
                <p className="text-sm opacity-90 mt-1">{locationName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                ⭐ Genel Değerlendirme
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-4xl transition-transform hover:scale-110 ${
                      star <= rating ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* Sentiment Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                😊 Nasıl Hissettiniz?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {sentiments.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSentiment(s.key)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      sentiment === s.key
                        ? `${s.color} text-white border-transparent shadow-lg`
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <div className="text-sm font-medium">{s.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                💰 Fiyatlar Nasıldı?
              </label>
              <div className="grid grid-cols-5 gap-2">
                {priceRatings.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriceRating(p.id)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      priceRating === p.id
                        ? 'bg-indigo-600 text-white border-transparent shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className={`text-xl font-bold ${priceRating === p.id ? '' : p.color}`}>
                      {p.icon}
                    </div>
                    <div className="text-xs font-medium mt-1">{p.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                💬 Yorumunuz (Opsiyonel)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Deneyiminizi detaylı anlatın..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {comment.length}/500 karakter
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Gönderiliyor...' : '✅ Gönder'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
