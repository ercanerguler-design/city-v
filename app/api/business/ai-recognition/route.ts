import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Recognition API
 * GET /api/business/ai-recognition?businessId=123&detectionType=person&minConfidence=0.5
 * 
 * Returns AI recognition logs for person/object/face detection
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const detectionType = searchParams.get('detectionType') || 'all';
    const minConfidence = parseFloat(searchParams.get('minConfidence') || '0.5');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID required' },
        { status: 400 }
      );
    }

    let query = `
      SELECT 
        id,
        detection_type,
        object_class,
        confidence_score,
        bounding_box,
        person_id,
        timestamp,
        device_id
      FROM ai_recognition_logs
      WHERE business_id = ${businessId}
        AND confidence_score >= ${minConfidence}
    `;

    if (detectionType !== 'all') {
      query += ` AND detection_type = '${detectionType}'`;
    }

    query += ` ORDER BY timestamp DESC LIMIT ${limit}`;

    const recognitionLogs = await sql.query(query);

    // Group by detection type
    const groupedByType: { [key: string]: any[] } = {};
    recognitionLogs.rows.forEach((log: any) => {
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
      totalDetections: recognitionLogs.rows.length,
      byType: Object.entries(groupedByType).map(([type, detections]) => ({
        type,
        count: detections.length,
        avgConfidence: Math.round(
          detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length
        )
      })),
      uniquePersons: new Set(
        recognitionLogs.rows
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
      recentDetections: recognitionLogs.rows.slice(0, 20).map((log: any) => ({
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
