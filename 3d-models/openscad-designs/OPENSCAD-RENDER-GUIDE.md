# 🎨 OPENSCAD RENDER REHBERİ

## 📦 KIZAKLI MONTAJ SİSTEMİ - Manuel Render

### 🎯 Hangi Dosyayı Render Edeceğim?

Kızaklı montaj sistemi için **2 ayrı parça** var:

1. **`device-body-slide.scad`** → Cihaz gövdesi (kancalar dahil)
2. **`wall-plate-slide.scad`** → Duvar plakası (raylar dahil)

---

## 🖥️ OPENSCAD'DE RENDER ADIM ADIM

### 1️⃣ Device Body (Cihaz Gövdesi)

**Dosya:** `device-body-slide.scad`

```
1. OpenSCAD'i Aç
2. File → Open → device-body-slide.scad
3. F5 (Preview) - Hızlı önizleme (30 saniye)
4. F6 (Render) - Tam render (3-5 dakika) ⏳
5. File → Export → Export as STL
6. Kaydet: device-body-slide.stl
```

**Render Süresi:** ~3-5 dakika  
**STL Boyutu:** ~300-500 KB  
**Yazdırma Süresi:** ~3-4 saat

---

### 2️⃣ Wall Plate (Duvar Plakası)

**Dosya:** `wall-plate-slide.scad`

```
1. OpenSCAD'i Aç
2. File → Open → wall-plate-slide.scad
3. F5 (Preview) - Hızlı önizleme (10 saniye)
4. F6 (Render) - Tam render (1-2 dakika) ⏳
5. File → Export → Export as STL
6. Kaydet: wall-plate-slide.stl
```

**Render Süresi:** ~1-2 dakika  
**STL Boyutu:** ~100-150 KB  
**Yazdırma Süresi:** ~1-1.5 saat

---

## ⚙️ OPENSCAD AYARLARI (Optimize Render)

### Render Kalitesi

OpenSCAD dosyalarında `$fn` parametresi:

```openscad
$fn = 150;  // ✅ Ultra smooth (önerilen)
$fn = 100;  // ⚠️ Orta kalite (daha hızlı render)
$fn = 50;   // ❌ Düşük kalite (test için)
```

**Önerimiz:** `$fn = 150` ile render et (zaten dosyalarda ayarlı)

---

### Preview vs Render

| İşlem | Kısayol | Süre | Amaç |
|-------|---------|------|------|
| **Preview** | `F5` | 10-30 saniye | Hızlı kontrol, düzenleme |
| **Render** | `F6` | 1-5 dakika | STL export, yazdırma |

**💡 İpucu:** İlk F5 ile kontrol et, sonra F6 ile render et!

---

## 📊 RENDER SONRASI KONTROL

### STL Dosyası Hazır mı?

```powershell
# PowerShell'de kontrol et:
cd "c:\Users\ercan\OneDrive\Masaüstü\Proje Cityv\city-v\3d-models\openscad-designs"
dir *.stl | Select-Object Name, @{N='KB';E={[math]::Round($_.Length/1KB,1)}}, LastWriteTime
```

**Beklenen Sonuç:**
```
Name                      KB  LastWriteTime
----                      --  -------------
device-body-slide.stl     400 [güncel tarih]
wall-plate-slide.stl      120 [güncel tarih]
```

---

## 🎯 SLICER'A AKTAR

### PrusaSlicer / Cura'ya Import

1. **Device Body:**
   - Orientation: Alt yüzey aşağı (kamera yukarı)
   - Supports: Minimal (sadece kancalar)
   - Infill: 15%
   - Layer Height: 0.2mm

2. **Wall Plate:**
   - Orientation: Düz yatay (as is)
   - Supports: YOK ❌
   - Infill: 20%
   - Layer Height: 0.2mm

---

## ⚡ HIZLI RENDER (Komut Satırı)

Eğer terminal'den render etmek istersen:

```powershell
# Device Body
& "C:\Program Files\OpenSCAD\openscad.exe" -o device-body-slide.stl device-body-slide.scad

# Wall Plate
& "C:\Program Files\OpenSCAD\openscad.exe" -o wall-plate-slide.stl wall-plate-slide.scad
```

**Not:** Bu yöntem GUI'siz çalışır, daha hızlı olabilir!

---

## 🔧 SORUN GİDERME

### ❌ Render çok yavaş

**Çözüm 1:** `$fn` değerini düşür
```openscad
$fn = 100;  // 150 yerine
```

**Çözüm 2:** Preview (F5) ile kontrol et, sadece son halinde Render (F6) yap

---

### ❌ STL eksik görünüyor

**Çözüm:** OpenSCAD'de:
1. Design → Flush Caches
2. F6 (Render) tekrar yap
3. File → Export → Export as STL

---

### ❌ Kancalar/raylar görünmüyor

**Kontrol:** Dosyanın sonuna bak, render modülü çağrılmış mı?

**device-body-slide.scad:**
```openscad
pro_body_slide();  // ✅ Bu satır olmalı
```

**wall-plate-slide.scad:**
```openscad
wall_plate();  // ✅ Bu satır olmalı
```

---

## 📐 DOSYA İÇERİĞİ ÖZETİ

### device-body-slide.scad
- ✅ 100mm x 100mm x 50mm ana gövde
- ✅ Merkez kamera lens deliği
- ✅ Arka tarafta 2 adet kızak kancası (üst + alt)
- ✅ 18650 batarya bölmesi (yatay)
- ✅ TP4056 şarj modülü yuvası
- ✅ USB-C port (yan)
- ✅ LED gösterge delikleri
- ✅ Güç düğmesi (üst)
- ✅ Havalandırma delikleri
- ✅ CITY-V PRO branding

### wall-plate-slide.scad
- ✅ 80mm x 70mm x 4mm plaka
- ✅ 2 adet kızak rayı (üst + alt)
- ✅ 4 köşe vida deliği (M5/M6)
- ✅ Countersink vida başları
- ✅ Alt kablo geçiş kanalı
- ✅ CITY-V branding

---

## 🎉 BAŞARILI RENDER!

Artık STL dosyaların hazır! 🎯

**Sıradaki Adım:**
1. STL'leri slicer'a aktar
2. Yazdırma ayarlarını yap
3. G-code oluştur
4. Yazdır! 🖨️

**Montaj için:** `SLIDE-MOUNT-GUIDE.md` dosyasına bak

---

## 📞 DESTEK

Render sorunları için: [GitHub Issues](https://github.com/ercanerguler-design/city-v/issues)

**Happy Rendering! 🎨**
