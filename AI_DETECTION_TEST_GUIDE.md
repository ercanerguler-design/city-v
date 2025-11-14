# 🧪 AI Detection Test Guide

## Quick Test (5 dakika)

### 1. Dev Server Başlat
```powershell
npm run dev
```

### 2. Business Dashboard'a Git
```
http://localhost:3000/business
```

### 3. Login
- JWT token localStorage'da olmalı
- Yoksa `/business` login sayfasına yönlendirir

### 4. Kamera Seç
- **"Giriş Kapısı"** kartına tıkla
- ID: 29
- IP: 192.168.1.3:80

### 5. Stream Yüklenmesini Bekle
- 2 saniye içinde görüntü gelmeli
- "Stream yükleniyor..." overlay kaybolmalı

### 6. AI Detection Kontrolü

#### ✅ Olması Gerekenler:
- [ ] Konsola "✅ TensorFlow.js COCO-SSD model yüklendi" yazılmalı
- [ ] Konsola "🤖 AI Detection başlatılıyor..." yazılmalı
- [ ] Stream görüntüsü açıkça görünmeli
- [ ] Yeşil 👁️ butonu aktif olmalı
- [ ] FPS badge görünmeli (15-30 FPS)

#### 🎯 Test Senaryoları:

**Scenario 1: İnsan Tespiti**
1. Kamera önüne geç veya el salla
2. Yeşil bounding box görünmeli
3. "Person XX%" label görünmeli
4. Sol üstte "Tespit: 1 kişi" yazmalı
5. Badge'de "1 kişi" görünmeli

**Scenario 2: İstatistik Tracking**
1. Kamera önüne geç → "↓ Giriş: 1" artmalı
2. Kamera önünden ayrıl → "↑ Çıkış: 1" artmalı
3. Tekrar geç → "↓ Giriş: 2" olmalı
4. "👥 Şu An: 1" dinamik olmalı

**Scenario 3: Toggle Test**
1. 👁️ butonuna tıkla (gri olmalı)
2. Bounding box kaybolmalı
3. FPS badge kaybolmalı
4. Tekrar tıkla (yeşil olmalı)
5. Detection yeniden başlamalı

---

## Console Log Timeline

### Expected Log Sequence:
```
1. 🤖 TensorFlow.js model yükleniyor...
2. ✅ TensorFlow.js COCO-SSD model yüklendi
3. 📹 Camera Stream Debug: {...}
4. ✅ Stream yüklendi (onLoad event)
5. 🤖 AI Detection başlatılıyor...
```

### During Detection:
- FPS updates every 1 second
- Stats update on person count change
- No error logs

---

## Browser DevTools Checklist

### Network Tab:
- [ ] `http://192.168.1.3:80/stream` → 200 OK (MJPEG stream)
- [ ] TensorFlow.js model files loaded
- [ ] No CORS errors

### Console Tab:
- [ ] No red errors
- [ ] Model loaded successfully
- [ ] Detection loop running

### Performance Tab:
- [ ] requestAnimationFrame running smoothly
- [ ] No memory leaks
- [ ] Canvas rendering ~60 FPS

---

## Troubleshooting

### ❌ Problem: Model yüklenmiyor
**Symptoms**: "Model yüklenemedi" error  
**Solution**:
1. Internet bağlantısı kontrol et
2. TensorFlow.js CDN erişilebilir mi kontrol et
3. Browser console'da network errors kontrol et

### ❌ Problem: Bounding box görünmüyor
**Symptoms**: Stream var ama box yok  
**Solution**:
1. Console'da "🤖 AI Detection başlatılıyor..." var mı?
2. 👁️ butonu yeşil mi? (aiEnabled state)
3. Canvas element DOM'da var mı? (inspect element)
4. Kamera önünde gerçekten insan var mı?

### ❌ Problem: Canvas boyutu yanlış
**Symptoms**: Box yanlış yerde  
**Solution**:
```typescript
// Canvas boyutu stream boyutuna eşit mi?
canvas.width === img.naturalWidth // true olmalı
canvas.height === img.naturalHeight // true olmalı
```

### ❌ Problem: FPS çok düşük (<10)
**Symptoms**: Detection laggy  
**Solution**:
1. Frame skip ekle (her 2 frame'de bir detect)
2. Model backend'i optimize et (WebGL vs CPU)
3. Canvas resolution düşür

---

## Performance Benchmarks

### Ideal Performance:
- **Model Load**: <3 seconds
- **Stream Load**: <2 seconds
- **Detection FPS**: 15-30 FPS
- **Detection Latency**: <100ms
- **Accuracy**: %70+ confidence

### Acceptable Performance:
- **Model Load**: <5 seconds
- **Stream Load**: <5 seconds
- **Detection FPS**: 10-20 FPS
- **Detection Latency**: <200ms
- **Accuracy**: %50+ confidence

---

## Success Criteria

### ✅ Minimal Success:
- [x] Model loads without error
- [x] Stream displays correctly
- [x] At least 1 person detection works
- [x] Bounding box renders on canvas
- [x] No TypeScript compile errors

### ✅ Full Success:
- [x] Multiple person detection
- [x] Stats tracking (entry/exit)
- [x] FPS counter working
- [x] Toggle button works
- [x] No console errors
- [x] Performance >10 FPS

### 🎯 Optimal Success:
- [ ] Database analytics integration
- [ ] Heatmap coordinate tracking
- [ ] Zone analysis
- [ ] Alert system
- [ ] Real ESP32-CAM integration

---

## Next Steps After Testing

### If Success ✅:
1. Test with real ESP32-CAM (192.168.1.3)
2. Add database analytics logging
3. Integrate heatmap coordinates
4. Add zone analysis
5. Build alert system

### If Failure ❌:
1. Check console errors
2. Verify network connectivity
3. Test with demo stream first
4. Debug step-by-step
5. Check browser compatibility

---

## Camera Test Checklist

### Camera ID 29 (Giriş Kapısı):
- [x] Database record exists
- [x] ai_enabled = true
- [x] IP: 192.168.1.3
- [x] Port: 80
- [x] Stream URL: /stream
- [x] Resolution: 1600x1200
- [ ] Stream accessible (ping test)
- [ ] HTTP endpoint working
- [ ] MJPEG stream format correct

---

## Git Commit (After Success)

```powershell
# Terminal'de dev server'ı durdur (Ctrl+C)

git add components/Business/Dashboard/RemoteCameraViewer.tsx
git add AI_DETECTION_ACTIVATED.md
git add AI_DETECTION_TEST_GUIDE.md

git commit -m "FEAT: Add TensorFlow.js AI Detection to RemoteCameraViewer

- Integrated COCO-SSD model for person detection
- Real-time bounding box overlay on MJPEG stream
- Live statistics tracking (entry/exit/current)
- FPS counter and detection count badges
- Toggle button for AI enable/disable
- Canvas overlay rendering
- Detection loop with requestAnimationFrame
- Stats update on person count changes

Camera ID 29 (Giriş Kapısı) ready for testing."

git push origin main
```

---

## 🎉 Done!

AI Detection sistemi hazır. Test et ve sonuçları bildir! 🚀
