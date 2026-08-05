import { NextRequest, NextResponse } from 'next/server';
import {
  cloverFetch,
  getActiveCloverConnection,
  getCloverChargeUrl,
  type CloverConnection,
} from '@/lib/clover-connection';

async function cloverRest(connection: CloverConnection, path: string, body: object) {
  const res = await cloverFetch(connection, path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Clover ${path} → ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

export async function POST(req: NextRequest) {
  const connection = await getActiveCloverConnection();
  if (!connection) {
    return NextResponse.json(
      { error: 'Clover is not connected. Ask the owner to connect Clover in Admin.' },
      { status: 503 },
    );
  }

  let body: {
    amount?: number;
    recipientName?: string;
    recipientEmail?: string;
    senderName?: string;
    message?: string;
    paymentToken?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { amount, recipientName, recipientEmail, senderName, message, paymentToken } = body;

  if (!amount || !recipientName || !recipientEmail || !senderName || !paymentToken) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }
  if (amount < 5 || amount > 500) {
    return NextResponse.json({ error: 'Amount must be between $5 and $500.' }, { status: 400 });
  }

  const amountCents = Math.round(amount * 100);

  try {
    // 1 — Create a Clover order
    const order = await cloverRest(connection, `/v3/merchants/${connection.merchantId}/orders`, {
      currency: 'USD',
      state: 'open',
      note: `Gift Card — ${recipientName} from ${senderName}`,
    });

    // 2 — Add gift card as a line item on the order
    await cloverRest(connection, `/v3/merchants/${connection.merchantId}/orders/${order.id}/line_items`, {
      price: amountCents,
      name: `Jimbo's Nursery Gift Card — $${amount.toFixed(2)}`,
      note: message || undefined,
    });

    // 3 — Charge the card via Clover Simple Commerce
    const chargeRes = await fetch(getCloverChargeUrl(connection.environment, '/v1/charges'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ecomind: 'ecom',
        amount: amountCents,
        currency: 'usd',
        source: paymentToken,
        description: `Jimbo's Nursery Gift Card — $${amount.toFixed(2)}`,
        order: { id: order.id },
      }),
    });

    const charge = await chargeRes.json().catch(() => ({}));
    if (!chargeRes.ok || charge.status !== 'succeeded') {
      return NextResponse.json(
        { error: charge?.message || charge?.error?.message || 'Payment declined.' },
        { status: 402 },
      );
    }

    // 4 — Issue the gift card via Clover Gift Card API
    let giftCardNumber = 'PENDING';
    try {
      const giftCard = await cloverRest(connection, `/v3/merchants/${connection.merchantId}/gift_cards`, {
        amount: amountCents,
      });
      giftCardNumber = giftCard.cardNumber ?? giftCard.id ?? 'PENDING';
    } catch (gcErr) {
      // Payment succeeded but gift card issuance failed.
      // Log and surface so staff can manually issue from Clover dashboard.
      console.error('[gift-cards] Gift card issuance failed after successful charge:', gcErr);
      giftCardNumber = 'SEE_CLOVER_DASHBOARD';
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      chargeId: charge.id,
      giftCardNumber,
      amount,
      recipientName,
      recipientEmail,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error.';
    console.error('[gift-cards/order]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
