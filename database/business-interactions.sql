-- Business Interactions Table
-- Tracks all user interactions with business locations (views, favorites, reviews)

CREATE TABLE IF NOT EXISTS business_interactions (
  id SERIAL PRIMARY KEY,
  business_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('view', 'favorite', 'review', 'route', 'menu_view', 'campaign_view')),
  location_id VARCHAR(100),
  user_email VARCHAR(255),
  sentiment VARCHAR(20),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_interactions_business ON business_interactions(business_user_id);
CREATE INDEX IF NOT EXISTS idx_business_interactions_type ON business_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_business_interactions_location ON business_interactions(location_id);
CREATE INDEX IF NOT EXISTS idx_business_interactions_created ON business_interactions(created_at DESC);

-- Grant permissions
GRANT ALL ON business_interactions TO postgres;
GRANT ALL ON business_interactions_id_seq TO postgres;
