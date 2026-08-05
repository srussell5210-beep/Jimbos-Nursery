import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  DollarSign,
  PackageCheck,
  Truck,
} from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { CrmShell } from "@/components/crm/CrmShell";
import CrmActionButton from "@/components/crm/CrmActionButton";
import { getCrmOrdersData } from "@/lib/crm-commerce";
import { NewOrderModal } from "@/components/crm/modals/NewOrderModal";
import { AddLineItemModal } from "@/components/crm/modals/AddLineItemModal";
import { deleteLineItem } from "@/actions/commerce";

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateLabel = (date?: Date | null) =>
  date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";

function Metric({
  label,
  value,
  note,
  icon: Icon,
  tone = "sage",
}: {
  label: string;
  value: string | number;
  note: string;
  icon: typeof ClipboardList;
  tone?: "sage" | "terracotta" | "ochre" | "midnight";
}) {
  const tones = {
    sage: "bg-nursery-sage/15 text-nursery-midnight",
    terracotta: "bg-nursery-terracotta/10 text-nursery-terracotta",
    ochre: "bg-nursery-ochre/15 text-nursery-midnight",
    midnight: "bg-nursery-midnight text-nursery-ivory",
  };

  return (
    <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-nursery-midnight/50">{label}</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-nursery-midnight">{value}</p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-nursery-midnight/60">{note}</p>
    </section>
  );
}

function StatusPill({ children, tone = "sage" }: { children: ReactNode; tone?: "sage" | "terracotta" | "ochre" | "midnight" }) {
  const tones = {
    sage: "bg-nursery-sage/15 text-nursery-midnight",
    terracotta: "bg-nursery-terracotta/10 text-nursery-terracotta",
    ochre: "bg-nursery-ochre/15 text-nursery-midnight",
    midnight: "bg-nursery-midnight text-nursery-ivory",
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

function fulfillmentTone(status: string): "sage" | "terracotta" | "ochre" | "midnight" {
  if (status === "Complete") return "sage";
  if (status === "Not Started") return "terracotta";
  if (status === "In Progress") return "ochre";
  return "midnight";
}

function BreakdownChart({
  title,
  rows,
  icon: Icon,
}: {
  title: string;
  rows: { label: string; count: number; value: number }[];
  icon: typeof BarChart3;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-nursery-midnight">{title}</h2>
        <Icon className="h-4 w-4 text-nursery-sage" />
      </div>
      <div className="mt-5 space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-nursery-midnight/60">No data yet.</p>
        ) : (
          rows.map((row) => (
            <div key={row.label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-nursery-midnight/75">{row.label}</span>
                <span className="font-semibold tabular-nums text-nursery-midnight">
                  {row.count} · {currency.format(row.value)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-nursery-sage/15">
                <div
                  className="h-full rounded-full bg-nursery-terracotta"
                  style={{ width: `${Math.max((row.value / max) * 100, 8)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { id?: string; modal?: string };
}) {
  const data = await getCrmOrdersData(searchParams.id);
  const selected = data.selectedOrder;

  return (
    <CrmShell active="Orders" eyebrow="Order Fulfillment" title="Orders">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Open Orders" value={data.metrics.openOrders} note="Orders not yet closed or cancelled." icon={ClipboardList} tone="sage" />
        <Metric label="Open Value" value={currency.format(data.metrics.openOrderValue)} note="Total value of open order records." icon={DollarSign} tone="midnight" />
        <Metric label="Pending Fulfillment" value={data.metrics.pendingFulfillment} note="Orders not started or in progress." icon={PackageCheck} tone="terracotta" />
        <Metric label="Closed Revenue" value={currency.format(data.metrics.totalRevenue)} note="Revenue from all closed orders." icon={CheckCircle2} tone="ochre" />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_0.75fr]">
        <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-nursery-sage/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-nursery-midnight">Order Board</h2>
              <p className="mt-1 text-sm text-nursery-midnight/55">All orders sorted by last update.</p>
            </div>
            <CrmActionButton icon="ClipboardList" label="New Order" href="?modal=new-order" />
          </div>
          <div className="divide-y divide-nursery-sage/10">
            {data.orders.length === 0 ? (
              <p className="px-5 py-8 text-sm text-nursery-midnight/60">No orders on record yet.</p>
            ) : (
              data.orders.map((order) => (
                <article key={order.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill>{order.status}</StatusPill>
                      <StatusPill tone={fulfillmentTone(order.fulfillmentStatus)}>
                        {order.fulfillmentStatus}
                      </StatusPill>
                      {order.quote ? (
                        <span className="rounded-full bg-[#f7f3ea] px-3 py-1 text-xs font-bold text-nursery-midnight/65">
                          From {order.quote.quoteNumber}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-3 font-serif text-2xl font-semibold text-nursery-midnight">
                      {order.orderNumber} · {order.customer.displayName}
                    </h3>
                    <div className="mt-4 grid gap-3 text-sm text-nursery-midnight/65 sm:grid-cols-3">
                      <span className="inline-flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-nursery-sage" />
                        {order.lineItems.length} line items
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Truck className="h-4 w-4 text-nursery-sage" />
                        {order.deliveries.length} deliveries
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-nursery-sage" />
                        Updated {dateLabel(order.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-lg bg-[#f7f3ea] p-4 lg:w-44 lg:flex-col lg:items-start">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-nursery-midnight/50">Total</p>
                      <p className="mt-2 text-2xl font-semibold tabular-nums text-nursery-midnight">
                        {currency.format(order.total)}
                      </p>
                    </div>
                    <Link
                      href={`/crm/orders?id=${order.id}`}
                      className="inline-flex items-center gap-1 text-sm font-bold text-nursery-terracotta"
                    >
                      Open
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <div className="space-y-4">
          <BreakdownChart title="Orders by Fulfillment" rows={data.fulfillmentBreakdown} icon={PackageCheck} />
          <BreakdownChart title="Orders by Status" rows={data.statusBreakdown} icon={BarChart3} />
        </div>
      </section>

      {selected ? (
        <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_0.8fr]">
          <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-nursery-sage/15 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-nursery-midnight">Selected Order Detail</h2>
                <p className="mt-1 text-sm text-nursery-midnight/55">
                  {selected.orderNumber} · {selected.customer.displayName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill tone={fulfillmentTone(selected.fulfillmentStatus)}>
                  {selected.fulfillmentStatus}
                </StatusPill>
                <Link
                  href={`?id=${selected.id}&modal=add-line-item`}
                  className="rounded-lg bg-nursery-midnight px-3 py-1.5 text-xs font-bold text-nursery-ivory transition hover:bg-nursery-terracotta"
                >
                  + Add Line
                </Link>
              </div>
            </div>
            <div className="divide-y divide-nursery-sage/10">
              {selected.lineItems.length === 0 ? (
                <p className="px-5 py-6 text-center text-sm text-nursery-midnight/45">No line items yet. Click + Add Line to start building this order.</p>
              ) : (
                selected.lineItems.map((line) => (
                  <div key={line.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <p className="font-semibold text-nursery-midnight">{line.description}</p>
                      <p className="mt-1 text-sm text-nursery-midnight/60">
                        {line.category} · Qty {line.quantity} · Unit {currency.format(line.unitPrice)}
                        {line.discountAmount > 0 ? ` · -${currency.format(line.discountAmount)}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold tabular-nums text-nursery-midnight">{currency.format(line.total)}</p>
                      <form action={deleteLineItem}>
                        <input type="hidden" name="lineItemId" value={line.id} />
                        <input type="hidden" name="parentType" value="order" />
                        <input type="hidden" name="parentId" value={selected.id} />
                        <button type="submit" className="text-xs text-nursery-midnight/30 transition hover:text-nursery-terracotta">✕</button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="grid gap-3 border-t border-nursery-sage/15 p-5 text-sm sm:grid-cols-3">
              <div>
                <p className="text-nursery-midnight/55">Subtotal</p>
                <p className="mt-1 font-semibold tabular-nums">{currency.format(selected.subtotal)}</p>
              </div>
              <div>
                <p className="text-nursery-midnight/55">Tax</p>
                <p className="mt-1 font-semibold tabular-nums">{currency.format(selected.taxTotal)}</p>
              </div>
              <div>
                <p className="text-nursery-midnight/55">Total</p>
                <p className="mt-1 font-semibold tabular-nums">{currency.format(selected.total)}</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-nursery-sage" />
                <h2 className="text-base font-bold text-nursery-midnight">Linked Records</h2>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-nursery-sage/10 p-4">
                  <p className="text-nursery-midnight/55">Deliveries</p>
                  <p className="mt-2 text-2xl font-semibold">{selected.deliveries.length}</p>
                </div>
                <div className="rounded-lg bg-nursery-ochre/10 p-4">
                  <p className="text-nursery-midnight/55">Service Jobs</p>
                  <p className="mt-2 text-2xl font-semibold">{selected.serviceJobs.length}</p>
                </div>
                <div className="rounded-lg bg-nursery-terracotta/10 p-4">
                  <p className="text-nursery-midnight/55">Invoices</p>
                  <p className="mt-2 text-2xl font-semibold">{selected.invoices.length}</p>
                </div>
                <div className="rounded-lg bg-[#f7f3ea] p-4">
                  <p className="text-nursery-midnight/55">Quote ref</p>
                  <p className="mt-2 font-semibold truncate">{selected.quote?.quoteNumber ?? "Direct"}</p>
                </div>
              </div>
            </section>
          </section>
        </section>
      ) : null}
      {searchParams.modal === 'new-order' && <NewOrderModal closeHref="/crm/orders" />}
      {searchParams.modal === 'add-line-item' && searchParams.id && (
        <AddLineItemModal parentId={searchParams.id} parentType="order" closeHref={`/crm/orders?id=${searchParams.id}`} />
      )}
    </CrmShell>
  );
}
