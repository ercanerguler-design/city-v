-- GERÇEK KAMERA EKLE - Yüksek Kalite
-- ESP32-CAM veya IP Kamera için

-- ÖNEMLİ: Aşağıdaki bilgileri kendi kameranıza göre değiştirin!
-- IP: ESP32-CAM'in WiFi IP adresi (örn: 192.168.1.100)
-- Port: 80 (varsayılan) veya özel port
-- Stream URL: /stream veya /mjpeg endpoint

INSERT INTO business_cameras (
  business_user_id,
  camera_name,
  ip_address,
  port,
  stream_url,
  location_description,
  status,
  resolution,
  ai_enabled
) VALUES (
  6, -- Business user ID (MADO - değiştirmeyin)
  'ESP32-CAM HD - Giriş Kapısı', -- Kamera adı
  '192.168.1.100', -- ← ESP32-CAM IP adresinizi buraya yazın
  80, -- Port (varsayılan 80)
  'http://192.168.1.100:80/stream', -- ← Stream URL (IP:PORT/stream)
  'Giriş Kapısı - Ana Salon', -- Konum açıklaması
  'active', -- Durum
  '1600x1200', -- UXGA çözünürlük (ESP32-CAM max)
  true -- AI aktif
)
RETURNING id, camera_name, ip_address, stream_url;

-- Birden fazla kamera eklemek için:
-- 1. Yukarıdaki INSERT'i kopyalayın
-- 2. IP adresini, kamera adını ve konumu değiştirin
-- 3. Tekrar çalıştırın

-- ÖRNEK 2: İkinci Kamera
/*
INSERT INTO business_cameras (
  business_user_id,
  camera_name,
  ip_address,
  port,
  stream_url,
  location_description,
  status,
  resolution,
  ai_enabled
) VALUES (
  6,
  'ESP32-CAM HD - Kasa Bölgesi',
  '192.168.1.101',
  80,
  'http://192.168.1.101:80/stream',
  'Kasa - Ödeme Alanı',
  'active',
  '1600x1200',
  true
);
*/

SELECT '✅ Gerçek kamera eklendi! Stream URL: ' || stream_url as status
FROM business_cameras 
WHERE camera_name LIKE 'ESP32-CAM HD%' 
ORDER BY id DESC 
LIMIT 1;
