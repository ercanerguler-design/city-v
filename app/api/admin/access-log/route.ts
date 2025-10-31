import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId, action, device, timestamp } = await req.json();
    
    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'userId ve action gerekli' },
        { status: 400 }
      );
    }

    // Insert access log
    const result = await query(
      'INSERT INTO access_logs (user_id, action_type, device_info, access_timestamp, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [userId, action, device || 'unknown', timestamp || new Date().toISOString()]
    );

    // Also log to admin_logs for admin panel visibility
    await query(
      'INSERT INTO admin_logs (action_type, target_user_id, action_data, created_at) VALUES ($1, $2, $3, NOW())',
      ['access_log', userId, JSON.stringify({ 
        action,
        device,
        timestamp: timestamp || new Date().toISOString(),
        ip: req.ip || 'unknown'
      })]
    );

    console.log(`🔐 Access log: ${action} by user ${userId} on device ${device}`);

    return NextResponse.json({
      success: true,
      logId: result.rows[0].id,
      message: 'Erişim günlüğü kaydedildi'
    });

  } catch (error) {
    console.error('Access log error:', error);
    return NextResponse.json(
      { success: false, error: 'Günlük kaydedilemedi' },
      { status: 500 }
    );
  }
}