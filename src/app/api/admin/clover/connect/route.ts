import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getAdminUser } from '@/lib/admin-api';
import {
  getCloverAuthorizeUrl,
  getCloverOAuthConfig,
  getPublicSiteOrigin,
  isLikelyCloverAppId,
} from '@/lib/clover-connection';

const STATE_COOKIE = 'clover_oauth_state';

export async function GET(request: NextRequest) {
  if (!getAdminUser(request)) {
    return NextResponse.redirect(new URL('/login?redirect=/admin', request.url));
  }

  const { appId, appSecret } = getCloverOAuthConfig();
  if (!isLikelyCloverAppId(appId) || !appSecret) {
    return NextResponse.redirect(new URL('/admin?clover=missing-config', request.url));
  }

  const state = randomBytes(24).toString('hex');
  const origin = getPublicSiteOrigin(new URL(request.url).origin);
  const authorizeUrl = getCloverAuthorizeUrl(origin, state);
  console.log('[clover-connect] origin=%s authorizeUrl=%s', origin, authorizeUrl); // DIAGNOSTIC
  const redirect = NextResponse.redirect(authorizeUrl);
  redirect.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60,
    path: '/',
  });
  return redirect;
}
