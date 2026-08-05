import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { syncCloverOrder } from '@/lib/clover-sync';

// ─── Signature verification ───────────────────────────────────────────────────
//
// Clover signs webhook payloads with HMAC-SHA256 using your app's client secret.
// The signature arrives in the X-Clover-Auth header as a base64 string.
// If CLOVER_WEBHOOK_SECRET is not set, verification is skipped (dev only).

function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.CLOVER_WEBHOOK_SECRET;
  if (!secret) return true; // skip in local dev when secret not yet configured

  if (!header) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(header),
  );
}

// ─── Webhook event shape ──────────────────────────────────────────────────────

interface CloverEvent {
  merchantId?: string;
  appId?:      string;
  type?:       string;  // "CREATE" | "UPDATE" | "DELETE"
  objectId?:   string;
  object?: {
    objectType?: string; // "ORDER" | "PAYMENT" | "CUSTOMER" | ...
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!verifySignature(rawBody, req.headers.get('x-clover-auth'))) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let events: CloverEvent[];
  try {
    const parsed = JSON.parse(rawBody);
    // Clover may send a single object or an array
    events = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const results: { objectId: string; status: string; error?: string }[] = [];

  for (const event of events) {
    const objectType = event.object?.objectType ?? '';
    const type       = event.type ?? '';
    const objectId   = event.objectId;
    const merchantId = event.merchantId ?? process.env.CLOVER_MERCHANT_ID;

    // Only sync on ORDER create/update — payments are included on the order
    if (objectType !== 'ORDER' || !['CREATE', 'UPDATE'].includes(type) || !objectId || !merchantId) {
      results.push({ objectId: objectId ?? 'unknown', status: 'skipped' });
      continue;
    }

    try {
      await syncCloverOrder(merchantId, objectId);
      results.push({ objectId, status: 'synced' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[clover-webhook] Failed to sync order ${objectId}:`, message);
      results.push({ objectId, status: 'error', error: message });
    }
  }

  return NextResponse.json({ received: true, results });
}

// Clover requires the endpoint to return 200 quickly; POST above handles that.
// GET is used by Clover to verify the endpoint is reachable.
export async function GET() {
  return NextResponse.json({ ok: true });
}
