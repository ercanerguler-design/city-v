# City-V Business Box - OpenSCAD 3D Modelleri

## 📦 İçindekiler

Bu klasör, City-V Business Box için profesyonel OpenSCAD 3D modellerini içerir.

### 🔧 Model Dosyaları

1. **business-box-main.scad** - Ana gövde (85×65×45mm)
   - Kamera deliği (28mm, 15° açılı)
   - Havalandırma delikleri (10 adet)
   - LED gösterge penceresi
   - USB kablo çıkışı
   - Montaj delikleri (duvar/tavan montajı)
   - City-V logosu (kabartma)

2. **business-box-cover.scad** - Arka kapak (83×63×8mm)
   - Mıknatıs yuvaları (4 adet, 8mm × 2mm)
   - Havalandırma grid sistemi
   - QR kod etiketi yüzeyi
   - Hafif yapı (iç boşluk)

3. **camera-mount.scad** - Kamera tutucu (32×32×20mm)
   - ESP32-CAM özel tutucu
   - 15° açılı montaj platformu
   - Lens açıklığı (22mm)
   - LED gösterge açıklıkları
   - PCB sabitleme klipleri
   - M2.5 vida delikleri

---

## 🚀 Hızlı Başlangıç

### 1. OpenSCAD Kurulumu

#### Windows:
```powershell
# Chocolatey ile (önerilen)
choco install openscad

# Manuel:
# https://openscad.org/downloads.html
# OpenSCAD-2023.12.24-x86_64-Installer.exe
```

#### macOS:
```bash
brew install --cask openscad
```

#### Linux:
```bash
sudo apt-get install openscad
```

### 2. STL Dosyası Oluşturma

#### Yöntem 1: OpenSCAD GUI
1. OpenSCAD'i çalıştırın
2. File → Open → `business-box-main.scad` seçin
3. **F5** tuşuna basın (Preview - hızlı önizleme)
4. **F6** tuşuna basın (Render - final kalite)
5. File → Export → **Export as STL**
6. `business-box-main.stl` olarak kaydedin
7. Diğer dosyalar için tekrarlayın

#### Yöntem 2: Komut Satırı (Toplu İşlem)
```powershell
# Tek dosya
openscad -o business-box-main.stl business-box-main.scad

# Tüm dosyalar (PowerShell)
Get-ChildItem *.scad | ForEach-Object {
    $stlName = $_.BaseName + ".stl"
    openscad -o $stlName $_.Name
    Write-Host "✓ $stlName oluşturuldu"
}
```

---

## ⚙️ Parametreleri Özelleştirme

Her `.scad` dosyası parametriktir, istediğiniz değerleri değiştirebilirsiniz:

### business-box-main.scad
```scad
// Boyutları değiştir
outer_width = 90;    // 85'ten 90mm'ye
outer_height = 70;   // 65'ten 70mm'ye
outer_depth = 50;    // 45'ten 50mm'ye

// Duvar kalınlığını artır
wall_thickness = 3;  // 2.5'ten 3mm'ye

// Kamera açısını değiştir
camera_angle = 20;   // 15'ten 20 dereceye
```

### business-box-cover.scad
```scad
// Mıknatıs boyutunu değiştir
magnet_diameter = 10;  // 8'den 10mm'ye
magnet_thickness = 3;  // 2.5'ten 3mm'ye

// Havalandırma deliklerini küçült
vent_hole_size = 2;    // 3'ten 2mm'ye
```

### camera-mount.scad
```scad
// Montaj açısını değiştir
mount_angle = 10;      // 15'ten 10 dereceye

// Vida delik boyutunu değiştir
screw_hole_diameter = 3;  // M3 vidalar için
```

---

## 🎨 3D Print Ayarları

### Önerilen Ayarlar
| Parametre | Değer | Açıklama |
|-----------|-------|----------|
| **Layer Height** | 0.2mm | Standart kalite |
| **Infill** | 20% | Yeterli dayanıklılık |
| **Wall Thickness** | 1.2mm (3 çizgi) | Güçlü duvarlar |
| **Top/Bottom Layers** | 4 | Düzgün yüzey |
| **Print Speed** | 50mm/s | Kaliteli sonuç |
| **Supports** | Ana gövde: EVET, Diğer: HAYIR | Sadece gerekli yerlerde |

### Malzeme Seçimi
| Parça | Malzeme | Renk | Neden? |
|-------|---------|------|--------|
| Ana Gövde | PETG | Beyaz/Siyah | Dayanıklılık, ısı direnci |
| Arka Kapak | PLA | Siyah | Hafif, kolay yazdırılır |
| Kamera Tutucu | PLA | Siyah | Hassas boyutlar |

### Filament Miktarları
- **Ana Gövde**: 60-80g (3-4 saat)
- **Arka Kapak**: 20-30g (1-2 saat)
- **Kamera Tutucu**: 10-15g (1 saat)
- **TOPLAM**: 90-125g (5-7 saat)

---

## 🔍 Kalite Kontrol

### STL Dosyasını Kontrol Etme

#### Yöntem 1: Online Araçlar
1. **3D Viewer**: https://3dviewer.net/
   - STL dosyasını sürükle-bırak
   - Boyutları kontrol et
   - Hataları gör

2. **MeshLab** (Gelişmiş)
   ```powershell
   choco install meshlab
   ```
   - File → Import Mesh → STL seç
   - Filters → Cleaning and Repairing → Remove Duplicate Faces
   - Filters → Normals → Re-Orient all faces coherently

#### Yöntem 2: Slicer Yazılımı
- **Cura**: https://ultimaker.com/software/ultimaker-cura
- **PrusaSlicer**: https://www.prusa3d.com/prusaslicer/
- **Bambu Studio**: https://bambulab.com/en/download/studio

Kontrol Listesi:
- [ ] Model tam yüklendi
- [ ] Baskı platformuna sığıyor (max 200×200mm)
- [ ] Supports yerleşimi kontrol edildi
- [ ] Layer preview incelendi
- [ ] Print süresi ve filament miktarı uygun

---

## 📐 Boyut Tablosu

| Model | Genişlik (X) | Yükseklik (Y) | Derinlik (Z) | Ağırlık |
|-------|-------------|---------------|--------------|---------|
| Ana Gövde | 85mm | 65mm | 45mm | 70g |
| Arka Kapak | 83mm | 63mm | 8mm | 25g |
| Kamera Tutucu | 32mm | 32mm | 20mm | 12g |
| **TOPLAM** | - | - | - | **107g** |

---

## 🛠️ Montaj Malzemeleri

### Gerekli Parçalar
1. **3D Baskı Parçalar**
   - Ana gövde (1 adet)
   - Arka kapak (1 adet)
   - Kamera tutucu (1 adet)

2. **Elektronik**
   - ESP32-CAM-MB (1 adet)
   - USB kablosu (1 adet)
   - 5V 2A adaptör (1 adet)

3. **Küçük Parçalar**
   - M2.5 vidalar (4 adet) - ESP32-CAM montajı
   - M3 vidalar (4 adet) - Kamera tutucu montajı
   - 8mm × 2mm neodyum mıknatıs (4 adet) - Arka kapak

4. **Opsiyonel**
   - Çift taraflı 3M bant - Duvar montajı
   - Vida-dübel seti - Kalıcı montaj
   - Kablo düzenleyici klipsler

### Montaj Sırası
1. ✅ ESP32-CAM'i kamera tutucuya M2.5 vidalarla sabitleyin
2. ✅ Kamera tutucuyu ana gövdeye M3 vidalarla monte edin
3. ✅ USB kablosunu bağlayın
4. ✅ Arka kapağa 4 mıknatısı yerleştirin (süper yapıştırıcı ile)
5. ✅ Test edin (WiFi, kamera, LED)
6. ✅ Arka kapağı kapatın
7. ✅ Duvara monte edin

---

## 🚨 Sık Karşılaşılan Sorunlar

### 1. OpenSCAD Render Çok Yavaş
**Çözüm**:
```scad
// $fn değerini düşürün (preview için)
$fn = 32;  // 64 yerine

// Render sonrası geri yükseltin
// $fn = 64;
```

### 2. STL Dosyası Çok Büyük
**Çözüm**:
```powershell
# MeshLab ile sıkıştır
meshlabserver -i input.stl -o output.stl -om vc vn
```

### 3. Supports Çıkmıyor
**Çözüm**:
- Slicer'da "Support Type: Tree" seçin
- "Support Overhang Angle: 45°" yapın
- "Support Density: 15%" yeterli

### 4. Kamera Deliği Dar Geldi
**Çözüm**:
```scad
// business-box-main.scad içinde
camera_hole_diameter = 29;  // 28'den 29mm'ye
```

### 5. Mıknatıslar Sığmıyor
**Çözüm**:
```scad
// business-box-cover.scad içinde
magnet_diameter = 8.2;      // 8'den 8.2mm'ye
magnet_thickness = 2.6;     // 2.5'ten 2.6mm'ye
```

---

## 📚 Ek Kaynaklar

### OpenSCAD Öğrenme
- **Resmi Dokümantasyon**: https://openscad.org/documentation.html
- **Cheat Sheet**: https://openscad.org/cheatsheet/
- **YouTube Tutorial**: https://www.youtube.com/watch?v=lHR0cWlYbis

### 3D Printing Rehberleri
- **All3DP**: https://all3dp.com/2/3d-printing-tips/
- **Prusa Knowledge Base**: https://help.prusa3d.com/
- **Simplify3D Print Quality Guide**: https://www.simplify3d.com/support/print-quality-troubleshooting/

### CAD Alternatifler
- **FreeCAD**: https://www.freecadweb.org/ (Ücretsiz, profesyonel)
- **Tinkercad**: https://www.tinkercad.com/ (Web-tabanlı, basit)
- **Fusion 360**: https://www.autodesk.com/products/fusion-360/ (Ticari, güçlü)

---

## 📦 Toplu Üretim

### 10 Adet İçin
```powershell
# STL dosyalarını oluştur
openscad -o main.stl business-box-main.scad
openscad -o cover.stl business-box-cover.scad
openscad -o mount.stl camera-mount.scad

# Print farm'a gönder
# Toplam süre: 50-70 saat (5 printer × 14 saat)
# Toplam filament: 900-1250g
```

### Maliyet Hesaplama (10 Adet)
| Kalem | Birim Fiyat | Miktar | Toplam |
|-------|-------------|--------|--------|
| PLA/PETG Filament | ₺200/kg | 1.2kg | ₺240 |
| Print Hizmeti | ₺5/saat | 60 saat | ₺300 |
| Neodyum Mıknatıs | ₺2/adet | 40 adet | ₺80 |
| Vida Seti | ₺10/set | 10 set | ₺100 |
| **TOPLAM** | - | - | **₺720** |

---

## ✅ Checklist

### Tasarım Aşaması
- [x] Ana gövde OpenSCAD kodu
- [x] Arka kapak OpenSCAD kodu
- [x] Kamera tutucu OpenSCAD kodu
- [ ] STL dosyaları oluşturuldu
- [ ] STL dosyaları kontrol edildi

### Print Aşaması
- [ ] Printer kalibre edildi
- [ ] Test print yapıldı (küçük parça)
- [ ] Ana gövde yazdırıldı
- [ ] Arka kapak yazdırıldı
- [ ] Kamera tutucu yazdırıldı
- [ ] Post-processing (temizleme, supports kaldırma)

### Montaj Aşaması
- [ ] Elektronik parçalar geldi
- [ ] Kamera tutucu montajı
- [ ] Kablolama tamamlandı
- [ ] Mıknatıslar yerleştirildi
- [ ] Test edildi (çalışıyor)
- [ ] QC geçti (kalite kontrol)

---

## 🤝 Destek

Sorularınız için:
- **Email**: support@cityv.com
- **Discord**: https://discord.gg/cityv
- **GitHub Issues**: https://github.com/cityv/business-box

---

## 📄 Lisans

Bu 3D modeller City-V Business Box projesi için özel tasarlanmıştır.
Ticari kullanım için City-V ile iletişime geçin.

© 2024 City-V. Tüm hakları saklıdır.
