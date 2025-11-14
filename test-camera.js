const { sql } = require('@vercel/postgres');

async function checkCamera() {
  try {
    const result = await sql`
      SELECT id, device_id, camera_name, ip_address, port, stream_url, username, password
      FROM business_cameras 
      WHERE user_id = 14 
      ORDER BY id DESC 
      LIMIT 1
    `;
    
    console.log('\n📷 Kamera Bilgileri:');
    console.log(JSON.stringify(result.rows[0], null, 2));
    
    if (result.rows[0]) {
      const cam = result.rows[0];
      console.log('\n🔗 Stream URL Test:');
      
      // Eğer stream_url varsa kullan
      if (cam.stream_url) {
        console.log('Database stream_url:', cam.stream_url);
      } else {
        // Yoksa IP:Port'tan oluştur
        let url = `http://${cam.ip_address}:${cam.port}/stream`;
        
        // Username/password varsa ekle
        if (cam.username && cam.password) {
          url = `http://${cam.username}:${cam.password}@${cam.ip_address}:${cam.port}/stream`;
        }
        
        console.log('Oluşturulan URL:', url);
      }
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
  
  process.exit(0);
}

checkCamera();
