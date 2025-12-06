import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    console.log('🏢 Starting AVM & Food Ordering Module Setup...');
    
    // Read SQL file
    const schemaPath = path.join(process.cwd(), 'database', 'mall-and-food-modules.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await sql.query(statement);
        results.push(`Statement ${i + 1} executed successfully`);
      } catch (err: any) {
        if (err.message.includes('already exists')) {
          results.push(`Statement ${i + 1} skipped (already exists)`);
        } else {
          errors.push(`Statement ${i + 1} failed: ${err.message}`);
        }
      }
    }
    
    return NextResponse.json({
      success: errors.length === 0,
      message: 'AVM & Food Ordering Modules Setup Complete',
      results,
      errors,
      tablesCreated: [
        'malls', 'mall_floors', 'mall_shops',
        'mall_cameras', 'mall_crowd_analysis', 'mall_rent_suggestions',
        'user_addresses', 'user_phone_verification',
        'shopping_carts', 'cart_items', 'food_orders',
        'order_status_history', 'business_delivery_settings'
      ]
    });
    
  } catch (error: any) {
    console.error('❌ Setup failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
