# CityV Real AI - Kurulum Rehberi

## 🚀 Hızlı Başlangıç

### 1. Python Environment Oluştur

```powershell
# Python-ai klasörüne git
cd python-ai

# Virtual environment oluştur
python -m venv venv

# Aktive et (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Eğer hata alırsan:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Paketleri Yükle

```powershell
# Torch CPU versiyonu (GPU yoksa)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Diğer paketler
pip install -r requirements.txt
```

### 3. AI Servisini Başlat

```powershell
# Development
python ai_service.py

# Ya da uvicorn ile
uvicorn ai_service:app --reload --host 0.0.0.0 --port 8000
```

### 4. Test Et

```powershell
# Başka bir terminal aç
curl http://localhost:8000/

# Response:
{
  "status": "healthy",
  "service": "CityV Real AI",
  "model": "YOLOv8n"
}
```

---

## ✅ Kontrol Listesi

- [ ] Python 3.9+ yüklü
- [ ] `python-ai/venv` klasörü oluşturuldu
- [ ] `pip install` tamamlandı
- [ ] YOLOv8n.pt modeli indirildi (ilk çalıştırmada otomatik)
- [ ] `http://localhost:8000/` çalışıyor
- [ ] `http://localhost:8000/docs` FastAPI dökümanları açılıyor

---

## 🔗 Next.js Entegrasyonu

`.env.local` dosyasına ekle:

```env
PYTHON_AI_URL=http://localhost:8000
```

Next.js'i yeniden başlat:

```powershell
npm run dev
```

---

## 📊 Sistem Testi

### 1. Python AI Test

```powershell
# Test image gönder
curl -X POST http://localhost:8000/analyze \
  -H "X-Camera-ID: 1" \
  -H "X-Location-Zone: Test" \
  -F "file=@test_image.jpg"
```

### 2. Next.js API Test

ESP32'den foto geldiğinde otomatik olarak:
1. Next.js `/api/iot/ai-analysis` alır
2. Python AI'ye gönderir
3. Sonucu database'e kaydeder
4. ESP32'ye response döner

---

## 🐛 Troubleshooting

### YOLOv8 indirmiyor
```powershell
# Manuel indir
mkdir models
cd models
curl -L https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt -o yolov8n.pt
```

### Torch hatası
```powershell
# CPU versiyonu
pip uninstall torch torchvision
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

### Port 8000 kullanımda
```powershell
# Başka port kullan
uvicorn ai_service:app --port 8001
# .env.local'de PYTHON_AI_URL=http://localhost:8001
```

---

## 📈 Performans

### YOLOv8n (Nano)
- İşlem süresi: 50-150ms (CPU)
- RAM: ~500MB
- Doğruluk: %80-85
- ✅ Development için ideal

### Upgrade için
```python
# ai_service.py içinde:
model = YOLO('yolov8m.pt')  # Medium - %85-90 doğruluk
model = YOLO('yolov8x.pt')  # Extra - %90-95 doğruluk
```

---

## 🌐 Production Deployment

### Railway.app (Önerilen)
1. https://railway.app hesap aç
2. GitHub repo bağla
3. Start command: `uvicorn ai_service:app --host 0.0.0.0 --port 8000`
4. URL al: `https://your-service.railway.app`
5. `.env.local`: `PYTHON_AI_URL=https://your-service.railway.app`

### Render.com
1. https://render.com hesap aç
2. New Web Service
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn ai_service:app --host 0.0.0.0 --port 8000`

---

## ✅ Hazır mısın?

Şimdi yapman gerekenler:
1. `cd python-ai`
2. `python -m venv venv`
3. `.\venv\Scripts\Activate.ps1`
4. `pip install -r requirements.txt`
5. `python ai_service.py`

Başarılı olursa göreceksin:
```
🤖 YOLOv8 model yükleniyor...
✅ YOLOv8n model hazır!
🚀 CityV Real AI Service Starting...
✅ Service ready at http://localhost:8000
```

**Hazırsan "BAŞLAT" yaz! 🚀**
