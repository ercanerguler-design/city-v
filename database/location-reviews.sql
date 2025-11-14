-- User Reviews & Sentiments for Locations
-- Kullanıcılar işletmeler için yorum ve duygu ekleyebilir

CREATE TABLE IF NOT EXISTS location_reviews (
  id SERIAL PRIMARY KEY,
  location_id VARCHAR(100) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  
  -- Review content
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  -- Sentiments/Emotions
  sentiment VARCHAR(20) CHECK (sentiment IN ('happy', 'sad', 'angry', 'neutral', 'excited', 'disappointed')),
  
  -- Price feedback
  price_rating VARCHAR(20) CHECK (price_rating IN ('very_cheap', 'cheap', 'fair', 'expensive', 'very_expensive')),
  
  -- Tags (opsiyonel)
  tags TEXT[],
  
  -- Metadata
  is_verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Prevent spam
  UNIQUE(location_id, user_id, created_at)
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_location_reviews_location ON location_reviews(location_id);
CREATE INDEX IF NOT EXISTS idx_location_reviews_user ON location_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_location_reviews_created ON location_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_location_reviews_sentiment ON location_reviews(sentiment);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION update_location_review_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_location_review_timestamp
BEFORE UPDATE ON location_reviews
FOR EACH ROW
EXECUTE FUNCTION update_location_review_timestamp();

-- Summary view for quick stats
CREATE OR REPLACE VIEW location_review_summary AS
SELECT 
  location_id,
  COUNT(*) as total_reviews,
  AVG(rating) as avg_rating,
  COUNT(DISTINCT user_id) as unique_reviewers,
  COUNT(CASE WHEN sentiment = 'happy' THEN 1 END) as happy_count,
  COUNT(CASE WHEN sentiment = 'sad' THEN 1 END) as sad_count,
  COUNT(CASE WHEN sentiment = 'angry' THEN 1 END) as angry_count,
  COUNT(CASE WHEN sentiment = 'excited' THEN 1 END) as excited_count,
  COUNT(CASE WHEN sentiment = 'disappointed' THEN 1 END) as disappointed_count,
  COUNT(CASE WHEN price_rating = 'very_cheap' THEN 1 END) as very_cheap_count,
  COUNT(CASE WHEN price_rating = 'cheap' THEN 1 END) as cheap_count,
  COUNT(CASE WHEN price_rating = 'fair' THEN 1 END) as fair_count,
  COUNT(CASE WHEN price_rating = 'expensive' THEN 1 END) as expensive_count,
  COUNT(CASE WHEN price_rating = 'very_expensive' THEN 1 END) as very_expensive_count,
  MAX(created_at) as last_review_at
FROM location_reviews
GROUP BY location_id;

SELECT '✅ location_reviews table and view created' as result;
