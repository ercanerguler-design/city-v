require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function createBusinessStaffTable() {
  try {
    console.log('📝 Creating business_staff table...');

    // 1. Create business_staff table
    await sql`
      CREATE TABLE IF NOT EXISTS business_staff (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50),
        role VARCHAR(50) DEFAULT 'employee',
        position VARCHAR(100),
        hire_date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(50) DEFAULT 'active',
        salary DECIMAL(10,2),
        photo_url TEXT,
        permissions JSONB DEFAULT '{"cameras": false, "menu": false, "reports": false, "settings": false}'::jsonb,
        working_hours JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT fk_business FOREIGN KEY (business_id) REFERENCES business_profiles(id) ON DELETE CASCADE
      )
    `;

    console.log('✅ business_staff table created!');

    // 2. Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_business_staff_business ON business_staff(business_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_business_staff_email ON business_staff(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_business_staff_status ON business_staff(status)`;

    console.log('✅ Indexes created!');

    // 3. Get correct business_profile ID
    const businessProfile = await sql`
      SELECT id FROM business_profiles WHERE user_id = 20 LIMIT 1
    `;
    
    if (businessProfile.length === 0) {
      console.error('❌ Business profile not found!');
      process.exit(1);
    }
    
    const businessId = businessProfile[0].id;
    console.log(`✅ Business Profile ID: ${businessId}`);

    // 4. Insert demo staff
    await sql`
      INSERT INTO business_staff (business_id, full_name, email, phone, position, role, status, working_hours)
      VALUES 
        (${businessId}, 'Ahmet Yılmaz', 'ahmet@sceinnovation.com', '0532 123 4567', 'Garson', 'employee', 'active', '{"shift": "Sabah (08:00-16:00)"}'),
        (${businessId}, 'Ayşe Demir', 'ayse@sceinnovation.com', '0533 234 5678', 'Kasa', 'employee', 'active', '{"shift": "Öğle (12:00-20:00)"}'),
        (${businessId}, 'Mehmet Kaya', 'mehmet@sceinnovation.com', '0534 345 6789', 'Müdür', 'manager', 'active', '{"shift": "Sabah (08:00-16:00)"}')
      ON CONFLICT (email) DO NOTHING
    `;

    console.log('✅ Demo staff added!');

    // 5. Check result
    const staffCount = await sql`SELECT COUNT(*) as count FROM business_staff WHERE business_id = ${businessId}`;
    console.log(`📊 Total staff for SCE INNOVATION: ${staffCount[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

createBusinessStaffTable();
