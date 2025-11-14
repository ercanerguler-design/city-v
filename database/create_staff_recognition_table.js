const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Z1HBqLuCNi0w@ep-solitary-wind-ad4zkrm3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function createStaffRecognitionTables() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Creating staff recognition tables...\n');

    // 1. Personel Yüz Profilleri Tablosu
    console.log('📋 Creating staff_face_profiles...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS staff_face_profiles (
        id SERIAL PRIMARY KEY,
        staff_id INTEGER NOT NULL REFERENCES business_staff(id) ON DELETE CASCADE,
        face_encoding TEXT NOT NULL, -- Base64 encoded yüz verileri
        face_image_url TEXT, -- Profil fotoğrafı
        confidence_threshold DECIMAL(3,2) DEFAULT 0.85, -- Tanıma eşiği (0.85 = %85)
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(staff_id)
      );
    `);
    console.log('✅ staff_face_profiles created\n');

    // 2. IoT Personel Tespit Kayıtları
    console.log('📋 Creating iot_staff_detections...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS iot_staff_detections (
        id SERIAL PRIMARY KEY,
        staff_id INTEGER NOT NULL REFERENCES business_staff(id) ON DELETE CASCADE,
        camera_id INTEGER NOT NULL REFERENCES business_cameras(id) ON DELETE CASCADE,
        detection_time TIMESTAMP DEFAULT NOW(),
        confidence DECIMAL(3,2), -- Tanıma güveni (0.00-1.00)
        snapshot_url TEXT, -- Tespit anı fotoğrafı
        location_zone VARCHAR(100), -- Kameranın bulunduğu bölge (Giriş, Salon, Mutfak vs)
        detection_type VARCHAR(20) DEFAULT 'entry', -- entry, exit, presence
        metadata JSONB -- Ek bilgiler (duygu analizi, maske takma vs)
      );
    `);
    console.log('✅ iot_staff_detections created\n');

    // 3. Vardiya Otomatik Kayıtları
    console.log('📋 Creating staff_attendance...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS staff_attendance (
        id SERIAL PRIMARY KEY,
        staff_id INTEGER NOT NULL REFERENCES business_staff(id) ON DELETE CASCADE,
        business_id INTEGER NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
        check_in_time TIMESTAMP,
        check_out_time TIMESTAMP,
        auto_detected BOOLEAN DEFAULT true, -- IoT ile mi manuel mi?
        camera_id INTEGER REFERENCES business_cameras(id),
        total_hours DECIMAL(5,2), -- Toplam çalışma saati
        date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(20) DEFAULT 'present', -- present, late, absent, early_leave
        notes TEXT
      );
    `);
    console.log('✅ staff_attendance created\n');

    // 4. Indexes
    console.log('📋 Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_staff_face_profiles_staff ON staff_face_profiles(staff_id);
      CREATE INDEX IF NOT EXISTS idx_iot_staff_detections_staff ON iot_staff_detections(staff_id);
      CREATE INDEX IF NOT EXISTS idx_iot_staff_detections_camera ON iot_staff_detections(camera_id);
      CREATE INDEX IF NOT EXISTS idx_iot_staff_detections_time ON iot_staff_detections(detection_time);
      CREATE INDEX IF NOT EXISTS idx_staff_attendance_staff ON staff_attendance(staff_id);
      CREATE INDEX IF NOT EXISTS idx_staff_attendance_date ON staff_attendance(staff_id, date);
    `);
    console.log('✅ Indexes created\n');

    // 5. Mevcut verileri kontrol et
    console.log('📊 Checking existing data...');
    const profilesResult = await client.query('SELECT COUNT(*) as count FROM staff_face_profiles');
    const detectionsResult = await client.query('SELECT COUNT(*) as count FROM iot_staff_detections');
    const attendanceResult = await client.query('SELECT COUNT(*) as count FROM staff_attendance');
    
    console.log(`   staff_face_profiles: ${profilesResult.rows[0].count} kayıt`);
    console.log(`   iot_staff_detections: ${detectionsResult.rows[0].count} kayıt`);
    console.log(`   staff_attendance: ${attendanceResult.rows[0].count} kayıt\n`);

    console.log('✅ Staff recognition system ready!');
    console.log('\n🎉 Artık personel yüz tanıma sistemi aktif!\n');
    console.log('📸 Sonraki Adımlar:');
    console.log('   1. Personel fotoğraflarını yükleyin');
    console.log('   2. ESP32-CAM cihazlarına yüz tanıma kodu ekleyin');
    console.log('   3. Kameraları personel girişlerine yerleştirin\n');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createStaffRecognitionTables()
  .then(() => {
    console.log('✨ Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
