import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * 🎥 Camera Status Update API
 * Kamera online/offline durumunu günceller
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { cameraId: string } }
) {
  try {
    const { cameraId } = params;
    const { status } = await req.json();

    // Validate status
    const validStatuses = ['active', 'inactive', 'offline', 'error'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        error: 'Geçersiz status değeri',
        validStatuses
      }, { status: 400 });
    }

    console.log(`🎥 Updating camera ${cameraId} status to: ${status}`);

    // Update camera status
    const result = await query(
      `UPDATE business_cameras
       SET status = $1,
           last_checked = NOW(),
           updated_at = NOW()
       WHERE id = $2
       RETURNING id, camera_name, status`,
      [status, cameraId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Kamera bulunamadı'
      }, { status: 404 });
    }

    const camera = result.rows[0];
    console.log(`✅ Camera status updated:`, camera);

    return NextResponse.json({
      success: true,
      camera: {
        id: camera.id,
        name: camera.camera_name,
        status: camera.status
      },
      message: `Kamera durumu güncellendi: ${status}`
    });

  } catch (error: any) {
    console.error('❌ Camera status update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Status güncellenemedi',
      details: error.message
    }, { status: 500 });
  }
}
