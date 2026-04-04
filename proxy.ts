import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Verifies a JWT token using the Web Crypto API (Edge-compatible).
 * This performs a REAL HMAC-SHA256 signature check — not just a decode.
 */
async function verifyTokenEdge(
  token: string
): Promise<{ userId: string; role: string; locationId?: string | null } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const secret = process.env.JWT_SECRET;
    if (!secret) return null;

    // ------- 1. Verify HMAC-SHA256 signature -------
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Convert base64url → base64 → binary
    const b64 = parts[2].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '=='.slice(0, (4 - (b64.length % 4)) % 4);
    const signatureBytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));

    const dataToVerify = encoder.encode(`${parts[0]}.${parts[1]}`);

    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, dataToVerify);
    if (!isValid) return null;

    // ------- 2. Decode & check expiry -------
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // ── Protect /admin/* ───────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
    }
    const decoded = await verifyTokenEdge(token);
    if (!decoded) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      // Clear the invalid/expired cookie
      response.cookies.delete('auth-token');
      return response;
    }
    if (decoded.role !== 'super_admin' && decoded.role !== 'store_admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // ── Protect /dashboard/* ──────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
    }
    const decoded = await verifyTokenEdge(token);
    if (!decoded) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }
  }

  // ── Protect /orders (customer must be logged in) ──────
  if (pathname === '/orders' || pathname.startsWith('/orders/')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
    }
    const decoded = await verifyTokenEdge(token);
    if (!decoded) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/orders/:path*'],
};
