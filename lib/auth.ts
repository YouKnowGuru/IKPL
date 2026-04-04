import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { User } from '@/models';
import connectDB from './db';

// ✅ Fail fast at startup if JWT_SECRET is missing — never fall back to a weak default.
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is not set. ' +
        'Add it to your .env.local file before starting the server.'
    );
  }
  return secret;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'customer' | 'store_admin' | 'super_admin';
  locationId?: string | null;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, getJwtSecret()) as JWTPayload;
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value;
}

export async function getCurrentUser() {
  try {
    const token = await getAuthToken();
    if (!token) return null;
    const payload = verifyToken(token);
    await connectDB();
    const user = await User.findById(payload.userId).select('-password');
    return user;
  } catch {
    return null;
  }
}

// For API routes (NextRequest-based)
export async function requireAuth(request: NextRequest): Promise<JWTPayload> {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) throw new Error('Authentication required');
  try {
    return verifyToken(token);
  } catch {
    throw new Error('Invalid or expired token');
  }
}

export async function requireAdmin(request: NextRequest): Promise<JWTPayload> {
  const payload = await requireAuth(request);
  if (payload.role !== 'super_admin' && payload.role !== 'store_admin') {
    throw new Error('Admin access required');
  }
  return payload;
}

export async function requireSuperAdmin(request: NextRequest): Promise<JWTPayload> {
  const payload = await requireAuth(request);
  if (payload.role !== 'super_admin') {
    throw new Error('Super admin access required');
  }
  return payload;
}
