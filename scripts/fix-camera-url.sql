-- Fix camera stream URL from RTSP to HTTP
-- Run this with psql or Vercel Postgres dashboard

UPDATE iot_devices 
SET stream_url = 'http://192.168.1.3:80/stream'
WHERE device_id = 40;

-- Verify the update
SELECT device_id, device_name, stream_url, ip_address 
FROM iot_devices 
WHERE device_id = 40;
