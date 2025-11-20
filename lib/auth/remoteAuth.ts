// Pure client-side utilities - NO server imports
interface DeviceInfo {
  fingerprint: string;
  name: string;
  userAgent: string;
  platform: string;
}

export class RemoteAuthManager {
  /**
   * Client-side token validation (without database)
   */
  static validateTokenFormat(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload.type === 'remote_access' && payload.exp > Date.now();
    } catch {
      return false;
    }
  }

  /**
   * Extract user ID from token (client-side only, no validation)
   */
  static getUserIdFromToken(token: string): number | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload.userId || null;
    } catch {
      return null;
    }
  }

  /**
   * Get device fingerprint from browser
   */
  static generateDeviceFingerprint(userAgent: string, platform: string): string {
    const canvas = typeof window !== 'undefined' ? this.getCanvasFingerprint() : '';
    const timezone = typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : '';
    const screen = typeof window !== 'undefined' ? `${screen.width}x${screen.height}` : '';
    
    const fingerprint = `${userAgent}-${platform}-${canvas}-${timezone}-${screen}`;
    return btoa(fingerprint).slice(0, 32);
  }

  private static getCanvasFingerprint(): string {
    if (typeof window === 'undefined') return '';
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('CityV Fingerprint', 2, 2);
      
      return canvas.toDataURL().slice(-32);
    } catch {
      return '';
    }
  }

  /**
   * Check if user is on business local network
   */
  static async detectNetworkType(ipAddress: string): Promise<'local' | 'remote'> {
    // Check if IP is in local network ranges
    const localRanges = [
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2\d|3[01])\./,
      /^127\./,
      /^::1$/,
      /^localhost$/
    ];

    const isLocal = localRanges.some(range => range.test(ipAddress));
    return isLocal ? 'local' : 'remote';
  }

  /**
   * Get user's location from IP
   */
  static async getLocationFromIP(ipAddress: string): Promise<string> {
    try {
      if (ipAddress === '127.0.0.1' || ipAddress.startsWith('192.168.')) {
        return 'Local Network';
      }

      const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
      const data = await response.json();
      
      return `${data.city || 'Unknown'}, ${data.country_name || 'Unknown'}`;
      
    } catch (error) {
      console.log('🌍 Location detection error:', error);
      return 'Unknown Location';
    }
  }
}

export default RemoteAuthManager;