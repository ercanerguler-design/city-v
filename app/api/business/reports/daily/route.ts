import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 📊 Daily Reports API
 * GET /api/business/reports/daily?businessUserId=23&date=2025-11-25
 * POST /api/business/reports/generate - Rapor oluştur (24 saat sonunda otomatik veya manuel)
 */

// GET - Günlük raporu getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessUserId = searchParams.get('businessUserId');
    const reportDate = searchParams.get('date'); // YYYY-MM-DD format

    if (!businessUserId) {
      return NextResponse.json(
        { success: false, error: 'businessUserId gerekli' },
        { status: 400 }
      );
    }

    let query;
    if (reportDate) {
      // Belirli bir tarih için rapor getir
      query = await sql`
        SELECT * FROM business_daily_reports
        WHERE business_user_id = ${parseInt(businessUserId)}
          AND report_date = ${reportDate}
        ORDER BY created_at DESC
        LIMIT 1
      `;
    } else {
      // Son 30 günün raporlarını getir
      query = await sql`
        SELECT * FROM business_daily_reports
        WHERE business_user_id = ${parseInt(businessUserId)}
        ORDER BY report_date DESC
        LIMIT 30
      `;
    }

    return NextResponse.json({
      success: true,
      reports: query.rows,
      count: query.rows.length
    });

  } catch (error: any) {
    console.error('❌ Daily reports GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Günlük rapor oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessUserId, reportDate } = body;

    if (!businessUserId) {
      return NextResponse.json(
        { success: false, error: 'businessUserId gerekli' },
        { status: 400 }
      );
    }

    // Rapor tarihi belirtilmemişse dün kullan (bugün bitmediği için)
    const targetDate = reportDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`📊 Günlük rapor oluşturuluyor: User ${businessUserId}, Tarih ${targetDate}`);

    // 1. Bu tarih için zaten rapor var mı kontrol et
    const existingReport = await sql`
      SELECT id FROM business_daily_reports
      WHERE business_user_id = ${parseInt(businessUserId)}
        AND report_date = ${targetDate}
    `;

    if (existingReport.rows.length > 0) {
      console.log('⚠️ Bu tarih için rapor zaten mevcut, güncelleniyor...');
      // Varolan raporu sil, yenisini oluştur
      await sql`
        DELETE FROM business_daily_reports
        WHERE id = ${existingReport.rows[0].id}
      `;
    }

    // 2. Kullanıcının aktif kameralarını bul
    const camerasResult = await sql`
      SELECT id, camera_name, location_description
      FROM business_cameras
      WHERE business_user_id = ${parseInt(businessUserId)}
        AND is_active = true
    `;

    const cameras = camerasResult.rows;
    const cameraIds = cameras.map(c => c.id);

    if (cameraIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Aktif kamera bulunamadı',
        message: 'Rapor oluşturmak için en az bir aktif kamera gerekli'
      }, { status: 400 });
    }

    console.log(`📹 ${cameraIds.length} aktif kamera bulundu`);

    // 3. Belirtilen tarih için IoT verilerini topla
    const iotDataResult = await sql`
      SELECT 
        ca.device_id,
        ca.people_count,
        ca.crowd_density,
        ca.confidence_score,
        ca.analysis_timestamp,
        EXTRACT(HOUR FROM (ca.analysis_timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Istanbul')) as hour
      FROM iot_crowd_analysis ca
      WHERE CAST(ca.device_id AS INTEGER) = ANY(${cameraIds})
        AND DATE(ca.analysis_timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Istanbul') = ${targetDate}
      ORDER BY ca.analysis_timestamp
    `;

    const iotData = iotDataResult.rows;
    console.log(`📦 ${iotData.length} IoT kaydı bulundu`);

    if (iotData.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Veri bulunamadı',
        message: `${targetDate} tarihinde IoT verisi bulunamadı`
      }, { status: 404 });
    }

    // 4. Metrikleri hesapla
    
    // Toplam ziyaretçi (maksimum people_count)
    const totalVisitors = Math.max(...iotData.map(d => parseInt(d.people_count) || 0));

    // Saatlik dağılım hesapla
    const hourlyMap = new Map<number, { visitors: number[], density: string[] }>();
    iotData.forEach(record => {
      const hour = parseInt(record.hour);
      if (!hourlyMap.has(hour)) {
        hourlyMap.set(hour, { visitors: [], density: [] });
      }
      hourlyMap.get(hour)!.visitors.push(parseInt(record.people_count) || 0);
      hourlyMap.get(hour)!.density.push(record.crowd_density || 'empty');
    });

    const hourlyDistribution = Array.from(hourlyMap.entries()).map(([hour, data]) => ({
      hour,
      visitors: Math.max(...data.visitors),
      avg_visitors: Math.round(data.visitors.reduce((a, b) => a + b, 0) / data.visitors.length),
      density: data.density[Math.floor(data.density.length / 2)] // median density
    })).sort((a, b) => a.hour - b.hour);

    // En yoğun ve en boş saatler
    const peakHourData = [...hourlyDistribution].sort((a, b) => b.visitors - a.visitors)[0];
    const quietestHourData = [...hourlyDistribution].sort((a, b) => a.visitors - b.visitors)[0];

    // Ortalama yoğunluk (tüm saatlerin ortalaması)
    const avgOccupancy = hourlyDistribution.length > 0
      ? Math.round(hourlyDistribution.reduce((sum, h) => sum + h.avg_visitors, 0) / hourlyDistribution.length)
      : 0;

    // Kamera bazlı dağılım
    const cameraMap = new Map<string, number[]>();
    iotData.forEach(record => {
      const deviceId = record.device_id;
      if (!cameraMap.has(deviceId)) {
        cameraMap.set(deviceId, []);
      }
      cameraMap.get(deviceId)!.push(parseInt(record.people_count) || 0);
    });

    const cameraBreakdown = Array.from(cameraMap.entries()).map(([deviceId, counts]) => {
      const camera = cameras.find(c => String(c.id) === deviceId);
      return {
        camera_id: parseInt(deviceId),
        camera_name: camera?.camera_name || 'Bilinmeyen Kamera',
        location: camera?.location_description || 'Belirtilmemiş',
        max_visitors: Math.max(...counts),
        avg_visitors: Math.round(counts.reduce((a, b) => a + b, 0) / counts.length),
        total_detections: counts.length
      };
    });

    // Yoğunluk seviyeleri dağılımı
    const crowdLevels: Record<string, number> = {
      empty: 0,
      low: 0,
      medium: 0,
      high: 0,
      overcrowded: 0
    };
    iotData.forEach(record => {
      const level = record.crowd_density || 'empty';
      if (level in crowdLevels) {
        crowdLevels[level]++;
      }
    });

    // Ortalama confidence score
    const confidenceScores = iotData.map(d => parseFloat(d.confidence_score) || 0).filter(s => s > 0);
    const avgConfidence = confidenceScores.length > 0
      ? Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length * 100) / 100
      : 0;

    // AI Önerileri oluştur
    const aiRecommendations = [];

    // Boş saatlere personel optimizasyonu
    if (quietestHourData) {
      aiRecommendations.push({
        type: 'optimization',
        title: 'Personel Optimizasyonu',
        description: `${quietestHourData.hour}:00 - ${(quietestHourData.hour + 2) % 24}:00 arası en düşük yoğunluk (${quietestHourData.visitors} kişi). 1 personel azaltabilirsiniz.`,
        impact: `💰 Aylık ~₺${Math.round(quietestHourData.hour * 450)} tasarruf`,
        priority: 'medium'
      });
    }

    // Yoğun saatlere kampanya önerisi
    if (peakHourData) {
      aiRecommendations.push({
        type: 'preparation',
        title: 'Yoğunluk Hazırlığı',
        description: `${peakHourData.hour}:00 en yoğun saat (${peakHourData.visitors} kişi). Ekstra personel planlaması önerilir.`,
        impact: `👥 +${Math.ceil(cameras.length * 0.3)} personel tavsiye edilir`,
        priority: 'high'
      });
    }

    // Ortalama yoğunluğa göre öneri
    if (avgOccupancy < 10) {
      aiRecommendations.push({
        type: 'campaign',
        title: 'Kampanya Fırsatı',
        description: `Ortalama yoğunluk düşük (${avgOccupancy} kişi). Özel indirim kampanyası düşünün.`,
        impact: `📈 %25-40 müşteri artışı potansiyeli`,
        priority: 'high'
      });
    }

    // 5. Raporu veritabanına kaydet
    const reportResult = await sql`
      INSERT INTO business_daily_reports (
        business_user_id,
        report_date,
        total_visitors,
        peak_hour,
        peak_hour_count,
        quietest_hour,
        quietest_hour_count,
        average_occupancy,
        active_cameras,
        total_detections,
        average_confidence,
        hourly_distribution,
        camera_breakdown,
        crowd_levels,
        ai_recommendations,
        generated_at
      ) VALUES (
        ${parseInt(businessUserId)},
        ${targetDate},
        ${totalVisitors},
        ${peakHourData?.hour || 0},
        ${peakHourData?.visitors || 0},
        ${quietestHourData?.hour || 0},
        ${quietestHourData?.visitors || 0},
        ${avgOccupancy},
        ${cameras.length},
        ${iotData.length},
        ${avgConfidence},
        ${JSON.stringify(hourlyDistribution)},
        ${JSON.stringify(cameraBreakdown)},
        ${JSON.stringify(crowdLevels)},
        ${JSON.stringify(aiRecommendations)},
        NOW()
      )
      RETURNING *
    `;

    const report = reportResult.rows[0];

    console.log(`✅ Günlük rapor oluşturuldu: Report ID ${report.id}`);

    return NextResponse.json({
      success: true,
      message: 'Günlük rapor başarıyla oluşturuldu',
      report: {
        id: report.id,
        date: report.report_date,
        totalVisitors: report.total_visitors,
        peakHour: report.peak_hour,
        avgOccupancy: report.average_occupancy,
        activeCameras: report.active_cameras,
        hourlyDistribution: report.hourly_distribution,
        cameraBreakdown: report.camera_breakdown,
        aiRecommendations: report.ai_recommendations
      }
    });

  } catch (error: any) {
    console.error('❌ Daily report generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
