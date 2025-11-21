import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

/**
 * 📊 Date Range Report API
 * Belirli tarih aralığı için analitik rapor üretir
 * GET /api/business/report?businessUserId=20&startDate=2025-11-14&endDate=2025-11-14
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessUserId = searchParams.get('businessUserId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!businessUserId || !startDate || !endDate) {
      return NextResponse.json({
        success: false,
        error: 'businessUserId, startDate ve endDate gerekli'
      }, { status: 400 });
    }

    console.log('📊 Generating report:', { businessUserId, startDate, endDate });

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of day

    // Get analytics for date range
    const analytics = await sql`
      SELECT 
        ia.id,
        ia.camera_id,
        ia.person_count,
        ia.crowd_density,
        ia.detection_objects,
        ia.created_at,
        bc.camera_name,
        bc.location as camera_location
       FROM iot_ai_analysis ia
       JOIN business_cameras bc ON bc.id = ia.camera_id
       WHERE bc.business_user_id = ${businessUserId}
         AND ia.created_at >= ${start.toISOString()}
         AND ia.created_at <= ${end.toISOString()}
       ORDER BY ia.created_at DESC
    `;

    // Calculate summary stats
    const totalRecords = analytics.length;
    
    const summaryStats = {
      totalPeople: analytics.reduce((sum, a) => sum + (a.person_count || 0), 0),
      avgPeople: totalRecords > 0 ? Math.round(analytics.reduce((sum, a) => sum + (a.person_count || 0), 0) / totalRecords) : 0,
      maxPeople: totalRecords > 0 ? Math.max(...analytics.map(a => a.person_count || 0)) : 0,
      minPeople: totalRecords > 0 ? Math.min(...analytics.map(a => a.person_count || 0)) : 0,
      avgDensity: totalRecords > 0 ? (analytics.reduce((sum, a) => sum + (a.crowd_density || 0), 0) / totalRecords * 100).toFixed(1) : '0.0',
      
      totalEntries: analytics.reduce((sum, a) => {
        const obj = typeof a.detection_objects === 'string' ? JSON.parse(a.detection_objects) : a.detection_objects;
        return sum + (obj?.people_in || 0);
      }, 0),
      
      totalExits: analytics.reduce((sum, a) => {
        const obj = typeof a.detection_objects === 'string' ? JSON.parse(a.detection_objects) : a.detection_objects;
        return sum + (obj?.people_out || 0);
      }, 0),
      
      totalRecords,
      dateRange: {
        start: startDate,
        end: endDate
      }
    };

    // Hourly breakdown
    const hourlyData: Record<number, { count: number, people: number }> = {};
    analytics.forEach(a => {
      const hour = new Date(a.created_at).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { count: 0, people: 0 };
      }
      hourlyData[hour].count++;
      hourlyData[hour].people += (a.person_count || 0);
    });

    const hourlyBreakdown = Object.entries(hourlyData).map(([hour, data]) => ({
      hour: parseInt(hour),
      hourLabel: `${hour.toString().padStart(2, '0')}:00`,
      avgPeople: Math.round(data.people / data.count),
      totalRecords: data.count
    })).sort((a, b) => a.hour - b.hour);

    // Format analytics data
    const formattedAnalytics = analytics.map(a => {
      const obj = typeof a.detection_objects === 'string' ? JSON.parse(a.detection_objects) : a.detection_objects;
      return {
        id: a.id,
        camera_id: a.camera_id,
        camera_name: a.camera_name,
        camera_location: a.camera_location,
        people_count: a.person_count || 0,
        crowd_density: ((a.crowd_density || 0) * 100).toFixed(1),
        entries_count: obj?.people_in || 0,
        exits_count: obj?.people_out || 0,
        current_occupancy: obj?.current_occupancy || 0,
        timestamp: a.created_at,
        date: new Date(a.created_at).toLocaleDateString('tr-TR'),
        time: new Date(a.created_at).toLocaleTimeString('tr-TR')
      };
    });

    console.log(`✅ Report generated: ${totalRecords} records`);

    return NextResponse.json({
      success: true,
      summary: summaryStats,
      hourlyBreakdown,
      analytics: formattedAnalytics,
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Report generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Rapor oluşturulamadı',
      details: error.message
    }, { status: 500 });
  }
}
