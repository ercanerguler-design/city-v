-- Premium Subscription Type Field Ekleme
-- Aylık (49.99 TL) veya Yıllık (399.99 TL) ayırt etmek için

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS premium_subscription_type VARCHAR(20) DEFAULT 'monthly';

-- Existing premium users için default monthly yap
UPDATE users 
SET premium_subscription_type = 'monthly' 
WHERE membership_tier = 'premium' AND premium_subscription_type IS NULL;

-- Yorum: 
-- 'monthly' = 49.99 TL/ay
-- 'yearly' = 399.99 TL/yıl
