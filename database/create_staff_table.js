const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Z1HBqLuCNi0w@ep-solitary-wind-ad4zkrm3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function createStaffTable() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Creating business_staff table...\n');

    // business_staff tablosu
    console.log('📋 Creating business_staff table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS business_staff (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(20),
        role VARCHAR(50) DEFAULT 'employee', -- employee, manager, admin
        position VARCHAR(100), -- Garson, Aşçı, Kasiyer vs
        hire_date DATE DEFAULT CURRENT_DATE,
        salary DECIMAL(10,2),
        status VARCHAR(20) DEFAULT 'active', -- active, leave, report, terminated
        photo_url TEXT,
        permissions JSONB DEFAULT '{"cameras": false, "menu": false, "reports": false, "settings": false}'::jsonb,
        working_hours JSONB, -- {"shift": "Sabah (08:00-16:00)", "days": ["monday", "tuesday"]}
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ business_staff table created\n');

    // Indexes
    console.log('📋 Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_business_staff_business_id ON business_staff(business_id);
      CREATE INDEX IF NOT EXISTS idx_business_staff_status ON business_staff(business_id, status);
      CREATE INDEX IF NOT EXISTS idx_business_staff_email ON business_staff(email);
    `);
    console.log('✅ Indexes created\n');

    // Mevcut verileri kontrol et
    console.log('📊 Checking existing data...');
    const staffResult = await client.query('SELECT COUNT(*) as count FROM business_staff');
    console.log(`   business_staff: ${staffResult.rows[0].count} kayıt\n`);

    console.log('✅ Business staff table ready!');
    console.log('\n🎉 Artık personel ekleyip yönetebilirsiniz!\n');

  } catch (error) {
    console.error('❌ Error creating table:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
createStaffTable()
  .then(() => {
    console.log('✨ Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
