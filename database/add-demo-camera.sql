-- Demo kamera ekle (Gerçek çalışan public stream)
-- Business user_id=6 kullan (MADO)

INSERT INTO business_cameras (
  business_user_id,
  camera_name,
  ip_address,
  port,
  stream_url,
  location_description,
  status
) VALUES (
  6, -- business_user_id
  'Demo Traffic Camera - Public Stream',
  '77.223.99.166',
  8080,
  'http://77.223.99.166:8080/mjpg/video.mjpg',
  'Demo Location - Traffic Intersection',
  'active'
) 
ON CONFLICT DO NOTHING
RETURNING id, camera_name, ip_address, stream_url;

SELECT '✅ Demo kamera eklendi!' as status;
