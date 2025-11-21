import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Test API çalışıyor',
    timestamp: new Date().toISOString()
  });
}