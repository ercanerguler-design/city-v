'use client';

import React from 'react';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Coffee,
  Building2,
  Hospital,
  Cross,
  ShoppingCart,
  Trees,
  Utensils,
  Fuel,
  GraduationCap,
  Dumbbell,
  BookOpen,
  Mail,
  Shield,
  Church,
  Film,
  Scissors,
  PawPrint,
  Smartphone,
  ShoppingBag,
  Hotel,
  Car,
  Plane,
  Briefcase,
  Scale,
  Home,
  Lock,
  Shirt,
  Flower2,
  Wrench,
  Wine,
  Truck,
  Paintbrush,
  Droplet,
  Warehouse,
} from 'lucide-react';

// Kategori renkleri (GENİŞLETİLMİŞ)
export const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  business: { bg: '#7C3AED', text: '#fff', border: '#5B21B6' }, // Business - Mor/Purple
  business_verified: { bg: '#10B981', text: '#fff', border: '#059669' }, // Verified Business - Yeşil
  cafe: { bg: '#8B4513', text: '#fff', border: '#6B3410' },
  bank: { bg: '#1E40AF', text: '#fff', border: '#1E3A8A' },
  hospital: { bg: '#DC2626', text: '#fff', border: '#B91C1C' },
  pharmacy: { bg: '#059669', text: '#fff', border: '#047857' },
  market: { bg: '#EA580C', text: '#fff', border: '#C2410C' },
  park: { bg: '#16A34A', text: '#fff', border: '#15803D' },
  restaurant: { bg: '#F59E0B', text: '#fff', border: '#D97706' },
  gas_station: { bg: '#6B7280', text: '#fff', border: '#4B5563' },
  school: { bg: '#7C3AED', text: '#fff', border: '#6D28D9' },
  gym: { bg: '#EF4444', text: '#fff', border: '#DC2626' },
  library: { bg: '#0891B2', text: '#fff', border: '#0E7490' },
  post_office: { bg: '#F97316', text: '#fff', border: '#EA580C' },
  police: { bg: '#1F2937', text: '#fff', border: '#111827' },
  mosque: { bg: '#10B981', text: '#fff', border: '#059669' },
  cinema: { bg: '#8B5CF6', text: '#fff', border: '#7C3AED' },
  salon: { bg: '#EC4899', text: '#fff', border: '#DB2777' },
  beauty: { bg: '#EC4899', text: '#fff', border: '#DB2777' },
  pet: { bg: '#F59E0B', text: '#fff', border: '#D97706' },
  electronics: { bg: '#3B82F6', text: '#fff', border: '#2563EB' },
  clothing: { bg: '#A855F7', text: '#fff', border: '#9333EA' },
  hotel: { bg: '#0891B2', text: '#fff', border: '#0E7490' },
  shopping: { bg: '#EC4899', text: '#fff', border: '#DB2777' },
  car: { bg: '#6B7280', text: '#fff', border: '#4B5563' },
  travel: { bg: '#3B82F6', text: '#fff', border: '#2563EB' },
  finance: { bg: '#1E40AF', text: '#fff', border: '#1E3A8A' },
  legal: { bg: '#1F2937', text: '#fff', border: '#111827' },
  real_estate: { bg: '#F97316', text: '#fff', border: '#EA580C' },
  locksmith: { bg: '#F59E0B', text: '#fff', border: '#D97706' },
  laundry: { bg: '#3B82F6', text: '#fff', border: '#2563EB' },
  florist: { bg: '#EC4899', text: '#fff', border: '#DB2777' },
  hardware: { bg: '#6B7280', text: '#fff', border: '#4B5563' },
  liquor: { bg: '#A855F7', text: '#fff', border: '#9333EA' },
  moving: { bg: '#F97316', text: '#fff', border: '#EA580C' },
  painter: { bg: '#8B5CF6', text: '#fff', border: '#7C3AED' },
  plumber: { bg: '#0891B2', text: '#fff', border: '#0E7490' },
  roofing: { bg: '#6B7280', text: '#fff', border: '#4B5563' },
  storage: { bg: '#F97316', text: '#fff', border: '#EA580C' },
  default: { bg: '#667eea', text: '#fff', border: '#5568d3' },
};

// Kategori ikonları (GENİŞLETİLMİŞ)
export const categoryIcons: Record<string, React.ComponentType<any>> = {
  cafe: Coffee,
  bank: Building2,
  hospital: Hospital,
  pharmacy: Cross,
  market: ShoppingCart,
  park: Trees,
  restaurant: Utensils,
  gas_station: Fuel,
  school: GraduationCap,
  gym: Dumbbell,
  library: BookOpen,
  post_office: Mail,
  police: Shield,
  mosque: Church,
  cinema: Film,
  salon: Scissors,
  beauty: Scissors,
  pet: PawPrint,
  electronics: Smartphone,
  clothing: ShoppingBag,
  hotel: Hotel,
  shopping: ShoppingBag,
  car: Car,
  travel: Plane,
  finance: Briefcase,
  legal: Scale,
  real_estate: Home,
  locksmith: Lock,
  laundry: Shirt,
  florist: Flower2,
  hardware: Wrench,
  liquor: Wine,
  moving: Truck,
  painter: Paintbrush,
  plumber: Droplet,
  roofing: Home,
  storage: Warehouse,
};

// Yoğunluk seviyesi renkleri
export const crowdLevelColors: Record<string, string> = {
  empty: '#10B981',
  low: '#3B82F6',
  moderate: '#F59E0B',
  high: '#EF4444',
  very_high: '#DC2626',
};

// Özel marker ikonu oluştur
export function createCustomMarker(category: string, crowdLevel: string = 'empty', size: number = 40): L.DivIcon {
  const colors = categoryColors[category] || categoryColors.default;
  const IconComponent = categoryIcons[category] || Coffee;
  const crowdColor = crowdLevelColors[crowdLevel] || crowdLevelColors.empty;

  const iconHtml = renderToStaticMarkup(
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Pin şekli */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
        }}
      >
        {/* Ana pin */}
        <path
          d="M20 4C13.373 4 8 9.373 8 16C8 24 20 36 20 36C20 36 32 24 32 16C32 9.373 26.627 4 20 4Z"
          fill={colors.bg}
          stroke={colors.border}
          strokeWidth="2"
        />
        {/* İç daire */}
        <circle cx="20" cy="16" r="8" fill="white" fillOpacity="0.9" />
      </svg>

      {/* İkon */}
      <div
        style={{
          position: 'absolute',
          top: '6px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <IconComponent
          size={size * 0.4}
          color={colors.bg}
          strokeWidth={2.5}
        />
      </div>

      {/* Yoğunluk göstergesi */}
      <div
        style={{
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          width: `${size * 0.25}px`,
          height: `${size * 0.25}px`,
          borderRadius: '50%',
          backgroundColor: crowdColor,
          border: '2px solid white',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

// Cluster ikonu oluştur
export function createClusterIcon(count: number, size: number = 40): L.DivIcon {
  const clusterHtml = renderToStaticMarkup(
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: '3px solid white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: 'white',
        fontSize: `${size * 0.4}px`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      {count}
    </div>
  );

  return L.divIcon({
    html: clusterHtml,
    className: 'custom-cluster-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Kullanıcı konumu ikonu
export function createUserLocationIcon(size: number = 24): L.DivIcon {
  const iconHtml = renderToStaticMarkup(
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        border: '4px solid white',
        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: `${size * 0.4}px`,
          height: `${size * 0.4}px`,
          borderRadius: '50%',
          backgroundColor: 'white',
        }}
      />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'user-location-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Rota başlangıç/bitiş ikonu
export function createRoutePointIcon(type: 'start' | 'end', size: number = 32): L.DivIcon {
  const color = type === 'start' ? '#10B981' : '#EF4444';
  const label = type === 'start' ? 'A' : 'B';

  const iconHtml = renderToStaticMarkup(
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: color,
        border: '3px solid white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: 'white',
        fontSize: `${size * 0.5}px`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      {label}
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'route-point-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Çizim aracı ikonu
export function createDrawingIcon(type: 'marker' | 'circle' | 'polygon', size: number = 28): L.DivIcon {
  const colors: Record<string, string> = {
    marker: '#F59E0B',
    circle: '#8B5CF6',
    polygon: '#EC4899',
  };

  const iconHtml = renderToStaticMarkup(
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: colors[type],
        border: '2px solid white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      }}
    />
  );

  return L.divIcon({
    html: iconHtml,
    className: 'drawing-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
