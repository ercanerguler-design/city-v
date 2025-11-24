// Business dashboard IoT veri çekme sorununu test et
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function testBusinessCameraAnalytics() {
  console.log('🧪 Business Camera Analytics Test - User ID 23');
  
  try {
    // 1. Business cameras kontrol
    const cameras = await sql`
      SELECT id, camera_name, device_id, is_active, last_seen
      FROM business_cameras 
      WHERE business_user_id = 23
      ORDER BY created_at DESC
    `;
    
    console.log(`📹 Found ${cameras.length} cameras for business user 23:`);
    cameras.forEach(cam => {
      console.log(`  📷 ${cam.camera_name} (ID: ${cam.id}, DeviceID: ${cam.device_id}, Active: ${cam.is_active})`);
    });
    
    // 2. IoT devices kontrol et
    const iotDevices = await sql`
      SELECT device_id, business_camera_id, is_active, last_seen
      FROM iot_devices
      WHERE business_camera_id = ANY(${cameras.map(c => c.id)})
    `;
    
    console.log(`\n🔌 IoT Devices: ${iotDevices.length} adet`);
    iotDevices.forEach(dev => {
      console.log(`  🔌 DeviceID: ${dev.device_id}, Camera: ${dev.business_camera_id}, Active: ${dev.is_active}`);
    });
    
    // 3. iot_ai_analysis tablosunu da kontrol et
    const aiAnalysis = await sql`
      SELECT camera_id, person_count, crowd_density, created_at
      FROM iot_ai_analysis
      WHERE camera_id = ANY(${cameras.map(c => c.id)})
        AND created_at >= NOW() - INTERVAL '1 hour'
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    console.log(`\n🤖 AI Analysis Records (son 1 saat): ${aiAnalysis.length} kayıt`);
    aiAnalysis.forEach((rec, i) => {
      console.log(`  ${i+1}. ${rec.created_at.toISOString().slice(11,19)} - Camera: ${rec.camera_id}, People: ${rec.person_count}, Density: ${rec.crowd_density}`);
    });
    
    // 4. İki tablo arasındaki bağlantıyı kontrol et
    console.log('\n🔍 Checking data connection between tables...');
    
    // iot_crowd_analysis tablosu var mı?
    const crowdAnalysisCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'iot_crowd_analysis'
    `;
    
    console.log(`📊 iot_crowd_analysis table exists: ${crowdAnalysisCheck.length > 0}`);
    
    if (crowdAnalysisCheck.length > 0) {
      const crowdAnalysis = await sql`
        SELECT device_id, people_count, current_occupancy, crowd_density, 
               analysis_timestamp
        FROM iot_crowd_analysis
        WHERE analysis_timestamp >= NOW() - INTERVAL '1 hour'
        ORDER BY analysis_timestamp DESC
        LIMIT 5
      `;
      
      console.log(`📊 Crowd Analysis Records: ${crowdAnalysis.length} kayıt`);
      crowdAnalysis.forEach((rec, i) => {
        console.log(`  ${i+1}. ${rec.analysis_timestamp} - Device: ${rec.device_id}, People: ${rec.people_count}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testBusinessCameraAnalytics();