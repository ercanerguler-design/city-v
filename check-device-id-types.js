const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkDeviceIdTypes() {
  try {
    // business_cameras table
    const camerasColumn = await sql`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'business_cameras' AND column_name = 'device_id'
    `;
    
    console.log('business_cameras.device_id:', camerasColumn[0]);
    
    // iot_crowd_analysis table
    const iotColumn = await sql`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'iot_crowd_analysis' AND column_name = 'device_id'
    `;
    
    console.log('iot_crowd_analysis.device_id:', iotColumn[0]);
    
    // Örnek veriler
    const cameras = await sql`
      SELECT id, camera_name, device_id 
      FROM business_cameras 
      WHERE device_id IS NOT NULL 
      LIMIT 3
    `;
    
    console.log('\nExample cameras with device_id:');
    cameras.forEach(c => {
      console.log(`  ${c.camera_name}: ${c.device_id} (type: ${typeof c.device_id})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDeviceIdTypes();
