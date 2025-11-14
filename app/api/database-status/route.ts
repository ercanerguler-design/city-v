/**
 * Database Status Check
 * Lists all tables and their structures
 */

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    console.log('🔍 Checking database structure...');
    
    // Get all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('📋 Found tables:', tables.rows.map(t => t.table_name));
    
    // Get column info for each table
    const tableDetails: any = {};
    
    for (const table of tables.rows) {
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = ${table.table_name}
        ORDER BY ordinal_position
      `;
      
      tableDetails[table.table_name] = columns.rows;
    }
    
    // Check specific critical tables
    const criticalTables = [
      'business_users',
      'business_profiles', 
      'business_cameras',
      'iot_devices',
      'iot_crowd_analysis'
    ];
    
    const missingTables = criticalTables.filter(
      tableName => !tables.rows.find(t => t.table_name === tableName)
    );
    
    // Check business_cameras for 192.168.1.3
    let cameraData: any = null;
    try {
      const cameras = await sql`
        SELECT id, camera_name, ip_address, stream_url
        FROM business_cameras
        WHERE ip_address = '192.168.1.3'
      `;
      cameraData = cameras.rows;
    } catch (e) {
      cameraData = 'Table not found or query failed';
    }
    
    return NextResponse.json({
      success: true,
      totalTables: tables.rows.length,
      tables: tables.rows.map(t => t.table_name),
      tableDetails: tableDetails,
      criticalTables: {
        required: criticalTables,
        missing: missingTables,
        allPresent: missingTables.length === 0
      },
      esp32Camera: cameraData
    });
    
  } catch (error: any) {
    console.error('❌ Database check error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 500 });
  }
}
