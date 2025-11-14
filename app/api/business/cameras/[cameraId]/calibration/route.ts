import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ cameraId: string }> }
) {
  try {
    const { calibrationLine } = await req.json();
    const params = await context.params;
    const cameraId = params.cameraId;

    // Kalibrasyon çizgisini güncelle
    await query(
      `UPDATE business_cameras 
       SET calibration_line = $1, updated_at = NOW() 
       WHERE id = $2`,
      [JSON.stringify(calibrationLine), cameraId]
    );

    return NextResponse.json({
      success: true,
      message: 'Kalibrasyon kaydedildi'
    });

  } catch (error) {
    console.error('❌ Kalibrasyon kaydetme hatası:', error);
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
      `SELECT calibration_line FROM business_cameras WHERE id = $1`,
      [cameraId]
    );

    const calibrationLine = result.rows[0]?.calibration_line || null;

    return NextResponse.json({
      success: true,
      calibrationLine
    });

  } catch (error) {
    console.error('❌ Kalibrasyon getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
