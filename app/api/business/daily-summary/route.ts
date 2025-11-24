import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-key-2024';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessUserId = searchParams.get('businessUserId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!businessUserId) {
      return NextResponse.json(
        { success: false, error: 'businessUserId gerekli' },
        { status: 400 }
      );
    }

    // JWT token authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let user;
    
    try {
      user = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log(`📊 Günlük özet verisi sorgulanıyor: User ${businessUserId}, Tarih ${date}`);

    // Belirtilen tarihteki özet verileri al
    const summaryResult = await sql`
      SELECT 
        id,
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
        total_analysis_records,
        created_at,
        updated_at
      FROM daily_business_summaries
      WHERE business_user_id = ${businessUserId} AND summary_date = ${date}
    `;

    if (summaryResult.length === 0) {
      console.log(`⚠️ ${date} tarihli günlük özet verisi bulunamadı`);
      return NextResponse.json({
        success: false,
        error: 'Bu tarih için günlük özet verisi bulunamadı',
        message: 'Veri henüz oluşturulmamış olabilir'
      }, { status: 404 });
    }

    const summary = summaryResult[0];

    console.log(`✅ Günlük özet verisi bulundu: ${summary.total_visitors} ziyaretçi`);

    return NextResponse.json({
      success: true,
      summary: {
        id: summary.id,
        businessUserId: summary.business_user_id,
        date: summary.summary_date,
        metrics: {
          totalVisitors: summary.total_visitors,
          totalEntries: summary.total_entries,
          totalExits: summary.total_exits,
          currentOccupancy: summary.current_occupancy,
          avgOccupancy: parseFloat(summary.avg_occupancy),
          maxOccupancy: summary.max_occupancy,
          minOccupancy: summary.min_occupancy,
          avgCrowdDensity: parseFloat(summary.avg_crowd_density),
          maxCrowdDensity: parseFloat(summary.max_crowd_density)
        },
        timeAnalysis: {
          peakHour: summary.peak_hour,
          peakHourVisitors: summary.peak_hour_visitors,
          busiestPeriod: summary.busiest_period
        },
        cameraData: {
          totalDetections: summary.total_detections,
          activeCamerasCount: summary.active_cameras_count,
          totalAnalysisRecords: summary.total_analysis_records
        },
        timestamps: {
          createdAt: summary.created_at,
          updatedAt: summary.updated_at
        }
      }
    });

  } catch (error) {
    console.error('❌ Günlük özet API hatası:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Günlük özet verisi alınamadı',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

// Tarih aralığı için özet veriler
export async function POST(request: NextRequest) {
  try {
    const { businessUserId, startDate, endDate } = await request.json();

    if (!businessUserId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'businessUserId, startDate ve endDate gerekli' },
        { status: 400 }
      );
    }

    console.log(`📊 Tarih aralığı özet verisi: ${startDate} - ${endDate}`);

    const summariesResult = await query(
      `SELECT 
        id,
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
        total_analysis_records,
        created_at,
        updated_at
      FROM daily_business_summaries
      WHERE business_user_id = $1 
        AND summary_date >= $2 
        AND summary_date <= $3
      ORDER BY summary_date DESC`,
      [businessUserId, startDate, endDate]
    );

    console.log(`✅ ${summariesResult.rows.length} günlük özet verisi bulundu`);

    const summaries = summariesResult.rows.map(row => ({
      id: row.id,
      date: row.summary_date,
      totalVisitors: row.total_visitors,
      totalEntries: row.total_entries,
      totalExits: row.total_exits,
      currentOccupancy: row.current_occupancy,
      avgOccupancy: parseFloat(row.avg_occupancy),
      maxOccupancy: row.max_occupancy,
      minOccupancy: row.min_occupancy,
      avgCrowdDensity: parseFloat(row.avg_crowd_density),
      maxCrowdDensity: parseFloat(row.max_crowd_density),
      peakHour: row.peak_hour,
      peakHourVisitors: row.peak_hour_visitors,
      busiestPeriod: row.busiest_period,
      totalDetections: row.total_detections,
      activeCamerasCount: row.active_cameras_count,
      totalAnalysisRecords: row.total_analysis_records
    }));

    // Toplam istatistikler
    const totalStats = {
      totalVisitorsSum: summaries.reduce((sum, s) => sum + s.totalVisitors, 0),
      totalEntriesSum: summaries.reduce((sum, s) => sum + s.totalEntries, 0),
      totalExitsSum: summaries.reduce((sum, s) => sum + s.totalExits, 0),
      avgOccupancyAvg: summaries.reduce((sum, s) => sum + s.avgOccupancy, 0) / summaries.length,
      maxOccupancyPeak: Math.max(...summaries.map(s => s.maxOccupancy)),
      avgDensityAvg: summaries.reduce((sum, s) => sum + s.avgCrowdDensity, 0) / summaries.length,
      totalDays: summaries.length
    };

    return NextResponse.json({
      success: true,
      summaries,
      totalStats,
      dateRange: {
        start: startDate,
        end: endDate
      }
    });

  } catch (error) {
    console.error('❌ Tarih aralığı özet API hatası:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Tarih aralığı özet verisi alınamadı',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

