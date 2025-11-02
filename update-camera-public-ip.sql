-- Public IP üzerinden erişim için kamera güncelleme
-- PUBLIC_IP'yi kendi IP'nizle değiştirin (curl ifconfig.me)

UPDATE business_cameras 
SET 
  ip_address = 'PUBLIC_IP_BURAYA',  -- Örnek: '85.123.45.67'
  port = 8080,
  stream_url = 'http://PUBLIC_IP_BURAYA:8080/stream'
WHERE user_id = 14;

-- Örnek:
-- ip_address = '85.123.45.67'
-- port = 8080
-- stream_url = 'http://85.123.45.67:8080/stream'
