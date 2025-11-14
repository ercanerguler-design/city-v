const { sql } = require('@vercel/postgres');

async function fixNaNValues() {
  try {
    console.log('🔧 Fixing NaN values in iot_ai_analysis...');
    
    // Set all NaN crowd_density to 0
    const result = await sql`
      UPDATE iot_ai_analysis
      SET crowd_density = 0
      WHERE crowd_density IS NULL 
         OR crowd_density = 'NaN'::numeric
         OR crowd_density < 0
         OR crowd_density > 1
    `;
    
    console.log(`✅ Fixed ${result.rowCount} rows with invalid crowd_density`);
    
    // Check remaining data
    const check = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN crowd_density IS NULL THEN 1 END) as null_count,
        AVG(crowd_density) as avg_density,
        MIN(crowd_density) as min_density,
        MAX(crowd_density) as max_density
      FROM iot_ai_analysis
    `;
    
    console.log('\n📊 Current data stats:');
    console.table(check.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixNaNValues();
