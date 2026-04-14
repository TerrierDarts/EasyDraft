import { User } from '../shared/auth-types';
import { randomUUID } from 'crypto';
import * as db from './db';

// For production, use proper JWT signing library (jsonwebtoken)
// For now, we'll use a simple token approach

// Minimal JWT-like token creation for development
export function createAuthToken(userId: string): string {
  const payload = {
    userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };
  
  // For production, use proper JWT library
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function verifyAuthToken(token: string): { userId: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expired
    }
    
    return { userId: payload.userId };
  } catch (err) {
    return null;
  }
}

// Mock Google ID token verification
// In production, use google-auth-library's TokenPayload verification
export function decodeGoogleToken(credential: string): {
  sub: string;
  email: string;
  name: string;
  picture?: string;
} | null {
  try {
    // This is a simplified mock - in production use google-auth-library
    // For testing, we'll accept base64 encoded user data
    const decoded = JSON.parse(Buffer.from(credential, 'base64').toString());
    return {
      sub: decoded.sub || decoded.id,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    };
  } catch (err) {
    console.error('Failed to decode Google token:', err);
    return null;
  }
}

export async function authenticateGoogleUser(
  credential: string
): Promise<{ user: User; token: string } | null> {
  const decoded = decodeGoogleToken(credential);
  
  if (!decoded) {
    return null;
  }
  
  // Check if user exists
  let user = await db.getUserByGoogleId(decoded.sub);
  
  if (!user) {
    // Create new user (free tier by default)
    user = await db.createUser({
      id: randomUUID(),
      googleId: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      createdAt: new Date().toISOString(),
      subscriptionTier: 'free',
      maxDrafts: 1,
    });
  }
  
  const token = createAuthToken(user.id);
  
  return { user, token };
}

export function generateSimpleId(): string {
  return randomUUID();
}
