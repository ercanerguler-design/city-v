import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Heatmap API
 * GET /api/business/heatmap?businessId=123&timeRange=1hour
 * 
 * Returns heatmap data for visualization
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const timeRange = searchParams.get('timeRange') || '1hour';

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID required' },
        { status: 400 }
      );
    }

    const intervals: { [key: string]: string } = {
      '1hour': '1 hour',
      '24hours': '24 hours',
      '7days': '7 days'
    };

    const interval = intervals[timeRange] || '1 hour';

    // Get latest heatmap data
    const heatmapData = await sql`
      SELECT 
        heatmap_points,
        hottest_zone,
        coldest_zone,
        avg_intensity,
        start_time,
        end_time,
        device_id
      FROM heatmap_data
      WHERE business_id = ${businessId}
        AND start_time >= NOW() - INTERVAL '${interval}'
      ORDER BY start_time DESC
      LIMIT 50
    `;

    // Aggregate heatmap points
    let allPoints: any[] = [];
    heatmapData.rows.forEach(row => {
      if (row.heatmap_points) {
        const points = typeof row.heatmap_points === 'string' 
          ? JSON.parse(row.heatmap_points)
          : row.heatmap_points;
        allPoints = allPoints.concat(points);
      }
    });

    // Find hotspots
    const zoneIntensity: { [key: string]: number[] } = {};
    allPoints.forEach((point: any) => {
      const zone = `${Math.floor(point.x / 100)}-${Math.floor(point.y / 100)}`;
      if (!zoneIntensity[zone]) zoneIntensity[zone] = [];
      zoneIntensity[zone].push(point.intensity);
    });

    const hotspots = Object.entries(zoneIntensity)
      .map(([zone, intensities]) => ({
        zone,
        avgIntensity: intensities.reduce((a, b) => a + b, 0) / intensities.length,
        dataPoints: intensities.length
      }))
      .sort((a, b) => b.avgIntensity - a.avgIntensity)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      timeRange,
      heatmapPoints: allPoints,
      hotspots,
      analytics: {
        totalDataPoints: allPoints.length,
        avgIntensity: allPoints.length > 0 
          ? allPoints.reduce((sum, p) => sum + p.intensity, 0) / allPoints.length 
          : 0,
        hottestZone: heatmapData.rows[0]?.hottest_zone || 'N/A',
        coldestZone: heatmapData.rows[0]?.coldest_zone || 'N/A'
      }
    });

  } catch (error: any) {
    console.error('❌ Heatmap error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch heatmap', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Receive heatmap data from ESP32
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      deviceId,
      heatmapPoints, // [{x, y, intensity}, ...]
      startTime,
      endTime
    } = body;

    if (!businessId || !deviceId || !heatmapPoints) {
      return NextResponse.json(
        { error: 'businessId, deviceId, and heatmapPoints required' },
        { status: 400 }
      );
    }

    // Calculate hottest and coldest zones
    const sortedPoints = [...heatmapPoints].sort((a, b) => b.intensity - a.intensity);
    const hottestZone = `Zone (${sortedPoints[0]?.x}, ${sortedPoints[0]?.y})`;
    const coldestZone = `Zone (${sortedPoints[sortedPoints.length - 1]?.x}, ${sortedPoints[sortedPoints.length - 1]?.y})`;
    const avgIntensity = heatmapPoints.reduce((sum: number, p: any) => sum + p.intensity, 0) / heatmapPoints.length;

    const result = await sql`
      INSERT INTO heatmap_data (
        business_id,
        device_id,
        heatmap_points,
        hottest_zone,
        coldest_zone,
        avg_intensity,
        start_time,
        end_time
      ) VALUES (
        ${businessId},
        ${deviceId},
        ${JSON.stringify(heatmapPoints)},
        ${hottestZone},
        ${coldestZone},
        ${avgIntensity},
        ${startTime || new Date().toISOString()},
        ${endTime || new Date().toISOString()}
      )
      RETURNING id
    `;

    console.log(`✅ Heatmap saved: ${heatmapPoints.length} points, avg intensity: ${avgIntensity.toFixed(2)}`);

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      analytics: {
        totalPoints: heatmapPoints.length,
        hottestZone,
        coldestZone,
        avgIntensity: avgIntensity.toFixed(2)
      }
    });

  } catch (error: any) {
    console.error('❌ Save heatmap error:', error);
    return NextResponse.json(
      { error: 'Failed to save heatmap', details: error.message },
      { status: 500 }
    );
  }
}

