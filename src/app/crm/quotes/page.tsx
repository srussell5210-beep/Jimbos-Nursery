import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  DollarSign,
  FileText,
  PackageCheck,
  ReceiptText,
  Send,
} from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { CrmShell } from "@/components/crm/CrmShell";
import CrmActionButton from "@/components/crm/CrmActionButton";
import { getCrmCommerceData } from "@/lib/crm-commerce";
import { NewQuoteModal } from "@/components/crm/modals/NewQuoteModal";
import { AddLineItemModal } from "@/components/crm/modals/AddLineItemModal";
import { deleteLineItem } from "@/actions/commerce";

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateLabel = (date?: Date | null) =>
  date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No date";

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
  icon: typeof FileText;
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

function ValueChart({ title, rows }: { title: string; rows: { label: string; count: number; value: number }[] }) {
  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-nursery-midnight">{title}</h2>
        <ReceiptText className="h-4 w-4 text-nursery-sage" />
      </div>
      <div className="mt-5 space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-nursery-midnight/75">{row.label}</span>
              <span className="font-semibold tabular-nums text-nursery-midnight">{row.count} · {currency.format(row.value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-nursery-sage/15">
              <div className="h-full rounded-full bg-nursery-terracotta" style={{ width: `${Math.max((row.value / max) * 100, 8)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: { id?: string; modal?: string };
}) {
  const data = await getCrmCommerceData(searchParams.id);
  const selected = data.selectedQuote;

  return (
    <CrmShell active="Quotes" eyebrow="Quote to Cash" title="Quotes">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric label="Active Quotes" value={data.metrics.activeQuotes} note="Draft, sent, and review-stage quotes." icon={FileText} tone="sage" />
        <Metric label="Quote Value" value={currency.format(data.metrics.quoteValue)} note="Total value of active quotes." icon={DollarSign} tone="midnight" />
        <Metric label="Open Orders" value={data.metrics.openOrders} note="Orders not closed or cancelled." icon={ClipboardList} tone="ochre" />
        <Metric label="Balance Due" value={currency.format(data.metrics.balanceDue)} note="Unpaid or partially paid invoices." icon={Banknote} tone="terracotta" />
        <Metric label="Deposits Needed" value={currency.format(data.metrics.depositsRequired)} note="Deposits required before fulfillment." icon={CreditCard} tone="sage" />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-nursery-sage/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-nursery-midnight">Quote Pipeline</h2>
              <p className="mt-1 text-sm text-nursery-midnight/55">Quote records with deposits, totals, and next conversion action.</p>
            </div>
            <CrmActionButton icon="FileText" label="New Quote" href="?modal=new-quote" />
          </div>
          <div className="divide-y divide-nursery-sage/10">
            {data.quotes.map((quote) => (
              <article key={quote.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_auto] lg:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill>{quote.stage}</StatusPill>
                    <StatusPill tone={quote.depositRequired > 0 ? "terracotta" : "sage"}>
                      {quote.depositRequired > 0 ? `${currency.format(quote.depositRequired)} deposit` : "No deposit"}
                    </StatusPill>
                    {quote.customer.taxExempt ? <StatusPill tone="ochre">Tax exempt</StatusPill> : null}
                  </div>
                  <h3 className="mt-3 font-serif text-2xl font-semibold text-nursery-midnight">{quote.quoteNumber} · {quote.customer.displayName}</h3>
                  <p className="mt-2 text-sm leading-6 text-nursery-midnight/65">
                    {quote.lead?.title ?? "Direct quote"} · {quote.notes ?? "No notes recorded."}
                  </p>
                  <div className="mt-4 grid gap-3 text-sm text-nursery-midnight/65 sm:grid-cols-3">
                    <span className="inline-flex items-center gap-2">
                      <Send className="h-4 w-4 text-nursery-sage" />
                      {quote.stage}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <PackageCheck className="h-4 w-4 text-nursery-sage" />
                      {quote.lineItems.length} line items
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-nursery-sage" />
                      Updated {dateLabel(quote.updatedAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg bg-[#f7f3ea] p-4 lg:w-44 lg:flex-col lg:items-start">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-nursery-midnight/50">Total</p>
                    <p className="mt-2 text-2xl font-semibold tabular-nums text-nursery-midnight">{currency.format(quote.total)}</p>
                  </div>
                  <Link
                    href={`/crm/quotes?id=${quote.id}`}
                    className="inline-flex items-center gap-1 text-sm font-bold text-nursery-terracotta"
                  >
                    View
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-4">
          <ValueChart title="Quotes by Stage" rows={data.quoteStages} />
          <ValueChart title="Invoice Balances" rows={data.invoiceStatuses} />
        </div>
      </section>

      {selected ? (
        <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_0.8fr]">
          <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-nursery-sage/15 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-nursery-midnight">Selected Quote Detail</h2>
                <p className="mt-1 text-sm text-nursery-midnight/55">{selected.quoteNumber} · {selected.customer.displayName}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill tone="ochre">{selected.stage}</StatusPill>
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
                <p className="px-5 py-6 text-center text-sm text-nursery-midnight/45">No line items yet. Click + Add Line to start building this quote.</p>
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
                        <input type="hidden" name="parentType" value="quote" />
                        <input type="hidden" name="parentId" value={selected.id} />
                        <button type="submit" className="text-xs text-nursery-midnight/30 transition hover:text-nursery-terracotta">✕</button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="grid gap-3 border-t border-nursery-sage/15 p-5 text-sm sm:grid-cols-4">
              <div>
                <p className="text-nursery-midnight/55">Subtotal</p>
                <p className="mt-1 font-semibold tabular-nums">{currency.format(selected.subtotal)}</p>
              </div>
              <div>
                <p className="text-nursery-midnight/55">Discount</p>
                <p className="mt-1 font-semibold tabular-nums">{currency.format(selected.discountTotal)}</p>
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

          <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-nursery-sage" />
              <h2 className="text-base font-bold text-nursery-midnight">Workflow Scope</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-nursery-midnight/65">
              This slice supports quote totals, line items, discounts, taxes, deposits, quote stages, order conversion state, invoice balances, and payment tracking.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-nursery-sage/10 p-4">
                <p className="text-nursery-midnight/55">Order link</p>
                <p className="mt-2 font-semibold">{selected.order ? selected.order.orderNumber : "Not converted"}</p>
              </div>
              <div className="rounded-lg bg-nursery-terracotta/10 p-4">
                <p className="text-nursery-midnight/55">Required deposit</p>
                <p className="mt-2 font-semibold tabular-nums">{currency.format(selected.depositRequired)}</p>
              </div>
            </div>
          </section>
        </section>
      ) : null}

      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm xl:col-span-1">
          <div className="border-b border-nursery-sage/15 px-5 py-4">
            <h2 className="text-base font-bold text-nursery-midnight">Open Orders</h2>
          </div>
          <div className="divide-y divide-nursery-sage/10">
            {data.orders.map((order) => (
              <div key={order.id} className="px-5 py-4">
                <p className="font-semibold text-nursery-midnight">{order.orderNumber} · {order.customer.displayName}</p>
                <p className="mt-1 text-sm text-nursery-midnight/60">{order.status} · {order.fulfillmentStatus}</p>
                <p className="mt-2 font-semibold tabular-nums">{currency.format(order.total)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
          <div className="border-b border-nursery-sage/15 px-5 py-4">
            <h2 className="text-base font-bold text-nursery-midnight">Unpaid Invoices</h2>
          </div>
          <div className="divide-y divide-nursery-sage/10">
            {data.invoices.map((invoice) => (
              <div key={invoice.id} className="px-5 py-4">
                <p className="font-semibold text-nursery-midnight">{invoice.invoiceNumber} · {invoice.customer.displayName}</p>
                <p className="mt-1 text-sm text-nursery-midnight/60">{invoice.status} · due {dateLabel(invoice.dueDate)}</p>
                <p className="mt-2 font-semibold tabular-nums">{currency.format(invoice.balanceDue)} due</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
          <div className="border-b border-nursery-sage/15 px-5 py-4">
            <h2 className="text-base font-bold text-nursery-midnight">Recent Payments</h2>
          </div>
          <div className="divide-y divide-nursery-sage/10">
            {data.payments.map((payment) => (
              <div key={payment.id} className="px-5 py-4">
                <p className="font-semibold text-nursery-midnight">{payment.method}</p>
                <p className="mt-1 text-sm text-nursery-midnight/60">{payment.customer.displayName} · {payment.status}</p>
                <p className="mt-2 font-semibold tabular-nums">{currency.format(payment.amount)}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
      {searchParams.modal === 'new-quote' && <NewQuoteModal closeHref="/crm/quotes" />}
      {searchParams.modal === 'add-line-item' && searchParams.id && (
        <AddLineItemModal parentId={searchParams.id} parentType="quote" closeHref={`/crm/quotes?id=${searchParams.id}`} />
      )}
    </CrmShell>
  );
}
