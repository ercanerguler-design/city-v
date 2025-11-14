-- Business subscriptions tablosuna max_cameras kolonu ekle
-- Eğer yoksa

ALTER TABLE business_subscriptions 
ADD COLUMN IF NOT EXISTS max_cameras INTEGER;

-- Mevcut kayıtlar için default değer
UPDATE business_subscriptions 
SET max_cameras = CASE 
  WHEN plan_type = 'premium' THEN 10
  WHEN plan_type = 'enterprise' THEN 50
  ELSE 5
END
WHERE max_cameras IS NULL;

-- Mevcut kayıtlar için monthly_price
UPDATE business_subscriptions 
SET monthly_price = CASE 
  WHEN plan_type = 'premium' THEN 249.00
  WHEN plan_type = 'enterprise' THEN 499.00
  ELSE 0
END
WHERE monthly_price IS NULL OR monthly_price = 0;

-- Kontrol
SELECT 
  id, 
  user_id, 
  plan_type, 
  max_cameras, 
  monthly_price,
  is_active,
  start_date,
  end_date
FROM business_subscriptions;
