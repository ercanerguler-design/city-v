export const categories = [
  { id: 'cafe', name: 'Kafe & Restoran', icon: '☕', color: '#f59e0b' },
  { id: 'bank', name: 'Banka & ATM', icon: '🏦', color: '#3b82f6' },
  { id: 'hospital', name: 'Hastane & Sağlık', icon: '🏥', color: '#ef4444' },
  { id: 'notary', name: 'Noter', icon: '📋', color: '#8b5cf6' },
  { id: 'pharmacy', name: 'Eczane', icon: '💊', color: '#10b981' },
  { id: 'shopping', name: 'Alışveriş Merkezi', icon: '🛍️', color: '#ec4899' },
  { id: 'public', name: 'Kamu Kurumu', icon: '🏛️', color: '#6366f1' },
  { id: 'transport', name: 'Ulaşım', icon: '🚇', color: '#14b8a6' },
  { id: 'entertainment', name: 'Eğlence', icon: '🎭', color: '#f43f5e' },
  { id: 'park', name: 'Park & Açık Alan', icon: '🌳', color: '#22c55e' },
  { id: 'gym', name: 'Spor Salonu', icon: '💪', color: '#fb923c' },
  { id: 'market', name: 'Market', icon: '🛒', color: '#a855f7' },
  { id: 'restaurant', name: 'Restoran', icon: '🍽️', color: '#f97316' },
  { id: 'gas_station', name: 'Benzin İstasyonu', icon: '⛽', color: '#0ea5e9' },
  { id: 'school', name: 'Okul & Eğitim', icon: '🎓', color: '#8b5cf6' },
  { id: 'library', name: 'Kütüphane', icon: '📚', color: '#06b6d4' },
  { id: 'post_office', name: 'Postane', icon: '📮', color: '#eab308' },
  { id: 'police', name: 'Polis & İtfaiye', icon: '🚓', color: '#dc2626' },
  { id: 'mosque', name: 'İbadet Yeri', icon: '🕌', color: '#16a34a' },
  { id: 'cinema', name: 'Sinema & Eğlence', icon: '🎬', color: '#9333ea' },
  { id: 'beauty', name: 'Güzellik & Kuaför', icon: '💇', color: '#ec4899' },
  { id: 'salon', name: 'Kuaför', icon: '✂️', color: '#ec4899' },
  { id: 'pet', name: 'Pet Shop & Veteriner', icon: '🐾', color: '#84cc16' },
  { id: 'electronics', name: 'Elektronik', icon: '📱', color: '#6366f1' },
  { id: 'clothing', name: 'Giyim & Aksesuar', icon: '👔', color: '#f43f5e' },
  { id: 'hotel', name: 'Otel & Konaklama', icon: '🏨', color: '#0891b2' },
  { id: 'car', name: 'Otomotiv', icon: '🚗', color: '#6b7280' },
  { id: 'travel', name: 'Seyahat & Ulaşım', icon: '✈️', color: '#3b82f6' },
  { id: 'finance', name: 'Finans & Sigorta', icon: '💼', color: '#1e40af' },
  { id: 'legal', name: 'Hukuk & Danışmanlık', icon: '⚖️', color: '#1f2937' },
  { id: 'real_estate', name: 'Emlak', icon: '🏠', color: '#f97316' },
  { id: 'locksmith', name: 'Çilingir', icon: '🔐', color: '#f59e0b' },
  { id: 'laundry', name: 'Çamaşırhane', icon: '👕', color: '#3b82f6' },
  { id: 'florist', name: 'Çiçekçi', icon: '💐', color: '#ec4899' },
  { id: 'hardware', name: 'Hırdavat', icon: '🔧', color: '#6b7280' },
  { id: 'liquor', name: 'Tekel', icon: '🍷', color: '#a855f7' },
  { id: 'moving', name: 'Nakliye', icon: '🚚', color: '#f97316' },
  { id: 'painter', name: 'Boyacı', icon: '🎨', color: '#8b5cf6' },
  { id: 'plumber', name: 'Tesisatçı', icon: '💧', color: '#0891b2' },
  { id: 'roofing', name: 'Çatı', icon: '🏗️', color: '#6b7280' },
  { id: 'storage', name: 'Depo', icon: '📦', color: '#f97316' },
];

export const getCategoryById = (id: string) => {
  return categories.find((cat) => cat.id === id);
};

export const getCategoryColor = (id: string) => {
  return categories.find((cat) => cat.id === id)?.color || '#6b7280';
};

export const getCategoryIcon = (id: string) => {
  return categories.find((cat) => cat.id === id)?.icon || '📍';
};
