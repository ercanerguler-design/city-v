const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

/**
 * Business IoT Demo Data Setup
 * Mevcut business'lar için demo IoT cihazları ve analiz verileri ekler
 */
async function setupBusinessIoTData() {
  try {
    console.log('🎭 Business IoT demo verileri ekleniyor...');

    // Mevcut business'ları getir
    const businesses = await sql`
      SELECT id, business_name, latitude, longitude 
      FROM business_profiles 
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      LIMIT 5
    `;

    if (businesses.rows.length === 0) {
      console.log('⚠️  Hiç business bulunamadı. Önce business ekleyin.');
      return;
    }

    console.log(`📋 ${businesses.rows.length} business için IoT cihazları ekleniyor...`);

    for (const business of businesses.rows) {
      console.log(`\n🏢 ${business.business_name}`);

      // Her business için 2-3 kamera ekle
      const cameraLocations = ['Giriş', 'Çıkış', 'Kasa', 'Salon'];
      const cameraCount = 2 + Math.floor(Math.random() * 2); // 2-3 kamera

      for (let i = 0; i < cameraCount; i++) {
        const locationName = cameraLocations[i];
        const deviceId = `ESP32-BIZ-${business.id}-${String(i + 1).padStart(3, '0')}`;
        
        // Cihaz ekle
        const lat = parseFloat(business.latitude) + (Math.random() - 0.5) * 0.001;
        const lng = parseFloat(business.longitude) + (Math.random() - 0.5) * 0.001;
        const isOnline = Math.random() > 0.2; // %80 online
        
        const device = await sql`
          INSERT INTO iot_devices (
            business_id, device_id, device_name, device_type,
            location_name, stream_url, latitude, longitude,
            ip_address, firmware_version, resolution, fps,
            is_online, last_heartbeat, installed_date
          ) VALUES (
            ${business.id}, ${deviceId}, 
            ${business.business_name + ' - ' + locationName},
            'ESP32-CAM', ${locationName},
            ${'http://192.168.1.' + (100 + i) + '/stream'},
            ${lat}, ${lng},
            ${'192.168.1.' + (100 + i)},
            'v2.3.0', '1920x1080', 20,
            ${isOnline},
            NOW(), NOW()
          )
          ON CONFLICT (device_id) DO UPDATE SET
            is_online = EXCLUDED.is_online,
            last_heartbeat = EXCLUDED.last_heartbeat
          RETURNING device_id
        `;

        console.log(`  ✅ ${deviceId} - ${locationName}`);

        // Her cihaz için son 7 gün analiz verisi ekle
        const analysisCount = await addCrowdAnalysisData(
          device.rows[0].device_id, 
          business.id, 
          locationName
        );

        console.log(`     📊 ${analysisCount} analiz kaydı eklendi`);
      }

      // Business için günlük istatistikler
      await generateDailyAnalytics(business.id);
      console.log(`  📈 Günlük istatistikler oluşturuldu`);
    }

    // Toplam istatistikler
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM iot_devices) as total_devices,
        (SELECT COUNT(*) FROM iot_devices WHERE is_online = true) as online_devices,
        (SELECT COUNT(*) FROM iot_crowd_analysis) as total_analysis,
        (SELECT COUNT(*) FROM iot_device_analytics) as total_analytics
    `;

    console.log('\n🎉 DEMO VERİLER EKLENDİ!');
    console.log('═══════════════════════════════════');
    console.log(`📷 Toplam Cihaz: ${stats.rows[0].total_devices}`);
    console.log(`🟢 Online Cihaz: ${stats.rows[0].online_devices}`);
    console.log(`📊 Analiz Kayıtları: ${stats.rows[0].total_analysis}`);
    console.log(`📈 İstatistik Kayıtları: ${stats.rows[0].total_analytics}`);

  } catch (error) {
    console.error('❌ Hata:', error);
    console.error('Detay:', error.message);
    process.exit(1);
  }
}

/**
 * Bir cihaz için crowd analysis verileri ekler
 */
async function addCrowdAnalysisData(deviceId, businessId, locationName) {
  const now = new Date();
  let totalRecords = 0;

  // Son 7 gün
  for (let day = 0; day < 7; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);

    // Her gün için çalışma saatleri (09:00 - 22:00)
    for (let hour = 9; hour <= 22; hour++) {
      // Her saat içinde 4 kayıt (15 dakikada bir)
      for (let quarter = 0; quarter < 4; quarter++) {
        const timestamp = new Date(date);
        timestamp.setHours(hour, quarter * 15, 0, 0);

        // Gün içi yoğunluk profili
        const baseOccupancy = getBaseOccupancy(hour, day);
        const entries = Math.floor(baseOccupancy * (0.8 + Math.random() * 0.4));
        const exits = Math.floor(entries * (0.7 + Math.random() * 0.3));
        const currentOccupancy = Math.max(0, entries - exits + Math.floor(Math.random() * 10));
        
        const maxCapacity = locationName === 'Giriş' || locationName === 'Çıkış' ? 50 : 100;
        const occupancyPercent = Math.min(100, (currentOccupancy / maxCapacity) * 100);
        
        const crowdLevel = getCrowdLevel(occupancyPercent);

        await sql`
          INSERT INTO iot_crowd_analysis (
            device_id, business_id, analysis_type, location_name,
            total_entries, total_exits, current_occupancy, max_capacity,
            occupancy_percent, crowd_level, confidence_score,
            timestamp, processing_time_ms, temperature, humidity
          ) VALUES (
            ${deviceId}, ${businessId}, 'people_count', ${locationName},
            ${entries}, ${exits}, ${currentOccupancy}, ${maxCapacity},
            ${occupancyPercent.toFixed(2)}, ${crowdLevel},
            ${85 + Math.random() * 10},
            ${timestamp.toISOString()},
            ${150 + Math.floor(Math.random() * 200)},
            ${18 + Math.random() * 8}, ${40 + Math.floor(Math.random() * 30)}
          )
        `;

        totalRecords++;
      }
    }
  }

  return totalRecords;
}

/**
 * Saate göre baz yoğunluk döndürür
 */
function getBaseOccupancy(hour, dayOfWeek) {
  // Hafta sonu daha yoğun
  const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.5 : 1.0;
  
  // Saat bazlı yoğunluk
  if (hour >= 9 && hour < 12) return Math.floor(15 * weekendMultiplier); // Sabah
  if (hour >= 12 && hour < 14) return Math.floor(30 * weekendMultiplier); // Öğle
  if (hour >= 14 && hour < 17) return Math.floor(25 * weekendMultiplier); // Öğleden sonra
  if (hour >= 17 && hour < 20) return Math.floor(40 * weekendMultiplier); // Akşam (peak)
  if (hour >= 20 && hour < 22) return Math.floor(20 * weekendMultiplier); // Gece
  return Math.floor(10 * weekendMultiplier);
}

/**
 * Occupancy yüzdesine göre crowd level döndürür
 */
function getCrowdLevel(occupancyPercent) {
  if (occupancyPercent === 0) return 'empty';
  if (occupancyPercent < 30) return 'low';
  if (occupancyPercent < 60) return 'medium';
  if (occupancyPercent < 85) return 'high';
  return 'overcrowded';
}

/**
 * Business için günlük istatistikler oluşturur
 */
async function generateDailyAnalytics(businessId) {
  // Son 7 günün her saati için istatistik
  const devices = await sql`
    SELECT device_id FROM iot_devices WHERE business_id = ${businessId}
  `;

  for (const device of devices.rows) {
    for (let day = 0; day < 7; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      const dateStr = date.toISOString().split('T')[0];

      for (let hour = 9; hour <= 22; hour++) {
        // O saat için tüm analiz verilerini topla
        const hourlyStats = await sql`
          SELECT 
            COALESCE(SUM(total_entries), 0) as total_visitors,
            COALESCE(AVG(occupancy_percent), 0) as avg_occupancy,
            COALESCE(MAX(current_occupancy), 0) as peak_occupancy,
            COALESCE(AVG(total_entries - total_exits), 0) as avg_dwell
          FROM iot_crowd_analysis
          WHERE device_id = ${device.device_id}
            AND DATE(timestamp) = ${dateStr}
            AND EXTRACT(HOUR FROM timestamp) = ${hour}
        `;

        const stats = hourlyStats.rows[0];

        await sql`
          INSERT INTO iot_device_analytics (
            device_id, business_id, analysis_date, hour_of_day,
            total_visitors, avg_occupancy, peak_occupancy,
            avg_dwell_time_minutes, entry_rate_per_hour
          ) VALUES (
            ${device.device_id}, ${businessId}, ${dateStr}, ${hour},
            ${stats.total_visitors}, ${stats.avg_occupancy}, ${stats.peak_occupancy},
            ${(stats.avg_dwell / 4).toFixed(2)}, -- Quarter to minute conversion
            ${(stats.total_visitors / 1).toFixed(2)}
          )
          ON CONFLICT (device_id, analysis_date, hour_of_day) DO UPDATE SET
            total_visitors = EXCLUDED.total_visitors,
            avg_occupancy = EXCLUDED.avg_occupancy,
            peak_occupancy = EXCLUDED.peak_occupancy,
            last_updated = NOW()
        `;
      }
    }
  }
}

// Script çalıştır
if (require.main === module) {
  setupBusinessIoTData()
    .then(() => {
      console.log('\n✅ İşlem tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { setupBusinessIoTData };
