/**
 * CityV Business System - Database Setup Script
 * Vercel Postgres'e tabloları oluşturur
 */

const { sql } = require('@vercel/postgres');

async function createTables() {
  console.log('🚀 CityV Business tabloları oluşturuluyor...\n');

  try {
    // 1. Menü Kategorileri Tablosu
    console.log('📋 business_menu_categories tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS business_menu_categories (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL,
        name VARCHAR(100) NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        icon VARCHAR(50) DEFAULT '📦',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ business_menu_categories oluşturuldu\n');

    // 2. Menü Ürünleri Tablosu
    console.log('📋 business_menu_items tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS business_menu_items (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL,
        category_id INTEGER REFERENCES business_menu_categories(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        currency VARCHAR(10) DEFAULT 'TRY',
        image_url TEXT,
        is_available BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        allergens TEXT[],
        dietary_info TEXT[],
        preparation_time INTEGER,
        calories INTEGER,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ business_menu_items oluşturuldu\n');

    // 3. Kamera Snapshot Tablosu
    console.log('📋 business_camera_snapshots tablosu oluşturuluyor...');
    await sql`
      CREATE TABLE IF NOT EXISTS business_camera_snapshots (
        id SERIAL PRIMARY KEY,
        camera_id INTEGER NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        entries_count INTEGER DEFAULT 0,
        exits_count INTEGER DEFAULT 0,
        current_people INTEGER DEFAULT 0,
        zone_data JSONB,
        heatmap_data JSONB,
        snapshot_url TEXT,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ business_camera_snapshots oluşturuldu\n');

    // 4. Business Cameras Tablosunu Güncelle
    console.log('🔧 business_cameras tablosu güncelleniyor...');
    
    await sql`ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS calibration_line JSONB`;
    await sql`ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS entry_direction VARCHAR(20) DEFAULT 'up_to_down'`;
    await sql`ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS zones JSONB DEFAULT '[]'::jsonb`;
    await sql`ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS total_entries INTEGER DEFAULT 0`;
    await sql`ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS total_exits INTEGER DEFAULT 0`;
    await sql`ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS current_occupancy INTEGER DEFAULT 0`;
    await sql`ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 100`;
    await sql`ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT true`;
    await sql`ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{"entry_exit": true, "crowd_analysis": true, "zone_monitoring": true}'::jsonb`;
    await sql`ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS rtsp_url TEXT`;
    await sql`ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS resolution VARCHAR(20) DEFAULT '640x480'`;
    await sql`ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS fps INTEGER DEFAULT 0`;
    await sql`ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP`;
    
    console.log('✅ business_cameras güncellendi\n');

    // 5. İndeksler
    console.log('🔍 İndeksler oluşturuluyor...');
    await sql`CREATE INDEX IF NOT EXISTS idx_menu_categories_business ON business_menu_categories(business_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_business ON business_menu_items(business_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_category ON business_menu_items(category_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_camera_snapshots_camera ON business_camera_snapshots(camera_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_camera_snapshots_timestamp ON business_camera_snapshots(timestamp DESC)`;
    console.log('✅ İndeksler oluşturuldu\n');

    // 6. Demo Veri
    console.log('🎲 Demo veri ekleniyor...');
    
    // Kategoriler
    await sql`
      INSERT INTO business_menu_categories (business_id, name, icon, display_order) 
      VALUES
        (1, 'İçecekler', '🥤', 1),
        (1, 'Ana Yemekler', '🍽️', 2),
        (1, 'Tatlılar', '🍰', 3)
      ON CONFLICT DO NOTHING
    `;

    // Menü itemları
    await sql`
      INSERT INTO business_menu_items (business_id, category_id, name, description, price, is_available) 
      VALUES
        (1, 1, 'Türk Kahvesi', 'Geleneksel Türk kahvesi', 45.00, true),
        (1, 1, 'Espresso', 'İtalyan espresso', 35.00, true),
        (1, 2, 'Izgara Köfte', 'Özel baharatlarla', 150.00, true),
        (1, 3, 'Künefe', 'Tel kadayıf tatlısı', 120.00, true)
      ON CONFLICT DO NOTHING
    `;
    
    console.log('✅ Demo veri eklendi\n');

    // 7. Kontrol
    console.log('🔍 Tablolar kontrol ediliyor...');
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'business_%'
      ORDER BY table_name
    `;
    
    console.log('\n📊 Oluşturulan Tablolar:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Satır sayıları
    console.log('\n📈 Satır Sayıları:');
    const countCategories = await sql`SELECT COUNT(*) FROM business_menu_categories`;
    const countItems = await sql`SELECT COUNT(*) FROM business_menu_items`;
    const countCameras = await sql`SELECT COUNT(*) FROM business_cameras`;
    const countSnapshots = await sql`SELECT COUNT(*) FROM business_camera_snapshots`;
    
    console.log(`   📋 business_menu_categories: ${countCategories.rows[0].count}`);
    console.log(`   📋 business_menu_items: ${countItems.rows[0].count}`);
    console.log(`   📹 business_cameras: ${countCameras.rows[0].count}`);
    console.log(`   📸 business_camera_snapshots: ${countSnapshots.rows[0].count}`);

    console.log('\n✅ TÜM TABLOLAR BAŞARIYLA OLUŞTURULDU! 🎉\n');

  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  }
}

// Script'i çalıştır
createTables()
  .then(() => {
    console.log('🚀 Database setup tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database setup başarısız:', error);
    process.exit(1);
  });
