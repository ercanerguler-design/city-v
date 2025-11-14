const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function createNotificationsTable() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('\n📋 Creating business_notifications table...\n');
  
  try {
    // Create table
    await sql`
      CREATE TABLE IF NOT EXISTS business_notifications (
        id SERIAL PRIMARY KEY,
        business_user_id INTEGER NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        data JSONB DEFAULT '{}',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('✅ Table business_notifications created');
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_business_notifications_user_id ON business_notifications(business_user_id)`;
    console.log('✅ Index idx_business_notifications_user_id created');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_business_notifications_created_at ON business_notifications(created_at DESC)`;
    console.log('✅ Index idx_business_notifications_created_at created');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_business_notifications_is_read ON business_notifications(is_read)`;
    console.log('✅ Index idx_business_notifications_is_read created');
    
    console.log('\n🎉 Business notifications table setup complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createNotificationsTable();
