import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Seating Analytics API
 * GET /api/business/seating?businessId=123
 * 
 * Returns table/seat occupancy data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID required' },
        { status: 400 }
      );
    }

    // Get latest seating data
    const seatingData = await sql`
      SELECT 
        table_id,
        total_seats,
        occupied_seats,
        occupancy_rate,
        timestamp
      FROM seating_analytics
      WHERE business_id = ${businessId}
        AND timestamp >= NOW() - INTERVAL '5 minutes'
      ORDER BY timestamp DESC
    `;

    // Summary stats
    const summary = await sql`
      SELECT 
        COUNT(DISTINCT table_id) as total_tables,
        SUM(total_seats) as total_seats,
        SUM(occupied_seats) as occupied_seats,
        AVG(occupancy_rate) as avg_occupancy
      FROM seating_analytics
      WHERE business_id = ${businessId}
        AND timestamp >= NOW() - INTERVAL '5 minutes'
    `;

    const stats = summary.rows[0] || {};

    return NextResponse.json({
      success: true,
      summary: {
        totalTables: stats.total_tables || 0,
        totalSeats: stats.total_seats || 0,
        occupiedSeats: stats.occupied_seats || 0,
        availableSeats: (stats.total_seats || 0) - (stats.occupied_seats || 0),
        avgOccupancy: Math.round(stats.avg_occupancy || 0)
      },
      tables: seatingData.rows.map(row => ({
        tableId: row.table_id,
        totalSeats: row.total_seats,
        occupiedSeats: row.occupied_seats,
        availableSeats: row.total_seats - row.occupied_seats,
        occupancyRate: Math.round(row.occupancy_rate),
        status: row.occupancy_rate === 0 ? 'empty' : 
                row.occupancy_rate === 100 ? 'full' : 'partial',
        lastUpdate: row.timestamp
      }))
    });

  } catch (error: any) {
    console.error('❌ Seating analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seating data', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Receive seating data from ESP32
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      deviceId,
      tableId,
      totalSeats,
      occupiedSeats
    } = body;

    if (!businessId || !deviceId || !tableId) {
      return NextResponse.json(
        { error: 'businessId, deviceId, and tableId required' },
        { status: 400 }
      );
    }

    const occupancyRate = (occupiedSeats / totalSeats) * 100;

    const result = await sql`
      INSERT INTO seating_analytics (
        business_id,
        device_id,
        table_id,
        total_seats,
        occupied_seats,
        occupancy_rate
      ) VALUES (
        ${businessId},
        ${deviceId},
        ${tableId},
        ${totalSeats},
        ${occupiedSeats},
        ${occupancyRate}
      )
      RETURNING id, timestamp
    `;

    console.log(`✅ Seating data saved: Table ${tableId}, ${occupiedSeats}/${totalSeats} occupied`);

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      timestamp: result.rows[0].timestamp
    });

  } catch (error: any) {
    console.error('❌ Save seating data error:', error);
    return NextResponse.json(
      { error: 'Failed to save seating data', details: error.message },
      { status: 500 }
    );
  }
}
