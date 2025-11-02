import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Arrival Logging API
 * GET /api/transport/arrivals?stopId=123&routeId=456&timeRange=24hours
 * 
 * Returns vehicle arrival events and schedule adherence data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stopId = searchParams.get('stopId');
    const routeId = searchParams.get('routeId');
    const vehicleId = searchParams.get('vehicleId');
    const timeRange = searchParams.get('timeRange') || '24hours';

    if (!stopId && !routeId && !vehicleId) {
      return NextResponse.json(
        { error: 'stopId, routeId, or vehicleId required' },
        { status: 400 }
      );
    }

    const intervals: { [key: string]: string } = {
      '1hour': '1 hour',
      '24hours': '24 hours',
      '7days': '7 days',
      '30days': '30 days'
    };

    const interval = intervals[timeRange] || '24 hours';

    // Build query conditions
    let arrivals;
    if (vehicleId) {
      arrivals = await sql`
        SELECT 
          sa.id,
          sa.scheduled_time,
          sa.actual_time,
          sa.delay_minutes,
          sa.passengers_boarding,
          sa.passengers_alighting,
          sa.crowd_level,
          v.vehicle_code,
          s.stop_name,
          r.route_name
        FROM stop_arrivals sa
        LEFT JOIN transport_vehicles v ON sa.vehicle_id = v.id
        LEFT JOIN transport_stops s ON sa.stop_id = s.id
        LEFT JOIN transport_routes r ON sa.route_id = r.id
        WHERE sa.vehicle_id = ${vehicleId}
          AND sa.actual_time >= NOW() - INTERVAL '${interval}'
        ORDER BY sa.actual_time DESC
        LIMIT 100
      `;
    } else if (routeId) {
      arrivals = await sql`
        SELECT 
          sa.id,
          sa.scheduled_time,
          sa.actual_time,
          sa.delay_minutes,
          sa.passengers_boarding,
          sa.passengers_alighting,
          sa.crowd_level,
          v.vehicle_code,
          s.stop_name,
          r.route_name
        FROM stop_arrivals sa
        LEFT JOIN transport_vehicles v ON sa.vehicle_id = v.id
        LEFT JOIN transport_stops s ON sa.stop_id = s.id
        LEFT JOIN transport_routes r ON sa.route_id = r.id
        WHERE sa.route_id = ${routeId}
          AND sa.actual_time >= NOW() - INTERVAL '${interval}'
        ORDER BY sa.actual_time DESC
        LIMIT 100
      `;
    } else {
      arrivals = await sql`
        SELECT 
          sa.id,
          sa.scheduled_time,
          sa.actual_time,
          sa.delay_minutes,
          sa.passengers_boarding,
          sa.passengers_alighting,
          sa.crowd_level,
          v.vehicle_code,
          s.stop_name,
          r.route_name
        FROM stop_arrivals sa
        LEFT JOIN transport_vehicles v ON sa.vehicle_id = v.id
        LEFT JOIN transport_stops s ON sa.stop_id = s.id
        LEFT JOIN transport_routes r ON sa.route_id = r.id
        WHERE sa.stop_id = ${stopId}
          AND sa.actual_time >= NOW() - INTERVAL '${interval}'
        ORDER BY sa.actual_time DESC
        LIMIT 100
      `;
    }

    // Calculate statistics
    const totalArrivals = arrivals.rows.length;
    const onTimeArrivals = arrivals.rows.filter(a => Math.abs(a.delay_minutes || 0) <= 2).length;
    const delayedArrivals = arrivals.rows.filter(a => (a.delay_minutes || 0) > 2).length;
    const earlyArrivals = arrivals.rows.filter(a => (a.delay_minutes || 0) < -2).length;
    
    const avgDelay = arrivals.rows.length > 0
      ? arrivals.rows.reduce((sum, a) => sum + (a.delay_minutes || 0), 0) / arrivals.rows.length
      : 0;

    const totalBoarding = arrivals.rows.reduce((sum, a) => sum + (a.passengers_boarding || 0), 0);
    const totalAlighting = arrivals.rows.reduce((sum, a) => sum + (a.passengers_alighting || 0), 0);

    // Delay distribution by hour
    const delaysByHour = await sql`
      SELECT 
        EXTRACT(HOUR FROM actual_time) as hour,
        AVG(delay_minutes) as avg_delay,
        COUNT(*) as arrivals,
        COUNT(CASE WHEN delay_minutes > 5 THEN 1 END) as delayed_count
      FROM stop_arrivals
      WHERE ${vehicleId ? sql`vehicle_id = ${vehicleId}` : stopId ? sql`stop_id = ${stopId}` : sql`route_id = ${routeId}`}
        AND actual_time >= NOW() - INTERVAL '${interval}'
      GROUP BY EXTRACT(HOUR FROM actual_time)
      ORDER BY hour
    `;

    return NextResponse.json({
      success: true,
      timeRange,
      summary: {
        totalArrivals,
        onTimeArrivals,
        delayedArrivals,
        earlyArrivals,
        onTimePercentage: totalArrivals > 0 ? Math.round((onTimeArrivals / totalArrivals) * 100) : 0,
        avgDelay: Math.round(avgDelay * 10) / 10,
        totalBoarding,
        totalAlighting
      },
      delaysByHour: delaysByHour.rows.map(row => ({
        hour: row.hour,
        avgDelay: Math.round(row.avg_delay * 10) / 10,
        totalArrivals: row.arrivals,
        delayedCount: row.delayed_count,
        onTimeRate: Math.round(((row.arrivals - row.delayed_count) / row.arrivals) * 100)
      })),
      recentArrivals: arrivals.rows.slice(0, 50).map(row => ({
        id: row.id,
        vehicle: row.vehicle_code,
        stop: row.stop_name,
        route: row.route_name,
        scheduledTime: row.scheduled_time,
        actualTime: row.actual_time,
        delayMinutes: row.delay_minutes,
        status: Math.abs(row.delay_minutes || 0) <= 2 ? 'on-time' : row.delay_minutes > 2 ? 'delayed' : 'early',
        boarding: row.passengers_boarding,
        alighting: row.passengers_alighting,
        crowdLevel: row.crowd_level
      }))
    });

  } catch (error: any) {
    console.error('❌ Arrivals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch arrival data', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Log vehicle arrival event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      stopId,
      routeId,
      vehicleId,
      scheduledTime,
      actualTime,
      passengersBoarding,
      passengersAlighting
    } = body;

    if (!stopId || !routeId || !vehicleId || !actualTime) {
      return NextResponse.json(
        { error: 'stopId, routeId, vehicleId, and actualTime required' },
        { status: 400 }
      );
    }

    // Calculate delay
    let delayMinutes = 0;
    if (scheduledTime) {
      const scheduled = new Date(scheduledTime);
      const actual = new Date(actualTime);
      delayMinutes = Math.round((actual.getTime() - scheduled.getTime()) / 60000);
    }

    // Determine crowd level
    const totalPassengers = (passengersBoarding || 0) + (passengersAlighting || 0);
    const crowdLevel = 
      totalPassengers >= 100 ? 'very_high' :
      totalPassengers >= 50 ? 'high' :
      totalPassengers >= 20 ? 'medium' : 'low';

    const result = await sql`
      INSERT INTO stop_arrivals (
        stop_id,
        route_id,
        vehicle_id,
        scheduled_time,
        actual_time,
        delay_minutes,
        passengers_boarding,
        passengers_alighting,
        crowd_level
      ) VALUES (
        ${stopId},
        ${routeId},
        ${vehicleId},
        ${scheduledTime || null},
        ${actualTime},
        ${delayMinutes},
        ${passengersBoarding || 0},
        ${passengersAlighting || 0},
        ${crowdLevel}
      )
      RETURNING id
    `;

    console.log(`✅ Arrival logged: Stop ${stopId}, Vehicle ${vehicleId}, Delay: ${delayMinutes}min, Boarding: ${passengersBoarding || 0}, Alighting: ${passengersAlighting || 0}`);

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      arrival: {
        delayMinutes,
        status: Math.abs(delayMinutes) <= 2 ? 'on-time' : delayMinutes > 2 ? 'delayed' : 'early',
        crowdLevel,
        passengerActivity: {
          boarding: passengersBoarding || 0,
          alighting: passengersAlighting || 0,
          total: totalPassengers
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Log arrival error:', error);
    return NextResponse.json(
      { error: 'Failed to log arrival', details: error.message },
      { status: 500 }
    );
  }
}
