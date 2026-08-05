import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth-check';

const COOKIE_NAME = 'jn_session';

export function getAdminUser(request: NextRequest): string | null {
  // TEMP LOCAL BYPASS: remove before deploying. Skips login for local Clover testing.
  if (process.env.NODE_ENV !== 'production') return 'local-dev';
  const token = request.cookies.get(COOKIE_NAME)?.value ?? '';
  return verifySessionToken(token);
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
