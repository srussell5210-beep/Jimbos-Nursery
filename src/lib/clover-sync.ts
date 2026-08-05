import { prisma } from '@/lib/prisma';
import { cloverFetch, getActiveCloverConnection } from '@/lib/clover-connection';

// ─── Clover REST helpers ───────────────────────────────────────────────────────

async function cloverGet(path: string) {
  const connection = await getActiveCloverConnection();
  if (!connection) {
    throw new Error('Clover is not connected.');
  }
  const res = await cloverFetch(connection, path);
  if (!res.ok) {
    throw new Error(`Clover GET ${path} → ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

// ─── Clover → CRM type maps ───────────────────────��─────────────────────���──────

const ORDER_STATE_MAP: Record<string, string> = {
  OPEN:      'Open',
  LOCKED:    'Open',
  PAID:      'Closed',
  VOID:      'Cancelled',
  REFUNDED:  'Cancelled',
};

const TENDER_MAP: Record<string, string> = {
  'com.clover.tender.credit_card': 'Credit Card',
  'com.clover.tender.debit_card':  'Debit Card',
  'com.clover.tender.cash':        'Cash',
  'com.clover.tender.gift_card':   'Gift Card',
  'com.clover.tender.check':       'Check',
};

function cents(n: number): number {
  return n / 100;
}

// Clover stores unit quantities as qty × 1000
function cloverQty(n: number): number {
  return n > 0 ? n / 1000 : 1;
}

function tenderLabel(labelKey?: string): string {
  if (!labelKey) return 'In-Store';
  return TENDER_MAP[labelKey] ?? labelKey.split('.').pop() ?? 'In-Store';
}

// ─── Clover order fetch ──────────────────────────────────���─────────────────────

export interface CloverLineItem {
  id: string;
  name?: string;
  price?: number;           // cents
  unitQty?: number;         // milli-units
  note?: string;
  discountAmount?: number;  // cents
  taxRates?: { elements?: { rate?: number }[] };
}

export interface CloverPayment {
  id: string;
  amount?: number;    // cents
  result?: string;
  tender?: { labelKey?: string; label?: string };
  createdTime?: number; // ms epoch
}

export interface CloverCustomer {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumbers?: { elements?: { phoneNumber?: string }[] };
}

export interface CloverOrder {
  id: string;
  title?: string;
  currency?: string;
  total?: number;        // cents
  taxAmount?: number;    // cents
  discountAmount?: number; // cents
  state?: string;
  note?: string;
  lineItems?: { elements?: CloverLineItem[] };
  payments?: { elements?: CloverPayment[] };
  customers?: { elements?: CloverCustomer[] };
  clientCreatedTime?: number; // ms epoch
}

export async function fetchCloverOrder(merchantId: string, orderId: string): Promise<CloverOrder> {
  return cloverGet(
    `/v3/merchants/${merchantId}/orders/${orderId}` +
    `?expand=lineItems,customers,payments`,
  );
}

// ─── Customer upsert ───────────────────────────────────────────────────────────

async function upsertCustomer(cloverCustomer: CloverCustomer | undefined): Promise<string> {
  const firstName  = cloverCustomer?.firstName?.trim() ?? '';
  const lastName   = cloverCustomer?.lastName?.trim() ?? '';
  const email      = cloverCustomer?.email?.trim().toLowerCase() ?? null;
  const phone      = cloverCustomer?.phoneNumbers?.elements?.[0]?.phoneNumber?.trim() ?? null;
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'Walk-in Customer';

  // Try to match an existing customer by email, then phone
  let existing = null;
  if (email) {
    existing = await prisma.customer.findFirst({ where: { email } });
  }
  if (!existing && phone) {
    existing = await prisma.customer.findFirst({ where: { phone } });
  }

  if (existing) {
    // Update any newly available fields
    await prisma.customer.update({
      where: { id: existing.id },
      data: {
        ...(email && !existing.email   ? { email }   : {}),
        ...(phone && !existing.phone   ? { phone }   : {}),
      },
    });
    return existing.id;
  }

  const created = await prisma.customer.create({
    data: {
      displayName,
      type:   'Retail',
      status: 'Active',
      email:  email ?? undefined,
      phone:  phone ?? undefined,
    },
  });
  return created.id;
}

// ─── SalesOrder upsert ─────────────────────────────────────────────────────────

async function upsertSalesOrder(
  order: CloverOrder,
  customerId: string,
): Promise<string> {
  const orderNumber      = `CLV-${order.id}`;
  const subtotalCents    = (order.total ?? 0) - (order.taxAmount ?? 0);
  const subtotal         = cents(subtotalCents);
  const taxTotal         = cents(order.taxAmount ?? 0);
  const discountTotal    = cents(order.discountAmount ?? 0);
  const total            = cents(order.total ?? 0);
  const status           = ORDER_STATE_MAP[order.state ?? ''] ?? 'Open';
  const fulfillmentStatus = status === 'Closed' ? 'Fulfilled' : 'Not Started';

  const existing = await prisma.salesOrder.findUnique({ where: { orderNumber } });

  if (existing) {
    await prisma.salesOrder.update({
      where: { orderNumber },
      data: { status, fulfillmentStatus, subtotal, taxTotal, discountTotal, total },
    });
    return existing.id;
  }

  const created = await prisma.salesOrder.create({
    data: {
      orderNumber,
      customerId,
      status,
      fulfillmentStatus,
      subtotal,
      taxTotal,
      discountTotal,
      total,
    },
  });
  return created.id;
}

// ─── LineItems upsert ──────────────────────────────────────────────────────────

async function upsertLineItems(
  cloverItems: CloverLineItem[],
  orderId: string,
): Promise<void> {
  // Delete old line items for this order then re-insert (simpler than per-item upsert)
  await prisma.lineItem.deleteMany({ where: { orderId } });

  if (!cloverItems.length) return;

  await prisma.lineItem.createMany({
    data: cloverItems.map((item) => {
      const qty      = cloverQty(item.unitQty ?? 1000);
      const unitPrice = cents(item.price ?? 0);
      const discount  = cents(item.discountAmount ?? 0);
      const taxRate   = (item.taxRates?.elements?.[0]?.rate ?? 0) / 1e7; // Clover stores rate × 1e7
      const total     = qty * unitPrice - discount;
      return {
        orderId,
        category:       'In-Store Purchase',
        description:    item.name ?? 'Item',
        quantity:       qty,
        unitPrice,
        discountAmount: discount,
        taxRate,
        total,
      };
    }),
  });
}

// ─── Invoice upsert ───────────────────────────────────────────���────────────────

async function upsertInvoice(
  order: CloverOrder,
  customerId: string,
  salesOrderId: string,
): Promise<string> {
  const invoiceNumber = `CLV-INV-${order.id}`;
  const subtotal      = cents((order.total ?? 0) - (order.taxAmount ?? 0));
  const taxTotal      = cents(order.taxAmount ?? 0);
  const discountTotal = cents(order.discountAmount ?? 0);
  const total         = cents(order.total ?? 0);
  const isPaid        = ['PAID'].includes(order.state ?? '');
  const status        = isPaid ? 'Paid' : 'Unpaid';
  const balanceDue    = isPaid ? 0 : total;

  const existing = await prisma.invoice.findUnique({ where: { invoiceNumber } });

  if (existing) {
    await prisma.invoice.update({
      where: { invoiceNumber },
      data: { status, subtotal, taxTotal, discountTotal, total, balanceDue },
    });
    return existing.id;
  }

  const created = await prisma.invoice.create({
    data: {
      invoiceNumber,
      customerId,
      orderId: salesOrderId,
      status,
      subtotal,
      taxTotal,
      discountTotal,
      depositTotal: 0,
      total,
      balanceDue,
    },
  });
  return created.id;
}

// ─── Payments upsert ──────────────────────────────��───────────────────────────���

async function upsertPayments(
  cloverPayments: CloverPayment[],
  customerId: string,
  invoiceId: string,
): Promise<void> {
  const successful = cloverPayments.filter((p) => p.result === 'SUCCESS');

  for (const p of successful) {
    const existing = await prisma.payment.findFirst({
      where: { reference: p.id },
    });
    if (existing) continue; // already synced

    await prisma.payment.create({
      data: {
        customerId,
        invoiceId,
        method:    tenderLabel(p.tender?.labelKey),
        status:    'Completed',
        amount:    cents(p.amount ?? 0),
        paidAt:    p.createdTime ? new Date(p.createdTime) : new Date(),
        reference: p.id,
        notes:     'Synced from Clover in-store POS',
      },
    });
  }
}

// ─── Activity log ──────────────────────────────────────────────────────────────

async function logActivity(
  customerId: string,
  order: CloverOrder,
  orderId: string,
): Promise<void> {
  await prisma.activity.create({
    data: {
      customerId,
      type:       'Sale',
      title:      `In-store purchase synced from Clover — $${cents(order.total ?? 0).toFixed(2)}`,
      details:    `Clover Order ID: ${order.id} · Order #CLV-${order.id}`,
      occurredAt: order.clientCreatedTime ? new Date(order.clientCreatedTime) : new Date(),
    },
  });
}

// ─── Main entry point ────────────────────────────────────────────────────────��─

export async function syncCloverOrder(
  merchantId: string,
  orderId: string,
): Promise<{ customerId: string; salesOrderId: string; invoiceId: string }> {
  const order = await fetchCloverOrder(merchantId, orderId);

  const cloverCustomer   = order.customers?.elements?.[0];
  const cloverLineItems  = order.lineItems?.elements ?? [];
  const cloverPayments   = order.payments?.elements ?? [];

  const customerId    = await upsertCustomer(cloverCustomer);
  const salesOrderId  = await upsertSalesOrder(order, customerId);
  await upsertLineItems(cloverLineItems, salesOrderId);
  const invoiceId     = await upsertInvoice(order, customerId, salesOrderId);
  await upsertPayments(cloverPayments, customerId, invoiceId);
  await logActivity(customerId, order, salesOrderId);

  return { customerId, salesOrderId, invoiceId };
}
