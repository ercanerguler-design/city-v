require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function fixStaffTable() {
  try {
    // Drop and recreate without FK constraint
    console.log('🗑️ Dropping old table...');
    await sql`DROP TABLE IF EXISTS business_staff CASCADE`;
    
    console.log('📝 Creating new table...');
    await sql`
      CREATE TABLE business_staff (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        role VARCHAR(50) DEFAULT 'employee',
        position VARCHAR(100),
        hire_date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(50) DEFAULT 'active',
        permissions JSONB DEFAULT '{"cameras": false, "menu": false, "reports": false}'::jsonb,
        working_hours JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('✅ Table created!');
    
    // Get business profile ID
    const bp = await sql`SELECT id FROM business_profiles WHERE user_id = 20 LIMIT 1`;
    const businessId = bp[0].id;
    console.log(`✅ Business ID: ${businessId}`);
    
    // Insert demo staff
    await sql`
      INSERT INTO business_staff (business_id, full_name, email, phone, position, role, working_hours)
      VALUES 
        (${businessId}, 'Ahmet Yılmaz', 'ahmet@sceinnovation.com', '0532 123 4567', 'Garson', 'employee', '{"shift": "Sabah (08:00-16:00)"}'),
        (${businessId}, 'Ayşe Demir', 'ayse@sceinnovation.com', '0533 234 5678', 'Kasiyer', 'employee', '{"shift": "Öğle (12:00-20:00)"}'),
        (${businessId}, 'Mehmet Kaya', 'mehmet@sceinnovation.com', '0534 345 6789', 'Müdür', 'manager', '{"shift": "Tam Gün (08:00-20:00)"}')
    `;
    
    console.log('✅ Staff added!');
    
    const count = await sql`SELECT COUNT(*) as count FROM business_staff`;
    console.log(`📊 Total staff: ${count[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

fixStaffTable();
