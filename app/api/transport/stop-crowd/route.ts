import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Stop Crowd Analytics API
 * GET /api/transport/stop-crowd?stopId=123&timeRange=24hours
 * 
 * Returns stop-level crowd analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stopId = searchParams.get('stopId');
    const timeRange = searchParams.get('timeRange') || '24hours';

    if (!stopId) {
      return NextResponse.json(
        { error: 'Stop ID required' },
        { status: 400 }
      );
    }

    const intervals: { [key: string]: string } = {
      '1hour': '1 hour',
      '24hours': '24 hours',
      '7days': '7 days'
    };

    const interval = intervals[timeRange] || '24 hours';

    // Get stop info
    const stopInfo = await sql`
      SELECT 
        s.stop_name,
        s.latitude,
        s.longitude,
        s.max_capacity,
        s.has_esp32_camera
      FROM transport_stops s
      WHERE s.id = ${stopId}
    `;

    if (stopInfo.rows.length === 0) {
      return NextResponse.json(
        { error: 'Stop not found' },
        { status: 404 }
      );
    }

    // Get current crowd
    const currentCrowd = await sql`
      SELECT 
        people_waiting,
        queue_length,
        crowd_level,
        avg_wait_time,
        timestamp
      FROM stop_crowd_analysis
      WHERE stop_id = ${stopId}
      ORDER BY timestamp DESC
      LIMIT 1
    `;

    // Get historical crowd data
    const historicalData = await sql`
      SELECT 
        people_waiting,
        queue_length,
        crowd_level,
        avg_wait_time,
        timestamp
      FROM stop_crowd_analysis
      WHERE stop_id = ${stopId}
        AND timestamp >= NOW() - INTERVAL '${interval}'
      ORDER BY timestamp DESC
    `;

    // Peak times analysis
    const peakTimes = await sql`
      SELECT 
        EXTRACT(HOUR FROM timestamp) as hour,
        AVG(people_waiting) as avg_people,
        MAX(people_waiting) as max_people,
        AVG(avg_wait_time) as avg_wait
      FROM stop_crowd_analysis
      WHERE stop_id = ${stopId}
        AND timestamp >= NOW() - INTERVAL '${interval}'
      GROUP BY EXTRACT(HOUR FROM timestamp)
      ORDER BY avg_people DESC
      LIMIT 5
    `;

    return NextResponse.json({
      success: true,
      stop: {
        id: stopId,
        name: stopInfo.rows[0].stop_name,
        location: {
          lat: stopInfo.rows[0].latitude,
          lng: stopInfo.rows[0].longitude
        },
        maxCapacity: stopInfo.rows[0].max_capacity,
        hasCamera: stopInfo.rows[0].has_esp32_camera
      },
      currentCrowd: currentCrowd.rows[0] ? {
        peopleWaiting: currentCrowd.rows[0].people_waiting,
        queueLength: currentCrowd.rows[0].queue_length,
        crowdLevel: currentCrowd.rows[0].crowd_level,
        avgWaitTime: currentCrowd.rows[0].avg_wait_time,
        lastUpdate: currentCrowd.rows[0].timestamp
      } : null,
      peakTimes: peakTimes.rows.map(row => ({
        hour: row.hour,
        avgPeople: Math.round(row.avg_people),
        maxPeople: row.max_people,
        avgWait: Math.round(row.avg_wait)
      })),
      historicalData: historicalData.rows.map(row => ({
        peopleWaiting: row.people_waiting,
        queueLength: row.queue_length,
        crowdLevel: row.crowd_level,
        avgWaitTime: row.avg_wait_time,
        timestamp: row.timestamp
      }))
    });

  } catch (error: any) {
    console.error('❌ Stop crowd error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stop crowd data', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Receive stop crowd data from ESP32
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      stopId,
      deviceId,
      peopleWaiting,
      queueLength,
      avgWaitTime
    } = body;

    if (!stopId || !deviceId || peopleWaiting === undefined) {
      return NextResponse.json(
        { error: 'stopId, deviceId, and peopleWaiting required' },
        { status: 400 }
      );
    }

    // Get stop capacity
    const stop = await sql`
      SELECT max_capacity FROM transport_stops WHERE id = ${stopId}
    `;

    const maxCapacity = stop.rows[0]?.max_capacity || 50;
    const crowdPercentage = (peopleWaiting / maxCapacity) * 100;
    
    const crowdLevel = 
      crowdPercentage >= 100 ? 'very_high' :
      crowdPercentage >= 75 ? 'high' :
      crowdPercentage >= 50 ? 'medium' :
      crowdPercentage >= 25 ? 'low' : 'very_low';

    const result = await sql`
      INSERT INTO stop_crowd_analysis (
        stop_id,
        device_id,
        people_waiting,
        queue_length,
        crowd_level,
        avg_wait_time
      ) VALUES (
        ${stopId},
        ${deviceId},
        ${peopleWaiting},
        ${queueLength || 0},
        ${crowdLevel},
        ${avgWaitTime || 0}
      )
      RETURNING id, timestamp
    `;

    console.log(`✅ Stop crowd saved: Stop ${stopId}, ${peopleWaiting} people, level: ${crowdLevel}`);

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      timestamp: result.rows[0].timestamp,
      analysis: {
        peopleWaiting,
        crowdLevel,
        capacity: maxCapacity,
        occupancyPercentage: Math.round(crowdPercentage)
      }
    });

  } catch (error: any) {
    console.error('❌ Save stop crowd error:', error);
    return NextResponse.json(
      { error: 'Failed to save stop crowd data', details: error.message },
      { status: 500 }
    );
  }
}
