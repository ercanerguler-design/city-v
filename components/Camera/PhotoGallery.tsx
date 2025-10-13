'use client';

import { useState } from 'react';
import { useCameraStore } from '../../store/cameraStore';

export default function PhotoGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState<string | null>(null);
  
  const { photos, sharePhoto, currentPhoto } = useCameraStore();

  const handleShare = async (photoId: string, platforms: string[]) => {
    setShareLoading(photoId);
    try {
      await sharePhoto(photoId, platforms);
      console.log('✅ Fotoğraf başarıyla paylaşıldı');
    } catch (error) {
      console.error('❌ Paylaşım hatası:', error);
    } finally {
      setShareLoading(null);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes}dk önce`;
    if (hours < 24) return `${hours}sa önce`;
    return `${days} gün önce`;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">📸 Fotoğraf Galerim</h2>
            <p className="opacity-90">
              {photos.length} fotoğraf • AI analizi aktif
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{photos.length}</div>
            <div className="text-sm opacity-75">Toplam</div>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-white/20">
          <div className="text-center">
            <div className="text-lg font-semibold">
              {photos.filter(p => p.aiAnalysis).length}
            </div>
            <div className="text-xs opacity-75">AI Analizi</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">
              {photos.filter(p => p.locationId).length}
            </div>
            <div className="text-xs opacity-75">Konum Etiketli</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">
              {Math.round(photos.filter(p => p.aiAnalysis).reduce((acc, p) => acc + (p.aiAnalysis?.confidence || 0), 0) / photos.filter(p => p.aiAnalysis).length * 100) || 0}%
            </div>
            <div className="text-xs opacity-75">Ortalama Güven</div>
          </div>
        </div>
      </div>

      {/* Recent Photo Highlight */}
      {currentPhoto && photos.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Son Çekilen Fotoğraf</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI analizi tamamlandı</p>
            </div>
          </div>
          
          <div className="relative rounded-lg overflow-hidden group">
            <img 
              src={currentPhoto} 
              alt="Son fotoğraf"
              className="w-full h-48 object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-4 left-4 right-4">
                {(() => {
                  const latestPhoto = photos[0];
                  return latestPhoto?.aiAnalysis ? (
                    <div className="text-white">
                      <div className="font-medium">{latestPhoto.aiAnalysis.detectedLocation}</div>
                      <div className="text-sm opacity-90">
                        %{Math.round(latestPhoto.aiAnalysis.confidence * 100)} güven ile tespit edildi
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        {latestPhoto.aiAnalysis.categories.slice(0, 3).join(', ')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-white">
                      <div className="font-medium">Yeni Fotoğraf</div>
                      <div className="text-sm opacity-90">AI analizi bekleniyor...</div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📷</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Henüz fotoğraf yok
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Kamera butonunu kullanarak ilk fotoğrafınızı çekin. AI teknolojisi ile otomatik mekan tanıma başlayacak!
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <span>🤖</span>
              <span>AI Analizi</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>📍</span>
              <span>Konum Tanıma</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>📤</span>
              <span>Sosyal Paylaşım</span>
            </div>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div 
              key={photo.id}
              className="relative group cursor-pointer bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => setSelectedPhoto(photo.id)}
            >
              {/* Photo */}
              <div className="aspect-square overflow-hidden">
                <img 
                  src={photo.imageUrl} 
                  alt={photo.caption || 'Fotoğraf'}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
              </div>
              
              {/* Photo Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(photo.id, ['native']);
                      }}
                      disabled={shareLoading === photo.id}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 text-white transition-colors disabled:opacity-50"
                    >
                      {shareLoading === photo.id ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="text-lg">📤</span>
                      )}
                    </button>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 text-white transition-colors"
                    >
                      <span className="text-lg">❤️</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col space-y-1">
                {photo.aiAnalysis && (
                  <div className="bg-blue-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                    <span>🤖</span>
                    <span>AI</span>
                  </div>
                )}
                {photo.locationId && (
                  <div className="bg-green-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                    <span>📍</span>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div className="absolute bottom-2 right-2">
                <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  {formatTimestamp(photo.timestamp)}
                </div>
              </div>

              {/* Info Strip */}
              <div className="p-3 bg-white dark:bg-gray-800">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {photo.aiAnalysis?.detectedLocation || 'Bilinmeyen Konum'}
                </div>
                {photo.aiAnalysis && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    %{Math.round(photo.aiAnalysis.confidence * 100)} güven
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            {(() => {
              const photo = photos.find(p => p.id === selectedPhoto);
              if (!photo) return null;

              return (
                <>
                  {/* Photo */}
                  <div className="relative">
                    <img 
                      src={photo.imageUrl} 
                      alt={photo.caption || 'Fotoğraf'}
                      className="w-full h-64 object-cover"
                    />
                    <button 
                      onClick={() => setSelectedPhoto(null)}
                      className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    {/* Timestamp Badge */}
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
                        {formatTimestamp(photo.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {/* AI Analysis */}
                    {photo.aiAnalysis && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-xl">🤖</span>
                          <span className="font-semibold text-blue-900 dark:text-blue-100">AI Analizi</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Konum:</span>
                            <span className="text-blue-800 dark:text-blue-200">{photo.aiAnalysis.detectedLocation}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Güven:</span>
                            <span className="text-green-600 dark:text-green-400 font-semibold">
                              %{Math.round(photo.aiAnalysis.confidence * 100)}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                            <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Kategoriler:</div>
                            <div className="flex flex-wrap gap-1">
                              {photo.aiAnalysis.categories.map((category, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                                >
                                  {category}
                                </span>
                              ))}
                            </div>
                          </div>
                          {photo.aiAnalysis.landmarks.length > 0 && (
                            <div className="pt-2">
                              <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Yakın Yerler:</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {photo.aiAnalysis.landmarks.join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleShare(photo.id, ['native'])}
                        disabled={shareLoading === photo.id}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {shareLoading === photo.id ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>📤</span>
                            <span>Paylaş</span>
                          </>
                        )}
                      </button>
                      <button className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <span className="text-xl">❤️</span>
                      </button>
                      <button className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <span className="text-xl">💾</span>
                      </button>
                    </div>

                    {/* Photo Info */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Fotoğraf ID: {photo.id.slice(-8)}</span>
                        <span>{formatTimestamp(photo.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}