import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ZONE_API_URLS: Record<string, string> = {
  NEXT_PUBLIC_ZONE_1_API: process.env.NEXT_PUBLIC_ZONE_1_API || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api',
  NEXT_PUBLIC_ZONE_2_API: process.env.NEXT_PUBLIC_ZONE_2_API || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api',
  NEXT_PUBLIC_ZONE_3_API: process.env.NEXT_PUBLIC_ZONE_3_API || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api',
  NEXT_PUBLIC_ZONE_4_API: process.env.NEXT_PUBLIC_ZONE_4_API || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api',
};

const FALLBACK_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

function parseJwtExp(token: string): number | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    const decoded = JSON.parse(jsonPayload);
    return decoded.exp || null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    let targetApiUrl = FALLBACK_API;
    
    // Use the locked HttpOnly zone if available (post-login)
    let envKey = request.cookies.get('annapurna_locked_zone')?.value;
    
    // Fallback to Header for pre-login requests (e.g. /captcha, /send-otp)
    if (!envKey) {
      const headerZoneId = request.headers.get('X-Zone-Id');
      if (headerZoneId) {
        envKey = `NEXT_PUBLIC_${headerZoneId.replace('-', '_')}_API`;
      }
    }

    if (envKey && ZONE_API_URLS[envKey]) {
      targetApiUrl = ZONE_API_URLS[envKey];
    }
    
    const baseUrl = new URL(targetApiUrl).origin;
    const requestUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, baseUrl);
    
    // Auth Routes Interception
    if (request.nextUrl.pathname === '/api/auth/verify-otp' || request.nextUrl.pathname === '/api/auth/refresh') {
      let body: string | undefined;
      
      // Inject refresh token if refreshing
      if (request.nextUrl.pathname === '/api/auth/refresh') {
        const refreshToken = request.cookies.get('annapurna_refresh_token')?.value;
        if (!refreshToken) {
           return NextResponse.json({ message: "No refresh token available" }, { status: 401 });
        }
        body = JSON.stringify({ refreshToken });
      } else {
        body = await request.text();
      }

      const res = await fetch(requestUrl, {
        method: request.method,
        headers: {
          'Content-Type': request.headers.get('Content-Type') || 'application/json',
        },
        body
      });

      const data = await res.json();
      const nextResponse = NextResponse.json(data, { status: res.status });

      if (res.ok && data.token) {
        // Set HttpOnly Tokens
        nextResponse.cookies.set('annapurna_token', data.token, { httpOnly: true, path: '/', sameSite: 'lax' });
        nextResponse.cookies.set('annapurna_refresh_token', data.refreshToken, { httpOnly: true, path: '/', sameSite: 'lax' });
        
        // Expose expiration claims to frontend as readable cookies
        const tokenExp = parseJwtExp(data.token);
        const refreshExp = parseJwtExp(data.refreshToken);
        if (tokenExp) nextResponse.cookies.set('annapurna_token_exp', tokenExp.toString(), { path: '/', sameSite: 'lax' });
        if (refreshExp) nextResponse.cookies.set('annapurna_refresh_exp', refreshExp.toString(), { path: '/', sameSite: 'lax' });

        // Lock the zone to the session securely
        if (envKey) {
          nextResponse.cookies.set('annapurna_locked_zone', envKey, { httpOnly: true, path: '/', sameSite: 'lax' });
        }

        // Strip actual tokens from JSON response
        delete data.token;
        delete data.refreshToken;
        return NextResponse.json(data, { status: res.status, headers: nextResponse.headers });
      }

      return nextResponse;
    }

    if (request.nextUrl.pathname === '/api/auth/logout') {
      // Forward logout to invalidate token on backend if needed
      const token = request.cookies.get('annapurna_token')?.value;
      const headers = new Headers(request.headers);
      if (token) headers.set('Authorization', `Bearer ${token}`);
      
      const res = await fetch(requestUrl, { method: 'POST', headers });
      const nextResponse = NextResponse.json({ message: "Logged out" }, { status: 200 });
      
      // Clear all auth cookies
      nextResponse.cookies.delete('annapurna_token');
      nextResponse.cookies.delete('annapurna_refresh_token');
      nextResponse.cookies.delete('annapurna_token_exp');
      nextResponse.cookies.delete('annapurna_refresh_exp');
      nextResponse.cookies.delete('annapurna_locked_zone');
      return nextResponse;
    }

    // All other API requests: Inject HttpOnly token as Authorization header
    const token = request.cookies.get('annapurna_token')?.value;
    const headers = new Headers(request.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return NextResponse.rewrite(requestUrl, {
      request: { headers }
    });
  }
}

export const config = {
  matcher: '/api/:path*',
};
