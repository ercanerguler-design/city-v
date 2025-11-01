import { NextResponse } from 'next/server';

// Basit health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'CityV Next.js API',
    python_ai_url: process.env.PYTHON_AI_URL || 'http://localhost:8000',
    timestamp: new Date().toISOString()
  });
}
