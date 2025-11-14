import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/cron/archive-daily-stats
 * 
 * Vercel Cron Job Endpoint
 * Her gün 23:59'da çalışır ve günlük istatistikleri arşivler
 * 
 * vercel.json içinde tanımlanmalı:
 * {
 *   "crons": [{
 *     "path": "/api/cron/archive-daily-stats",
 *     "schedule": "59 23 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Vercel Cron Secret kontrolü (güvenlik için)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ Unauthorized cron request');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🕐 [CRON] Daily stats archiving started at', new Date().toISOString());

    // Archive script'ini çalıştır
    const { archiveDailyStats } = require('@/database/archiveDailyStats');
    const result = await archiveDailyStats();

    console.log('✅ [CRON] Daily stats archived:', result);

    return NextResponse.json({
      success: true,
      message: 'Daily stats archived successfully',
      result
    });

  } catch (error: any) {
    console.error('❌ [CRON] Archive error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Archive failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
