// Test database tables - Check if mall & food tables exist
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function testTables() {
  console.log('🔍 Checking AVM & Food Ordering tables...\n');
  
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN (
          'malls', 'mall_floors', 'mall_shops', 'mall_cameras',
          'mall_crowd_analysis', 'shopping_carts', 'cart_items',
          'food_orders', 'user_addresses', 'business_delivery_settings'
        )
      ORDER BY table_name
    `;
    
    console.log('✅ Found tables:', result.length);
    result.forEach(row => {
      console.log('  -', row.table_name);
    });
    
    const expectedTables = [
      'malls', 'mall_floors', 'mall_shops', 'mall_cameras',
      'mall_crowd_analysis', 'shopping_carts', 'cart_items',
      'food_orders', 'user_addresses', 'business_delivery_settings'
    ];
    
    const foundTableNames = result.map(r => r.table_name);
    const missing = expectedTables.filter(t => !foundTableNames.includes(t));
    
    if (missing.length > 0) {
      console.log('\n❌ Missing tables:', missing.join(', '));
      console.log('\n📝 To create tables, run SQL from: database/mall-and-food-modules.sql');
      console.log('   in Vercel Postgres dashboard or Neon SQL Editor');
    } else {
      console.log('\n🎉 All tables exist! System ready for testing.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testTables();
