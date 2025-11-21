/**
 * Date and Time formatting utilities for Turkish timezone (Europe/Istanbul)
 */

/**
 * Format timestamp to Turkish timezone time
 * @param timestamp - Date string or Date object
 * @returns Formatted time string (HH:MM:SS)
 */
export function formatTurkishTime(timestamp: string | Date | null | undefined): string {
  if (!timestamp) return '--:--:--';
  
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    return date.toLocaleTimeString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('formatTurkishTime error:', error);
    return '--:--:--';
  }
}

/**
 * Format timestamp to Turkish timezone date
 * @param timestamp - Date string or Date object
 * @returns Formatted date string (DD.MM.YYYY)
 */
export function formatTurkishDate(timestamp: string | Date | null | undefined): string {
  if (!timestamp) return '--.--.----';
  
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    return date.toLocaleDateString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('formatTurkishDate error:', error);
    return '--.--.----';
  }
}

/**
 * Format timestamp to Turkish timezone date and time
 * @param timestamp - Date string or Date object
 * @returns Formatted datetime string (DD.MM.YYYY HH:MM:SS)
 */
export function formatTurkishDateTime(timestamp: string | Date | null | undefined): string {
  if (!timestamp) return '--.--.---- --:--:--';
  
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    const dateStr = date.toLocaleDateString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    const timeStr = date.toLocaleTimeString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    return `${dateStr} ${timeStr}`;
  } catch (error) {
    console.error('formatTurkishDateTime error:', error);
    return '--.--.---- --:--:--';
  }
}

/**
 * Format timestamp to relative time (e.g., "2 dakika önce")
 * @param timestamp - Date string or Date object
 * @returns Relative time string in Turkish
 */
export function formatRelativeTime(timestamp: string | Date | null | undefined): string {
  if (!timestamp) return 'Bilinmiyor';
  
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 10) return 'Şimdi';
    if (diffSecs < 60) return `${diffSecs} saniye önce`;
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return formatTurkishDate(timestamp);
  } catch (error) {
    console.error('formatRelativeTime error:', error);
    return 'Bilinmiyor';
  }
}

/**
 * Get current Turkish time
 * @returns Current time in Turkish timezone
 */
export function getCurrentTurkishTime(): Date {
  return new Date();
}

/**
 * Format timestamp for charts (HH:MM format)
 * @param timestamp - Date string or Date object
 * @returns Formatted time for charts (HH:MM)
 */
export function formatChartTime(timestamp: string | Date | null | undefined): string {
  if (!timestamp) return '--:--';
  
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    return date.toLocaleTimeString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('formatChartTime error:', error);
    return '--:--';
  }
}
