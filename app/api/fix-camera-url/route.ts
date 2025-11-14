/**
 * Emergency fix endpoint to update camera stream URL
 * GET /api/fix-camera-url
 */

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    console.log('🔧 Fixing ALL camera tables...');
    
    // Update iot_devices table
    const iotUpdate = await sql`
      UPDATE iot_devices 
      SET stream_url = 'http://192.168.1.3:80/stream'
      WHERE ip_address = '192.168.1.3'
      RETURNING device_id, device_name, stream_url, ip_address
    `;
    
    // Update business_cameras table
    const businessUpdate = await sql`
      UPDATE business_cameras 
      SET stream_url = 'http://192.168.1.3:80/stream'
      WHERE ip_address = '192.168.1.3'
      RETURNING id, camera_name, stream_url, ip_address
    `;
    
    console.log('✅ Updated iot_devices:', iotUpdate.rows);
    console.log('✅ Updated business_cameras:', businessUpdate.rows);
    
    // Verify both tables
    const verifyIot = await sql`
      SELECT device_id, device_name, stream_url, ip_address 
      FROM iot_devices 
      WHERE ip_address = '192.168.1.3'
    `;
    
    const verifyBusiness = await sql`
      SELECT id, camera_name, stream_url, ip_address 
      FROM business_cameras 
      WHERE ip_address = '192.168.1.3'
    `;
    
    if (verifyIot.rows.length === 0 && verifyBusiness.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No cameras found with IP 192.168.1.3' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Both camera tables updated successfully',
      iot_devices: verifyIot.rows,
      business_cameras: verifyBusiness.rows
    });
    
  } catch (error: any) {
    console.error('❌ Error fixing camera URL:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
