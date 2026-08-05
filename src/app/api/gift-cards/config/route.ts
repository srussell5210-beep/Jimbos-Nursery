import { NextResponse } from 'next/server';
import { getActiveCloverConnection } from '@/lib/clover-connection';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const connection = await getActiveCloverConnection();
    if (!connection?.apiAccessKey) {
      return NextResponse.json({ checkoutReady: false });
    }
    return NextResponse.json({
      checkoutReady: true,
      apiAccessKey: connection.apiAccessKey,
      environment: connection.environment,
    });
  } catch (err) {
    console.error('[gift-cards/config]', err);
    return NextResponse.json({ checkoutReady: false }, { status: 503 });
  }
}
