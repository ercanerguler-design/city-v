// Çalışma saatleri yardımcı fonksiyonları
export function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6; // 0 = Pazar, 6 = Cumartesi
}

export function isSaturday(): boolean {
  return new Date().getDay() === 6;
}

export function isSunday(): boolean {
  return new Date().getDay() === 0;
}

export function getCurrentDayName(): string {
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return days[new Date().getDay()];
}

/**
 * Google API'den gelen gerçek çalışma saatlerini kontrol et
 */
function checkRealWorkingHours(workingHours: any, now: Date): { isOpen: boolean, reason?: string } {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayName = dayNames[now.getDay()];
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  // 24 saat açık mı kontrol et
  if (workingHours.isOpen24Hours) {
    return { isOpen: true, reason: '24 saat açık' };
  }

  // Bugünkü çalışma saatleri
  const todayHours = workingHours[currentDayName];
  
  // Check if closed - support both 'closed: true' and 'isOpen: false' formats
  const isClosed = todayHours?.closed === true || todayHours?.isOpen === false;
  
  if (!todayHours || isClosed) {
    const dayNamesTurkish = {
      sunday: 'Pazar',
      monday: 'Pazartesi', 
      tuesday: 'Salı',
      wednesday: 'Çarşamba',
      thursday: 'Perşembe',
      friday: 'Cuma',
      saturday: 'Cumartesi'
    };
    
    return { 
      isOpen: false, 
      reason: `${dayNamesTurkish[currentDayName as keyof typeof dayNamesTurkish]} günü kapalı` 
    };
  }

  // Saat aralığını kontrol et - güvenli parse
  // ✅ FIX: Önce 'open'/'close' kullan (daha güvenilir), fallback 'openTime'/'closeTime'
  const openTimeStr = todayHours.open || todayHours.openTime;
  const closeTimeStr = todayHours.close || todayHours.closeTime;

  if (!openTimeStr || !closeTimeStr) {
    console.warn('⚠️ Working hours format error:', { 
      todayHours, 
      currentDayName,
      openTimeStr,
      closeTimeStr 
    });
    return { isOpen: false, reason: 'Çalışma saatleri belirtilmemiş' };
  }

  const [openHour, openMinute] = openTimeStr.split(':').map(Number);
  const [closeHour, closeMinute] = closeTimeStr.split(':').map(Number);
  
  const openTime = openHour * 60 + openMinute;
  const closeTime = closeHour * 60 + closeMinute;

  // Gece yarısı geçen işletmeler için (örn: 22:00 - 02:00)
  if (closeTime < openTime) {
    const isOpenNow = currentTime >= openTime || currentTime <= closeTime;
    if (!isOpenNow) {
      return { 
        isOpen: false, 
        reason: `${openTimeStr} - ${closeTimeStr} saatleri arasında açık` 
      };
    }
  } else {
    // Normal saat aralığı (örn: 09:00 - 18:00)
    const isOpenNow = currentTime >= openTime && currentTime <= closeTime;
    if (!isOpenNow) {
      return { 
        isOpen: false, 
        reason: `${openTimeStr} - ${closeTimeStr} saatleri arasında açık` 
      };
    }
  }

  return { isOpen: true };
}

export function isLocationOpen(location: any): { isOpen: boolean, reason?: string } {
  const now = new Date();

  // Working hours'ı kontrol et (hem workingHours hem working_hours destekle)
  const workingHours = location.workingHours || location.working_hours;
  
  // Eğer working hours varsa ve object ise, gerçek kontrol yap
  if (workingHours && typeof workingHours === 'object' && Object.keys(workingHours).length > 0) {
    return checkRealWorkingHours(workingHours, now);
  }

  // Working hours yoksa - varsayılan olarak açık kabul et
  return { isOpen: true, reason: undefined };
}

export function getWorkingHoursText(location: any): string {
  // Business locations için working_hours'ı kullan
  const workingHours = location.workingHours || location.working_hours;
  if (location.isBusiness && workingHours && typeof workingHours === 'object') {
    const hours = workingHours;
    
    if (hours.is24Hours || hours.isOpen24Hours) {
      return '7/24 Açık';
    }

    const currentDay = getCurrentDayName();
    
    // Günlük çalışma saatlerini kontrol et
    if (hours[currentDay]) {
      const dayHours = hours[currentDay];
      
      // Object formatı { isOpen: true, openTime: "09:00", closeTime: "18:00" }
      if (typeof dayHours === 'object' && dayHours.isOpen !== undefined) {
        if (!dayHours.isOpen) {
          return 'Kapalı';
        }
        return `${dayHours.openTime} - ${dayHours.closeTime}`;
      }
      
      // String formatı "09:00-18:00"
      if (typeof dayHours === 'string') {
        return dayHours;
      }
    }

    // Fallback: weekday/saturday/sunday formatı
    if (isSunday() && hours.sunday) {
      const sundayHours = hours.sunday;
      if (typeof sundayHours === 'object' && sundayHours.isOpen !== undefined) {
        return sundayHours.isOpen ? `${sundayHours.openTime} - ${sundayHours.closeTime}` : 'Kapalı';
      }
      return sundayHours;
    }

    if (isSaturday() && hours.saturday) {
      const saturdayHours = hours.saturday;
      if (typeof saturdayHours === 'object' && saturdayHours.isOpen !== undefined) {
        return saturdayHours.isOpen ? `${saturdayHours.openTime} - ${saturdayHours.closeTime}` : 'Kapalı';
      }
      return saturdayHours;
    }

    // Weekday fallback
    const weekdayHours = hours.weekday;
    if (typeof weekdayHours === 'object' && weekdayHours.isOpen !== undefined) {
      return weekdayHours.isOpen ? `${weekdayHours.openTime} - ${weekdayHours.closeTime}` : 'Kapalı';
    }
    
    return weekdayHours || 'Bilinmiyor';
  }

  // Static locations için - çalışma saati bilgisi yok
  return 'Bilinmiyor';
}

// getDefaultWorkingHours fonksiyonu kaldırıldı
// Artık sadece business_profiles tablosundaki working_hours kullanılıyor
