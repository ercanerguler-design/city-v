import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    console.log('🔧 RTSP URL\'leri HTTP\'ye çeviriliyor...');

    // Önce mevcut durumu göster
    const currentCameras = await query(
      'SELECT id, camera_name, stream_url FROM business_cameras WHERE stream_url LIKE $1',
      ['rtsp://%']
    );

    console.log('📋 Değiştirilecek kameralar:', currentCameras.rows.length);
    currentCameras.rows.forEach((row: any) => {
      console.log(`  - ID ${row.id}: ${row.camera_name}`);
      console.log(`    Eski: ${row.stream_url}`);
    });

    // RTSP'yi HTTP'ye çevir
    const updateResult = await query(`
      UPDATE business_cameras 
      SET stream_url = REPLACE(stream_url, 'rtsp://', 'http://')
      WHERE stream_url LIKE 'rtsp://%'
      RETURNING id, camera_name, stream_url
    `);

    console.log('\n✅ Güncelleme tamamlandı!');
    console.log('📋 Güncellenmiş kameralar:');
    updateResult.rows.forEach((row: any) => {
      console.log(`  - ID ${row.id}: ${row.camera_name}`);
      console.log(`    Yeni: ${row.stream_url}`);
    });

    return NextResponse.json({
      success: true,
      message: `${updateResult.rows.length} kamera güncellendi`,
      cameras: updateResult.rows
    });

  } catch (error: any) {
    console.error('❌ Hata:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
