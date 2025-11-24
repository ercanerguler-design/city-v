import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!businessId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'businessId, startDate, endDate gerekli' },
        { status: 400 }
      );
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Geçmiş dönem verileri çek
    const historicalData = await sql`
      SELECT 
        EXTRACT(HOUR FROM ca.analysis_timestamp) as hour,
        EXTRACT(DAY FROM ca.analysis_timestamp) as day,
        AVG(ca.people_count) as avg_people,
        AVG(ia.crowd_density) as avg_density,
        COUNT(*) as data_points
      FROM iot_crowd_analysis ia
      JOIN business_cameras bc ON CAST(bc.id AS VARCHAR) = ca.device_id
      WHERE bc.business_user_id = ${parseInt(businessId)}
        AND ca.analysis_timestamp >= ${start.toISOString()}
        AND ca.analysis_timestamp <= ${end.toISOString()}
      GROUP BY EXTRACT(HOUR FROM ca.analysis_timestamp), EXTRACT(DAY FROM ca.analysis_timestamp)
      ORDER BY day, hour
    `;

    // Entry/Exit totals
    const entryExitData = await sql`
      SELECT 
        SUM(COALESCE((ia.detection_objects->>'people_in')::INTEGER, 0)) as total_entries,
        SUM(COALESCE((ia.detection_objects->>'people_out')::INTEGER, 0)) as total_exits
      FROM iot_crowd_analysis ia
      JOIN business_cameras bc ON CAST(bc.id AS VARCHAR) = ca.device_id
      WHERE bc.business_user_id = ${parseInt(businessId)}
        AND ca.analysis_timestamp >= ${start.toISOString()}
        AND ca.analysis_timestamp <= ${end.toISOString()}
    `;

    // Peak hour calculation
    const peakHour = historicalData.rows.reduce((max, row) => {
      return (row.avg_people > (max?.avg_people || 0)) ? row : max;
    }, historicalData.rows[0]);

    // Calculate averages
    const avgCrowdLevel = historicalData.rows.reduce((sum, row) => 
      sum + (parseFloat(row.avg_people) || 0), 0) / (historicalData.rows.length || 1);

    return NextResponse.json({
      success: true,
      data: {
        totalPeople: Math.round(avgCrowdLevel * historicalData.rows.length),
        avgCrowdLevel: avgCrowdLevel,
        peakTime: peakHour ? `${peakHour.hour}:00` : 'N/A',
        totalEntries: entryExitData.rows[0]?.total_entries || 0,
        totalExits: entryExitData.rows[0]?.total_exits || 0,
        hourlyData: historicalData.rows.map(row => ({
          hour: parseInt(row.hour),
          day: parseInt(row.day),
          avgPeople: Math.round(parseFloat(row.avg_people) || 0),
          density: Math.round(parseFloat(row.avg_density) || 0),
          dataPoints: parseInt(row.data_points)
        }))
      }
    });

  } catch (error) {
    console.error('❌ Historical report error:', error);
    return NextResponse.json(
      { error: 'Rapor oluşturulamadı', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

