import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-2024';

// Plan limitleri
const CAMERA_LIMITS = {
  premium: 10,
  enterprise: 50
};

// JWT token'dan user bilgisini al
function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    return decoded;
  } catch {
    return null;
  }
}

// Kullanıcının planını öğren (yeni membership sistemi)
async function getUserPlan(userId: number) {
  try {
    const result = await sql`
      SELECT membership_type, max_cameras
      FROM business_users 
      WHERE id = ${userId}
    `;
    
    if (result.rows.length === 0) {
      return {
        planType: 'free',
        maxCameras: 1
      };
    }

    const membershipType = result.rows[0].membership_type || 'free';
    const maxCameras = result.rows[0].max_cameras || 1;
    
    return {
      planType: membershipType,
      maxCameras: maxCameras
    };
  } catch (error) {
    console.log('⚠️ Plan bulunamadı, default free kullanılıyor');
    return {
      planType: 'free',
      maxCameras: 1
    };
  }
}

// GET - Kullanıcının kameralarını listele
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cameras = await sql`
      SELECT 
        id, 
        camera_name, 
        ip_address, 
        port, 
        username,
        stream_url,
        status, 
        location_description,
        created_at,
        last_checked
      FROM business_cameras 
      WHERE business_user_id = ${user.userId}
      ORDER BY created_at DESC
    `;

    // Plan bilgisi
    const planInfo = await getUserPlan(user.userId);

    return NextResponse.json({
      success: true,
      cameras: cameras.rows,
      plan: {
        type: planInfo.planType,
        maxCameras: planInfo.maxCameras,
        currentCount: cameras.rows.length,
        remainingSlots: planInfo.maxCameras - cameras.rows.length
      }
    });

  } catch (error: any) {
    console.error('❌ Kamera listesi hatası:', error);
    return NextResponse.json(
      { error: 'Kameralar yüklenemedi', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Yeni kamera ekle
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      camera_name, 
      ip_address, 
      port = 80,
      stream_path = '/stream',
      username, 
      password,
      location_description 
    } = body;

    // Validasyon
    if (!camera_name || !ip_address) {
      return NextResponse.json(
        { error: 'Kamera adı ve IP adresi gerekli' },
        { status: 400 }
      );
    }

    // Plan kontrolü
    const planInfo = await getUserPlan(user.userId);

    const currentCount = await sql`
      SELECT COUNT(*) as count 
      FROM business_cameras 
      WHERE business_user_id = ${user.userId}
    `;

    if (parseInt(currentCount.rows[0].count) >= planInfo.maxCameras) {
      return NextResponse.json(
        { 
          error: `${planInfo.planType.toUpperCase()} planınızda maksimum ${planInfo.maxCameras} kamera ekleyebilirsiniz`,
          currentCount: currentCount.rows[0].count,
          maxCameras: planInfo.maxCameras
        },
        { status: 400 }
      );
    }

    // IP'den stream path'i ayır (eğer / varsa)
    let cleanIp = ip_address;
    let actualStreamPath = stream_path;
    
    if (ip_address.includes('/')) {
      const parts = ip_address.split('/');
      cleanIp = parts[0];
      actualStreamPath = '/' + parts.slice(1).join('/');
    }

    // Stream URL oluştur
    // HTTP stream: http://192.168.1.100:80/stream
    // veya RTSP: rtsp://username:password@192.168.1.100:554/stream
    let streamUrl;
    if (username && password) {
      // RTSP with auth
      streamUrl = `rtsp://${username}:${password}@${cleanIp}:${port}${actualStreamPath}`;
    } else {
      // HTTP stream (ESP32-CAM genelde böyle)
      streamUrl = `http://${cleanIp}:${port}${actualStreamPath}`;
    }

    // Kamerayı ekle
    const result = await sql`
      INSERT INTO business_cameras (
        business_user_id, 
        camera_name, 
        ip_address, 
        port, 
        username, 
        password,
        stream_url,
        location_description,
        status
      ) VALUES (
        ${user.userId}, 
        ${camera_name}, 
        ${cleanIp}, 
        ${port}, 
        ${username || null}, 
        ${password || null},
        ${streamUrl},
        ${location_description || null},
        'active'
      )
      RETURNING *
    `;

    console.log(`✅ Kamera eklendi: ${camera_name} (${cleanIp}:${port}${actualStreamPath})`);

    return NextResponse.json({
      success: true,
      camera: result.rows[0],
      message: 'Kamera başarıyla eklendi'
    });

  } catch (error: any) {
    console.error('❌ Kamera ekleme hatası:', error);
    
    if (error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Bu IP adresi ve port zaten kayıtlı' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Kamera eklenemedi', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Kamera güncelle
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      id, 
      camera_name, 
      ip_address, 
      port, 
      username, 
      password,
      location_description,
      status 
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Kamera ID gerekli' },
        { status: 400 }
      );
    }

    // Stream URL güncelle
    const streamUrl = username && password 
      ? `rtsp://${username}:${password}@${ip_address}:${port}/stream`
      : `rtsp://${ip_address}:${port}/stream`;

    const result = await sql`
      UPDATE business_cameras 
      SET 
        camera_name = COALESCE(${camera_name}, camera_name),
        ip_address = COALESCE(${ip_address}, ip_address),
        port = COALESCE(${port}, port),
        username = ${username || null},
        password = ${password || null},
        stream_url = ${streamUrl},
        location_description = COALESCE(${location_description}, location_description),
        status = COALESCE(${status}, status),
        updated_at = NOW()
      WHERE id = ${id} 
        AND business_user_id = ${user.userId}
      RETURNING *
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Kamera bulunamadı veya yetkiniz yok' },
        { status: 404 }
      );
    }

    console.log(`✅ Kamera güncellendi: ${result.rows[0].camera_name}`);

    return NextResponse.json({
      success: true,
      camera: result.rows[0],
      message: 'Kamera başarıyla güncellendi'
    });

  } catch (error: any) {
    console.error('❌ Kamera güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Kamera güncellenemedi', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Kamera sil (HARD DELETE - aynı IP tekrar eklenebilsin)
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Kamera ID gerekli' },
        { status: 400 }
      );
    }

    // HARD DELETE - Kalıcı olarak sil ki aynı IP tekrar eklenebilsin
    const result = await sql`
      DELETE FROM business_cameras 
      WHERE id = ${id} 
        AND business_user_id = ${user.userId}
      RETURNING camera_name
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Kamera bulunamadı veya yetkiniz yok' },
        { status: 404 }
      );
    }

    console.log(`✅ Kamera kalıcı olarak silindi: ${result.rows[0].camera_name}`);

    return NextResponse.json({
      success: true,
      message: 'Kamera başarıyla silindi'
    });

  } catch (error: any) {
    console.error('❌ Kamera silme hatası:', error);
    return NextResponse.json(
      { error: 'Kamera silinemedi', details: error.message },
      { status: 500 }
    );
  }
}
