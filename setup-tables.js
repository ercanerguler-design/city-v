const { neon } = require('@neondatabase/serverless');

// Database connection
const sql = neon('postgresql://neondb_owner:npg_Z1HBqLuCNi0w@ep-solitary-wind-ad4zkrm3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function setupTables() {
  try {
    console.log('🔨 Temel tablolar oluşturuluyor...');

    // Business staff tablosu
    await sql`
      CREATE TABLE IF NOT EXISTS business_staff (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(50) NOT NULL DEFAULT 'employee',
        position VARCHAR(100),
        hire_date DATE DEFAULT CURRENT_DATE,
        salary DECIMAL(10,2),
        status VARCHAR(20) DEFAULT 'active',
        permissions JSONB DEFAULT '{"cameras": false, "menu": false, "reports": false, "settings": false}',
        working_hours JSONB,
        photo_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(business_id, email)
      )
    `;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_staff_business ON business_staff(business_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_staff_status ON business_staff(business_id, status)`;
    
    console.log('✅ business_staff tablosu oluşturuldu');

    // Business menu categories tablosu
    await sql`
      CREATE TABLE IF NOT EXISTS business_menu_categories (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL,
        name VARCHAR(100) NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        icon VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_menu_categories_business ON business_menu_categories(business_id)`;
    
    console.log('✅ business_menu_categories tablosu oluşturuldu');

    // Business menu items tablosu
    await sql`
      CREATE TABLE IF NOT EXISTS business_menu_items (
        id SERIAL PRIMARY KEY,
        category_id INTEGER REFERENCES business_menu_categories(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(500),
        is_available BOOLEAN DEFAULT TRUE,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_category ON business_menu_items(category_id)`;
    
    console.log('✅ business_menu_items tablosu oluşturuldu');

    // Business profiles tablosu update - working_hours kolonu
    try {
      await sql`
        ALTER TABLE business_profiles 
        ADD COLUMN IF NOT EXISTS working_hours JSONB DEFAULT '{"is24Hours": false}'
      `;
      console.log('✅ business_profiles.working_hours kolonu eklendi');
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.log('⚠️ working_hours kolonu zaten var veya eklenemedi');
      }
    }

    console.log('🎉 Tüm tablolar hazır!');
    
  } catch (error) {
    console.error('❌ Tablo oluşturma hatası:', error);
  }
  
  process.exit(0);
}

setupTables();