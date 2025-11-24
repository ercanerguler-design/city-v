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

    // Time range mapping - use direct SQL intervals
    let timeCondition = "ia.created_at >= NOW() - INTERVAL '1 hour'";
    if (timeRange === '24hours') timeCondition = "ia.created_at >= NOW() - INTERVAL '24 hours'";
    else if (timeRange === '7days') timeCondition = "ia.created_at >= NOW() - INTERVAL '7 days'";
    else if (timeRange === '30days') timeCondition = "ia.created_at >= NOW() - INTERVAL '30 days'";

    // 1. Latest crowd analytics from iot_ai_analysis
    const latestAnalytics = await sql`
      SELECT 
        bc.location_description as zone_name,
        ia.person_count as current_people_count,
        COALESCE((ia.detection_objects->>'current_occupancy')::INTEGER, 0) as max_capacity,
        COALESCE((ia.detection_objects->>'people_in')::INTEGER, 0) as entry_count,
        COALESCE((ia.detection_objects->>'people_out')::INTEGER, 0) as exit_count,
        0 as queue_length,
        0 as avg_wait_time,
        CASE 
          WHEN ia.person_count > 15 THEN 'high'
          WHEN ia.person_count > 8 THEN 'medium'
          ELSE 'low'
        END as crowd_level,
        ia.crowd_density,
        ia.created_at as timestamp
      FROM iot_ai_analysis ia
      JOIN business_cameras bc ON ia.camera_id = bc.id
      WHERE bc.business_user_id = ${parseInt(businessId)}
        AND ia.created_at >= NOW() - INTERVAL '1 hour'
      ORDER BY ia.created_at DESC
      LIMIT 100
    `;

    // 2. Zone-wise summary
    const zoneSummary = await sql`
      SELECT 
        bc.location_description as zone_name,
        AVG(ia.person_count) as avg_people,
        MAX(ia.person_count) as max_people,
        AVG(0) as avg_queue,
        CASE 
          WHEN AVG(ia.person_count) > 15 THEN 15
          WHEN AVG(ia.person_count) > 8 THEN 8
          ELSE 3
        END as avg_density,
        COUNT(*) as data_points
      FROM iot_ai_analysis ia
      JOIN business_cameras bc ON ia.camera_id = bc.id
      WHERE bc.business_user_id = ${parseInt(businessId)}
        AND ia.created_at >= NOW() - INTERVAL '1 hour'
      GROUP BY bc.location_description
      ORDER BY avg_people DESC
    `;

    // 3. Entry/Exit totals
    const entryExitStats = await sql`
      SELECT 
        SUM(COALESCE((ia.detection_objects->>'people_in')::INTEGER, 0)) as total_entries,
        SUM(COALESCE((ia.detection_objects->>'people_out')::INTEGER, 0)) as total_exits,
        SUM(COALESCE((ia.detection_objects->>'people_in')::INTEGER, 0)) - 
        SUM(COALESCE((ia.detection_objects->>'people_out')::INTEGER, 0)) as net_occupancy
      FROM iot_ai_analysis ia
      JOIN business_cameras bc ON ia.camera_id = bc.id
      WHERE bc.business_user_id = ${parseInt(businessId)}
        AND ia.created_at >= NOW() - INTERVAL '1 hour'
    `;

    // 4. Peak hours analysis
    const peakHours = await sql`
      SELECT 
        EXTRACT(HOUR FROM ia.created_at) as hour,
        AVG(ia.person_count) as avg_people,
        AVG(ia.crowd_density) as avg_density,
        CASE 
          WHEN AVG(ia.person_count) > 15 THEN 'high'
          WHEN AVG(ia.person_count) > 8 THEN 'medium'
          ELSE 'low'
        END as max_crowd_level
      FROM iot_ai_analysis ia
      JOIN business_cameras bc ON ia.camera_id = bc.id
      WHERE bc.business_user_id = ${parseInt(businessId)}
        AND ia.created_at >= NOW() - INTERVAL '1 hour'
      GROUP BY EXTRACT(HOUR FROM ia.created_at)
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

