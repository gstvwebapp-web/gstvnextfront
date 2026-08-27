import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limiting store for API routes
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

  // 1. Rate Limiting for Auth API endpoints (10 requests per 60s per IP)
  if (pathname.startsWith('/api/auth/')) {
    const now = Date.now();
    const windowMs = 60 * 1000;
    const limit = 10;

    const rateData = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > rateData.resetTime) {
      rateData.count = 1;
      rateData.resetTime = now + windowMs;
    } else {
      rateData.count += 1;
    }

    rateLimitMap.set(ip, rateData);

    if (rateData.count > limit) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 2. CSRF Protection for state-modifying requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method) && pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');

    if (origin && host && !origin.includes(host) && !origin.includes('localhost') && !origin.includes('gstv.in')) {
      return new NextResponse(
        JSON.stringify({ error: 'CSRF verification failed' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  const response = NextResponse.next();

  // 3. Security headers on all responses
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    // '/((?!_next/static|_next/image|favicon.ico|public|assets).*)',
    '/((?!_next/static|_next/image|public|assets).*)',
  ],
};
