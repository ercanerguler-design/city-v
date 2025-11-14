-- Test: Kamera Limitleri Kontrolü
-- Bu script business_users tablosundaki kamera limitlerini kontrol eder

-- 1. Tüm business users'ın membership ve camera limitlerini listele
SELECT 
  id,
  email,
  full_name,
  membership_type,
  max_cameras,
  membership_expiry_date,
  is_active,
  created_at
FROM business_users
ORDER BY created_at DESC;

-- 2. Membership tipine göre grupla ve say
SELECT 
  membership_type,
  COUNT(*) as user_count,
  AVG(max_cameras) as avg_camera_limit,
  MIN(max_cameras) as min_cameras,
  MAX(max_cameras) as max_cameras
FROM business_users
GROUP BY membership_type
ORDER BY 
  CASE membership_type
    WHEN 'enterprise' THEN 1
    WHEN 'premium' THEN 2
    WHEN 'business' THEN 3
    WHEN 'free' THEN 4
    ELSE 5
  END;

-- 3. Yanlış camera limiti olan kullanıcıları bul (düzeltilmesi gerekenler)
SELECT 
  id,
  email,
  membership_type,
  max_cameras,
  CASE membership_type
    WHEN 'enterprise' THEN 50
    WHEN 'premium' THEN 10
    WHEN 'business' THEN 10
    ELSE 1
  END as expected_cameras
FROM business_users
WHERE max_cameras != CASE membership_type
  WHEN 'enterprise' THEN 50
  WHEN 'premium' THEN 10
  WHEN 'business' THEN 10
  ELSE 1
END;

-- 4. Düzeltme scripti (yukarıdaki sorgu sonuç döndürüyorsa çalıştır)
/*
UPDATE business_users
SET max_cameras = CASE membership_type
  WHEN 'enterprise' THEN 50
  WHEN 'premium' THEN 10
  WHEN 'business' THEN 10
  ELSE 1
END
WHERE max_cameras != CASE membership_type
  WHEN 'enterprise' THEN 50
  WHEN 'premium' THEN 10
  WHEN 'business' THEN 10
  ELSE 1
END;
*/

-- 5. Business subscriptions tablosunu kontrol et
SELECT 
  bs.id,
  bs.user_id,
  bu.email,
  bs.plan_type,
  bs.max_cameras,
  bs.is_active,
  bs.start_date,
  bs.end_date
FROM business_subscriptions bs
JOIN business_users bu ON bs.user_id = bu.id
ORDER BY bs.created_at DESC;
