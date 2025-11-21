const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkMenuData() {
  try {
    console.log('🔍 Checking table schema...');
    const schema = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'business_menu_categories'
    `;
    console.log('business_menu_categories columns:', schema.map(s => s.column_name).join(', '));
    
    console.log('\n🔍 Checking menu categories...');
    const cats = await sql`SELECT * FROM business_menu_categories LIMIT 3`;
    console.log('Categories:', cats.length);
    if (cats.length > 0) console.log('Sample category:', cats[0]);
    
    console.log('\n🔍 Checking menu items...');
    const items = await sql`SELECT * FROM business_menu_items LIMIT 5`;
    console.log('Items:', items.length);
    if (items.length > 0) console.log('Sample item:', items[0]);
    
    console.log('\n🔍 Checking business_profiles working_hours...');
    const bp = await sql`SELECT id, business_name, working_hours FROM business_profiles WHERE user_id = 20`;
    console.log('Business:', bp[0]);
    
    console.log('\n🔍 Checking if tables exist...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%menu%'
    `;
    console.log('Menu tables:', tables.map(t => t.table_name));
    
  } catch (e) {
    console.error('❌ Error:', e.message);
    console.error('Stack:', e.stack);
  }
}

checkMenuData();
