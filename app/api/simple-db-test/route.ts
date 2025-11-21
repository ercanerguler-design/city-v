import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Basit Database Test API
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Simple Database Test started');
    
    // Environment check
    console.log('Environment check:');
    console.log('  DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('  POSTGRES_URL exists:', !!process.env.POSTGRES_URL);
    console.log('  NODE_ENV:', process.env.NODE_ENV);
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        error: 'DATABASE_URL environment variable is missing',
        env: {
          DATABASE_URL: !!process.env.DATABASE_URL,
          POSTGRES_URL: !!process.env.POSTGRES_URL
        }
      }, { status: 500 });
    }
    
    // Database connection
    const sql = neon(process.env.DATABASE_URL);
    console.log('✅ Neon connection created');
    
    // Simple query
    const result = await sql`SELECT NOW() as current_time, 'SUCCESS' as status`;
    console.log('✅ Query executed:', result[0]);
    
    return NextResponse.json({
      success: true,
      result: result[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Database test error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      name: error.name
    }, { status: 500 });
  }
}