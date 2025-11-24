import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 🤖 AI Recommendations API
 * Gerçek IoT verilerine dayalı profesyonel AI önerileri
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessUserId = searchParams.get('businessUserId');

    if (!businessUserId) {
      return NextResponse.json(
        { error: 'Business user ID gerekli' },
        { status: 400 }
      );
    }

    console.log('🤖 AI recommendations for business:', businessUserId);

    // 1. Kamera verilerini çek
    const camerasResult = await sql`
      SELECT id, camera_name, is_active
      FROM business_cameras
      WHERE business_user_id = ${businessUserId}
    `;

    const cameras = camerasResult.rows;
    const activeCameras = cameras.filter(c => c.is_active);
    
    if (activeCameras.length === 0) {
      return NextResponse.json({
        success: true,
        hasData: false,
        message: 'Aktif kamera bulunamadı',
        recommendations: {
          immediate: ['Kameralarınızı aktif edin ve veri toplamaya başlayın'],
          shortTerm: [],
          strategic: []
        }
      });
    }

    const cameraIds = activeCameras.map(c => c.id);

    // 2. Son 24 saatin IoT verilerini çek
    const todayData = await sql`
      SELECT 
        camera_id,
        person_count,
        crowd_level,
        avg_age,
        male_count,
        female_count,
        created_at,
        EXTRACT(HOUR FROM created_at AT TIME ZONE 'Europe/Istanbul') as hour
      FROM iot_ai_analysis
      WHERE camera_id = ANY(${cameraIds})
        AND created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
    `;

    // 3. Son 7 günün verilerini çek (trend analizi için)
    const weekData = await sql`
      SELECT 
        camera_id,
        person_count,
        crowd_level,
        created_at,
        EXTRACT(HOUR FROM created_at AT TIME ZONE 'Europe/Istanbul') as hour,
        EXTRACT(DOW FROM created_at AT TIME ZONE 'Europe/Istanbul') as day_of_week
      FROM iot_ai_analysis
      WHERE camera_id = ANY(${cameraIds})
        AND created_at >= NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC
    `;

    console.log('📊 Data:', {
      today: todayData.rows.length,
      week: weekData.rows.length
    });

    if (todayData.rows.length === 0) {
      return NextResponse.json({
        success: true,
        hasData: false,
        message: 'Henüz veri toplanmamış',
        recommendations: {
          immediate: ['Kameralarınız aktif ancak henüz veri alınmadı. 5-10 dakika bekleyin.'],
          shortTerm: [],
          strategic: []
        }
      });
    }

    // 4. GERÇEK VERİ ANALİZİ
    const analysis = analyzeData(todayData.rows, weekData.rows);
    
    // 5. AI ÖNERİLERİ OLUŞTUR
    const recommendations = generateRecommendations(analysis, cameras.length);

    // 6. TAHMİNLER
    const predictions = generatePredictions(analysis);

    return NextResponse.json({
      success: true,
      hasData: true,
      dataQuality: {
        sampleSize: todayData.rows.length,
        weeklyAverage: Math.round(weekData.rows.length / 7),
        reliability: todayData.rows.length > 50 ? 'high' : todayData.rows.length > 20 ? 'medium' : 'low',
        lastUpdate: todayData.rows[0]?.created_at
      },
      analysis,
      recommendations,
      predictions
    });

  } catch (error: any) {
    console.error('❌ AI recommendations error:', error);
    return NextResponse.json(
      { error: 'Öneriler oluşturulamadı', details: error.message },
      { status: 500 }
    );
  }
}

// GERÇEK VERİ ANALİZ FONKSİYONU
function analyzeData(todayData: any[], weekData: any[]) {
  // Bugünkü toplam ziyaretçi
  const todayTotal = todayData.reduce((sum, d) => sum + (d.person_count || 0), 0);
  
  // Haftalık ortalama
  const weekTotal = weekData.reduce((sum, d) => sum + (d.person_count || 0), 0);
  const weekAverage = weekTotal / 7;

  // Trend hesapla (bugün vs haftalık ortalama)
  const trend = todayTotal > weekAverage * 1.1 ? 'increasing' 
              : todayTotal < weekAverage * 0.9 ? 'decreasing' 
              : 'stable';

  // Saatlik dağılım
  const hourlyStats = Array(24).fill(0).map((_, hour) => {
    const hourData = todayData.filter(d => d.hour === hour);
    const count = hourData.reduce((sum, d) => sum + (d.person_count || 0), 0);
    return { hour, count };
  });

  // En yoğun saatler
  const peakHours = [...hourlyStats]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(h => h.hour);

  // Ortalama kalabalık seviyesi
  const crowdLevels = todayData.map(d => d.crowd_level);
  const crowdStats = {
    low: crowdLevels.filter(l => l === 'low').length,
    medium: crowdLevels.filter(l => l === 'medium').length,
    high: crowdLevels.filter(l => l === 'high').length,
    overcrowded: crowdLevels.filter(l => l === 'overcrowded').length
  };

  // Cinsiyet dağılımı
  const totalMale = todayData.reduce((sum, d) => sum + (d.male_count || 0), 0);
  const totalFemale = todayData.reduce((sum, d) => sum + (d.female_count || 0), 0);
  const genderRatio = {
    male: totalMale,
    female: totalFemale,
    malePercent: totalMale + totalFemale > 0 ? Math.round((totalMale / (totalMale + totalFemale)) * 100) : 50,
    femalePercent: totalMale + totalFemale > 0 ? Math.round((totalFemale / (totalMale + totalFemale)) * 100) : 50
  };

  // Yaş ortalaması
  const ageData = todayData.filter(d => d.avg_age && d.avg_age > 0);
  const avgAge = ageData.length > 0 
    ? Math.round(ageData.reduce((sum, d) => sum + d.avg_age, 0) / ageData.length)
    : 0;

  return {
    todayTotal,
    weekAverage: Math.round(weekAverage),
    trend,
    peakHours,
    crowdStats,
    genderRatio,
    avgAge,
    hourlyStats
  };
}

// GERÇEKÇİ AI ÖNERİLERİ OLUŞTUR
function generateRecommendations(analysis: any, totalCameras: number) {
  const immediate: string[] = [];
  const shortTerm: string[] = [];
  const strategic: string[] = [];

  // 1. ANLIK ÖNERİLER (Bugüne göre)
  if (analysis.todayTotal === 0) {
    immediate.push('⚠️ Bugün henüz ziyaretçi tespit edilmedi. Kamera açılarını kontrol edin.');
  } else if (analysis.todayTotal < 10) {
    immediate.push('📊 Düşük trafik tespit edildi. Sosyal medya kampanyası başlatabilirsiniz.');
  } else if (analysis.todayTotal > 100) {
    immediate.push('🎉 Yüksek trafik! Müşteri deneyimini optimize etmek için personel desteği artırın.');
  }

  // Peak hours önerisi
  if (analysis.peakHours.length > 0) {
    const peakHoursStr = analysis.peakHours.map((h: number) => `${h}:00`).join(', ');
    immediate.push(`⏰ En yoğun saatler: ${peakHoursStr}. Bu saatlerde ekstra personel hazır bulundurun.`);
  }

  // Kalabalık seviyesi
  if (analysis.crowdStats.overcrowded > 10) {
    immediate.push('🚨 Çok kalabalık anlar tespit edildi! Kapasite yönetimi gerekebilir.');
  } else if (analysis.crowdStats.high > 20) {
    immediate.push('📈 Yoğunluk artışı var. Müşteri akışını izleyin.');
  }

  // 2. KISA VADELİ ÖNERİLER (Haftalık trend)
  if (analysis.trend === 'increasing') {
    shortTerm.push('📈 Ziyaretçi sayıları artıyor! Stok ve personel planlamasını gözden geçirin.');
    shortTerm.push('💰 Artan talebe göre fiyatlandırma stratejisi optimize edilebilir.');
  } else if (analysis.trend === 'decreasing') {
    shortTerm.push('📉 Ziyaretçi sayıları düşüyor. İndirim kampanyası veya özel etkinlik düzenleyin.');
    shortTerm.push('🎯 Müşteri geri dönüşünü artırmak için sadakat programı başlatın.');
  } else {
    shortTerm.push('➡️ Ziyaretçi sayıları stabil. Mevcut stratejilerinizi sürdürün.');
  }

  // Cinsiyet dağılımı önerisi
  if (analysis.genderRatio.malePercent > 70) {
    shortTerm.push(`👔 Müşterilerin %${analysis.genderRatio.malePercent}'i erkek. Kadın hedef kitle için özel kampanyalar düzenleyin.`);
  } else if (analysis.genderRatio.femalePercent > 70) {
    shortTerm.push(`👗 Müşterilerin %${analysis.genderRatio.femalePercent}'i kadın. Erkek hedef kitle için ürün çeşitliliğini artırın.`);
  } else {
    shortTerm.push('⚖️ Dengeli cinsiyet dağılımı. Mevcut pazarlama stratejiniz etkili.');
  }

  // 3. STRATEJİK ÖNERİLER
  if (totalCameras < 5) {
    strategic.push('📹 Daha detaylı analiz için kamera sayısını artırın (önerilen: 5+).');
  }

  if (analysis.avgAge > 0) {
    if (analysis.avgAge < 25) {
      strategic.push(`🎮 Ortalama yaş ${analysis.avgAge}. Genç kitleye hitap eden dijital pazarlama ve sosyal medya stratejileri geliştirin.`);
    } else if (analysis.avgAge > 45) {
      strategic.push(`👴 Ortalama yaş ${analysis.avgAge}. Olgun kitleye yönelik kalite ve güven odaklı mesajlar verin.`);
    } else {
      strategic.push(`💼 Ortalama yaş ${analysis.avgAge}. Çalışan profesyonellere uygun hızlı hizmet ve pratik çözümler sunun.`);
    }
  }

  // Veri kalitesi önerisi
  if (analysis.todayTotal < 50) {
    strategic.push('📊 Daha güvenilir AI önerileri için en az 50+ günlük veri noktası hedefleyin.');
  }

  strategic.push('🤖 AI modellerimiz sürekli öğreniyor. Düzenli veri toplayarak tahmin doğruluğu artar.');

  return {
    immediate,
    shortTerm,
    strategic
  };
}

// TAHMİN OLUŞTUR
function generatePredictions(analysis: any) {
  const currentHour = new Date().getHours();
  
  // Bir sonraki saatin tahmini
  const nextHourStat = analysis.hourlyStats.find((h: any) => h.hour === (currentHour + 1) % 24);
  const avgHourlyVisitors = analysis.todayTotal / 24;
  
  const nextHourPrediction = nextHourStat?.count || Math.round(avgHourlyVisitors);

  // Peak time tahmini
  const peakHour = analysis.peakHours[0] || 14;
  const peakVisitors = analysis.hourlyStats.find((h: any) => h.hour === peakHour)?.count || 0;

  // Yoğunluk seviyesi tahmini
  let predictedCrowdLevel = 'low';
  if (nextHourPrediction > 20) predictedCrowdLevel = 'high';
  else if (nextHourPrediction > 10) predictedCrowdLevel = 'medium';

  return {
    nextHour: {
      time: `${(currentHour + 1) % 24}:00`,
      expectedVisitors: nextHourPrediction,
      crowdLevel: predictedCrowdLevel,
      confidence: analysis.todayTotal > 50 ? 85 : analysis.todayTotal > 20 ? 70 : 50
    },
    peakTime: {
      hour: peakHour,
      expectedVisitors: peakVisitors,
      time: `${peakHour}:00-${(peakHour + 1) % 24}:00`
    },
    dailyForecast: {
      expectedTotal: Math.round(analysis.weekAverage * (analysis.trend === 'increasing' ? 1.1 : analysis.trend === 'decreasing' ? 0.9 : 1)),
      trend: analysis.trend,
      confidence: analysis.weekAverage > 0 ? 80 : 50
    }
  };
}
