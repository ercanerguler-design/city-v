import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

/**
 * ESP32-CAM'den Personel Tespiti API
 * QR Kod veya Yüz Tanıma ile personel kaydı
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      camera_id,
      staff_qr,         // QR kod için
      face_image,       // Yüz tanıma için (base64)
      detection_type,   // 'qr_scan' veya 'face_recognition'
      location_zone
    } = body;

    if (!camera_id) {
      return NextResponse.json({ error: 'Camera ID gerekli' }, { status: 400 });
    }

    let staffId: number | null = null;
    let staffInfo: any = null;
    let confidence = 1.0;

    // 1. QR Kod ile Tanıma
    if (detection_type === 'qr_scan' && staff_qr) {
      console.log('📱 QR Kod taraması:', staff_qr);
      
      // QR kod formatı: STAFF-{id}-{hash}
      const qrMatch = staff_qr.match(/STAFF-(\d+)-/);
      if (qrMatch) {
        staffId = parseInt(qrMatch[1]);
        
        // Personel bilgilerini al
        const staffResult = await sql`
          SELECT id, full_name, position, status
          FROM business_staff
          WHERE id = ${staffId} AND status = 'active'
        `;
        
        if (staffResult.rows.length === 0) {
          return NextResponse.json({ error: 'Personel bulunamadı veya aktif değil' }, { status: 404 });
        }
        
        staffInfo = staffResult.rows[0];
      } else {
        return NextResponse.json({ error: 'Geçersiz QR kod formatı' }, { status: 400 });
      }
    }
    
    // 2. Yüz Tanıma ile Tanıma (TODO: ML implementasyonu)
    else if (detection_type === 'face_recognition' && face_image) {
      console.log('👤 Yüz tanıma işleniyor...');
      
      // Basit simülasyon - Gerçek implementasyonda ML modeli kullanılacak
      // TensorFlow.js veya Python mikroservis ile
      
      return NextResponse.json({ 
        error: 'Yüz tanıma henüz aktif değil. QR kod kullanın.',
        suggestion: 'detection_type: "qr_scan" kullanın'
      }, { status: 501 });
    } else {
      return NextResponse.json({ error: 'detection_type ve ilgili veri gerekli' }, { status: 400 });
    }

    if (!staffId || !staffInfo) {
      return NextResponse.json({ error: 'Personel tanınamadı' }, { status: 404 });
    }

    // 3. Tespit kaydını oluştur
    await sql`
      INSERT INTO iot_staff_detections (
        staff_id, camera_id, confidence, location_zone, detection_type
      ) VALUES (
        ${staffId}, ${camera_id}, ${confidence}, ${location_zone || 'Bilinmiyor'}, ${detection_type}
      )
    `;

    // 4. Bugünkü vardiya kaydını kontrol et
    const today = new Date().toISOString().split('T')[0];
    
    const attendanceResult = await sql`
      SELECT id, check_in_time, check_out_time
      FROM staff_attendance
      WHERE staff_id = ${staffId} AND date = ${today}
    `;

    let action = '';
    let attendanceId: number | null = null;
    let message = '';

    if (attendanceResult.rows.length === 0) {
      // İlk giriş - Check-in
      const newAttendance = await sql`
        INSERT INTO staff_attendance (
          staff_id, 
          business_id,
          check_in_time, 
          camera_id, 
          date,
          auto_detected
        ) VALUES (
          ${staffId},
          (SELECT business_id FROM business_staff WHERE id = ${staffId}),
          NOW(),
          ${camera_id},
          ${today},
          true
        )
        RETURNING id
      `;
      
      attendanceId = newAttendance.rows[0].id;
      action = 'check_in';
      message = `${staffInfo.full_name} vardiyaya başladı! 🎉`;
      
      console.log(`✅ Check-in: ${staffInfo.full_name} - ${location_zone}`);
      
    } else {
      const attendance = attendanceResult.rows[0];
      
      if (!attendance.check_out_time) {
        // Zaten check-in yapılmış, şimdi check-out
        const checkInTime = new Date(attendance.check_in_time);
        const checkOutTime = new Date();
        const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
        
        await sql`
          UPDATE staff_attendance
          SET 
            check_out_time = NOW(),
            total_hours = ${totalHours.toFixed(2)}
          WHERE id = ${attendance.id}
        `;
        
        attendanceId = attendance.id;
        action = 'check_out';
        message = `${staffInfo.full_name} vardiyayı tamamladı! Toplam: ${totalHours.toFixed(1)} saat`;
        
        console.log(`✅ Check-out: ${staffInfo.full_name} - ${totalHours.toFixed(1)}s`);
        
      } else {
        // Zaten check-out yapılmış - ek tespit kaydı
        action = 'presence';
        message = `${staffInfo.full_name} tespit edildi (${location_zone})`;
        
        console.log(`👀 Presence: ${staffInfo.full_name} - ${location_zone}`);
      }
    }

    return NextResponse.json({
      success: true,
      staff: {
        id: staffInfo.id,
        name: staffInfo.full_name,
        position: staffInfo.position
      },
      action,
      attendance_id: attendanceId,
      message,
      location: location_zone,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Staff detection error:', error);
    return NextResponse.json({ 
      error: 'Personel tespiti başarısız',
      details: error.message 
    }, { status: 500 });
  }
}

/**
 * GET - Test endpoint & Son tespitler
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const test = searchParams.get('test');
    const limit = searchParams.get('limit') || '10';
    
    // Test endpoint for ESP32-CAM connectivity
    if (test === 'connectivity') {
      return NextResponse.json({
        success: true,
        message: '🟢 Staff Detection API Working!',
        endpoint: '/api/iot/staff-detection',
        timestamp: new Date().toISOString(),
        methods: ['POST', 'GET'],
        required_fields: ['camera_id', 'staff_qr', 'detection_type'],
        example_payload: {
          camera_id: 29,
          staff_qr: 'STAFF-001-ADMIN',
          detection_type: 'qr_scan',
          location_zone: 'Giris-Kapisi'
        },
        test_qr_codes: [
          'STAFF-001-ADMIN',
          'STAFF-002-GUARD', 
          'STAFF-003-CLEAN',
          'STAFF-004-MAINT'
        ]
      });
    }
    
    // Create test staff if needed
    if (test === 'create_test_data') {
      try {
        // Check if test data exists
        const existingStaff = await sql`
          SELECT COUNT(*) as count FROM business_staff WHERE id <= 4
        `;
        
        if (existingStaff.rows[0].count < 4) {
          // Create test business user first
          await sql`
            INSERT INTO business_users (id, email, password_hash, full_name)
            VALUES (1, 'test@cityv.com', 'test_hash', 'Test Business')
            ON CONFLICT (id) DO NOTHING
          `;
          
          // Create test staff
          await sql`
            INSERT INTO business_staff (id, business_id, full_name, email, position, status)
            VALUES 
            (1, 1, 'Admin User', 'admin@cityv.com', 'Admin', 'active'),
            (2, 1, 'Güvenlik Görevlisi', 'guard@cityv.com', 'Güvenlik', 'active'),
            (3, 1, 'Temizlik Personeli', 'cleaner@cityv.com', 'Temizlik', 'active'),
            (4, 1, 'Bakım Teknisyeni', 'maintenance@cityv.com', 'Bakım', 'active')
            ON CONFLICT (id) DO NOTHING
          `;
        }
        
        return NextResponse.json({
          success: true,
          message: 'Test data created/verified',
          staff_count: 4
        });
      } catch (error: any) {
        return NextResponse.json({
          success: false,
          error: 'Failed to create test data: ' + error.message
        }, { status: 500 });
      }
    }

    const result = await sql`
      SELECT 
        isd.*,
        bs.full_name,
        bs.position,
        bc.camera_name,
        bc.location_description
      FROM iot_staff_detections isd
      JOIN business_staff bs ON isd.staff_id = bs.id
      JOIN business_cameras bc ON isd.camera_id = bc.id
      ORDER BY isd.detection_time DESC
      LIMIT ${parseInt(limit)}
    `;

    return NextResponse.json({
      success: true,
      detections: result.rows
    });

  } catch (error: any) {
    console.error('❌ Get detections error:', error);
    return NextResponse.json({ error: 'Kayıtlar alınamadı' }, { status: 500 });
  }
}


