-- Ngrok URL ile kamera güncelleme
-- Ngrok başlattıktan sonra verdiği URL'i buraya yaz

UPDATE business_cameras 
SET 
  stream_url = 'https://YOUR_NGROK_URL.ngrok.io/stream',
  ip_address = 'YOUR_NGROK_URL.ngrok.io',
  port = 443
WHERE user_id = 14;

-- Örnek:
-- stream_url = 'https://abc123.ngrok.io/stream'
-- ip_address = 'abc123.ngrok.io'
-- port = 443
