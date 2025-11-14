import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ cameraId: string }> }
) {
  try {
    const { zones } = await req.json();
    const params = await context.params;
    const cameraId = params.cameraId;

    // Kamera zones'unu güncelle
    await query(
      `UPDATE business_cameras 
       SET zones = $1, updated_at = NOW() 
       WHERE id = $2`,
      [JSON.stringify(zones), cameraId]
    );

    return NextResponse.json({
      success: true,
      message: 'Bölgeler kaydedildi'
    });

  } catch (error) {
    console.error('❌ Zone kaydetme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ cameraId: string }> }
) {
  try {
    const params = await context.params;
    const cameraId = params.cameraId;

    const result = await query(
      `SELECT zones FROM business_cameras WHERE id = $1`,
      [cameraId]
    );

    const zones = result.rows[0]?.zones || [];

    return NextResponse.json({
      success: true,
      zones
    });

  } catch (error) {
    console.error('❌ Zone getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
