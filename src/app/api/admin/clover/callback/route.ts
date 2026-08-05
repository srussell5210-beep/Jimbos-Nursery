import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin-api';
import { exchangeCloverCode } from '@/lib/clover-connection';

const STATE_COOKIE = 'clover_oauth_state';

function adminRedirect(request: NextRequest, result: string) {
  return new URL(`/admin?clover=${encodeURIComponent(result)}`, request.url);
}

function redirectAndClearState(request: NextRequest, result: string) {
  const response = NextResponse.redirect(adminRedirect(request, result));
  response.cookies.set(STATE_COOKIE, '', { maxAge: 0, path: '/' });
  return response;
}

export async function GET(request: NextRequest) {
  if (!getAdminUser(request)) {
    return NextResponse.redirect(new URL('/login?redirect=/admin', request.url));
  }

  const url = new URL(request.url);
  const state = url.searchParams.get('state') ?? '';
  const expectedState = request.cookies.get(STATE_COOKIE)?.value ?? '';
  const code = url.searchParams.get('code');
  const merchantId = url.searchParams.get('merchant_id') ?? url.searchParams.get('merchantId');
  const error = url.searchParams.get('error');

  console.log('[clover-callback] entry hasCode=%s stateMatch=%s merchantId=%s error=%s', // DIAGNOSTIC
    Boolean(code), Boolean(state && expectedState && state === expectedState), merchantId, error);

  if (error) return redirectAndClearState(request, 'error');
  if (!state || !expectedState || state !== expectedState || !code) {
    return redirectAndClearState(request, 'invalid-state');
  }

  try {
    await exchangeCloverCode(code, merchantId);
    return redirectAndClearState(request, 'connected');
  } catch (err) {
    console.error('[clover-callback]', err);
    return redirectAndClearState(request, 'connect-failed');
  }
}
