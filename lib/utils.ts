import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatTime(date: Date | string): string {
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Invalid date check
  if (isNaN(dateObj.getTime())) {
    return 'Bilinmiyor';
  }
  
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Şimdi';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} saat önce`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} gün önce`;
}

export function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Günaydın';
  if (hour < 18) return 'İyi Günler';
  return 'İyi Akşamlar';
}

export function getCrowdLevelColor(level: string): string {
  const colors: Record<string, string> = {
    empty: '#10b981',       // green
    low: '#84cc16',         // lime
    moderate: '#f59e0b',    // amber
    high: '#f97316',        // orange
    very_high: '#ef4444',   // red
  };
  return colors[level] || colors.moderate;
}

export function getCrowdLevelText(level: string): string {
  const texts: Record<string, string> = {
    empty: 'Boş',
    low: 'Az Kalabalık',
    moderate: 'Orta',
    high: 'Kalabalık',
    very_high: 'Çok Kalabalık',
  };
  return texts[level] || 'Bilinmiyor';
}
