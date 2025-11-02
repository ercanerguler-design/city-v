# 🚀 VERCEL LANSMAN REHBERİ - HIZLI

## ✅ ŞU AN SİSTEM DURUMU

Sistem **Python AI olmadan** çalışmaya hazır! ESP32'den gelen fotoğraflar direkt Next.js API'ye gidiyor ve veritabanına kaydediliyor.

## 📋 HIZLI LANSMAN ADIMLARI

### 1. Vercel'e Deploy Et (2 dakika)

```bash
# Vercel CLI yüklü değilse
npm install -g vercel

# Deploy et
vercel --prod
```

**Alternatif**: GitHub'dan deploy et
1. GitHub'a push yap
2. Vercel.com'a git
3. "Import Project" → GitHub repo seç
4. Deploy et

### 2. Vercel URL'ini Al

Deploy sonrası Vercel sana URL verecek:
```
https://cityv-xxxxx.vercel.app
```

### 3. ESP32'yi Güncelle

`esp32-cam-cityv.ino` dosyasında 57. satırı değiştir:

```cpp
// ÖNCE:
String API_BASE_URL = "http://192.168.1.12:3000/api";

// SONRA (kendi Vercel URL'inle):
String API_BASE_URL = "https://cityv-xxxxx.vercel.app/api";
```

### 4. ESP32'ye Yükle

Arduino IDE'de:
1. Dosyayı aç
2. COM portunu seç
3. Upload et

### 5. Test Et!

ESP32 açıldığında:
- Serial monitör'de log göreceksin
- Her 5 saniyede bir fotoğraf gönderecek
- `http://[ESP32-IP]/status` adresinden durumu kontrol et

## 🗄️ VERCEL ENVIRONMENT VARIABLES

Vercel dashboard → Settings → Environment Variables:

```
POSTGRES_URL=postgresql://...
DATABASE_URL=postgresql://...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx
```

*(Bunlar zaten mevcut olmalı - kontrol et)*

## ✅ ÇALIŞAN SİSTEM

1. **ESP32-CAM** → Fotoğraf çeker (UXGA 1600x1200)
2. **Next.js API** → `/api/iot/crowd-analysis` endpoint'i
3. **PostgreSQL** → `iot_crowd_analysis` tablosuna kayıt
4. **Frontend** → Dashboard'da canlı veri

## 🔍 SORUN GİDERME

### ESP32 bağlanamıyor?
```cpp
// HTTP durumu kontrol et
Serial.println("✅ HTTP: " + String(httpCode));
```

### Database kaydetmiyor?
Vercel logs kontrol et:
```bash
vercel logs
```

### CORS hatası?
API route'lar zaten CORS'a açık:
```typescript
headers: {
  'Access-Control-Allow-Origin': '*'
}
```

## 📊 BAŞARI KONTROLÜ

1. **ESP32 Serial Monitor**:
   ```
   ✅ HTTP: 200
   ✅ Analiz kaydedildi! ID: 123
   ```

2. **Vercel Logs**:
   ```
   ✓ POST /api/iot/crowd-analysis 200
   ```

3. **Database Kontrol**:
   ```sql
   SELECT * FROM iot_crowd_analysis ORDER BY analysis_timestamp DESC LIMIT 5;
   ```

## 🎯 LANSMAN CHECKLIST

- [ ] Vercel'e deploy edildi
- [ ] Vercel URL alındı
- [ ] ESP32 firmware güncellendi
- [ ] ESP32'ye yüklendi
- [ ] Test fotoğrafı gönderildi
- [ ] Database'de kayıt görüldü
- [ ] Dashboard'da veri gözüküyor

## 🚨 ACİL NOTLAR

- **Python AI YOK** - Şimdilik sadece fotoğraf kaydetme var
- Database'de `people_count=0` göreceksin - Bu normal
- İleride gerçek AI ekleyebilirsin (opsiyonel)
- **SİSTEM ÇALIŞIYOR** - Fotoğraflar kaydediliyor!

## 📞 HER ŞEY HAZIR!

Tüm kod zaten çalışıyor durumda. Sadece:
1. Vercel'e deploy et
2. URL'i ESP32'ye yaz
3. Başlat!

**Toplam Süre**: 5 dakika ⏱️
