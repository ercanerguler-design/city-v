require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function setupAllTables() {
  try {
    console.log('🔧 PostgreSQL Database Setup Starting...\n');

    // 1. Business Users Table
    console.log('📋 Setting up business_users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS business_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        membership_type VARCHAR(50) DEFAULT 'free',
        max_cameras INTEGER DEFAULT 1,
        credits INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 2. Business Profiles Table
    console.log('📋 Setting up business_profiles table...');
    await sql`
      CREATE TABLE IF NOT EXISTS business_profiles (
        id SERIAL PRIMARY KEY,
        business_user_id INTEGER REFERENCES business_users(id) ON DELETE CASCADE,
        business_name VARCHAR(255) NOT NULL,
        business_type VARCHAR(100),
        address TEXT,
        city VARCHAR(100),
        district VARCHAR(100),
        postal_code VARCHAR(20),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        website VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 3. Business Cameras Table
    console.log('📋 Setting up business_cameras table...');
    await sql`
      CREATE TABLE IF NOT EXISTS business_cameras (
        id SERIAL PRIMARY KEY,
        business_user_id INTEGER REFERENCES business_users(id) ON DELETE CASCADE,
        camera_name VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        port INTEGER DEFAULT 80,
        username VARCHAR(100),
        password VARCHAR(255),
        stream_url TEXT,
        location_description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_checked TIMESTAMP,
        zones JSONB DEFAULT '[]'::jsonb,
        total_entries INTEGER DEFAULT 0,
        total_exits INTEGER DEFAULT 0,
        current_occupancy INTEGER DEFAULT 0,
        max_capacity INTEGER DEFAULT 100,
        ai_enabled BOOLEAN DEFAULT true,
        features JSONB DEFAULT '{"entry_exit": true, "crowd_analysis": true, "zone_monitoring": true}'::jsonb,
        rtsp_url TEXT,
        resolution VARCHAR(20) DEFAULT '640x480',
        fps INTEGER DEFAULT 0,
        last_seen TIMESTAMP
      )
    `;

    // 4. Business Campaigns Table
    console.log('📋 Setting up business_campaigns table...');
    await sql`
      CREATE TABLE IF NOT EXISTS business_campaigns (
        id SERIAL PRIMARY KEY,
        business_user_id INTEGER REFERENCES business_users(id) ON DELETE CASCADE,
        campaign_name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        target_audience JSONB,
        schedule_type VARCHAR(50) DEFAULT 'immediate',
        scheduled_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'draft',
        sent_count INTEGER DEFAULT 0,
        click_count INTEGER DEFAULT 0,
        conversion_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 5. Business Notifications Table
    console.log('📋 Setting up business_notifications table...');
    await sql`
      CREATE TABLE IF NOT EXISTS business_notifications (
        id SERIAL PRIMARY KEY,
        business_user_id INTEGER REFERENCES business_users(id) ON DELETE CASCADE,
        type VARCHAR(100) NOT NULL DEFAULT 'info',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 6. Daily Stats Table
    console.log('📋 Setting up daily_business_stats table...');
    await sql`
      CREATE TABLE IF NOT EXISTS daily_business_stats (
        id SERIAL PRIMARY KEY,
        business_user_id INTEGER REFERENCES business_users(id) ON DELETE CASCADE,
        camera_id INTEGER REFERENCES business_cameras(id) ON DELETE CASCADE,
        stat_date DATE NOT NULL,
        total_entries INTEGER DEFAULT 0,
        total_exits INTEGER DEFAULT 0,
        peak_occupancy INTEGER DEFAULT 0,
        avg_occupancy DECIMAL(5,2) DEFAULT 0,
        peak_hour INTEGER,
        total_detections INTEGER DEFAULT 0,
        avg_confidence DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(business_user_id, camera_id, stat_date)
      )
    `;

    // 7. IoT Devices Table (ESP32-CAM Integration)
    console.log('📋 Setting up iot_devices table...');
    await sql`
      CREATE TABLE IF NOT EXISTS iot_devices (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(100) UNIQUE NOT NULL,
        device_name VARCHAR(255) NOT NULL,
        device_type VARCHAR(50) DEFAULT 'esp32_cam',
        ip_address VARCHAR(45),
        mac_address VARCHAR(17),
        firmware_version VARCHAR(50),
        status VARCHAR(50) DEFAULT 'offline',
        last_seen TIMESTAMP,
        location_description TEXT,
        stream_url TEXT,
        rtsp_url TEXT,
        business_id INTEGER REFERENCES business_users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 8. IoT Crowd Analysis Table
    console.log('📋 Setting up iot_crowd_analysis table...');
    await sql`
      CREATE TABLE IF NOT EXISTS iot_crowd_analysis (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(100) NOT NULL,
        analysis_type VARCHAR(100),
        location_type VARCHAR(100),
        people_count INTEGER,
        crowd_density VARCHAR(50),
        confidence_score DECIMAL(5,2),
        accuracy_estimate DECIMAL(5,2),
        detection_objects JSONB,
        image_url TEXT,
        processing_time_ms INTEGER,
        weather_condition VARCHAR(50),
        temperature DECIMAL(5,2),
        humidity INTEGER,
        entry_count INTEGER DEFAULT 0,
        exit_count INTEGER DEFAULT 0,
        current_occupancy INTEGER DEFAULT 0,
        trend_direction VARCHAR(20),
        movement_detected INTEGER DEFAULT 0,
        detection_method VARCHAR(100),
        algorithm_version VARCHAR(50),
        analysis_stages TEXT,
        foreground_percentage DECIMAL(5,2) DEFAULT 0,
        frame_number INTEGER DEFAULT 0,
        analysis_timestamp TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 9. Working Hours Table
    console.log('📋 Setting up business_working_hours table...');
    await sql`
      CREATE TABLE IF NOT EXISTS business_working_hours (
        id SERIAL PRIMARY KEY,
        business_user_id INTEGER REFERENCES business_users(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
        opening_time TIME,
        closing_time TIME,
        is_closed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(business_user_id, day_of_week)
      )
    `;

    // 10. Menu Categories Table
    console.log('📋 Setting up business_menu_categories table...');
    await sql`
      CREATE TABLE IF NOT EXISTS business_menu_categories (
        id SERIAL PRIMARY KEY,
        business_user_id INTEGER REFERENCES business_users(id) ON DELETE CASCADE,
        category_name VARCHAR(255) NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 11. Menu Items Table
    console.log('📋 Setting up business_menu_items table...');
    await sql`
      CREATE TABLE IF NOT EXISTS business_menu_items (
        id SERIAL PRIMARY KEY,
        business_user_id INTEGER REFERENCES business_users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES business_menu_categories(id) ON DELETE CASCADE,
        item_name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2),
        image_url TEXT,
        is_available BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Check table counts
    const tableChecks = [
      'business_users',
      'business_profiles', 
      'business_cameras',
      'business_campaigns',
      'business_notifications',
      'daily_business_stats',
      'iot_devices',
      'iot_crowd_analysis',
      'business_working_hours',
      'business_menu_categories',
      'business_menu_items'
    ];

    console.log('\n📊 Table Status:');
    for (const table of tableChecks) {
      try {
        const count = await sql.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`  ✅ ${table}: ${count.rows[0].count} records`);
      } catch (error) {
        console.log(`  ❌ ${table}: Error - ${error.message}`);
      }
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log(`🌐 Database ready for: https://city-v-chi.vercel.app`);
    console.log(`📹 Camera Limits: Free(1), Premium(10), Enterprise(30), Business(10)`);

  } catch (error) {
    console.error('❌ Database setup error:', error);
  }
}

setupAllTables();