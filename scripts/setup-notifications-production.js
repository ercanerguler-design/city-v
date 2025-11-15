// Neon database'de business_notifications tablosunu kontrol et ve oluştur
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

if (!process.env.POSTGRES_URL) {
  console.error('❌ POSTGRES_URL environment variable not found!');
  process.exit(1);
}

const sql = neon(process.env.POSTGRES_URL);

async function setupNotifications() {
  try {
    console.log('🔍 Checking if business_notifications table exists...');
    
    // Check if table exists
    const checkResult = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'business_notifications'
      );
    `;
    
    console.log('Table exists:', checkResult[0].exists);
    
    if (checkResult[0].exists) {
      console.log('✅ business_notifications table already exists');
      
      // Show table structure
      const structure = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'business_notifications'
        ORDER BY ordinal_position;
      `;
      console.log('📋 Table structure:', structure);
      
      // Count records
      const count = await sql`SELECT COUNT(*) FROM business_notifications`;
      console.log('📊 Total records:', count[0].count);
      
      return;
    }
    
    console.log('🔧 Creating business_notifications table...');
    
    await sql`
      CREATE TABLE business_notifications (
        id SERIAL PRIMARY KEY,
        business_user_id INTEGER NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        data JSONB DEFAULT '{}',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    console.log('✅ Table created');
    
    console.log('🔧 Creating indexes...');
    
    await sql`CREATE INDEX idx_business_notifications_user_id ON business_notifications(business_user_id)`;
    await sql`CREATE INDEX idx_business_notifications_created_at ON business_notifications(created_at DESC)`;
    await sql`CREATE INDEX idx_business_notifications_is_read ON business_notifications(is_read)`;
    
    console.log('✅ Indexes created');
    
    console.log('🎉 Setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

setupNotifications()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
