'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ThumbsUp, Camera, Trash2, User, Calendar, MessageCircle } from 'lucide-react';
import { useSocialStore } from '@/lib/stores/socialStore';
import { useAuthStore } from '@/store/authStore';

interface SocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: string;
  locationName: string;
}

export default function SocialModal({ isOpen, onClose, locationId, locationName }: SocialModalProps) {
  const { user, isAuthenticated } = useAuthStore();
  const {
    addComment,
    deleteComment,
    likeComment,
    getLocationComments,
    addPhoto,
    deletePhoto,
    likePhoto,
    getLocationPhotos,
    getLocationRating,
  } = useSocialStore();

  const [activeTab, setActiveTab] = useState<'comments' | 'photos'>('comments');
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);

  const comments = getLocationComments(locationId);
  const photos = getLocationPhotos(locationId);
  const locationRating = getLocationRating(locationId);

  const handleSubmitComment = () => {
    if (!isAuthenticated) {
      alert('Yorum yapmak için giriş yapmalısınız');
      return;
    }

    if (!newComment.trim()) {
      alert('Lütfen yorum yazınız');
      return;
    }

    addComment(locationId, newComment, rating);
    setNewComment('');
    setRating(5);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simüle edilmiş fotoğraf URL'si (gerçek uygulamada bir storage'a yüklenecek)
    const fakeUrl = URL.createObjectURL(file);
    addPhoto(locationId, fakeUrl);
  };

  const formatDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    return new Date(timestamp).toLocaleDateString('tr-TR');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <MessageCircle className="w-6 h-6" />
                  {locationName}
                </h2>
                {locationRating && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(locationRating.averageRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-white/30'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-white/80">
                      {locationRating.averageRating.toFixed(1)} ({locationRating.totalRatings} değerlendirme)
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setActiveTab('comments')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === 'comments'
                    ? 'bg-white text-indigo-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                💬 Yorumlar ({comments.length})
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === 'photos'
                    ? 'bg-white text-indigo-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                📸 Fotoğraflar ({photos.length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'comments' ? (
              <div className="space-y-6">
                {/* Add Comment Form */}
                {isAuthenticated ? (
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                          {user?.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Yorum yaz</p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Değerlendirme:
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(0)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= (hoveredStar || rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Deneyiminizi paylaşın..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-600 text-gray-900 dark:text-white resize-none"
                      rows={3}
                    />

                    <button
                      onClick={handleSubmitComment}
                      className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
                    >
                      Yorum Gönder
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-300">
                      Yorum yapmak için giriş yapmalısınız
                    </p>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">Henüz yorum yok</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">İlk yorumu siz yapın!</p>
                    </div>
                  ) : (
                    comments.map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-slate-600"
                      >
                        <div className="flex items-start gap-3">
                          {comment.userAvatar ? (
                            <img
                              src={comment.userAvatar}
                              alt={comment.userName}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                              {comment.userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {comment.userName}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(comment.createdAt)}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= comment.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            <p className="mt-2 text-gray-700 dark:text-gray-300">
                              {comment.content}
                            </p>

                            <div className="flex items-center gap-4 mt-3">
                              <button
                                onClick={() => user && likeComment(comment.id, user.id)}
                                disabled={!isAuthenticated}
                                className={`flex items-center gap-1 text-sm transition-colors ${
                                  user && comment.likedBy.includes(user.id)
                                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600'
                                }`}
                              >
                                <ThumbsUp className="w-4 h-4" />
                                {comment.likes > 0 && comment.likes}
                              </button>

                              {user?.id === comment.userId && (
                                <button
                                  onClick={() => deleteComment(comment.id)}
                                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Sil
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Upload Photo */}
                {isAuthenticated && (
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold cursor-pointer hover:from-indigo-700 hover:to-purple-700 transition-all">
                      <Camera className="w-5 h-5" />
                      Fotoğraf Yükle
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Photos Grid */}
                {photos.length === 0 ? (
                  <div className="text-center py-12">
                    <Camera className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Henüz fotoğraf yok</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">İlk fotoğrafı siz ekleyin!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo, index) => (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative group aspect-square rounded-xl overflow-hidden"
                      >
                        <img
                          src={photo.url}
                          alt="Location photo"
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-white text-sm font-semibold">{photo.userName}</p>
                            <p className="text-white/70 text-xs">{formatDate(photo.uploadedAt)}</p>
                            
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => user && likePhoto(photo.id, user.id)}
                                disabled={!isAuthenticated}
                                className={`flex items-center gap-1 text-sm ${
                                  user && photo.likedBy.includes(user.id)
                                    ? 'text-red-400'
                                    : 'text-white'
                                }`}
                              >
                                <ThumbsUp className="w-4 h-4" />
                                {photo.likes > 0 && photo.likes}
                              </button>

                              {user?.id === photo.userId && (
                                <button
                                  onClick={() => deletePhoto(photo.id)}
                                  className="flex items-center gap-1 text-sm text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
