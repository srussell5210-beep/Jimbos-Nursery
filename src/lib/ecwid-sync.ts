import crypto from 'crypto';
import { ecwidFetch, isEcwidConfigured } from '@/lib/ecwid-connection';
import type { NurseryEvent, EventAddOn } from '@/lib/events-store';

import { parseEventPrice } from '@/lib/event-price';

export { parseEventPrice };

// ─── Product upsert ──────────────────────────────────────────────────────────

interface EcwidOptionChoice {
  text: string;
  priceModifier: number;
  priceModifierType: 'ABSOLUTE' | 'PERCENT';
}

interface EcwidProductOption {
  type: 'RADIO' | 'CHECKBOX' | 'SELECT';
  name: string;
  required?: boolean;
  choices?: EcwidOptionChoice[];
}

interface EcwidProductPayload {
  name: string;
  sku: string;
  price: number;
  enabled: boolean;
  unlimited: boolean;
  quantity?: number;
  options?: EcwidProductOption[];
  isShippingRequired: false;
}

async function upsertEcwidProduct(payload: EcwidProductPayload, existingId?: number | null): Promise<number> {
  if (existingId) {
    const res = await ecwidFetch(`/products/${existingId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (res.ok) return existingId;
    if (res.status !== 404) {
      throw new Error(`Ecwid PUT /products/${existingId} → ${res.status}: ${await res.text()}`);
    }
    // 404: the product was removed on Ecwid's side — fall through and recreate it.
  }

  const res = await ecwidFetch('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Ecwid POST /products → ${res.status}: ${await res.text()}`);
  }
  const created = await res.json() as { id: number };
  return created.id;
}

// ─── Event → Ecwid sync ──────────────────────────────────────────────────────
//
// Time slots become a required RADIO option on the ticket product (a
// per-ticket attribute). Add-ons become their own separate Ecwid products
// instead of priced options — Ecwid option price modifiers apply per unit of
// the line item, so a priced option on the ticket would incorrectly scale
// with guest count. Separate products also get their own native Ecwid stock
// tracking (from addOn.capacity), matching the per-add-on quantity limits
// this app already supports.

export async function syncEventToEcwid(event: NurseryEvent): Promise<NurseryEvent> {
  if (!isEcwidConfigured()) return event;

  const ticketPrice = parseEventPrice(event.price);
  if (ticketPrice === null) {
    // Free event — nothing to sync. An existing Ecwid product (if the event
    // used to be priced) is left alone; not deleted automatically.
    return event;
  }

  const hasCapacity = typeof event.capacity === 'number' && event.capacity > 0;
  const timeSlots = event.timeSlots ?? [];

  const ticketPayload: EcwidProductPayload = {
    name: event.title,
    sku: `event-${event.id}`,
    price: ticketPrice,
    enabled: true,
    unlimited: !hasCapacity,
    isShippingRequired: false,
    ...(hasCapacity ? { quantity: event.capacity as number } : {}),
    options: timeSlots.length > 0
      ? [{
          type: 'RADIO',
          name: 'Time Slot',
          required: true,
          choices: timeSlots.map((slot) => ({ text: slot.label, priceModifier: 0, priceModifierType: 'ABSOLUTE' as const })),
        }]
      : [],
  };

  const ecwidProductId = await upsertEcwidProduct(ticketPayload, event.ecwidProductId);

  const addOns: EventAddOn[] = [];
  for (const addOn of event.addOns ?? []) {
    const hasAddOnCapacity = typeof addOn.capacity === 'number' && addOn.capacity > 0;
    const addOnOptions = (addOn.options ?? []).filter((o) => o.label.trim());
    // A priced SELECT option is safe here (unlike on the ticket product):
    // an add-on line item's quantity is the add-on count, so an ABSOLUTE
    // modifier applies once per add-on unit, which is what we want.
    const addOnPayload: EcwidProductPayload = {
      name: `${event.title} — ${addOn.name}`,
      sku: `event-${event.id}-addon-${addOn.id}`,
      price: addOn.price ?? 0,
      enabled: true,
      unlimited: !hasAddOnCapacity,
      isShippingRequired: false,
      ...(hasAddOnCapacity ? { quantity: addOn.capacity as number } : {}),
      ...(addOnOptions.length > 0
        ? {
            options: [{
              type: 'SELECT' as const,
              name: addOn.optionLabel?.trim() || 'Option',
              required: true,
              choices: addOnOptions.map((option) => ({
                text: option.label.trim(),
                priceModifier: option.price ?? 0,
                priceModifierType: 'ABSOLUTE' as const,
              })),
            }],
          }
        : {}),
    };
    const addOnEcwidId = await upsertEcwidProduct(addOnPayload, addOn.ecwidProductId);
    addOns.push({ ...addOn, ecwidProductId: addOnEcwidId });
  }

  return {
    ...event,
    ecwidProductId,
    ...(event.addOns ? { addOns } : {}),
  };
}

// ─── Webhook signature verification ─────────────────────────────────────────
//
// Ecwid signs webhooks with HMAC-SHA256 of "{eventCreated}.{eventId}" using
// the app's client_secret — a DIFFERENT value from the API access token
// above, also found on https://my.ecwid.com/#develop-apps. Mirrors the
// pattern in src/app/api/webhooks/clover/route.ts.

export function verifyEcwidWebhookSignature(eventCreated: number, eventId: string, header: string | null): boolean {
  const secret = process.env.ECWID_WEBHOOK_SECRET;
  if (!secret) return true; // skip in local dev when secret not yet configured
  if (!header) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${eventCreated}.${eventId}`)
    .digest('base64');

  const expectedBuf = Buffer.from(expected);
  const headerBuf = Buffer.from(header);
  if (expectedBuf.length !== headerBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, headerBuf);
}

// ─── Order fetch ──────────────────────────────────────────────────────────��─

export interface EcwidSelectedOption {
  name: string;
  value: string;
  priceModifier?: number;
}

export interface EcwidOrderItem {
  productId: number;
  quantity: number;
  selectedOptions?: EcwidSelectedOption[];
}

export interface EcwidOrder {
  id: string | number;
  email?: string;
  paymentStatus?: string;
  billingPerson?: { name?: string };
  items?: EcwidOrderItem[];
}

export async function fetchEcwidOrder(orderId: string | number): Promise<EcwidOrder> {
  const res = await ecwidFetch(`/orders/${orderId}`);
  if (!res.ok) {
    throw new Error(`Ecwid GET /orders/${orderId} → ${res.status}: ${await res.text()}`);
  }
  return res.json();
}
