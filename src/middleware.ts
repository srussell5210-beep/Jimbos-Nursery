import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'jn_session';

async function verifyToken(token: string): Promise<boolean> {
  const secret = process.env.SESSION_SECRET ?? 'changeme';
  if (!token) return false;
  try {
    const decoded = atob(token);
    const lastColon = decoded.lastIndexOf(':');
    if (lastColon < 0) return false;
    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    const expected = Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return sig === expected;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  // TEMP LOCAL BYPASS: remove before deploying. Skips login for local Clover testing.
  if (process.env.NODE_ENV !== 'production') return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value ?? '';
  if (!(await verifyToken(token))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/crm', '/crm/(.*)', '/admin'],
};
