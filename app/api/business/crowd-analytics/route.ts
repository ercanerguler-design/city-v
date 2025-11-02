import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Business Crowd Analytics API
 * GET /api/business/crowd-analytics?businessId=123
 * 
 * Returns:
 * - Real-time people count
 * - Entry/exit counts
 * - Queue length
 * - Crowd density
 * - Zone-wise analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const timeRange = searchParams.get('range') || '1hour'; // 1hour, 24hours, 7days

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID required' },
        { status: 400 }
      );
    }

    // Time range mapping
    const intervals: { [key: string]: string } = {
      '1hour': '1 hour',
      '24hours': '24 hours',
      '7days': '7 days',
      '30days': '30 days'
    };

    const interval = intervals[timeRange] || '1 hour';

    // 1. Latest crowd analytics
    const latestAnalytics = await sql`
      SELECT 
        zone_name,
        current_people_count,
        max_capacity,
        entry_count,
        exit_count,
        queue_length,
        avg_wait_time,
        crowd_level,
        crowd_density,
        timestamp
      FROM business_crowd_analytics
      WHERE business_id = ${businessId}
        AND timestamp >= NOW() - INTERVAL '${interval}'
      ORDER BY timestamp DESC
      LIMIT 100
    `;

    // 2. Zone-wise summary
    const zoneSummary = await sql`
      SELECT 
        zone_name,
        AVG(current_people_count) as avg_people,
        MAX(current_people_count) as max_people,
        AVG(queue_length) as avg_queue,
        AVG(crowd_density) as avg_density,
        COUNT(*) as data_points
      FROM business_crowd_analytics
      WHERE business_id = ${businessId}
        AND timestamp >= NOW() - INTERVAL '${interval}'
      GROUP BY zone_name
      ORDER BY avg_density DESC
    `;

    // 3. Entry/Exit totals
    const entryExitStats = await sql`
      SELECT 
        SUM(entry_count) as total_entries,
        SUM(exit_count) as total_exits,
        SUM(entry_count) - SUM(exit_count) as net_occupancy
      FROM business_crowd_analytics
      WHERE business_id = ${businessId}
        AND timestamp >= NOW() - INTERVAL '${interval}'
    `;

    // 4. Peak hours analysis
    const peakHours = await sql`
      SELECT 
        EXTRACT(HOUR FROM timestamp) as hour,
        AVG(current_people_count) as avg_people,
        AVG(crowd_density) as avg_density,
        MAX(crowd_level) as max_crowd_level
      FROM business_crowd_analytics
      WHERE business_id = ${businessId}
        AND timestamp >= NOW() - INTERVAL '${interval}'
      GROUP BY EXTRACT(HOUR FROM timestamp)
      ORDER BY avg_people DESC
      LIMIT 5
    `;

    // 5. Current status (most recent)
    const currentStatus = latestAnalytics.rows[0] || {
      current_people_count: 0,
      crowd_level: 'low',
      crowd_density: 0,
      queue_length: 0
    };

    return NextResponse.json({
      success: true,
      timeRange,
      currentStatus: {
        peopleCount: currentStatus.current_people_count || 0,
        crowdLevel: currentStatus.crowd_level || 'low',
        density: Math.round(currentStatus.crowd_density || 0),
        queueLength: currentStatus.queue_length || 0,
        avgWaitTime: currentStatus.avg_wait_time || 0,
        lastUpdate: currentStatus.timestamp
      },
      zones: zoneSummary.rows.map(zone => ({
        name: zone.zone_name,
        avgPeople: Math.round(zone.avg_people || 0),
        maxPeople: zone.max_people || 0,
        avgQueue: Math.round(zone.avg_queue || 0),
        density: Math.round(zone.avg_density || 0),
        dataPoints: zone.data_points
      })),
      entryExit: {
        totalEntries: entryExitStats.rows[0]?.total_entries || 0,
        totalExits: entryExitStats.rows[0]?.total_exits || 0,
        netOccupancy: entryExitStats.rows[0]?.net_occupancy || 0
      },
      peakHours: peakHours.rows.map(ph => ({
        hour: ph.hour,
        avgPeople: Math.round(ph.avg_people || 0),
        density: Math.round(ph.avg_density || 0),
        crowdLevel: ph.max_crowd_level
      })),
      historicalData: latestAnalytics.rows.map(row => ({
        timestamp: row.timestamp,
        zone: row.zone_name,
        people: row.current_people_count,
        density: row.crowd_density,
        queue: row.queue_length,
        crowdLevel: row.crowd_level
      }))
    });

  } catch (error: any) {
    console.error('❌ Crowd analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crowd analytics', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Receive crowd analytics from ESP32
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      deviceId,
      zoneName,
      currentPeopleCount,
      maxCapacity,
      entryCount,
      exitCount,
      queueLength,
      avgWaitTime
    } = body;

    if (!businessId || !deviceId) {
      return NextResponse.json(
        { error: 'businessId and deviceId required' },
        { status: 400 }
      );
    }

    // Calculate crowd metrics
    const density = maxCapacity > 0 
      ? (currentPeopleCount / maxCapacity) * 100 
      : 0;

    let crowdLevel = 'low';
    if (density > 80) crowdLevel = 'very_high';
    else if (density > 60) crowdLevel = 'high';
    else if (density > 30) crowdLevel = 'medium';

    // Insert analytics
    const result = await sql`
      INSERT INTO business_crowd_analytics (
        business_id,
        device_id,
        zone_name,
        current_people_count,
        max_capacity,
        entry_count,
        exit_count,
        queue_length,
        avg_wait_time,
        crowd_level,
        crowd_density
      ) VALUES (
        ${businessId},
        ${deviceId},
        ${zoneName || 'main'},
        ${currentPeopleCount || 0},
        ${maxCapacity || 100},
        ${entryCount || 0},
        ${exitCount || 0},
        ${queueLength || 0},
        ${avgWaitTime || 0},
        ${crowdLevel},
        ${density}
      )
      RETURNING id, timestamp
    `;

    console.log(`✅ Crowd analytics saved: Business ${businessId}, Zone ${zoneName}, People ${currentPeopleCount}`);

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      timestamp: result.rows[0].timestamp,
      calculatedMetrics: {
        crowdLevel,
        density: Math.round(density)
      }
    });

  } catch (error: any) {
    console.error('❌ Save crowd analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to save analytics', details: error.message },
      { status: 500 }
    );
  }
}
