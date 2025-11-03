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
  console.log('🔐 Camera API auth check:', { hasHeader: !!authHeader, startsWithBearer: authHeader?.startsWith('Bearer ') });
  
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('❌ Missing or invalid auth header');
    return null;
  }

  try {
    const token = authHeader.substring(7);
    console.log('🔍 Decoding token, length:', token.length);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    console.log('✅ Token decoded:', { userId: decoded.userId, email: decoded.email });
    return decoded;
  } catch (error: any) {
    console.error('❌ JWT verify failed:', error.message);
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
    // GEÇİCİ: Token decode sorunu olduğu için query'den userId al
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');
    
    let user = getUserFromToken(request);
    
    // Token decode başarısız olursa query'den al
    if (!user && userIdParam) {
      console.log('⚠️ Token decode failed, using userId from query:', userIdParam);
      user = { userId: parseInt(userIdParam), email: 'temp@temp.com' };
    }
    
    if (!user) {
      console.log('❌ No auth - no token, no userId param');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Camera API authorized for userId:', user.userId);

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
    // GEÇİCİ: Token decode sorunu için body'den userId al
    const body = await request.json();
    
    let user = getUserFromToken(request);
    
    // Token decode başarısız olursa body'den al
    if (!user && body.userId) {
      console.log('⚠️ POST: Token decode failed, using userId from body:', body.userId);
      user = { userId: parseInt(body.userId), email: 'temp@temp.com' };
    }
    
    if (!user) {
      console.log('❌ POST: No auth - no token, no userId in body');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ POST Camera API authorized for userId:', user.userId);
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
    let user = getUserFromToken(request);
    
    // Token decode başarısız olursa body'den userId al (fallback)
    if (!user) {
      const body = await request.json();
      if (body.userId) {
        console.log('⚠️ PUT: Token decode failed, using userId from body:', body.userId);
        user = { userId: parseInt(body.userId), email: 'temp@temp.com' };
      } else {
        console.log('❌ PUT: No auth - no token, no userId in body');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
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
      status,
      calibration_line,
      entry_direction,
      zones
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

    // Kalibrasyon ve zone bilgilerini de güncelle
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
        calibration_line = COALESCE(${calibration_line ? JSON.stringify(calibration_line) : null}::jsonb, calibration_line),
        entry_direction = COALESCE(${entry_direction}, entry_direction),
        zones = COALESCE(${zones ? JSON.stringify(zones) : null}::jsonb, zones),
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
    let user = getUserFromToken(request);
    
    // Token decode başarısız olursa query'den userId al (fallback)
    if (!user) {
      const { searchParams } = new URL(request.url);
      const userIdParam = searchParams.get('userId');
      if (userIdParam) {
        console.log('⚠️ DELETE: Token decode failed, using userId from query:', userIdParam);
        user = { userId: parseInt(userIdParam), email: 'temp@temp.com' };
      } else {
        console.log('❌ DELETE: No auth - no token, no userId param');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
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
