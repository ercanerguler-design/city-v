import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Passenger Counting API
 * GET /api/transport/passenger-counts?vehicleId=123&timeRange=24hours
 * 
 * Returns boarding/alighting statistics and passenger flow data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const stopId = searchParams.get('stopId');
    const timeRange = searchParams.get('timeRange') || '24hours';

    if (!vehicleId && !stopId) {
      return NextResponse.json(
        { error: 'vehicleId or stopId required' },
        { status: 400 }
      );
    }

    const intervals: { [key: string]: string } = {
      '1hour': '1 hour',
      '24hours': '24 hours',
      '7days': '7 days'
    };

    const interval = intervals[timeRange] || '24 hours';

    // Get passenger counts
    let passengerData;
    if (vehicleId) {
      passengerData = await sql`
        SELECT 
          pc.passengers_on,
          pc.passengers_off,
          pc.total_passengers_after,
          pc.direction,
          pc.timestamp,
          v.vehicle_code,
          s.stop_name
        FROM passenger_counts pc
        LEFT JOIN transport_vehicles v ON pc.vehicle_id = v.id
        LEFT JOIN transport_stops s ON pc.stop_id = s.id
        WHERE pc.vehicle_id = ${vehicleId}
          AND pc.timestamp >= NOW() - INTERVAL '${interval}'
        ORDER BY pc.timestamp DESC
        LIMIT 200
      `;
    } else {
      passengerData = await sql`
        SELECT 
          pc.passengers_on,
          pc.passengers_off,
          pc.total_passengers_after,
          pc.direction,
          pc.timestamp,
          v.vehicle_code,
          s.stop_name
        FROM passenger_counts pc
        LEFT JOIN transport_vehicles v ON pc.vehicle_id = v.id
        LEFT JOIN transport_stops s ON pc.stop_id = s.id
        WHERE pc.stop_id = ${stopId}
          AND pc.timestamp >= NOW() - INTERVAL '${interval}'
        ORDER BY pc.timestamp DESC
        LIMIT 200
      `;
    }

    // Calculate statistics
    const totalBoarding = passengerData.rows.reduce((sum, row) => sum + (row.passengers_on || 0), 0);
    const totalAlighting = passengerData.rows.reduce((sum, row) => sum + (row.passengers_off || 0), 0);

    // Busiest stops/times
    let busiestPeriods;
    if (vehicleId) {
      busiestPeriods = await sql`
        SELECT 
          EXTRACT(HOUR FROM timestamp) as hour,
          SUM(passengers_on) as total_boarding,
          SUM(passengers_off) as total_alighting,
          COUNT(*) as events
        FROM passenger_counts
        WHERE vehicle_id = ${vehicleId}
          AND timestamp >= NOW() - INTERVAL '${interval}'
        GROUP BY EXTRACT(HOUR FROM timestamp)
        ORDER BY total_boarding DESC
        LIMIT 10
      `;
    } else {
      busiestPeriods = await sql`
        SELECT 
          EXTRACT(HOUR FROM timestamp) as hour,
          SUM(passengers_on) as total_boarding,
          SUM(passengers_off) as total_alighting,
          COUNT(*) as events
        FROM passenger_counts
        WHERE stop_id = ${stopId}
          AND timestamp >= NOW() - INTERVAL '${interval}'
        GROUP BY EXTRACT(HOUR FROM timestamp)
        ORDER BY total_boarding DESC
        LIMIT 10
      `;
    }

    return NextResponse.json({
      success: true,
      timeRange,
      summary: {
        totalBoarding,
        totalAlighting,
        netChange: totalBoarding - totalAlighting,
        totalEvents: passengerData.rows.length
      },
      busiestPeriods: busiestPeriods.rows.map(row => ({
        hour: row.hour,
        boarding: row.total_boarding,
        alighting: row.total_alighting,
        events: row.events
      })),
      recentActivity: passengerData.rows.slice(0, 50).map(row => ({
        vehicle: row.vehicle_code,
        stop: row.stop_name,
        boarding: row.passengers_on,
        alighting: row.passengers_off,
        totalAfter: row.total_passengers_after,
        direction: row.direction,
        timestamp: row.timestamp
      }))
    });

  } catch (error: any) {
    console.error('❌ Passenger counts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch passenger counts', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Receive passenger counting data from ESP32/Vehicle sensors
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vehicleId,
      stopId,
      passengersOn,
      passengersOff,
      direction
    } = body;

    if (!vehicleId || !stopId || passengersOn === undefined || passengersOff === undefined) {
      return NextResponse.json(
        { error: 'vehicleId, stopId, passengersOn, passengersOff required' },
        { status: 400 }
      );
    }

    // Get vehicle current passenger count
    const vehicle = await sql`
      SELECT current_passengers FROM transport_vehicles WHERE id = ${vehicleId}
    `;

    const currentPassengers = vehicle.rows[0]?.current_passengers || 0;
    const totalPassengersAfter = currentPassengers + passengersOn - passengersOff;

    const result = await sql`
      INSERT INTO passenger_counts (
        vehicle_id,
        stop_id,
        passengers_on,
        passengers_off,
        total_passengers_after,
        direction
      ) VALUES (
        ${vehicleId},
        ${stopId},
        ${passengersOn},
        ${passengersOff},
        ${totalPassengersAfter},
        ${direction || 'unknown'}
      )
      RETURNING id, timestamp
    `;

    // Update vehicle passenger count
    await sql`
      UPDATE transport_vehicles
      SET current_passengers = ${totalPassengersAfter}
      WHERE id = ${vehicleId}
    `;

    console.log(`✅ Passenger count saved: Vehicle ${vehicleId}, Stop ${stopId}, On: ${passengersOn}, Off: ${passengersOff}, Total: ${totalPassengersAfter}`);

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      timestamp: result.rows[0].timestamp,
      passengerFlow: {
        boarding: passengersOn,
        alighting: passengersOff,
        netChange: passengersOn - passengersOff,
        totalAfter: totalPassengersAfter
      }
    });

  } catch (error: any) {
    console.error('❌ Save passenger count error:', error);
    return NextResponse.json(
      { error: 'Failed to save passenger count', details: error.message },
      { status: 500 }
    );
  }
}
