import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Transport Live Tracking API - USER & ADMIN
 * GET /api/transport/live?stopId=STOP_KIZILAY&routeCode=348
 * 
 * Returns:
 * - Incoming vehicles with ETA
 * - Stop crowd status
 * - Real-time vehicle locations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stopId = searchParams.get('stopId');
    const stopCode = searchParams.get('stopCode');
    const routeCode = searchParams.get('routeCode');
    const cityCode = searchParams.get('cityCode') || 'ankara';

    // Get stop info
    let stop;
    if (stopId) {
      const stopResult = await sql`
        SELECT * FROM transport_stops WHERE id = ${stopId}
      `;
      stop = stopResult.rows[0];
    } else if (stopCode) {
      const stopResult = await sql`
        SELECT * FROM transport_stops WHERE stop_code = ${stopCode}
      `;
      stop = stopResult.rows[0];
    } else {
      return NextResponse.json(
        { error: 'stopId or stopCode required' },
        { status: 400 }
      );
    }

    if (!stop) {
      return NextResponse.json(
        { error: 'Stop not found' },
        { status: 404 }
      );
    }

    // Get incoming vehicles
    const incomingVehicles = await sql`
      SELECT 
        v.vehicle_code,
        v.vehicle_type,
        v.total_capacity,
        r.route_code,
        r.route_name,
        r.color as route_color,
        vl.current_passengers,
        vl.crowd_level,
        vl.distance_to_next_stop,
        vl.eta_to_next_stop,
        vl.speed,
        vl.latitude,
        vl.longitude,
        vl.timestamp
      FROM vehicle_locations vl
      JOIN transport_vehicles v ON vl.vehicle_id = v.id
      JOIN transport_routes r ON vl.route_id = r.id
      WHERE vl.next_stop_id = ${stop.id}
        AND vl.timestamp >= NOW() - INTERVAL '5 minutes'
        ${routeCode ? sql`AND r.route_code = ${routeCode}` : sql``}
      ORDER BY vl.eta_to_next_stop ASC
      LIMIT 10
    `;

    // Get stop crowd analytics
    const stopCrowd = await sql`
      SELECT 
        people_waiting,
        people_in_queue,
        crowd_level,
        crowd_density,
        avg_wait_time,
        timestamp
      FROM stop_crowd_analysis
      WHERE stop_id = ${stop.id}
      ORDER BY timestamp DESC
      LIMIT 1
    `;

    // Get recent arrivals (last 30 minutes)
    const recentArrivals = await sql`
      SELECT 
        v.vehicle_code,
        r.route_code,
        r.route_name,
        sa.arrival_status,
        sa.actual_time,
        sa.delay_minutes,
        sa.passengers_boarding,
        sa.passengers_alighting,
        sa.passengers_waiting
      FROM stop_arrivals sa
      JOIN transport_vehicles v ON sa.vehicle_id = v.id
      JOIN transport_routes r ON sa.route_id = r.id
      WHERE sa.stop_id = ${stop.id}
        AND sa.actual_time >= NOW() - INTERVAL '30 minutes'
      ORDER BY sa.actual_time DESC
      LIMIT 10
    `;

    // Get all routes serving this stop
    const routes = await sql`
      SELECT DISTINCT
        r.id,
        r.route_code,
        r.route_name,
        r.route_type,
        r.color,
        rs.stop_order
      FROM route_stops rs
      JOIN transport_routes r ON rs.route_id = r.id
      WHERE rs.stop_id = ${stop.id}
        AND r.active = true
      ORDER BY r.route_code
    `;

    const currentCrowd = stopCrowd.rows[0] || {
      people_waiting: 0,
      crowd_level: 'low',
      crowd_density: 0,
      avg_wait_time: 0
    };

    return NextResponse.json({
      success: true,
      stop: {
        id: stop.id,
        code: stop.stop_code,
        name: stop.stop_name,
        type: stop.stop_type,
        location: {
          lat: parseFloat(stop.latitude),
          lng: parseFloat(stop.longitude)
        },
        hasCamera: stop.has_camera
      },
      currentCrowd: {
        peopleWaiting: currentCrowd.people_waiting || 0,
        inQueue: currentCrowd.people_in_queue || 0,
        crowdLevel: currentCrowd.crowd_level || 'low',
        density: Math.round(currentCrowd.crowd_density || 0),
        avgWaitTime: currentCrowd.avg_wait_time || 0,
        lastUpdate: currentCrowd.timestamp
      },
      incomingVehicles: incomingVehicles.rows.map(v => ({
        vehicleCode: v.vehicle_code,
        vehicleType: v.vehicle_type,
        routeCode: v.route_code,
        routeName: v.route_name,
        routeColor: v.route_color,
        eta: v.eta_to_next_stop, // seconds
        distance: v.distance_to_next_stop, // meters
        speed: v.speed, // km/h
        occupancy: {
          current: v.current_passengers || 0,
          capacity: v.total_capacity || 100,
          crowdLevel: v.crowd_level || 'low',
          percentage: Math.round(((v.current_passengers || 0) / (v.total_capacity || 100)) * 100)
        },
        location: {
          lat: parseFloat(v.latitude),
          lng: parseFloat(v.longitude)
        },
        lastUpdate: v.timestamp
      })),
      recentActivity: recentArrivals.rows.map(a => ({
        vehicleCode: a.vehicle_code,
        routeCode: a.route_code,
        routeName: a.route_name,
        status: a.arrival_status,
        time: a.actual_time,
        delay: a.delay_minutes || 0,
        boarding: a.passengers_boarding || 0,
        alighting: a.passengers_alighting || 0,
        waiting: a.passengers_waiting || 0
      })),
      availableRoutes: routes.rows.map(r => ({
        id: r.id,
        code: r.route_code,
        name: r.route_name,
        type: r.route_type,
        color: r.color,
        stopOrder: r.stop_order
      }))
    });

  } catch (error: any) {
    console.error('❌ Transport live tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live data', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Update vehicle location (from GPS/tracking system)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vehicleCode,
      routeCode,
      latitude,
      longitude,
      speed,
      currentPassengers,
      nextStopCode,
      distanceToNextStop,
      etaToNextStop
    } = body;

    if (!vehicleCode || !routeCode) {
      return NextResponse.json(
        { error: 'vehicleCode and routeCode required' },
        { status: 400 }
      );
    }

    // Get vehicle and route IDs
    const vehicleResult = await sql`
      SELECT id, total_capacity FROM transport_vehicles WHERE vehicle_code = ${vehicleCode}
    `;
    
    const routeResult = await sql`
      SELECT id FROM transport_routes WHERE route_code = ${routeCode}
    `;

    if (vehicleResult.rows.length === 0 || routeResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Vehicle or route not found' },
        { status: 404 }
      );
    }

    const vehicle = vehicleResult.rows[0];
    const route = routeResult.rows[0];

    // Get next stop ID
    let nextStopId = null;
    if (nextStopCode) {
      const stopResult = await sql`
        SELECT id FROM transport_stops WHERE stop_code = ${nextStopCode}
      `;
      nextStopId = stopResult.rows[0]?.id;
    }

    // Calculate crowd level
    const occupancyRate = (currentPassengers / vehicle.total_capacity) * 100;
    let crowdLevel = 'low';
    if (occupancyRate >= 100) crowdLevel = 'full';
    else if (occupancyRate >= 80) crowdLevel = 'high';
    else if (occupancyRate >= 50) crowdLevel = 'medium';

    // Insert location update
    const result = await sql`
      INSERT INTO vehicle_locations (
        vehicle_id,
        route_id,
        latitude,
        longitude,
        speed,
        next_stop_id,
        distance_to_next_stop,
        eta_to_next_stop,
        current_passengers,
        crowd_level
      ) VALUES (
        ${vehicle.id},
        ${route.id},
        ${latitude},
        ${longitude},
        ${speed || 0},
        ${nextStopId},
        ${distanceToNextStop || 0},
        ${etaToNextStop || 0},
        ${currentPassengers || 0},
        ${crowdLevel}
      )
      RETURNING id, timestamp
    `;

    console.log(`✅ Vehicle location updated: ${vehicleCode} on ${routeCode}, ETA: ${etaToNextStop}s`);

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      timestamp: result.rows[0].timestamp,
      calculatedMetrics: {
        crowdLevel,
        occupancyRate: Math.round(occupancyRate)
      }
    });

  } catch (error: any) {
    console.error('❌ Vehicle location update error:', error);
    return NextResponse.json(
      { error: 'Failed to update location', details: error.message },
      { status: 500 }
    );
  }
}
