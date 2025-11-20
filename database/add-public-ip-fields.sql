-- Add public IP fields to cameras table for port forwarding support
-- This enables ESP32 cameras to be accessed from production HTTPS sites

ALTER TABLE business_cameras 
ADD COLUMN IF NOT EXISTS public_ip VARCHAR(15),
ADD COLUMN IF NOT EXISTS public_port INTEGER,
ADD COLUMN IF NOT EXISTS stream_path VARCHAR(100) DEFAULT '/stream',
ADD COLUMN IF NOT EXISTS is_public_access BOOLEAN DEFAULT FALSE;

-- Add index for public IP searches
CREATE INDEX IF NOT EXISTS idx_business_cameras_public_ip ON business_cameras(public_ip);

-- Add comment for documentation
COMMENT ON COLUMN business_cameras.public_ip IS 'Public IP address for port forwarding (router external IP)';
COMMENT ON COLUMN business_cameras.public_port IS 'Public port number that forwards to camera local port';
COMMENT ON COLUMN business_cameras.stream_path IS 'Camera stream endpoint path (e.g., /stream, /cam-hi.jpg)';
COMMENT ON COLUMN business_cameras.is_public_access IS 'Whether camera uses public IP for production access';