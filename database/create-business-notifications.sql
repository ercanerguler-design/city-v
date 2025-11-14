-- Business Notifications Table
-- İşletmelere gelen yorum, favori ve diğer bildirimleri saklar

CREATE TABLE IF NOT EXISTS business_notifications (
  id SERIAL PRIMARY KEY,
  business_user_id INTEGER NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'review', 'favorite', 'campaign_view', 'menu_view', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}', -- Extra data (user info, location, etc.)
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_business_notifications_user_id (business_user_id),
  INDEX idx_business_notifications_created_at (created_at DESC),
  INDEX idx_business_notifications_is_read (is_read)
);

-- Comment
COMMENT ON TABLE business_notifications IS 'İşletmelere gelen bildirimler';
COMMENT ON COLUMN business_notifications.type IS 'Bildirim türü: review, favorite, campaign_view, menu_view';
COMMENT ON COLUMN business_notifications.data IS 'Ekstra bilgiler JSON formatında';

-- Örnek veri
-- INSERT INTO business_notifications (business_user_id, type, title, message, data) VALUES
-- (20, 'review', 'Yeni Yorum', 'John Doe yorumunuz için 5 yıldız verdi', '{"rating": 5, "sentiment": "positive", "locationId": "sce-innovation-ankar"}');
