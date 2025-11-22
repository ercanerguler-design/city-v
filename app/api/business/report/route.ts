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

    // Get analytics for date range - iot_crowd_analysis tablosundan
    console.log('📊 Query params:', { businessUserId, start: start.toISOString(), end: end.toISOString() });
    
    const analytics = await sql`
      SELECT 
        ica.id,
        ica.device_id,
        ica.people_count as person_count,
        ica.crowd_density,
        ica.timestamp as created_at,
        bc.camera_name,
        bc.location_description as camera_location
       FROM iot_crowd_analysis ica
       JOIN business_cameras bc ON bc.device_id = ica.device_id
       WHERE bc.business_user_id = ${parseInt(businessUserId)}
         AND ica.timestamp >= ${start.toISOString()}
         AND ica.timestamp <= ${end.toISOString()}
       ORDER BY ica.timestamp DESC
    `;
    
    console.log('📊 Found analytics records:', analytics.length);

    // Calculate summary stats
    const totalRecords = analytics.length;
    
    const summaryStats = {
      totalPeople: analytics.reduce((sum, a) => sum + (a.person_count || 0), 0),
      avgPeople: totalRecords > 0 ? Math.round(analytics.reduce((sum, a) => sum + (a.person_count || 0), 0) / totalRecords) : 0,
      maxPeople: totalRecords > 0 ? Math.max(...analytics.map(a => a.person_count || 0)) : 0,
      minPeople: totalRecords > 0 ? Math.min(...analytics.map(a => a.person_count || 0)) : 0,
      avgDensity: totalRecords > 0 ? (analytics.reduce((sum, a) => sum + (a.crowd_density || 0), 0) / totalRecords).toFixed(1) : '0.0',
      
      totalEntries: 0, // iot_crowd_analysis'de entries/exits yok
      totalExits: 0,
      
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
      return {
        id: a.id,
        device_id: a.device_id,
        camera_name: a.camera_name,
        camera_location: a.camera_location,
        people_count: a.person_count || 0,
        crowd_density: (a.crowd_density || 0).toFixed(1),
        entries_count: 0, // iot_crowd_analysis'de yok
        exits_count: 0,
        current_occupancy: a.person_count || 0,
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

