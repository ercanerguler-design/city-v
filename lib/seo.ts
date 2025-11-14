import { Metadata } from 'next';

interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'business';
  locale?: string;
  siteName?: string;
}

const defaultSEO: Required<SEOConfig> = {
  title: 'CityV - Şehrinizi Keşfedin',
  description: 'Ankara\'nın en iyi mekanlarını keşfedin, kalabalık seviyelerini öğrenin ve rezervasyon yapın. İş sahipleri için profesyonel yönetim paneli.',
  keywords: [
    'Ankara', 'mekan', 'restoran', 'kafe', 'kalabalık', 'rezervasyon',
    'şehir rehberi', 'işletme yönetimi', 'kampanya', 'business'
  ],
  image: '/og-image.jpg',
  url: 'https://cityv.app',
  type: 'website',
  locale: 'tr_TR',
  siteName: 'CityV'
};

export function generateSEOMetadata(config: SEOConfig = {}): Metadata {
  const seo = { ...defaultSEO, ...config };
  
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    
    // Open Graph
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.url,
      siteName: seo.siteName,
      images: [
        {
          url: seo.image,
          width: 1200,
          height: 630,
          alt: seo.title,
        }
      ],
      locale: seo.locale,
      type: seo.type,
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [seo.image],
    },
    
    // Additional metadata
    alternates: {
      canonical: seo.url,
    },
    
    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Verification
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  };
}

// Specific SEO configs for different pages
export const pageSEO = {
  home: generateSEOMetadata({
    title: 'CityV - Ankara\'nın En İyi Mekanları',
    description: 'Ankara\'daki restoranlar, kafeler ve eğlence mekanlarının güncel kalabalık seviyelerini öğrenin. Rezervasyon yapın, kampanyaları takip edin.',
    keywords: ['Ankara mekanları', 'restoran rehberi', 'kafe bulucu', 'kalabalık takibi']
  }),
  
  business: generateSEOMetadata({
    title: 'İşletme Yönetim Paneli - CityV Business',
    description: 'İşletmenizi CityV ile yönetin. Kampanya oluşturun, rezervasyonları takip edin, müşteri geri bildirimlerini alın.',
    keywords: ['işletme yönetimi', 'restoran paneli', 'kampanya yönetimi', 'rezervasyon sistemi'],
    type: 'business'
  }),
  
  locations: (locationName: string, category: string) => generateSEOMetadata({
    title: `${locationName} - ${category} | CityV`,
    description: `${locationName} hakkında detaylı bilgi, güncel kalabalık seviyesi, çalışma saatleri ve rezervasyon imkanı.`,
    keywords: [locationName, category, 'Ankara', 'rezervasyon', 'kalabalık']
  }),
  
  campaigns: generateSEOMetadata({
    title: 'Kampanyalar ve Fırsatlar - CityV',
    description: 'Ankara\'nın en iyi mekanlarından özel indirimler, kampanyalar ve fırsatları kaçırmayın.',
    keywords: ['kampanya', 'indirim', 'fırsat', 'Ankara mekan kampanyaları']
  })
};

// Schema.org structured data
export function generateBusinessSchema(business: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ankara',
      addressCountry: 'TR',
      streetAddress: business.address
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: business.coordinates[0],
      longitude: business.coordinates[1]
    },
    telephone: business.phone,
    email: business.email,
    url: business.website,
    image: business.images,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: business.rating,
      reviewCount: business.totalReviews
    },
    openingHours: Object.entries(business.workingHours)
      .filter(([_, hours]) => hours && hours !== 'Kapalı')
      .map(([day, hours]) => {
        const dayMap: { [key: string]: string } = {
          monday: 'Mo',
          tuesday: 'Tu',
          wednesday: 'We', 
          thursday: 'Th',
          friday: 'Fr',
          saturday: 'Sa',
          sunday: 'Su'
        };
        return `${dayMap[day]} ${hours}`;
      }),
    priceRange: business.category === 'restaurant' ? '$$' : '$'
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CityV',
    url: 'https://cityv.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://cityv.app/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };
}