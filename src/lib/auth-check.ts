import { cookies } from 'next/headers';
import { createHmac } from 'crypto';
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'jn_session';

export function verifySessionToken(token: string): string | null {
  const secret = process.env.SESSION_SECRET ?? 'changeme';
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const lastColon = decoded.lastIndexOf(':');
    if (lastColon < 0) return null;
    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    if (sig !== expected) return null;
    return payload.split(':')[0];
  } catch {
    return null;
  }
}

// For server actions: redirects to /login if session is invalid.
export function requireSession(): void {
  // TEMP LOCAL BYPASS: remove before deploying. Skips login for local Clover testing.
  if (process.env.NODE_ENV !== 'production') return;

  const token = cookies().get(COOKIE_NAME)?.value ?? '';
  if (!verifySessionToken(token)) {
    redirect('/login');
  }
}
