import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser, unauthorized } from '@/lib/admin-api';
import {
  deleteCloverConnection,
  getCloverOAuthConfig,
  getPublicSiteOrigin,
  getCloverRedirectUri,
  isLikelyCloverAppId,
  readCloverConnection,
} from '@/lib/clover-connection';

export async function GET(request: NextRequest) {
  if (!getAdminUser(request)) return unauthorized();

  const origin = getPublicSiteOrigin(new URL(request.url).origin);
  const { environment, appId, appSecret, merchantId } = getCloverOAuthConfig();
  const hasValidAppId = isLikelyCloverAppId(appId);
  const connection = await readCloverConnection();

  return NextResponse.json({
    appConfigured: Boolean(hasValidAppId && appSecret),
    missing: [
      ...(!appId ? ['CLOVER_APP_ID'] : []),
      ...(appId && !hasValidAppId ? ['valid CLOVER_APP_ID from Clover App Settings'] : []),
      ...(!appSecret ? ['CLOVER_APP_SECRET'] : []),
    ],
    redirectUri: getCloverRedirectUri(origin),
    merchantConfigured: Boolean(merchantId),
    connected: Boolean(connection),
    checkoutReady: Boolean(connection?.apiAccessKey),
    environment: connection?.environment ?? environment,
    merchantId: connection?.merchantId ?? null,
    connectedAt: connection?.connectedAt ?? null,
    updatedAt: connection?.updatedAt ?? null,
    accessTokenExpiresAt: connection?.accessTokenExpiresAt ?? null,
    refreshTokenExpiresAt: connection?.refreshTokenExpiresAt ?? null,
  });
}

export async function DELETE(request: NextRequest) {
  if (!getAdminUser(request)) return unauthorized();
  await deleteCloverConnection();
  return NextResponse.json({ ok: true });
}
