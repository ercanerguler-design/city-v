-- Fix Business Visibility Settings
-- This script ensures all business profiles are visible on the map

-- Show current state
SELECT 
  user_id, 
  business_name, 
  city,
  is_visible_on_map, 
  auto_sync_to_cityv, 
  CASE 
    WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 'YES'
    ELSE 'NO'
  END as has_coordinates
FROM business_profiles
ORDER BY created_at DESC;

-- Update all profiles to be visible
UPDATE business_profiles 
SET 
  is_visible_on_map = true,
  auto_sync_to_cityv = true
WHERE is_visible_on_map = false 
   OR auto_sync_to_cityv = false
   OR is_visible_on_map IS NULL
   OR auto_sync_to_cityv IS NULL;

-- Show updated state
SELECT 
  user_id, 
  business_name, 
  is_visible_on_map, 
  auto_sync_to_cityv 
FROM business_profiles
WHERE is_visible_on_map = true AND auto_sync_to_cityv = true;

-- Verify count
SELECT COUNT(*) as visible_profiles
FROM business_profiles
WHERE is_visible_on_map = true 
  AND auto_sync_to_cityv = true
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL;
