/**
 * Premium Özellikleri Kontrol Sistemi
 * Hangi özelliklerin premium olduğunu ve kullanıcının erişimini kontrol eder
 */

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  requiresPremium: boolean;
}

export const PREMIUM_FEATURES = {
  // Reklamsız deneyim - otomatik
  AD_FREE: {
    id: 'ad_free',
    name: 'Reklamsız Deneyim',
    description: 'Tamamen reklamsız deneyim',
    requiresPremium: true,
  },
  
  // Gelişmiş Analytics
  ADVANCED_ANALYTICS: {
    id: 'advanced_analytics',
    name: 'Gelişmiş İstatistikler',
    description: 'Gelişmiş istatistikler ve grafikler',
    requiresPremium: true,
  },
  
  // Ziyaret Geçmişi
  VISIT_HISTORY: {
    id: 'visit_history',
    name: 'Ziyaret Geçmişi',
    description: '1000+ ziyaret geçmişi',
    requiresPremium: true,
    limit: { free: 10, premium: 1000 },
  },
  
  // Premium Temalar
  PREMIUM_THEMES: {
    id: 'premium_themes',
    name: 'Premium Temalar',
    description: '6+ özel premium tema',
    requiresPremium: true,
  },
  
  // Premium Rozetler
  PREMIUM_BADGES: {
    id: 'premium_badges',
    name: 'Premium Rozetler',
    description: 'Özel premium rozetleri',
    requiresPremium: true,
  },
  
  // Öncelikli Destek
  PRIORITY_SUPPORT: {
    id: 'priority_support',
    name: 'Öncelikli Destek',
    description: 'Öncelikli müşteri desteği',
    requiresPremium: true,
  },
  
  // Akıllı Bildirimler
  SMART_NOTIFICATIONS: {
    id: 'smart_notifications',
    name: 'Akıllı Bildirimler',
    description: 'Akıllı bildirimler',
    requiresPremium: true,
  },
  
  // Özel Filtreler
  ADVANCED_FILTERS: {
    id: 'advanced_filters',
    name: 'Özel Filtreler',
    description: 'Özel filtreler ve kayıtlar',
    requiresPremium: true,
  },
  
  // Veri Dışa Aktarma
  DATA_EXPORT: {
    id: 'data_export',
    name: 'Veri Dışa Aktarma',
    description: 'Veri dışa aktarma (CSV/JSON)',
    requiresPremium: true,
  },
  
  // Erken Erişim
  EARLY_ACCESS: {
    id: 'early_access',
    name: 'Erken Erişim',
    description: 'Yeni özelliklere erken erişim',
    requiresPremium: true,
  },
  
  // Akıllı Öneriler - TAM ERİŞİM
  SMART_RECOMMENDATIONS: {
    id: 'smart_recommendations',
    name: 'Akıllı Öneriler',
    description: 'AI tabanlı kişiselleştirilmiş öneriler',
    requiresPremium: true,
  },
  
  // Oyuncu Profili - TAM ERİŞİM
  GAMIFICATION: {
    id: 'gamification',
    name: 'Oyuncu Profili',
    description: 'Rozetler, seviyeler ve liderlik tablosu',
    requiresPremium: true,
  },
  
  // Takip Edilenler - SINIRLI
  TRACKED_LOCATIONS: {
    id: 'tracked_locations',
    name: 'Takip Edilenler',
    description: 'Favori mekanları takip et',
    requiresPremium: false, // Herkes kullanabilir ama limitli
    limit: { free: 5, premium: 999 },
  },
  
  // Rota Planlama
  ROUTE_PLANNING: {
    id: 'route_planning',
    name: 'Rota Planlama',
    description: 'Gelişmiş rota planlama özellikleri',
    requiresPremium: true,
  },
} as const;

/**
 * Kullanıcının premium olup olmadığını kontrol eder
 */
export function isPremiumUser(user: any): boolean {
  return user?.membershipTier && user.membershipTier !== 'free';
}

/**
 * Kullanıcının bir özelliğe erişimi olup olmadığını kontrol eder
 */
export function hasFeatureAccess(user: any, featureId: string): boolean {
  const feature = Object.values(PREMIUM_FEATURES).find(f => f.id === featureId);
  
  if (!feature) {
    console.warn(`Feature not found: ${featureId}`);
    return false;
  }
  
  // Premium gerektirmeyen özellikler herkese açık
  if (!feature.requiresPremium) {
    return true;
  }
  
  // Premium gerektiren özellikler sadece premium kullanıcılara
  return isPremiumUser(user);
}

/**
 * Kullanıcının bir özellik için limitini döndürür
 */
export function getFeatureLimit(user: any, featureId: string): number {
  const feature = Object.values(PREMIUM_FEATURES).find(f => f.id === featureId);
  
  if (!feature || !('limit' in feature)) {
    return Infinity;
  }
  
  return isPremiumUser(user) ? feature.limit.premium : feature.limit.free;
}

/**
 * Premium gerektiren bir özelliğe erişim engeli gösterir
 */
export function showPremiumRequiredMessage(featureName: string): string {
  return `${featureName} özelliği Premium üyeler içindir. Premium'a geçerek tüm özelliklere erişebilirsiniz.`;
}

/**
 * Tüm premium özelliklerin listesini döndürür
 */
export function getAllPremiumFeatures() {
  return Object.values(PREMIUM_FEATURES).filter(f => f.requiresPremium);
}

/**
 * Ücretsiz özelliklerin listesini döndürür
 */
export function getFreeFeatures() {
  return Object.values(PREMIUM_FEATURES).filter(f => !f.requiresPremium);
}
