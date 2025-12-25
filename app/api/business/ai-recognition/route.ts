import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-key-2024';

/**
 * AI Recognition API
 * GET /api/business/ai-recognition?businessUserId=23&detectionType=person&minConfidence=0.5
 * 
 * Returns AI recognition logs for person/object/face detection
 * NO JWT - uses businessUserId parameter like other analytics APIs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessUserId = searchParams.get('businessUserId') || searchParams.get('businessId'); // backward compatible
    const detectionType = searchParams.get('detectionType') || 'all';
    const minConfidence = parseFloat(searchParams.get('minConfidence') || '0.5');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!businessUserId) {
      return NextResponse.json(
        { error: 'Business User ID required' },
        { status: 400 }
      );
    }

    console.log('🔍 AI Recognition query:', { businessUserId, detectionType, minConfidence, limit });

    // ✅ ESP32 FIRMWARE: iot_crowd_analysis tablosu kullanılıyor
    // Business cameras ile JOIN yaparak ESP32 verilerini al
    const recognitionLogs = await sql`
      SELECT 
        ca.id,
        'person' as detection_type,
        'human' as object_class,
        COALESCE(ca.confidence_score, 95) as confidence_score,
        NULL as bounding_box,
        ca.device_id as person_id,
        ca.analysis_timestamp as timestamp,
        ca.device_id,
        bc.business_user_id as business_id
      FROM iot_crowd_analysis ca
      JOIN business_cameras bc ON bc.id::VARCHAR = ca.device_id
      WHERE bc.business_user_id = ${parseInt(businessUserId)}
        AND ca.confidence_score >= ${minConfidence}
        AND ca.analysis_timestamp >= NOW() - INTERVAL '24 hours'
      ORDER BY ca.analysis_timestamp DESC 
      LIMIT ${limit}
    `;

    // If no real data found, return empty result
    if (recognitionLogs.length === 0) {
      console.log('⚠️ No AI recognition data found');
      
      return NextResponse.json({
        success: true,
        filters: {
          detectionType,
          minConfidence,
          limit
        },
        stats: {
          totalDetections: 0,
          byType: [],
          uniquePersons: 0
        },
        detections: {},
        recentDetections: []
      });
    }

    // Process real data
    // Group by detection type
    const groupedByType: { [key: string]: any[] } = {};
    recognitionLogs.forEach((log: any) => {
      if (!groupedByType[log.detection_type]) {
        groupedByType[log.detection_type] = [];
      }
      groupedByType[log.detection_type].push({
        id: log.id,
        objectClass: log.object_class,
        confidence: Math.round(log.confidence_score * 100),
        boundingBox: typeof log.bounding_box === 'string' 
          ? JSON.parse(log.bounding_box) 
          : log.bounding_box,
        personId: log.person_id,
        timestamp: log.timestamp,
        deviceId: log.device_id
      });
    });

    // Calculate statistics
    const stats = {
      totalDetections: recognitionLogs.length,
      byType: Object.entries(groupedByType).map(([type, detections]) => ({
        type,
        count: detections.length,
        avgConfidence: Math.round(
          detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length
        )
      })),
      uniquePersons: new Set(
        recognitionLogs
          .filter((r: any) => r.person_id)
          .map((r: any) => r.person_id)
      ).size
    };

    return NextResponse.json({
      success: true,
      filters: {
        detectionType,
        minConfidence,
        limit
      },
      stats,
      detections: groupedByType,
      recentDetections: recognitionLogs.slice(0, 20).map((log: any) => ({
        id: log.id,
        type: log.detection_type,
        object: log.object_class,
        confidence: Math.round(log.confidence_score * 100),
        timestamp: log.timestamp
      }))
    });

  } catch (error: any) {
    console.error('❌ AI Recognition error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI recognition data', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Receive AI detection data from ESP32
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      deviceId,
      detections // [{ detectionType, objectClass, confidence, boundingBox, personId? }]
    } = body;

    if (!businessId || !deviceId || !detections || !Array.isArray(detections)) {
      return NextResponse.json(
        { error: 'businessId, deviceId, and detections array required' },
        { status: 400 }
      );
    }

    const insertPromises = detections.map((detection: any) => {
      return sql`
        INSERT INTO ai_recognition_logs (
          business_id,
          device_id,
          detection_type,
          object_class,
          confidence_score,
          bounding_box,
          person_id
        ) VALUES (
          ${businessId},
          ${deviceId},
          ${detection.detectionType},
          ${detection.objectClass},
          ${detection.confidence},
          ${JSON.stringify(detection.boundingBox)},
          ${detection.personId || null}
        )
        RETURNING id
      `;
    });

    const results = await Promise.all(insertPromises);

    console.log(`✅ AI Recognition saved: ${detections.length} detections`);

    return NextResponse.json({
      success: true,
      savedCount: results.length,
      detections: results.map((r, i) => ({
        id: r.rows[0].id,
        type: detections[i].detectionType,
        object: detections[i].objectClass,
        confidence: Math.round(detections[i].confidence * 100)
      }))
    });

  } catch (error: any) {
    console.error('❌ Save AI recognition error:', error);
    return NextResponse.json(
      { error: 'Failed to save AI recognition data', details: error.message },
      { status: 500 }
    );
  }
}

