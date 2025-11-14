import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Vercel KV'den bildirimleri al (son 50 bildirim)
    const notificationsList = await kv.lrange('cityv:notifications', 0, 49);
    
    const notifications = notificationsList.map((item: any) => {
      if (typeof item === 'string') {
        return JSON.parse(item);
      }
      return item;
    });

    return NextResponse.json({
      success: true,
      notifications
    });

  } catch (error: any) {
    console.error('Bildirimler getirilemedi:', error);
    return NextResponse.json(
      { 
        success: false, 
        notifications: [],
        error: error.message 
      },
      { status: 200 } // 200 döndür ama boş liste
    );
  }
}
