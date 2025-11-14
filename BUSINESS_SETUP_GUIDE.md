# CityV Business Dashboard - Kurulum ve Kullanım Kılavuzu

## 🚀 Özellikler

### ✅ Tamamlanan Sistemler

1. **Vercel PostgreSQL Üyelik Sistemi**
   - Kullanıcı kaydı ve girişi
   - JWT token authentication
   - Business profilleri
   - Güvenli şifre hashleme (bcrypt)

2. **Kampanya Yönetimi ve Push Notifications**
   - Kampanya oluşturma ve yönetimi
   - Vercel KV ile otomatik push bildirimi
   - Ana CityV sayfasında bildirim gösterimi
   - Hedef kitle seçimi (Tüm/Yeni/VIP üyeler)

3. **Gerçek ESP32-CAM IoT Entegrasyonu**
   - IP kamera stream entegrasyonu (192.168.1.2)
   - Canlı video feed
   - MJPEG stream desteği
   - Kamera durumu izleme

4. **AI Powered Gerçek Zamanlı Analiz** ⭐
   - TensorFlow.js COCO-SSD model
   - **Gerçek zamanlı insan sayımı** (mock data yok!)
   - **Giriş/Çıkış tracking**
   - **Yoğunluk analizi** (low/medium/high/critical)
   - **Heatmap generation** (kalabalık noktalar)
   - **Bölge bazlı analiz** (4 zone tracking)
   - **Tüm veriler veritabanına kaydediliyor**

5. **Çoklu Dil Desteği**
   - Türkçe/İngilizce
   - Context-based translation
   - localStorage ile tercih kaydı

6. **İşletme Profil Yönetimi**
   - Logo yükleme
   - İletişim bilgileri
   - Çalışma saatleri
   - Adres ve konum bilgileri

## 📦 Kurulum

### 1. Bağımlılıklar

```bash
npm install @vercel/postgres @vercel/kv bcryptjs jsonwebtoken @types/bcryptjs @types/jsonwebtoken
```

Paketler zaten yüklendi ✅

### 2. Environment Variables

`.env.local` dosyasına ekleyin:

```env
# Vercel Postgres
POSTGRES_URL="your_postgres_url"
POSTGRES_PRISMA_URL="your_prisma_url"
POSTGRES_URL_NON_POOLING="your_non_pooling_url"

# Vercel KV (Push Notifications)
KV_URL="your_kv_url"
KV_REST_API_URL="your_kv_rest_api_url"
KV_REST_API_TOKEN="your_kv_rest_api_token"

# JWT Secret
JWT_SECRET="cityv-business-secret-2024"
```

### 3. Veritabanı Kurulumu

```bash
node database/setupBusinessDatabase.js
```

Bu script otomatik olarak:
- Tüm tabloları oluşturur
- Demo kullanıcı ekler (demo@cityv.com / demo123)
- Demo kamera ekler (192.168.1.2)
- İndeksleri oluşturur

## 🎯 Kullanım

### Demo Giriş

```
Email: demo@cityv.com
Şifre: demo123
```

### Kamera Yapılandırması

ESP32-CAM IP adresinizi güncelleyin:

`app/business/page.tsx` içinde:

```tsx
<ESP32CameraStream
  cameraIp="192.168.1.2"  // BURAYA KENDİ IP'NİZİ YAZIN
  cameraName="Ana Giriş Kamerası"
  location="Giriş"
  businessId={businessId}
  onAnalyticsUpdate={handleAnalyticsUpdate}
/>
```

### ESP32-CAM Ayarları

Kameranız şu formatta stream sunmalı:
- MJPEG stream: `http://192.168.1.2:81/stream`
- Çözünürlük: 640x480 veya daha yüksek
- CORS ayarları açık olmalı

## 🧠 AI Analiz Nasıl Çalışır?

### 1. Model Yükleme
```typescript
await tf.ready();
const model = await cocoSsd.load();
```

### 2. Frame-by-Frame Analiz
```typescript
const predictions = await model.detect(videoFrame);
const people = predictions.filter(pred => pred.class === 'person');
```

### 3. Gerçek Zamanlı Tracking
- **Giriş/Çıkış**: Önceki frame ile karşılaştırma
- **Heatmap**: Kişi pozisyonlarından yoğunluk haritası
- **Zone Analysis**: Frame'i 4 bölgeye bölerek analiz
- **Density**: Kişi sayısına göre yoğunluk seviyesi

### 4. Veritabanına Kayıt
Her 5 saniyede bir:
```typescript
POST /api/business/cameras/analytics
{
  currentPeople: 15,
  entriesCount: 45,
  exitsCount: 30,
  densityLevel: 'high',
  heatmapData: [...],
  zones: { 'Sol Üst': 3, 'Sağ Üst': 5, ... }
}
```

## 📊 API Endpoints

### Authentication
- `POST /api/business/register` - Kayıt ol
- `POST /api/business/login` - Giriş yap

### Campaigns
- `POST /api/business/campaigns` - Kampanya oluştur
- `GET /api/business/campaigns?businessId={id}` - Kampanyaları getir

### Camera Analytics
- `POST /api/business/cameras/analytics` - Analytics kaydet
- `GET /api/business/cameras/analytics?cameraIp={ip}` - Analytics getir

### Profile
- `GET /api/business/profile?businessId={id}` - Profil getir
- `PUT /api/business/profile` - Profil güncelle

### Notifications
- `GET /api/notifications` - Bildirimleri getir

## 🎨 Özellik Detayları

### Dashboard Tabs

1. **Dashboard** - Ana metrikler ve gerçek zamanlı veri
2. **Kameralar** - Canlı stream ve AI analizi
3. **Kampanyalar** - Kampanya oluştur ve yönet
4. **Profil** - İşletme bilgilerini düzenle

### Gerçek Zamanlı Veriler

✅ **GERÇEk VERİLER** (TensorFlow.js'den geliyor):
- İçerideki kişi sayısı
- Giriş sayısı (tracking ile)
- Çıkış sayısı (tracking ile)
- Yoğunluk seviyesi (hesaplanan)
- Heatmap koordinatları (AI detection)
- Bölge analizi (AI detection)

❌ **SİMÜLE EDİLEN** (henüz gerçek sistemle entegre değil):
- Günlük gelir (POS sistemi gerekli)
- Ortalama kalış süresi (gelişmiş tracking gerekli)

## 🔒 Güvenlik

- Şifreler bcrypt ile hashlenmiş
- JWT token ile authentication
- SQL injection koruması (@vercel/postgres)
- CORS yapılandırması
- Environment variables ile secret yönetimi

## 📱 Dil Değiştirme

Sağ üst köşede TR/EN butonları ile dil değiştirilebilir.
Tercih localStorage'a kaydedilir.

## 🎯 Sonraki Adımlar

Sistemi tam çalışır hale getirmek için:

1. ✅ Vercel Postgres database bağlantısı yapılandır
2. ✅ Vercel KV bağlantısı yapılandır
3. ✅ ESP32-CAM IP adresini güncelle
4. ✅ Demo kullanıcı ile giriş yap
5. ✅ Kameralar sekmesinde canlı stream'i aç
6. ✅ AI analizi gerçek zamanlı çalışacak
7. ✅ Kampanya oluştur ve push notification test et

## 🐛 Troubleshooting

### Kamera Stream Çalışmıyor
- ESP32-CAM IP adresini kontrol edin
- Stream URL'sinin doğru olduğundan emin olun
- CORS ayarlarını kontrol edin
- Browser console'da hata mesajlarına bakın

### AI Analizi Çalışmıyor
- TensorFlow.js model'in yüklendiğinden emin olun
- Console'da "✅ TensorFlow.js model yüklendi" mesajını görmelisiniz
- Video stream'in aktif olduğundan emin olun
- GPU/WebGL desteğini kontrol edin

### Database Hataları
- Environment variables'ları kontrol edin
- `node database/setupBusinessDatabase.js` komutunu çalıştırın
- Vercel dashboard'dan database bağlantısını test edin

## 📞 İletişim

Herhangi bir sorun için GitHub issues kullanın.

---

**NOT**: Bu sistem gerçek AI analizi kullanır, mock data kullanmaz! TensorFlow.js ile canlı video stream'den insan tespiti yapar ve tüm verileri veritabanına kaydeder.
