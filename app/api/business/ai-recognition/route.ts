import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-key-2024';

/**
 * AI Recognition API
 * GET /api/business/ai-recognition?businessId=123&detectionType=person&minConfidence=0.5
 * 
 * Returns AI recognition logs for person/object/face detection
 */
export async function GET(request: NextRequest) {
  try {
    // JWT token authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let user;
    
    try {
      user = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

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

    console.log('🔍 AI Recognition query:', { businessId, detectionType, minConfidence, limit });

    // Check for actual data first
    let whereClause = `business_id = $1 AND confidence_score >= $2`;
    let params = [businessId, minConfidence];
    
    if (detectionType !== 'all') {
      whereClause += ` AND detection_type = $3`;
      params.push(detectionType);
    }

    const query = `
      SELECT 
        id,
        detection_type,
        object_class,
        confidence_score,
        bounding_box,
        person_id,
        timestamp,
        device_id,
        business_id
      FROM ai_recognition_logs
      WHERE ${whereClause}
      ORDER BY timestamp DESC 
      LIMIT $${params.length + 1}
    `;
    
    params.push(limit.toString());

    const recognitionLogs = await sql(query, params);

    // If no real data, generate mock data
    if (recognitionLogs.length === 0) {
      console.log('⚠️ No AI recognition data found - generating mock data');
      
      const mockDetections = [];
      for (let i = 0; i < Math.min(limit, 50); i++) {
        const detectionTypes = ['person', 'face', 'vehicle', 'object'];
        const objects = {
          person: ['person', 'customer', 'visitor'],
          face: ['happy_face', 'neutral_face', 'surprised_face'],
          vehicle: ['car', 'bicycle', 'motorcycle'],
          object: ['bag', 'phone', 'laptop']
        };
        
        const randomType = detectionTypes[Math.floor(Math.random() * detectionTypes.length)];
        const randomObject = objects[randomType][Math.floor(Math.random() * objects[randomType].length)];
        
        mockDetections.push({
          id: `mock-${i}`,
          detection_type: randomType,
          object_class: randomObject,
          confidence_score: Math.random() * 0.3 + 0.7, // 0.7-1.0
          bounding_box: JSON.stringify({
            x: Math.floor(Math.random() * 400),
            y: Math.floor(Math.random() * 300),
            width: Math.floor(Math.random() * 100) + 50,
            height: Math.floor(Math.random() * 100) + 50
          }),
          person_id: randomType === 'person' ? `person_${Math.floor(Math.random() * 100)}` : null,
          timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          device_id: `camera_${Math.floor(Math.random() * 3) + 1}`,
          business_id: parseInt(businessId)
        });
      }
      
      // Group by detection type
      const groupedByType: { [key: string]: any[] } = {};
      mockDetections.forEach((log: any) => {
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
        totalDetections: mockDetections.length,
        byType: Object.entries(groupedByType).map(([type, detections]) => ({
          type,
          count: detections.length,
          avgConfidence: Math.round(
            detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length
          )
        })),
        uniquePersons: new Set(
          mockDetections
            .filter((r: any) => r.person_id)
            .map((r: any) => r.person_id)
        ).size
      };

      return NextResponse.json({
        success: true,
        isMockData: true,
        filters: {
          detectionType,
          minConfidence,
          limit
        },
        stats,
        detections: groupedByType,
        recentDetections: mockDetections.slice(0, 20).map((log: any) => ({
          id: log.id,
          type: log.detection_type,
          object: log.object_class,
          confidence: Math.round(log.confidence_score * 100),
          timestamp: log.timestamp
        }))
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
