/**
 * Cross-Platform Storage Utility
 * 
 * LocalStorage + Cookie fallback for mobile Safari issues
 * Ensures auth persistence across all devices
 */

// Cookie helper functions
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// Main storage interface
export const authStorage = {
  /**
   * Save token with localStorage + cookie fallback
   */
  setToken(token: string): boolean {
    try {
      // Primary: localStorage
      localStorage.setItem('business_token', token);
      
      // Fallback: cookie (for mobile Safari)
      setCookie('business_token', token, 7);
      
      console.log('✅ Token saved (localStorage + cookie)');
      return true;
    } catch (error) {
      console.error('❌ Token save error:', error);
      
      // If localStorage fails, try cookie only
      try {
        setCookie('business_token', token, 7);
        console.log('✅ Token saved (cookie only - localStorage blocked)');
        return true;
      } catch (cookieError) {
        console.error('❌ Cookie save also failed:', cookieError);
        return false;
      }
    }
  },

  /**
   * Get token from localStorage or cookie
   */
  getToken(): string | null {
    try {
      // Try localStorage first
      const token = localStorage.getItem('business_token');
      if (token) {
        console.log('📋 Token found in localStorage');
        return token;
      }
    } catch (error) {
      console.warn('⚠️ LocalStorage access blocked:', error);
    }

    // Fallback to cookie
    const cookieToken = getCookie('business_token');
    if (cookieToken) {
      console.log('📋 Token found in cookie (localStorage fallback)');
      return cookieToken;
    }

    console.log('❌ No token found');
    return null;
  },

  /**
   * DEPRECATED: User data artık localStorage'da tutulmuyor
   * Tüm user data /api/business/me endpoint'inden database'den çekiliyor
   */
  setUser(user: any): boolean {
    console.warn('⚠️ authStorage.setUser() DEPRECATED - User data sadece database\'de tutulur');
    return true; // Backward compatibility için
  },

  /**
   * DEPRECATED: User data artık localStorage'dan okunmuyor
   * /api/business/me endpoint'ini kullan
   */
  getUser(): any | null {
    console.warn('⚠️ authStorage.getUser() DEPRECATED - /api/business/me kullanın');
    return null;
  },

  /**
   * Clear auth token (logout)
   * User data zaten database'de, sadece token temizlenir
   */
  clear(): void {
    try {
      localStorage.removeItem('business_token');
      // business_user artık kullanılmıyor ama eski data varsa temizle
      localStorage.removeItem('business_user');
    } catch (error) {
      console.warn('⚠️ LocalStorage clear blocked:', error);
    }

    deleteCookie('business_token');
    deleteCookie('business_user');
    
    console.log('✅ Auth token cleared - User data database\'de güvende');
  },

  /**
   * Check if storage is available
   */
  isAvailable(): { localStorage: boolean; cookies: boolean } {
    const localStorageAvailable = (() => {
      try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch {
        return false;
      }
    })();

    const cookiesAvailable = (() => {
      try {
        document.cookie = 'test=1';
        const result = document.cookie.indexOf('test=') !== -1;
        document.cookie = 'test=;expires=Thu, 01 Jan 1970 00:00:00 UTC';
        return result;
      } catch {
        return false;
      }
    })();

    return { localStorage: localStorageAvailable, cookies: cookiesAvailable };
  }
};

// Mobile detection helper
export const isMobile = () => {
  if (typeof navigator === 'undefined') return false;
  return /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
};

// iOS Safari detection
export const isIOSSafari = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const webkit = /WebKit/.test(ua);
  const notChrome = !/CriOS/.test(ua);
  return iOS && webkit && notChrome;
};

// Debug info
export const getStorageDebugInfo = () => {
  const availability = authStorage.isAvailable();
  const token = authStorage.getToken();
  const user = authStorage.getUser();
  
  return {
    mobile: isMobile(),
    iosSafari: isIOSSafari(),
    localStorage: availability.localStorage,
    cookies: availability.cookies,
    hasToken: !!token,
    hasUser: !!user,
    tokenSource: token ? (localStorage.getItem('business_token') ? 'localStorage' : 'cookie') : 'none',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  };
};

export default authStorage;
