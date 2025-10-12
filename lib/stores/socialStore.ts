import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

export interface Comment {
  id: string;
  locationId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  rating: number;
  likes: number;
  likedBy: string[];
  createdAt: number;
  photos?: string[];
}

export interface LocationPhoto {
  id: string;
  locationId: string;
  userId: string;
  userName: string;
  url: string;
  uploadedAt: number;
  likes: number;
  likedBy: string[];
}

export interface LocationRating {
  locationId: string;
  totalRatings: number;
  averageRating: number;
  ratings: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface UserContribution {
  userId: string;
  commentsCount: number;
  photosCount: number;
  totalLikesReceived: number;
  badges: string[];
}

interface SocialStore {
  comments: Comment[];
  photos: LocationPhoto[];
  ratings: Record<string, LocationRating>;
  contributions: Record<string, UserContribution>;

  // Comment Actions
  addComment: (locationId: string, content: string, rating: number, photos?: string[]) => void;
  deleteComment: (commentId: string) => void;
  likeComment: (commentId: string, userId: string) => void;
  getLocationComments: (locationId: string) => Comment[];

  // Photo Actions
  addPhoto: (locationId: string, url: string) => void;
  deletePhoto: (photoId: string) => void;
  likePhoto: (photoId: string, userId: string) => void;
  getLocationPhotos: (locationId: string) => LocationPhoto[];

  // Rating Actions
  getLocationRating: (locationId: string) => LocationRating | null;
  
  // Contribution Actions
  getUserContribution: (userId: string) => UserContribution;
  checkContributionBadges: (userId: string) => void;
}

export const useSocialStore = create<SocialStore>()(
  persist(
    (set, get) => ({
      comments: [],
      photos: [],
      ratings: {},
      contributions: {},

      addComment: (locationId, content, rating, photos = []) => {
        const user = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.user;
        if (!user) {
          toast.error('Yorum yapmak için giriş yapmalısınız');
          return;
        }

        const newComment: Comment = {
          id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          locationId,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          content,
          rating,
          likes: 0,
          likedBy: [],
          createdAt: Date.now(),
          photos,
        };

        set((state) => {
          // Yorum ekle
          const newComments = [...state.comments, newComment];

          // Rating güncelle
          const currentRating = state.ratings[locationId] || {
            locationId,
            totalRatings: 0,
            averageRating: 0,
            ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          };

          const updatedRating = {
            ...currentRating,
            totalRatings: currentRating.totalRatings + 1,
            ratings: {
              ...currentRating.ratings,
              [rating]: currentRating.ratings[rating as keyof typeof currentRating.ratings] + 1,
            },
          };

          // Ortalama hesapla
          const totalStars = Object.entries(updatedRating.ratings).reduce(
            (sum, [star, count]) => sum + parseInt(star) * count,
            0
          );
          updatedRating.averageRating = totalStars / updatedRating.totalRatings;

          // Katkı güncelle
          const currentContribution = state.contributions[user.id] || {
            userId: user.id,
            commentsCount: 0,
            photosCount: 0,
            totalLikesReceived: 0,
            badges: [],
          };

          const updatedContribution = {
            ...currentContribution,
            commentsCount: currentContribution.commentsCount + 1,
          };

          return {
            comments: newComments,
            ratings: {
              ...state.ratings,
              [locationId]: updatedRating,
            },
            contributions: {
              ...state.contributions,
              [user.id]: updatedContribution,
            },
          };
        });

        // Rozet kontrolü
        setTimeout(() => get().checkContributionBadges(user.id), 100);

        toast.success('💬 Yorumunuz başarıyla eklendi!', {
          icon: '✅',
          style: {
            borderRadius: '12px',
            background: '#10b981',
            color: '#fff',
          },
        });

        // Gamification entegrasyonu
        const gamificationStore = JSON.parse(localStorage.getItem('gamification-storage') || '{}');
        if (gamificationStore?.state) {
          // Yorum için bonus puan
          console.log('🎮 Sosyal aktivite: +5 puan');
        }
      },

      deleteComment: (commentId) => {
        const user = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.user;
        const comment = get().comments.find(c => c.id === commentId);
        
        if (!comment) return;
        if (comment.userId !== user?.id) {
          toast.error('Sadece kendi yorumlarınızı silebilirsiniz');
          return;
        }

        set((state) => ({
          comments: state.comments.filter(c => c.id !== commentId),
        }));

        toast.success('Yorum silindi');
      },

      likeComment: (commentId, userId) => {
        set((state) => {
          const updatedComments = state.comments.map(comment => {
            if (comment.id === commentId) {
              const alreadyLiked = comment.likedBy.includes(userId);
              
              if (alreadyLiked) {
                return {
                  ...comment,
                  likes: comment.likes - 1,
                  likedBy: comment.likedBy.filter(id => id !== userId),
                };
              } else {
                // Katkı sahibine beğeni say
                const commentOwner = state.contributions[comment.userId];
                if (commentOwner) {
                  state.contributions[comment.userId] = {
                    ...commentOwner,
                    totalLikesReceived: commentOwner.totalLikesReceived + 1,
                  };
                }

                return {
                  ...comment,
                  likes: comment.likes + 1,
                  likedBy: [...comment.likedBy, userId],
                };
              }
            }
            return comment;
          });

          return { comments: updatedComments };
        });
      },

      getLocationComments: (locationId) => {
        return get().comments
          .filter(c => c.locationId === locationId)
          .sort((a, b) => b.createdAt - a.createdAt);
      },

      addPhoto: (locationId, url) => {
        const user = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.user;
        if (!user) {
          toast.error('Fotoğraf eklemek için giriş yapmalısınız');
          return;
        }

        const newPhoto: LocationPhoto = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          locationId,
          userId: user.id,
          userName: user.name,
          url,
          uploadedAt: Date.now(),
          likes: 0,
          likedBy: [],
        };

        set((state) => {
          const currentContribution = state.contributions[user.id] || {
            userId: user.id,
            commentsCount: 0,
            photosCount: 0,
            totalLikesReceived: 0,
            badges: [],
          };

          return {
            photos: [...state.photos, newPhoto],
            contributions: {
              ...state.contributions,
              [user.id]: {
                ...currentContribution,
                photosCount: currentContribution.photosCount + 1,
              },
            },
          };
        });

        setTimeout(() => get().checkContributionBadges(user.id), 100);

        toast.success('📸 Fotoğraf başarıyla eklendi!', {
          icon: '✅',
          style: {
            borderRadius: '12px',
            background: '#10b981',
            color: '#fff',
          },
        });
      },

      deletePhoto: (photoId) => {
        const user = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.user;
        const photo = get().photos.find(p => p.id === photoId);
        
        if (!photo) return;
        if (photo.userId !== user?.id) {
          toast.error('Sadece kendi fotoğraflarınızı silebilirsiniz');
          return;
        }

        set((state) => ({
          photos: state.photos.filter(p => p.id !== photoId),
        }));

        toast.success('Fotoğraf silindi');
      },

      likePhoto: (photoId, userId) => {
        set((state) => {
          const updatedPhotos = state.photos.map(photo => {
            if (photo.id === photoId) {
              const alreadyLiked = photo.likedBy.includes(userId);
              
              if (alreadyLiked) {
                return {
                  ...photo,
                  likes: photo.likes - 1,
                  likedBy: photo.likedBy.filter(id => id !== userId),
                };
              } else {
                const photoOwner = state.contributions[photo.userId];
                if (photoOwner) {
                  state.contributions[photo.userId] = {
                    ...photoOwner,
                    totalLikesReceived: photoOwner.totalLikesReceived + 1,
                  };
                }

                return {
                  ...photo,
                  likes: photo.likes + 1,
                  likedBy: [...photo.likedBy, userId],
                };
              }
            }
            return photo;
          });

          return { photos: updatedPhotos };
        });
      },

      getLocationPhotos: (locationId) => {
        return get().photos
          .filter(p => p.locationId === locationId)
          .sort((a, b) => b.uploadedAt - a.uploadedAt);
      },

      getLocationRating: (locationId) => {
        return get().ratings[locationId] || null;
      },

      getUserContribution: (userId) => {
        return get().contributions[userId] || {
          userId,
          commentsCount: 0,
          photosCount: 0,
          totalLikesReceived: 0,
          badges: [],
        };
      },

      checkContributionBadges: (userId) => {
        const contribution = get().contributions[userId];
        if (!contribution) return;

        const newBadges: string[] = [...contribution.badges];
        let badgeUnlocked = false;

        // İlk Yorum Rozeti
        if (contribution.commentsCount >= 1 && !newBadges.includes('first-comment')) {
          newBadges.push('first-comment');
          badgeUnlocked = true;
          toast.success('🏆 Yeni Rozet: İlk Yorumcu!', {
            duration: 4000,
            icon: '💬',
            style: {
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontWeight: 'bold',
            },
          });
        }

        // Aktif Yorumcu (10 yorum)
        if (contribution.commentsCount >= 10 && !newBadges.includes('active-commenter')) {
          newBadges.push('active-commenter');
          badgeUnlocked = true;
          toast.success('🏆 Yeni Rozet: Aktif Yorumcu!', {
            duration: 4000,
            icon: '💬',
            style: {
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#fff',
              fontWeight: 'bold',
            },
          });
        }

        // Fotoğrafçı (5 fotoğraf)
        if (contribution.photosCount >= 5 && !newBadges.includes('photographer')) {
          newBadges.push('photographer');
          badgeUnlocked = true;
          toast.success('🏆 Yeni Rozet: Fotoğrafçı!', {
            duration: 4000,
            icon: '📸',
            style: {
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
              color: '#fff',
              fontWeight: 'bold',
            },
          });
        }

        // Topluluk Lideri (50 beğeni)
        if (contribution.totalLikesReceived >= 50 && !newBadges.includes('community-leader')) {
          newBadges.push('community-leader');
          badgeUnlocked = true;
          toast.success('🏆 Yeni Rozet: Topluluk Lideri!', {
            duration: 4000,
            icon: '👑',
            style: {
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#fff',
              fontWeight: 'bold',
            },
          });
        }

        if (badgeUnlocked) {
          set((state) => ({
            contributions: {
              ...state.contributions,
              [userId]: {
                ...state.contributions[userId],
                badges: newBadges,
              },
            },
          }));
        }
      },
    }),
    {
      name: 'social-storage',
    }
  )
);
