import { createHash, createHmac } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const USERNAME = process.env.ADMIN_USERNAME ?? '';
const PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ?? '';
const SESSION_SECRET = process.env.SESSION_SECRET ?? 'changeme';
const COOKIE_NAME = 'jn_session';
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

function makeToken(username: string): string {
  const payload = `${username}:${Date.now()}`;
  const sig = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64');
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const hash = createHash('sha256').update(password ?? '').digest('hex');
  const validUser = username === USERNAME;
  const validPass = hash === PASSWORD_HASH;

  if (!validUser || !validPass) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = makeToken(username);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
  return res;
}
