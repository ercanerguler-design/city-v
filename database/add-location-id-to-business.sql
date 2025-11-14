-- Add location_id column to business_profiles
-- Links business profile to CityV map location

ALTER TABLE business_profiles
ADD COLUMN IF NOT EXISTS location_id VARCHAR(100);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_business_profiles_location_id 
ON business_profiles(location_id);

-- Comment for documentation
COMMENT ON COLUMN business_profiles.location_id IS 'CityV harita üzerindeki mekan ID (örn: "starbucks-kizilay")';

-- Example update (add your business location mappings here)
-- UPDATE business_profiles SET location_id = 'starbucks-kizilay' WHERE id = 1;

SELECT '✅ location_id column added to business_profiles' as result;
