import { sql } from '@vercel/postgres';

/**
 * Business Dashboard - Günlük İstatistik Arşivleme Scripti
 * 
 * Bu script her gün 23:59'da çalışır ve:
 * 1. Bugünkü tüm business verilerini hesaplar
 * 2. business_daily_stats tablosuna kaydeder
 * 3. Ertesi gün (00:00) dashboard temiz başlar
 * 
 * Kullanım:
 * - Cron job ile günlük 23:59'da çalıştırın
 * - Vercel Cron: vercel.json içinde tanımlanmalı
 * - Manual test: node database/archiveDailyStats.js
 */

async function archiveDailyStats() {
  console.log('🕐 [23:59] Günlük istatistik arşivleme başlıyor...\n');
  
  try {
    // Aktif tüm business kullanıcılarını al
    const businessUsers = await sql`
      SELECT id, email, full_name
      FROM business_users
      WHERE is_active = true
      ORDER BY id
    `;

    console.log(`👥 ${businessUsers.rows.length} aktif business kullanıcısı bulundu\n`);

    let archivedCount = 0;
    let errorCount = 0;

    for (const user of businessUsers.rows) {
      try {
        console.log(`📊 ${user.email} için bugünkü veriler hesaplanıyor...`);

        // Bugünkü istatistikleri hesapla
        const stats = await sql`
          SELECT 
            COALESCE(SUM(ia.person_count), 0)::INTEGER as total_visitors,
            COALESCE(SUM((ia.detection_objects->>'people_in')::INTEGER), 0)::INTEGER as total_entries,
            COALESCE(SUM((ia.detection_objects->>'people_out')::INTEGER), 0)::INTEGER as total_exits,
            COALESCE(MAX(ia.person_count), 0)::INTEGER as peak_occupancy,
            COALESCE(AVG(ia.person_count), 0)::NUMERIC as avg_occupancy,
            COUNT(DISTINCT bc.id)::INTEGER as active_cameras
          FROM iot_ai_analysis ia
          JOIN business_cameras bc ON ia.camera_id = bc.id
          WHERE bc.business_user_id = ${user.id}
            AND DATE(ia.created_at) = CURRENT_DATE
        `;

        // En yoğun saati bul
        const busiestHour = await sql`
          SELECT 
            EXTRACT(HOUR FROM ia.created_at)::INTEGER as hour,
            COUNT(*) as count
          FROM iot_ai_analysis ia
          JOIN business_cameras bc ON ia.camera_id = bc.id
          WHERE bc.business_user_id = ${user.id}
            AND DATE(ia.created_at) = CURRENT_DATE
          GROUP BY EXTRACT(HOUR FROM ia.created_at)
          ORDER BY COUNT(*) DESC
          LIMIT 1
        `;

        // Favorileri al
        const favorites = await sql`
          SELECT COUNT(*) as count
          FROM business_favorites_stats
          WHERE business_id = (
            SELECT id FROM business_profiles WHERE user_id = ${user.id} LIMIT 1
          )
          AND DATE(created_at) = CURRENT_DATE
        `;

        const statData = stats.rows[0];
        const busiestData = busiestHour.rows[0] || { hour: 12, count: 0 };
        const favData = favorites.rows[0] || { count: 0 };

        // Verileri arşivle
        await sql`
          INSERT INTO business_daily_stats (
            business_user_id,
            stat_date,
            total_visitors,
            total_entries,
            total_exits,
            peak_occupancy,
            avg_occupancy,
            total_cameras_active,
            busiest_hour,
            busiest_hour_count,
            favorites_added,
            archived_at
          ) VALUES (
            ${user.id},
            CURRENT_DATE,
            ${statData.total_visitors},
            ${statData.total_entries},
            ${statData.total_exits},
            ${statData.peak_occupancy},
            ${statData.avg_occupancy},
            ${statData.active_cameras},
            ${busiestData.hour},
            ${busiestData.count},
            ${favData.count},
            NOW()
          )
          ON CONFLICT (business_user_id, stat_date) 
          DO UPDATE SET
            total_visitors = EXCLUDED.total_visitors,
            total_entries = EXCLUDED.total_entries,
            total_exits = EXCLUDED.total_exits,
            peak_occupancy = EXCLUDED.peak_occupancy,
            avg_occupancy = EXCLUDED.avg_occupancy,
            total_cameras_active = EXCLUDED.total_cameras_active,
            busiest_hour = EXCLUDED.busiest_hour,
            busiest_hour_count = EXCLUDED.busiest_hour_count,
            favorites_added = EXCLUDED.favorites_added,
            archived_at = NOW()
        `;

        console.log(`   ✅ Arşivlendi: ${statData.total_visitors} ziyaretçi, ${statData.active_cameras} kamera`);
        archivedCount++;

      } catch (userError) {
        console.error(`   ❌ ${user.email} için hata:`, userError);
        errorCount++;
      }
    }

    console.log(`\n✅ Arşivleme tamamlandı!`);
    console.log(`   📦 ${archivedCount} kullanıcı arşivlendi`);
    console.log(`   ❌ ${errorCount} hata\n`);

    console.log('🌅 Yeni gün (00:00) başladığında dashboard sıfırdan başlayacak\n');

    return { success: true, archived: archivedCount, errors: errorCount };

  } catch (error) {
    console.error('❌ Arşivleme hatası:', error);
    throw error;
  }
}

// Script olarak çalıştırılırsa
if (require.main === module) {
  archiveDailyStats()
    .then((result) => {
      console.log('✅ Script başarıyla tamamlandı:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script hatası:', error);
      process.exit(1);
    });
}

module.exports = { archiveDailyStats };
