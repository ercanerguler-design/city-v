import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Menu Debug API - is_active kontrolü ve düzeltme
 */

export async function GET(request: NextRequest) {
  try {
    // Kategorileri kontrol et
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
