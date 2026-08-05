import { NextRequest, NextResponse } from 'next/server';
import { readEvents } from '@/lib/events-store';
import { readReservations, writeReservations, type EventReservation, type ReservedAddOn } from '@/lib/event-reservations-store';
import { verifyEcwidWebhookSignature, fetchEcwidOrder } from '@/lib/ecwid-sync';

// ─── Webhook payload shape ────────────────────────────────────────────────────
//
// Ecwid webhooks are signature-verified (see verifyEcwidWebhookSignature) but
// we still re-fetch the full order by ID rather than trusting the inline
// "data" summary — same pattern as src/app/api/webhooks/clover/route.ts.

interface EcwidWebhookPayload {
  eventId: string;
  eventCreated: number;
  storeId?: number;
  entityId?: number | string;
  eventType: string;
  data?: { orderId?: string | number };
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  let payload: EcwidWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const signatureHeader = req.headers.get('x-ecwid-webhook-signature');
  if (!verifyEcwidWebhookSignature(payload.eventCreated, payload.eventId, signatureHeader)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  if (payload.eventType !== 'order.created' && payload.eventType !== 'order.updated') {
    return NextResponse.json({ received: true, status: 'skipped' });
  }

  const orderId = payload.data?.orderId ?? payload.entityId;
  if (!orderId) {
    return NextResponse.json({ received: true, status: 'skipped' });
  }

  try {
    const order = await fetchEcwidOrder(orderId);
    if (order.paymentStatus !== 'PAID') {
      return NextResponse.json({ received: true, status: 'not-paid' });
    }

    const orderIdStr = String(order.id);
    const reservations = await readReservations();
    if (reservations.some((r) => r.ecwidOrderId === orderIdStr)) {
      return NextResponse.json({ received: true, status: 'already-recorded' });
    }

    const events = await readEvents();
    const items = order.items ?? [];
    const created: EventReservation[] = [];

    for (const item of items) {
      const event = events.find((e) => e.ecwidProductId === item.productId);
      if (!event) continue; // not one of our event tickets — e.g. a regular shop item

      const timeSlotOption = item.selectedOptions?.find((o) => o.name === 'Time Slot');
      const matchedSlot = timeSlotOption
        ? (event.timeSlots ?? []).find((s) => s.label === timeSlotOption.value)
        : undefined;

      const addOns: ReservedAddOn[] = [];
      for (const addOn of event.addOns ?? []) {
        const addOnItem = items.find((i) => i.productId === addOn.ecwidProductId);
        if (addOnItem) {
          addOns.push({ id: addOn.id, name: addOn.name, quantity: addOnItem.quantity });
        }
      }

      created.push({
        id: `ecwid-${orderIdStr}-${event.id}`,
        eventId: event.id,
        eventTitle: event.title,
        name: order.billingPerson?.name ?? 'Ecwid Customer',
        email: order.email ?? '',
        guests: item.quantity,
        timeSlotId: matchedSlot?.id ?? null,
        timeSlotLabel: matchedSlot?.label ?? null,
        addOns,
        createdAt: new Date().toISOString(),
        paid: true,
        ecwidOrderId: orderIdStr,
      });
    }

    if (created.length > 0) {
      reservations.push(...created);
      await writeReservations(reservations);
    }

    return NextResponse.json({ received: true, status: 'synced', count: created.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[ecwid-webhook] Failed to process order:', message);
    // Still 200 — Ecwid expects a quick 200 OK and will otherwise keep retrying.
    return NextResponse.json({ received: true, status: 'error', error: message });
  }
}

// Used by Ecwid (and for manual checks) to verify the endpoint is reachable.
export async function GET() {
  return NextResponse.json({ ok: true });
}
