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

export function isLocationOpen(location: any): { isOpen: boolean; reason?: string } {
  if (!location.workingHours) {
    return { isOpen: true };
  }

  const hours = location.workingHours;
  
  // 24 saat açık
  if (hours.is24Hours) {
    return { isOpen: true };
  }

  // Parklar her zaman açık
  if (location.category === 'park') {
    return { isOpen: true, reason: 'Her zaman açık' };
  }

  // Pazar kontrolü
  if (isSunday()) {
    if (!hours.sunday || hours.sunday.toLowerCase() === 'kapalı') {
      return { isOpen: false, reason: 'Pazar günü kapalı' };
    }
    // Nöbetçi eczane kontrolü
    if (location.category === 'pharmacy' && hours.isOnDuty) {
      return { isOpen: true, reason: 'Nöbetçi Eczane' };
    }
  }

  // Cumartesi kontrolü
  if (isSaturday()) {
    if (!hours.saturday || hours.saturday.toLowerCase() === 'kapalı') {
      return { isOpen: false, reason: 'Cumartesi kapalı' };
    }
    // Nöbetçi eczane kontrolü
    if (location.category === 'pharmacy' && hours.isOnDuty) {
      return { isOpen: true, reason: 'Nöbetçi Eczane' };
    }
  }

  return { isOpen: true };
}

export function getWorkingHoursText(location: any): string {
  if (!location.workingHours) {
    return 'Bilinmiyor';
  }

  const hours = location.workingHours;
  
  // Parklar
  if (location.category === 'park') {
    return 'Her Zaman Açık';
  }
  
  if (hours.is24Hours) {
    return '7/24 Açık';
  }

  if (isSunday()) {
    // Nöbetçi eczane özel durumu
    if (location.category === 'pharmacy' && hours.isOnDuty) {
      return 'Nöbetçi Eczane (24 Saat)';
    }
    return hours.sunday || 'Kapalı';
  }

  if (isSaturday()) {
    // Nöbetçi eczane özel durumu
    if (location.category === 'pharmacy' && hours.isOnDuty) {
      return 'Nöbetçi Eczane (24 Saat)';
    }
    return hours.saturday || 'Kapalı';
  }

  return hours.weekday;
}

// Kategoriye göre hafta sonu durumu
export function getDefaultWorkingHours(category: string) {
  switch (category) {
    case 'bank':
    case 'notary':
    case 'public':
      return {
        weekday: '09:00-17:00',
        saturday: 'Kapalı',
        sunday: 'Kapalı',
      };
    case 'hospital':
      return {
        weekday: '24 Saat',
        is24Hours: true,
      };
    case 'pharmacy':
      // Nöbetçi eczane sistemi: Pazar ve Cumartesi rastgele %20 ihtimal nöbetçi
      const isOnDutySunday = Math.random() < 0.2; // %20 ihtimal nöbetçi
      const isOnDutySaturday = Math.random() < 0.15; // %15 ihtimal nöbetçi
      return {
        weekday: '09:00-19:00',
        saturday: isOnDutySaturday ? 'Nöbetçi Eczane (24 Saat)' : '09:00-19:00',
        sunday: isOnDutySunday ? 'Nöbetçi Eczane (24 Saat)' : 'Kapalı',
        isOnDuty: isOnDutySunday || isOnDutySaturday,
      };
    case 'cafe':
    case 'market':
      return {
        weekday: '08:00-22:00',
        saturday: '08:00-22:00',
        sunday: '09:00-21:00',
      };
    case 'park':
      // Parklar ASLA kapalı olmaz
      return {
        weekday: '24 Saat Açık',
        saturday: '24 Saat Açık',
        sunday: '24 Saat Açık',
        is24Hours: true,
      };
    case 'shopping':
      return {
        weekday: '10:00-22:00',
        saturday: '10:00-22:00',
        sunday: '10:00-21:00',
      };
    case 'restaurant':
      return {
        weekday: '10:00-23:00',
        saturday: '10:00-00:00',
        sunday: '10:00-23:00',
      };
    case 'gas_station':
      return {
        weekday: '24 Saat',
        saturday: '24 Saat',
        sunday: '24 Saat',
        is24Hours: true,
      };
    case 'school':
    case 'library':
      return {
        weekday: '08:00-17:00',
        saturday: 'Kapalı',
        sunday: 'Kapalı',
      };
    case 'post_office':
      return {
        weekday: '08:30-17:30',
        saturday: 'Kapalı',
        sunday: 'Kapalı',
      };
    case 'police':
      return {
        weekday: '24 Saat',
        saturday: '24 Saat',
        sunday: '24 Saat',
        is24Hours: true,
      };
    case 'mosque':
      return {
        weekday: '05:00-23:00',
        saturday: '05:00-23:00',
        sunday: '05:00-23:00',
      };
    case 'cinema':
      return {
        weekday: '10:00-01:00',
        saturday: '10:00-02:00',
        sunday: '10:00-00:00',
      };
    case 'beauty':
      return {
        weekday: '09:00-19:00',
        saturday: '09:00-19:00',
        sunday: '10:00-18:00',
      };
    case 'pet':
      return {
        weekday: '09:00-19:00',
        saturday: '09:00-19:00',
        sunday: '10:00-17:00',
      };
    case 'electronics':
    case 'clothing':
      return {
        weekday: '10:00-20:00',
        saturday: '10:00-21:00',
        sunday: '11:00-20:00',
      };
    case 'gym':
      return {
        weekday: '06:00-23:00',
        saturday: '08:00-22:00',
        sunday: '09:00-21:00',
      };
    default:
      return {
        weekday: '09:00-18:00',
        saturday: '09:00-18:00',
        sunday: 'Kapalı',
      };
  }
}
