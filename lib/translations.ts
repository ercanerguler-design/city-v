export const translations = {
  tr: {
    // Auth
    login: 'Giriş Yap',
    logout: 'Çıkış Yap',
    email: 'E-posta',
    password: 'Şifre',
    
    // Dashboard
    dashboard: 'Yönetim Paneli',
    live: 'Canlı',
    
    // Metrics
    realTimeVisitors: 'Anlık Ziyaretçi',
    dailyRevenue: 'Günlük Gelir',
    activeCamera: 'Aktif Kamera',
    avgStayTime: 'Ort. Kalış Süresi',
    
    // Staff
    staffManagement: 'Personel Yönetimi',
    newStaff: 'Yeni Personel',
    manager: 'Müdür',
    sales: 'Satış',
    technical: 'Teknik',
    cashier: 'Kasa',
    active: 'Aktif',
    onLeave: 'İzinli',
    
    // Campaigns
    campaignManagement: 'Kampanya Yönetimi',
    newCampaign: 'Yeni Kampanya',
    createCampaign: 'Kampanya Oluştur',
    campaignTitle: 'Kampanya Başlığı',
    description: 'Açıklama',
    discountRate: 'İndirim Oranı',
    startDate: 'Başlangıç Tarihi',
    endDate: 'Bitiş Tarihi',
    targetAudience: 'Hedef Kitle',
    allUsers: 'Tüm Kullanıcılar',
    newMembers: 'Yeni Üyeler',
    vipMembers: 'VIP Üyeler',
    
    // Notifications
    notifications: 'Bildirimler',
    markAsRead: 'Okundu Olarak İşaretle',
    
    // IoT
    iotDeviceMonitoring: 'IoT Cihaz İzleme',
    cameraStream: 'Kamera Yayını',
    online: 'Çevrimiçi',
    offline: 'Çevrimdışı',
    entrance: 'Giriş',
    cashRegister: 'Kasa',
    shelf: 'Raf',
    temperature: 'Sıcaklık',
    lastData: 'Son Veri',
    
    // Analytics
    detailedAnalysis: 'Detaylı Analiz',
    location: 'Konum',
    capacity: 'Kapasite',
    peopleCount: 'Kişi Sayısı',
    entries: 'Giriş',
    exits: 'Çıkış',
    density: 'Yoğunluk',
    low: 'Düşük',
    medium: 'Orta',
    high: 'Yoğun',
    critical: 'Kritik',
    zoneAnalysis: 'Bölge Analizi',
    
    // Profile
    businessProfile: 'İşletme Profili',
    businessName: 'İşletme Adı',
    businessType: 'İşletme Türü',
    address: 'Adres',
    city: 'Şehir',
    phone: 'Telefon',
    workingHours: 'Çalışma Saatleri',
    saveChanges: 'Değişiklikleri Kaydet',
    
    // Common
    save: 'Kaydet',
    cancel: 'İptal',
    edit: 'Düzenle',
    delete: 'Sil',
    search: 'Ara',
    loading: 'Yükleniyor...',
    success: 'Başarılı',
    error: 'Hata',
  },
  en: {
    // Auth
    login: 'Login',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    
    // Dashboard
    dashboard: 'Dashboard',
    live: 'Live',
    
    // Metrics
    realTimeVisitors: 'Real-time Visitors',
    dailyRevenue: 'Daily Revenue',
    activeCamera: 'Active Camera',
    avgStayTime: 'Avg. Stay Time',
    
    // Staff
    staffManagement: 'Staff Management',
    newStaff: 'New Staff',
    manager: 'Manager',
    sales: 'Sales',
    technical: 'Technical',
    cashier: 'Cashier',
    active: 'Active',
    onLeave: 'On Leave',
    
    // Campaigns
    campaignManagement: 'Campaign Management',
    newCampaign: 'New Campaign',
    createCampaign: 'Create Campaign',
    campaignTitle: 'Campaign Title',
    description: 'Description',
    discountRate: 'Discount Rate',
    startDate: 'Start Date',
    endDate: 'End Date',
    targetAudience: 'Target Audience',
    allUsers: 'All Users',
    newMembers: 'New Members',
    vipMembers: 'VIP Members',
    
    // Notifications
    notifications: 'Notifications',
    markAsRead: 'Mark as Read',
    
    // IoT
    iotDeviceMonitoring: 'IoT Device Monitoring',
    cameraStream: 'Camera Stream',
    online: 'Online',
    offline: 'Offline',
    entrance: 'Entrance',
    cashRegister: 'Cash Register',
    shelf: 'Shelf',
    temperature: 'Temperature',
    lastData: 'Last Data',
    
    // Analytics
    detailedAnalysis: 'Detailed Analysis',
    location: 'Location',
    capacity: 'Capacity',
    peopleCount: 'People Count',
    entries: 'Entries',
    exits: 'Exits',
    density: 'Density',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
    zoneAnalysis: 'Zone Analysis',
    
    // Profile
    businessProfile: 'Business Profile',
    businessName: 'Business Name',
    businessType: 'Business Type',
    address: 'Address',
    city: 'City',
    phone: 'Phone',
    workingHours: 'Working Hours',
    saveChanges: 'Save Changes',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
  }
};

export type Language = 'tr' | 'en';
export type TranslationKey = keyof typeof translations.tr;
