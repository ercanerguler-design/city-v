/**
 * JWT Token Utilities
 * Business authentication için helper fonksiyonlar
 */

import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-2024';

export interface BusinessTokenPayload {
  userId: number;
  email: string;
  businessName: string;
  membershipType: string;
}

// Token oluştur
export function generateToken(payload: BusinessTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d' // 7 gün geçerli
  });
}

// Token doğrula
export function verifyToken(token: string): BusinessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as BusinessTokenPayload;
    return decoded;
  } catch (error) {
    console.error('❌ Token doğrulama hatası:', error);
    return null;
  }
}

// Request'ten token al ve doğrula
export function getTokenFromRequest(request: NextRequest): BusinessTokenPayload | null {
  // Header'dan token al
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}

// Token yenile
export function refreshToken(oldToken: string): string | null {
  const payload = verifyToken(oldToken);
  
  if (!payload) {
    return null;
  }

  // Yeni token oluştur
  return generateToken({
    userId: payload.userId,
    email: payload.email,
    businessName: payload.businessName,
    membershipType: payload.membershipType
  });
}
