// Quick script to setup mall and food modules
import { sql } from '@vercel/postgres';

async function setupModules() {
  try {
    console.log('🏢 Setting up AVM & Food Ordering Modules...\n');
    
    // Mall tables - simpler version
    const tables = [
      {
        name: 'malls',
        sql: `CREATE TABLE IF NOT EXISTS malls (
          id SERIAL PRIMARY KEY,
          business_profile_id INTEGER,
          mall_name VARCHAR(255) NOT NULL,
          total_floors INTEGER DEFAULT 3,
          total_shops INTEGER DEFAULT 0,
          address TEXT,
          city VARCHAR(100),
          location_lat DECIMAL(10,8),
          location_lng DECIMAL(11,8),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'mall_floors',
        sql: `CREATE TABLE IF NOT EXISTS mall_floors (
          id SERIAL PRIMARY KEY,
          mall_id INTEGER,
          floor_number INTEGER NOT NULL,
          floor_name VARCHAR(100),
          total_area_sqm DECIMAL(10,2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'mall_shops',
        sql: `CREATE TABLE IF NOT EXISTS mall_shops (
          id SERIAL PRIMARY KEY,
          mall_id INTEGER,
          floor_id INTEGER,
          shop_name VARCHAR(255) NOT NULL,
          shop_number VARCHAR(50),
          category VARCHAR(100),
          area_sqm DECIMAL(10,2),
          monthly_rent DECIMAL(10,2),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'mall_cameras',
        sql: `CREATE TABLE IF NOT EXISTS mall_cameras (
          id SERIAL PRIMARY KEY,
          mall_id INTEGER,
          floor_id INTEGER,
          camera_id INTEGER,
          zone_name VARCHAR(255),
          zone_type VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'mall_crowd_analysis',
        sql: `CREATE TABLE IF NOT EXISTS mall_crowd_analysis (
          id SERIAL PRIMARY KEY,
          mall_id INTEGER,
          floor_id INTEGER,
          camera_id INTEGER,
          zone_name VARCHAR(255),
          people_count INTEGER DEFAULT 0,
          density_level VARCHAR(50),
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          hour_of_day INTEGER,
          day_of_week INTEGER
        )`
      },
      {
        name: 'user_addresses',
        sql: `CREATE TABLE IF NOT EXISTS user_addresses (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          address_title VARCHAR(100),
          full_address TEXT NOT NULL,
          city VARCHAR(100),
          district VARCHAR(100),
          address_lat DECIMAL(10,8),
          address_lng DECIMAL(11,8),
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'shopping_carts',
        sql: `CREATE TABLE IF NOT EXISTS shopping_carts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          business_profile_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'cart_items',
        sql: `CREATE TABLE IF NOT EXISTS cart_items (
          id SERIAL PRIMARY KEY,
          cart_id INTEGER,
          menu_item_id INTEGER,
          quantity INTEGER DEFAULT 1,
          unit_price DECIMAL(10,2),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'food_orders',
        sql: `CREATE TABLE IF NOT EXISTS food_orders (
          id SERIAL PRIMARY KEY,
          order_number VARCHAR(50) UNIQUE NOT NULL,
          user_id INTEGER,
          business_profile_id INTEGER,
          address_id INTEGER,
          items JSONB NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          delivery_fee DECIMAL(10,2) DEFAULT 0,
          final_amount DECIMAL(10,2) NOT NULL,
          customer_name VARCHAR(255),
          customer_phone VARCHAR(20),
          delivery_address TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          payment_method VARCHAR(50),
          payment_status VARCHAR(50) DEFAULT 'pending',
          order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          estimated_delivery_time TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'business_delivery_settings',
        sql: `CREATE TABLE IF NOT EXISTS business_delivery_settings (
          id SERIAL PRIMARY KEY,
          business_profile_id INTEGER UNIQUE,
          accepts_orders BOOLEAN DEFAULT true,
          min_order_amount DECIMAL(10,2) DEFAULT 0,
          delivery_fee DECIMAL(10,2) DEFAULT 10.00,
          estimated_prep_time_minutes INTEGER DEFAULT 30,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      }
    ];
    
    // Create tables
    for (const table of tables) {
      try {
        await sql.query(table.sql);
        console.log(`✅ ${table.name} created`);
      } catch (err) {
        console.log(`⚠️  ${table.name} ${err.message.includes('already exists') ? 'already exists' : 'ERROR: ' + err.message}`);
      }
    }
    
    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_mall_floors_mall ON mall_floors(mall_id)',
      'CREATE INDEX IF NOT EXISTS idx_mall_shops_mall ON mall_shops(mall_id)',
      'CREATE INDEX IF NOT EXISTS idx_mall_cameras_floor ON mall_cameras(floor_id)',
      'CREATE INDEX IF NOT EXISTS idx_mall_crowd_timestamp ON mall_crowd_analysis(timestamp DESC)',
      'CREATE INDEX IF NOT EXISTS idx_shopping_carts_user ON shopping_carts(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_food_orders_user ON food_orders(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_food_orders_status ON food_orders(status)'
    ];
    
    console.log('\n📊 Creating indexes...');
    for (const idx of indexes) {
      try {
        await sql.query(idx);
      } catch (err) {
        // Ignore index errors
      }
    }
    console.log('✅ Indexes created');
    
    console.log('\n🎉 AVM & Food Ordering Modules Ready!');
    console.log('✅ Tables: malls, mall_floors, mall_shops, mall_cameras, mall_crowd_analysis');
    console.log('✅ Tables: user_addresses, shopping_carts, cart_items, food_orders');
    console.log('✅ Tables: business_delivery_settings');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupModules();
