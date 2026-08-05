import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser, unauthorized } from '@/lib/admin-api';
import { getPublicSiteOrigin } from '@/lib/clover-connection';
import { ecwidStoreId, isEcwidConfigured } from '@/lib/ecwid-connection';

export async function GET(request: NextRequest) {
  if (!getAdminUser(request)) return unauthorized();

  const origin = getPublicSiteOrigin(new URL(request.url).origin);
  const tokenConfigured = isEcwidConfigured();
  const webhookSecretConfigured = Boolean(process.env.ECWID_WEBHOOK_SECRET);

  return NextResponse.json({
    configured: tokenConfigured,
    missing: [
      ...(!tokenConfigured ? ['ECWID_API_TOKEN'] : []),
      ...(!webhookSecretConfigured ? ['ECWID_WEBHOOK_SECRET'] : []),
    ],
    storeId: ecwidStoreId(),
    webhookUrl: `${origin}/api/webhooks/ecwid`,
  });
}
