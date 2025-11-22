const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkBusinessProfiles() {
  try {
    console.log('🔍 Checking business profiles addresses...\n');
    
    const result = await sql`
      SELECT 
        id,
        business_name,
        address,
        latitude,
        longitude
      FROM business_profiles
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      LIMIT 5
    `;
    
    console.log('📢 Business profiles found:', result.length);
    console.log('');
    
    result.forEach((row, index) => {
      console.log(`Business ${index + 1}:`);
      console.log(`  Name: ${row.business_name}`);
      console.log(`  Address type: ${typeof row.address}`);
      console.log(`  Address value: ${JSON.stringify(row.address)}`);
      console.log(`  Coordinates: [${row.latitude}, ${row.longitude}]`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Database error:', error);
  }
}

checkBusinessProfiles();