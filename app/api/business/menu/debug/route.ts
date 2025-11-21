import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * Menu Debug API - Comprehensive debugging
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Menu Categories Debug API started');
    
    // 1. Environment check
    console.log('🌍 Environment variables:');
    console.log('  DATABASE_URL:', !!process.env.DATABASE_URL);
    console.log('  NODE_ENV:', process.env.NODE_ENV);
    
    // 2. Direct neon connection test
    console.log('📡 Testing direct neon connection...');
    const directTest = await sql`SELECT NOW() as current_time, 'DIRECT' as method`;
    console.log('✅ Direct connection:', directTest[0]);
    
    // 3. Query function test
    console.log('📦 Testing @/lib/db query function...');
    const queryTest = await query('SELECT NOW() as current_time, $1 as method', ['QUERY_FUNCTION']);
    console.log('✅ Query function:', queryTest.rows[0]);
    
    // 4. Table structure
    console.log('🗄️ Checking table structure...');
    const structure = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'business_menu_categories'
      ORDER BY ordinal_position
    `, []);
    console.log('🏗️ Table structure:', structure.rows);
    
    // 5. Simple SELECT test
    console.log('📊 Testing simple SELECT...');
    const simpleSelect = await query('SELECT COUNT(*) FROM business_menu_categories', []);
    console.log('🔢 Row count:', simpleSelect.rows[0]);
    
    // 6. Sample data with explicit columns
    console.log('📝 Getting sample data...');
    const sampleData = await query(`
      SELECT id, business_id, name, icon, display_order, is_active, created_at, updated_at
      FROM business_menu_categories 
      LIMIT 3
    `, []);
    console.log('📊 Sample data:', sampleData.rows);
    
    return NextResponse.json({
      success: true,
      debug: {
        environment: {
          DATABASE_URL: !!process.env.DATABASE_URL,
          NODE_ENV: process.env.NODE_ENV
        },
        connections: {
          direct: directTest[0],
          queryFunction: queryTest.rows[0]
        },
        table: {
          structure: structure.rows,
          count: simpleSelect.rows[0],
          samples: sampleData.rows
        }
      },
      timestamp: new Date().toISOString()
    });
    const categoriesResult = await query(
      `SELECT id, business_id, name, is_active FROM business_menu_categories`
    );

    // Ürünleri kontrol et
    const itemsResult = await query(
      `SELECT id, business_id, category_id, name, is_active FROM business_menu_items`
    );

    return NextResponse.json({
      success: true,
      categories: categoriesResult.rows,
      items: itemsResult.rows,
      stats: {
        totalCategories: categoriesResult.rows.length,
        activeCategories: categoriesResult.rows.filter((c: any) => c.is_active === true).length,
        nullCategories: categoriesResult.rows.filter((c: any) => c.is_active === null).length,
        totalItems: itemsResult.rows.length,
        activeItems: itemsResult.rows.filter((i: any) => i.is_active === true).length,
        nullItems: itemsResult.rows.filter((i: any) => i.is_active === null).length
      }
    });

  } catch (error: any) {
    console.error('❌ Debug error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST - is_active NULL olanları düzelt
export async function POST(request: NextRequest) {
  try {
    // Kategorileri düzelt
    const categoriesFixed = await query(
      `UPDATE business_menu_categories SET is_active = true WHERE is_active IS NULL RETURNING id`
    );

    // Ürünleri düzelt
    const itemsFixed = await query(
      `UPDATE business_menu_items SET is_active = true WHERE is_active IS NULL RETURNING id`
    );

    return NextResponse.json({
      success: true,
      fixed: {
        categories: categoriesFixed.rows.length,
        items: itemsFixed.rows.length
      },
      message: 'is_active değerleri düzeltildi'
    });

  } catch (error: any) {
    console.error('❌ Fix error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
