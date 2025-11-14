-- Aggregate Daily Business Data
-- Bu script mevcut iot_ai_analysis verilerinden günlük özet çıkarır
-- Cron job veya manuel olarak çalıştırılabilir

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function aggregateDailyData(targetDate = null) {
  try {
    // Eğer tarih belirtilmemişse dün
    const date = targetDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    console.log(`📊 ${dateStr} tarihli günlük verileri topluyorum...`);

    // Tüm business user'ları al
    const businessUsersResult = await pool.query(
      'SELECT id FROM business_users WHERE is_active = true'
    );

    let successCount = 0;
    let errorCount = 0;

    for (const businessUser of businessUsersResult.rows) {
      const businessUserId = businessUser.id;

      try {
        // O gün için tüm kamera verilerini al
        const analyticsResult = await pool.query(`
          SELECT 
            ia.person_count,
            ia.entries,
            ia.exits,
            ia.current_occupancy,
            ia.crowd_density,
            ia.created_at,
            bc.id as camera_id
          FROM iot_ai_analysis ia
          JOIN business_cameras bc ON bc.id = ia.camera_id
          WHERE bc.business_user_id = $1
            AND DATE(ia.created_at) = $2
          ORDER BY ia.created_at
        `, [businessUserId, dateStr]);

        if (analyticsResult.rows.length === 0) {
          console.log(`⚠️ Business user ${businessUserId} için ${dateStr} tarihli veri yok`);
          continue;
        }

        const data = analyticsResult.rows;

        // Hesaplamalar
        const totalVisitors = data.reduce((sum, row) => sum + (row.person_count || 0), 0);
        const totalEntries = data.reduce((sum, row) => sum + (row.entries || 0), 0);
        const totalExits = data.reduce((sum, row) => sum + (row.exits || 0), 0);
        
        const occupancies = data.map(row => row.current_occupancy || 0);
        const avgOccupancy = occupancies.reduce((a, b) => a + b, 0) / occupancies.length;
        const maxOccupancy = Math.max(...occupancies);
        const minOccupancy = Math.min(...occupancies);

        const densities = data.map(row => row.crowd_density || 0);
        const avgCrowdDensity = densities.reduce((a, b) => a + b, 0) / densities.length;
        const maxCrowdDensity = Math.max(...densities);

        // En yoğun saat hesaplama
        const hourCounts = {};
        data.forEach(row => {
          const hour = new Date(row.created_at).getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + (row.person_count || 0);
        });
        
        let peakHour = 0;
        let peakHourVisitors = 0;
        for (const [hour, count] of Object.entries(hourCounts)) {
          if (count > peakHourVisitors) {
            peakHour = parseInt(hour);
            peakHourVisitors = count;
          }
        }

        // En yoğun dönem
        const morningCount = data.filter(r => {
          const h = new Date(r.created_at).getHours();
          return h >= 6 && h < 12;
        }).reduce((sum, r) => sum + (r.person_count || 0), 0);

        const afternoonCount = data.filter(r => {
          const h = new Date(r.created_at).getHours();
          return h >= 12 && h < 18;
        }).reduce((sum, r) => sum + (r.person_count || 0), 0);

        const eveningCount = data.filter(r => {
          const h = new Date(r.created_at).getHours();
          return h >= 18 && h < 24;
        }).reduce((sum, r) => sum + (r.person_count || 0), 0);

        const nightCount = data.filter(r => {
          const h = new Date(r.created_at).getHours();
          return h >= 0 && h < 6;
        }).reduce((sum, r) => sum + (r.person_count || 0), 0);

        const periodCounts = {
          morning: morningCount,
          afternoon: afternoonCount,
          evening: eveningCount,
          night: nightCount
        };

        const busiestPeriod = Object.keys(periodCounts).reduce((a, b) => 
          periodCounts[a] > periodCounts[b] ? a : b
        );

        // Aktif kamera sayısı
        const activeCamerasCount = new Set(data.map(r => r.camera_id)).size;

        // Database'e kaydet veya güncelle
        await pool.query(`
          INSERT INTO daily_business_summaries (
            business_user_id,
            summary_date,
            total_visitors,
            total_entries,
            total_exits,
            current_occupancy,
            avg_occupancy,
            max_occupancy,
            min_occupancy,
            avg_crowd_density,
            max_crowd_density,
            peak_hour,
            peak_hour_visitors,
            busiest_period,
            total_detections,
            active_cameras_count,
            total_analysis_records
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
          )
          ON CONFLICT (business_user_id, summary_date)
          DO UPDATE SET
            total_visitors = EXCLUDED.total_visitors,
            total_entries = EXCLUDED.total_entries,
            total_exits = EXCLUDED.total_exits,
            current_occupancy = EXCLUDED.current_occupancy,
            avg_occupancy = EXCLUDED.avg_occupancy,
            max_occupancy = EXCLUDED.max_occupancy,
            min_occupancy = EXCLUDED.min_occupancy,
            avg_crowd_density = EXCLUDED.avg_crowd_density,
            max_crowd_density = EXCLUDED.max_crowd_density,
            peak_hour = EXCLUDED.peak_hour,
            peak_hour_visitors = EXCLUDED.peak_hour_visitors,
            busiest_period = EXCLUDED.busiest_period,
            total_detections = EXCLUDED.total_detections,
            active_cameras_count = EXCLUDED.active_cameras_count,
            total_analysis_records = EXCLUDED.total_analysis_records,
            updated_at = NOW()
        `, [
          businessUserId,
          dateStr,
          totalVisitors,
          totalEntries,
          totalExits,
          data[data.length - 1]?.current_occupancy || 0, // Son değer
          avgOccupancy.toFixed(2),
          maxOccupancy,
          minOccupancy,
          avgCrowdDensity.toFixed(2),
          maxCrowdDensity.toFixed(2),
          peakHour,
          peakHourVisitors,
          busiestPeriod,
          data.length,
          activeCamerasCount,
          data.length
        ]);

        console.log(`✅ Business user ${businessUserId}: ${totalVisitors} ziyaretçi, ${data.length} kayıt`);
        successCount++;

      } catch (error) {
        console.error(`❌ Business user ${businessUserId} için hata:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Özet:`);
    console.log(`✅ Başarılı: ${successCount}`);
    console.log(`❌ Hatalı: ${errorCount}`);
    console.log(`📅 Tarih: ${dateStr}`);

  } catch (error) {
    console.error('❌ Agregasyon hatası:', error);
  } finally {
    await pool.end();
  }
}

// Script olarak çalıştırıldığında
if (require.main === module) {
  const targetDate = process.argv[2] ? new Date(process.argv[2]) : null;
  aggregateDailyData(targetDate);
}

module.exports = { aggregateDailyData };
