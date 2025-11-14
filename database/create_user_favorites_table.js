const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createUserFavoritesTable() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Creating user_favorites table...\n');

    // 1. User Favorites Tablosu
    console.log('📋 Creating user_favorites table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        location_id VARCHAR(100) NOT NULL,
        added_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, location_id)
      );
    `);
    console.log('✅ user_favorites table created\n');

    // 2. Indexes
    console.log('📋 Creating indexes...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_favorites_location_id ON user_favorites(location_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_favorites_added_at ON user_favorites(added_at);`);
    console.log('✅ Indexes created\n');

    // 3. Mevcut Verileri Kontrol Et
    console.log('📊 Checking existing data...');
    const favoritesResult = await client.query('SELECT COUNT(*) as count FROM user_favorites');
    console.log(`   user_favorites: ${favoritesResult.rows[0].count} kayıt\n`);

    console.log('✅ User favorites table created successfully!');
    console.log('\n🎉 Artık favoriler veritabanında saklanacak!\n');

  } catch (error) {
    console.error('❌ Error creating table:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
createUserFavoritesTable()
  .then(() => {
    console.log('✨ Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
