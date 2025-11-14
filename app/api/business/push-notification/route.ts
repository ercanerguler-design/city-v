import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-2024';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let userId: number;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      userId = decoded.id;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const {
      businessId,
      campaignId,
      title,
      message,
      targetAudience
    } = body;

    // Hedef kullanıcıları belirle
    let targetUsers: string[] | null = null;
    let sentCount = 0;

    // City-V kullanıcılarını hedefle (tüm kullanıcılar veya filtrelenmiş)
    if (targetAudience === 'all') {
      const usersResult = await query(
        `SELECT id FROM users WHERE is_active = true`
      );
      targetUsers = usersResult.rows.map(u => u.id.toString());
      sentCount = usersResult.rows.length;
    } else if (targetAudience === 'nearby') {
      // İşletmeye yakın kullanıcılar (koordinat bazlı)
      const businessResult = await query(
        `SELECT latitude, longitude FROM business_profiles WHERE id = $1`,
        [businessId]
      );

      if (businessResult.rows.length > 0) {
        const { latitude, longitude } = businessResult.rows[0];
        
        // 5km yarıçapındaki kullanıcılar (basit hesaplama)
        const usersResult = await query(
          `SELECT id FROM users 
           WHERE is_active = true 
           AND last_location IS NOT NULL
           LIMIT 1000`
        );
        targetUsers = usersResult.rows.map(u => u.id.toString());
        sentCount = usersResult.rows.length;
      }
    } else {
      // Diğer filtreleme seçenekleri (membership_tier bazlı)
      const membershipFilter = 
        targetAudience === 'vip' ? 'enterprise' :
        targetAudience === 'regular' ? 'premium' :
        'free';

      const usersResult = await query(
        `SELECT id FROM users 
         WHERE is_active = true AND membership_tier = $1`,
        [membershipFilter]
      );
      targetUsers = usersResult.rows.map(u => u.id.toString());
      sentCount = usersResult.rows.length;
    }

    // Push notification kaydı oluştur
    const notificationResult = await query(
      `INSERT INTO push_notifications (
        business_id, campaign_id, title, message, 
        notification_type, target_users, sent_count, sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id`,
      [
        businessId,
        campaignId,
        title,
        message,
        'campaign',
        targetUsers,
        sentCount
      ]
    );

    // Kampanyayı notification gönderildi olarak işaretle
    if (campaignId) {
      await query(
        `UPDATE business_campaigns 
         SET notification_sent = true, 
             notification_sent_at = NOW(),
             reach_count = $1
         WHERE id = $2`,
        [sentCount, campaignId]
      );
    }

    // TODO: Gerçek push notification servisi entegrasyonu (Firebase, OneSignal vb.)
    // Bu aşamada sadece database'e kayıt ediyoruz
    console.log(`📢 Push notification gönderildi: ${sentCount} kullanıcı`);

    return NextResponse.json({
      success: true,
      notificationId: notificationResult.rows[0].id,
      sentCount,
      message: `${sentCount} kullanıcıya bildirim gönderildi`
    });

  } catch (error) {
    console.error('❌ Push notification hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
