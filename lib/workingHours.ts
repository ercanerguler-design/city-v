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
  // Backward compatibility: 'open'/'close' veya 'openTime'/'closeTime' formatını destekle
  const openTimeStr = todayHours.openTime || todayHours.open;
  const closeTimeStr = todayHours.closeTime || todayHours.close;

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
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute; // Dakika cinsinden
  const dayOfWeek = now.getDay(); // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi

  // Business'tan gelen working_hours'ı KULLANILABİLİR formatta kontrol et
  if (location.workingHours && typeof location.workingHours === 'object') {
    return checkRealWorkingHours(location.workingHours, now);
  }
  
  // Kategori bazlı gerçekçi çalışma saatleri (Türkiye standartları)
  const category = location.category?.toLowerCase() || '';
  
  // 7/24 AÇIK YERLER
  if (category.includes('hospital') || category.includes('emergency') || 
      category.includes('pharmacy') && location.name?.includes('Nöbetçi')) {
    return { isOpen: true, reason: '24 saat hizmet' };
  }
  
  // GAS STATION (Çoğu 6-24 arası)
  if (category.includes('gas') || category.includes('petrol')) {
    const isOpen = currentTime >= 360 && currentTime <= 1440; // 06:00 - 24:00
    return { isOpen, reason: isOpen ? undefined : '06:00 - 24:00 saatleri arasında açık' };
  }
  
  // BANKALAR - Türkiye Standartı
  if (category.includes('bank') || category.includes('atm')) {
    if (dayOfWeek === 0) return { isOpen: false, reason: 'Pazar günü kapalı' };
    if (dayOfWeek === 6) { // Cumartesi yarım gün
      const isOpen = currentTime >= 540 && currentTime <= 780; // 09:00 - 13:00
      return { isOpen, reason: isOpen ? undefined : 'Cumartesi 09:00 - 13:00 arası açık' };
    }
    const isOpen = currentTime >= 540 && currentTime <= 1020; // Hafta içi 09:00 - 17:00
    return { isOpen, reason: isOpen ? undefined : 'Hafta içi 09:00 - 17:00 arası açık' };
  }
  
  // Kategori bazlı fallback kontrol (Google API'den veri gelmediyse)
  console.log(`⚠️ ${location.name || 'Bilinmeyen yer'} için Google çalışma saati yok, kategori bazlı tahmin kullanılıyor: ${category}`);
  
  // DEVLET DAİRELERİ
  if (category.includes('government') || category.includes('municipality') || category.includes('post')) {
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { isOpen: false, reason: 'Hafta sonu kapalı' };
    }
    const isOpen = currentTime >= 480 && currentTime <= 1020; // 08:00 - 17:00
    return { isOpen, reason: isOpen ? undefined : '08:00 - 17:00 arası açık' };
  }
  
  // OKULLAR VE ÜNİVERSİTELER
  if (category.includes('school') || category.includes('university')) {
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { isOpen: false, reason: 'Hafta sonu kapalı' };
    }
    const isOpen = currentTime >= 480 && currentTime <= 1080; // 08:00 - 18:00
    return { isOpen, reason: isOpen ? undefined : '08:00 - 18:00 arası açık' };
  }
  
  // CAFE VE KAHVEHANE
  if (category.includes('cafe') || category.includes('coffee')) {
    const isOpen = currentTime >= 420 && currentTime <= 1380; // 07:00 - 23:00
    return { isOpen, reason: isOpen ? undefined : '07:00 - 23:00 arası açık' };
  }
  
  // RESTORAN VE YEMEK YERLERİ
  if (category.includes('restaurant') || category.includes('food')) {
    const isOpen = currentTime >= 630 && currentTime <= 1440; // 10:30 - 24:00
    return { isOpen, reason: isOpen ? undefined : '10:30 - 24:00 arası açık' };
  }
  
  // AVM VE MAĞAZALAR
  if (category.includes('mall') || category.includes('shopping')) {
    if (dayOfWeek === 0) { // Pazar özel saatler
      const isOpen = currentTime >= 720 && currentTime <= 1200; // 12:00 - 20:00
      return { isOpen, reason: isOpen ? undefined : 'Pazar 12:00 - 20:00 arası açık' };
    }
    const isOpen = currentTime >= 600 && currentTime <= 1320; // 10:00 - 22:00
    return { isOpen, reason: isOpen ? undefined : '10:00 - 22:00 arası açık' };
  }
  
  // MARKET VE SÜPERMARKET
  if (category.includes('market') || category.includes('grocery')) {
    const isOpen = currentTime >= 480 && currentTime <= 1320; // 08:00 - 22:00
    return { isOpen, reason: isOpen ? undefined : '08:00 - 22:00 arası açık' };
  }
  
  // ECZANE (Normal eczaneler)
  if (category.includes('pharmacy') && !location.name?.includes('Nöbetçi')) {
    if (dayOfWeek === 0) {
      return { isOpen: false, reason: 'Pazar günü çoğu eczane kapalı' };
    }
    const isOpen = currentTime >= 540 && currentTime <= 1200; // 09:00 - 20:00
    return { isOpen, reason: isOpen ? undefined : '09:00 - 20:00 arası açık' };
  }
  
  // GÜZELLİK SALONU, KUAFÖR
  if (category.includes('beauty') || category.includes('hair')) {
    if (dayOfWeek === 0) {
      return { isOpen: false, reason: 'Pazar günü kapalı' };
    }
    const isOpen = currentTime >= 540 && currentTime <= 1140; // 09:00 - 19:00
    return { isOpen, reason: isOpen ? undefined : '09:00 - 19:00 arası açık' };
  }
  
  // FITNESS VE SPOR SALONLARI
  if (category.includes('gym') || category.includes('fitness')) {
    const isOpen = currentTime >= 360 && currentTime <= 1380; // 06:00 - 23:00
    return { isOpen, reason: isOpen ? undefined : '06:00 - 23:00 arası açık' };
  }
  
  // CAMİ VE İBADETHANE - Her zaman açık
  if (category.includes('mosque') || category.includes('church') || category.includes('worship')) {
    return { isOpen: true, reason: 'İbadethane - her zaman açık' };
  }
  
  // PARK VE AÇIK ALANLAR
  if (category.includes('park') || category.includes('square')) {
    const isOpen = currentTime >= 300 && currentTime <= 1380; // 05:00 - 23:00
    return { isOpen, reason: isOpen ? undefined : '05:00 - 23:00 arası açık' };
  }
  
  // VARSAYILAN: Genel işyerleri (09:00 - 18:00, Pazar kapalı)
  if (dayOfWeek === 0) {
    return { isOpen: false, reason: 'Pazar günü kapalı' };
  }
  const isOpen = currentTime >= 540 && currentTime <= 1080; // 09:00 - 18:00
  return { isOpen, reason: isOpen ? undefined : '09:00 - 18:00 arası açık' };
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
    // Sağlık hizmetleri
    case 'hospital':
    case 'doctor':
    case 'dentist':
    case 'veterinary_care':
      return {
        weekday: '08:00-18:00',
        saturday: '08:00-13:00',
        sunday: 'Kapalı',
        is24Hours: category === 'hospital', // Hastaneler 7/24
      };
    case 'pharmacy':
      return {
        weekday: '08:30-19:30',
        saturday: '09:00-19:00',
        sunday: '10:00-18:00',
        isOnDuty: Math.random() < 0.2, // %20 şansla nöbetçi
      };
    // Eğitim kurumları
    case 'school':
    case 'university':
    case 'library':
      return {
        weekday: '08:00-17:00',
        saturday: '09:00-16:00',
        sunday: 'Kapalı',
      };
    // Resmi kurumlar
    case 'government':
    case 'post_office':
    case 'courthouse':
    case 'city_hall':
    case 'embassy':
      return {
        weekday: '08:30-17:30',
        saturday: 'Kapalı',
        sunday: 'Kapalı',
      };
    // Hukuki hizmetler
    case 'lawyer':
    case 'accounting':
      return {
        weekday: '09:00-18:00',
        saturday: '09:00-13:00',
        sunday: 'Kapalı',
      };
    // Teknik hizmetler
    case 'plumber':
    case 'electrician':
    case 'locksmith':
    case 'painter':
    case 'roofing_contractor':
      return {
        weekday: '08:00-18:00',
        saturday: '08:00-16:00',
        sunday: 'Acil durumlar',
        emergencyService: true,
      };
    // Emlak ve taşımacılık
    case 'real_estate_agency':
    case 'moving_company':
    case 'car_rental':
    case 'car_dealer':
      return {
        weekday: '09:00-19:00',
        saturday: '09:00-18:00',
        sunday: '11:00-17:00',
      };
    // Depolama ve lojistik
    case 'storage':
    case 'warehouse':
      return {
        weekday: '07:00-19:00',
        saturday: '08:00-16:00',
        sunday: 'Kapalı',
      };
    // Turizm ve seyahat
    case 'travel_agency':
    case 'tourist_attraction':
    case 'amusement_park':
      return {
        weekday: '09:00-18:00',
        saturday: '09:00-19:00',
        sunday: '10:00-18:00',
      };
    // Çiçekçi ve peyzaj
    case 'florist':
    case 'garden_center':
      return {
        weekday: '08:00-19:00',
        saturday: '08:00-20:00',
        sunday: '09:00-18:00',
      };
    // İçki satışı
    case 'liquor_store':
      return {
        weekday: '10:00-22:00',
        saturday: '10:00-22:00',
        sunday: '12:00-20:00',
      };
    // Çamaşırhane
    case 'laundry':
      return {
        weekday: '07:00-21:00',
        saturday: '08:00-20:00',
        sunday: '09:00-19:00',
      };
    // Hardware store
    case 'hardware_store':
      return {
        weekday: '08:00-19:00',
        saturday: '08:00-18:00',
        sunday: '09:00-16:00',
      };
    default:
      return {
        weekday: '09:00-18:00',
        saturday: '09:00-18:00',
        sunday: 'Kapalı',
      };
  }
}
