import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

async function setupMallAndFoodModules() {
  try {
    console.log('🏢 Starting AVM & Food Ordering Module Setup...');
    
    // Read SQL file
    const schemaPath = path.join(process.cwd(), 'database', 'mall-and-food-modules.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📋 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await sql.query(statement);
        console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
      } catch (err: any) {
        // Ignore "already exists" errors
        if (err.message.includes('already exists')) {
          console.log(`⚠️ Statement ${i + 1} skipped (already exists)`);
        } else {
          console.error(`❌ Statement ${i + 1} failed:`, err.message);
        }
      }
    }
    
    console.log('\n🎉 AVM & Food Ordering Modules Setup Complete!');
    console.log('✅ Created Tables:');
    console.log('   - malls, mall_floors, mall_shops');
    console.log('   - mall_cameras, mall_crowd_analysis, mall_rent_suggestions');
    console.log('   - user_addresses, user_phone_verification');
    console.log('   - shopping_carts, cart_items, food_orders');
    console.log('   - order_status_history, business_delivery_settings');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

setupMallAndFoodModules();
