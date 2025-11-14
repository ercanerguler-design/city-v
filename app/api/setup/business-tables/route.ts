import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🚀 Business tabloları oluşturuluyor...');
    const results = [];

    // 1. Menü Kategorileri
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
    results.push('✅ business_menu_categories');

    // 2. Menü İtemleri
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
    results.push('✅ business_menu_items');

    // 3. Kamera Snapshots
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
    results.push('✅ business_camera_snapshots');

    // 4. Kamera tablosunu güncelle
    const alterQueries = [
      'ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS calibration_line JSONB',
      'ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS entry_direction VARCHAR(20) DEFAULT \'up_to_down\'',
      'ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS zones JSONB DEFAULT \'[]\'::jsonb',
      'ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS total_entries INTEGER DEFAULT 0',
      'ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS total_exits INTEGER DEFAULT 0',
      'ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS current_occupancy INTEGER DEFAULT 0',
      'ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 100',
      'ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT true',
      'ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS features JSONB DEFAULT \'{"entry_exit": true, "crowd_analysis": true, "zone_monitoring": true}\'::jsonb',
      'ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS rtsp_url TEXT',
      'ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS resolution VARCHAR(20) DEFAULT \'640x480\'',
      'ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS fps INTEGER DEFAULT 0',
      'ALTER TABLE business_cameras ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP'
    ];

    for (const query of alterQueries) {
      await sql.query(query);
    }
    results.push('✅ business_cameras güncellendi (13 kolon eklendi)');

    // 5. İndeksler
    await sql`CREATE INDEX IF NOT EXISTS idx_menu_categories_business ON business_menu_categories(business_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_business ON business_menu_items(business_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_category ON business_menu_items(category_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_camera_snapshots_camera ON business_camera_snapshots(camera_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_camera_snapshots_timestamp ON business_camera_snapshots(timestamp DESC)`;
    results.push('✅ 5 indeks oluşturuldu');

    // 6. Demo veri
    await sql`
      INSERT INTO business_menu_categories (business_id, name, icon, display_order) 
      VALUES (1, 'İçecekler', '🥤', 1), (1, 'Ana Yemekler', '🍽️', 2), (1, 'Tatlılar', '🍰', 3)
      ON CONFLICT DO NOTHING
    `;
    
    await sql`
      INSERT INTO business_menu_items (business_id, category_id, name, description, price, is_available) 
      VALUES
        (1, 1, 'Türk Kahvesi', 'Geleneksel Türk kahvesi', 45.00, true),
        (1, 1, 'Espresso', 'İtalyan espresso', 35.00, true),
        (1, 2, 'Izgara Köfte', 'Özel baharatlarla', 150.00, true),
        (1, 3, 'Künefe', 'Tel kadayıf tatlısı', 120.00, true)
      ON CONFLICT DO NOTHING
    `;
    results.push('✅ Demo veri eklendi (3 kategori, 4 ürün)');

    // Kontrol
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE 'business_%'
      ORDER BY table_name
    `;

    return NextResponse.json({
      success: true,
      message: 'Tüm tablolar başarıyla oluşturuldu! 🎉',
      results,
      tables: tables.rows.map(r => r.table_name),
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Database setup hatası:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}
