# 🚀 CityV Business Dashboard - HAZIR!

## ✅ Tamamlanan Özellikler

### 1. **Profesyonel Dashboard** (`/business/dashboard`)
- ✅ Modern sidebar navigation
- ✅ Responsive tasarım
- ✅ 6 ana bölüm: Overview, Kameralar, Konum, Menü, Analitik, Ayarlar
- ✅ User profile + logout
- ✅ Real-time metrics cards

### 2. **Kamera Yönetimi** (TAM ÖZELLİKLİ!)
#### Kamera Listesi
- ✅ Grid görünümü + durum göstergeleri (active/offline/error)
- ✅ IP, port, çözünürlük, FPS bilgileri
- ✅ Giriş/çıkış/içerideki kişi sayısı istatistikleri
- ✅ Plan limiti kontrolü (Premium: 10, Enterprise: 50)

#### Kamera Ekleme
- ✅ IP + Port girişi
- ✅ Stream path özelleştirme (/stream, /cam-hi.jpg vb.)
- ✅ Username/Password (opsiyonel, RTSP için)
- ✅ Lokasyon açıklaması
- ✅ Bağlantı test butonu

#### Kalibrasyon Aracı
- ✅ Canvas üzerinde giriş-çıkış çizgisi çizme
- ✅ Yeşil nokta (giriş), kırmızı nokta (çıkış)
- ✅ 4 yön seçeneği: ↑ ↓ → ←
- ✅ Canlı kamera görüntüsü üzerinde çizim
- ✅ Database'e kaydetme (calibration_line, entry_direction)

#### Bölge Çizim Aracı
- ✅ Polygon çizimi (masa, kasa, giriş, depo)
- ✅ Çoklu bölge tanımlama
- ✅ Renk kodlu bölgeler
- ✅ Bölge adlandırma
- ✅ Database'e zones array olarak kaydetme

#### Canlı İzleme
- ✅ Full screen modal
- ✅ Kamera stream gösterimi

### 3. **Lokasyon Yönetimi**
- ✅ Otomatik konum algılama (Geolocation API)
- ✅ Manuel enlem/boylam girişi
- ✅ Adres, şehir, ilçe bilgileri
- ✅ Google Maps önizleme (iframe)
- ✅ Database güncelleme API'si

### 4. **Menü & Fiyat Listesi**
- ✅ Kategori ekleme/düzenleme
- ✅ Ürün listesi görüntüleme
- ✅ Emoji icon desteği
- ✅ Fiyat + indirimli fiyat
- ✅ Database: business_menu_categories + business_menu_items

### 5. **Database & API'ler**
#### Tablolar:
- ✅ `business_cameras` - zones (JSONB), calibration_line (JSONB)
- ✅ `business_camera_snapshots` - Zaman serisi verileri
- ✅ `business_menu_categories` - Menü kategorileri
- ✅ `business_menu_items` - Ürünler (allergen, dietary, calories)

#### API Endpoints:
- ✅ `/api/business/cameras` - GET/POST/PUT/DELETE
- ✅ `/api/business/location` - GET/PUT
- ✅ `/api/business/menu` - GET/POST/PUT/DELETE
- ✅ `/api/business/menu/categories` - GET/POST/PUT/DELETE

## 📋 Kurulum Adımları

### 1. Database'i Hazırla
```sql
-- Vercel Postgres'te çalıştır:
\c veritabanı_adı

-- Tabloları oluştur
\i database/business-complete-system.sql
```

### 2. Server'ı Başlat
```powershell
npm run dev
```

### 3. Test Et

#### A) Business Login
```
URL: http://localhost:3000/business/login
Email: ercanerguler1@gmail.com
Password: (database'deki hash)
```

#### B) Dashboard'a Gir
Login sonrası otomatik `/business/dashboard` yönlendirmesi

#### C) Kamera Ekle
1. "Kamera Ekle" butonuna tıkla
2. **Test için örnek:**
   - Kamera Adı: "Giriş Kapısı"
   - IP: 192.168.1.100
   - Port: 80
   - Stream Path: /stream
3. "Test Et" ile bağlantıyı kontrol et
4. "Kamera Ekle"

#### D) Kalibrasyon Yap
1. Kamera kartında "Kalibrasyon" butonuna tıkla
2. Canvas üzerinde 2 nokta belirle (yeşil → kırmızı)
3. Yön seçimi yap
4. "Kaydet"

#### E) Bölge Çiz
1. "Bölgeler" butonuna tıkla
2. Bölge adı ve tipi seç (Masa, Kasa, Giriş, Depo)
3. Canvas'ta en az 3 nokta tıkla
4. "Bölgeyi Tamamla"
5. Birden fazla bölge ekleyebilirsin
6. "Kaydet"

#### F) Konum Ayarla
1. "Konum Yönetimi" sekmesine git
2. "Otomatik Algıla" ile GPS kullan
3. Veya manuel enlem/boylam gir
4. "Kaydet"
5. Google Maps önizlemesi görünecek

#### G) Menü Ekle
1. "Menü & Fiyatlar" sekmesine git
2. "Kategori Ekle" → "İçecekler" 🥤
3. Kategori içine ürün ekle (şu an basic)

## 🎯 ESP32 Entegrasyonu

### ESP32'den Veri Gönderme

```cpp
// ESP32-CAM kodunda:
void sendCrowdData() {
  HTTPClient http;
  http.begin("http://cityv-api.vercel.app/api/iot/crowd-analysis");
  http.addHeader("Content-Type", "application/json");
  
  String payload = "{";
  payload += "\"camera_id\": 1,";
  payload += "\"entries_count\": " + String(entriesCount) + ",";
  payload += "\"exits_count\": " + String(exitsCount) + ",";
  payload += "\"current_people\": " + String(currentPeople) + ",";
  payload += "\"zone_data\": " + zoneDataJSON;
  payload += "}";
  
  int httpCode = http.POST(payload);
  http.end();
}
```

### Backend'de İşleme
API endpoint zaten var: `/api/business/cameras` PUT ile güncellenir

## 🔥 Özellikler

### Business Kullanıcıları İçin:
✅ Kolay kamera ekleme (sadece IP gir)
✅ Kalibrasyon çizgisi çizme (fare ile)
✅ Bölge tanımlama (poligon çizimi)
✅ Giriş-çıkış sayımı (real-time)
✅ Yoğunluk analizi (bölge bazlı)
✅ Menü & fiyat yönetimi
✅ Konum belirleme (otomatik + manuel)
✅ Canlı kamera izleme

### CityV Anasayfada Görünüm:
✅ Business konumları haritada
✅ Gerçek zamanlı yoğunluk gösterimi
✅ Kampanya bilgileri
✅ Menü erişimi
✅ Yol tarifi

## 🎨 UI/UX Detayları

- **Renk Paleti**: Blue-600 (ana), Purple-600 (vurgu), Green-500 (başarı), Red-500 (hata)
- **Animasyonlar**: Framer Motion (smooth transitions)
- **Icons**: Lucide React (modern, consistent)
- **Responsive**: Mobile-first design
- **Toast Notifications**: react-hot-toast

## 🐛 Bilinen Sınırlamalar

1. **Kamera Stream**: CORS sorunu olabilir - ESP32'de Access-Control-Allow-Origin header ekle
2. **Image Upload**: Menü görselleri için Cloudinary/S3 entegrasyonu eklenebilir
3. **Real-time Updates**: WebSocket henüz yok - polling kullanılıyor (30 saniye)
4. **Analytics**: Grafikler placeholder - Chart.js eklenecek

## 🚀 Production Deployment

### Vercel'e Deploy
```bash
vercel --prod
```

### Env Variables (Vercel Dashboard)
```
DATABASE_URL=postgresql://...
JWT_SECRET=cityv-business-secret-2024
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

## 📞 Destek

Herhangi bir sorun için:
- Database tabloları kontrol et
- Browser console log'larına bak
- Network tab'da API response'ları incele

---

**BAŞARILI! Müşteriye hazır profesyonel sistem! 🎉**
