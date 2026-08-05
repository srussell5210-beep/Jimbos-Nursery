import {
  Banknote,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  DollarSign,
  ReceiptText,
  AlertCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { CrmShell } from "@/components/crm/CrmShell";
import CrmActionButton from "@/components/crm/CrmActionButton";
import { getCrmInvoicesData } from "@/lib/crm-commerce";
import { NewInvoiceModal } from "@/components/crm/modals/NewInvoiceModal";
import { AddLineItemModal } from "@/components/crm/modals/AddLineItemModal";
import { deleteLineItem } from "@/actions/commerce";

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateLabel = (date?: Date | null) =>
  date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No due date";

const timeLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

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
  icon: typeof ReceiptText;
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

function invoiceStatusTone(status: string): "sage" | "terracotta" | "ochre" | "midnight" {
  if (status === "Paid") return "sage";
  if (status === "Overdue") return "terracotta";
  if (status === "Partial") return "ochre";
  return "midnight";
}

function StatusChart({
  rows,
}: {
  rows: { label: string; count: number; total: number; balance: number }[];
}) {
  const max = Math.max(...rows.map((r) => r.balance), 1);

  return (
    <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-nursery-midnight">Balances by Status</h2>
        <BarChart3 className="h-4 w-4 text-nursery-sage" />
      </div>
      <div className="mt-5 space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-nursery-midnight/60">No invoice data yet.</p>
        ) : (
          rows.map((row) => (
            <div key={row.label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-nursery-midnight/75">{row.label}</span>
                <span className="font-semibold tabular-nums text-nursery-midnight">
                  {row.count} · {currency.format(row.balance)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-nursery-sage/15">
                <div
                  className="h-full rounded-full bg-nursery-terracotta"
                  style={{ width: `${Math.max((row.balance / max) * 100, 8)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: { id?: string; modal?: string };
}) {
  const data = await getCrmInvoicesData(searchParams.id);
  const selected = data.selectedInvoice;

  return (
    <CrmShell active="Invoices" eyebrow="Billing & Collections" title="Invoices">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric label="Total Invoices" value={data.metrics.totalInvoices} note="All invoice records on file." icon={ReceiptText} tone="sage" />
        <Metric label="Unpaid" value={data.metrics.unpaidCount} note="Invoices not yet marked paid." icon={Banknote} tone="terracotta" />
        <Metric label="Overdue" value={data.metrics.overdueCount} note="Past due date and not paid." icon={AlertCircle} tone="terracotta" />
        <Metric label="Balance Due" value={currency.format(data.metrics.balanceDue)} note="Total outstanding across unpaid invoices." icon={DollarSign} tone="midnight" />
        <Metric label="Collected This Month" value={currency.format(data.metrics.collectedThisMonth)} note="Payments received in the current month." icon={CheckCircle2} tone="ochre" />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_0.75fr]">
        <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-nursery-sage/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-nursery-midnight">Invoice Register</h2>
              <p className="mt-1 text-sm text-nursery-midnight/55">Sorted by due date, then balance owed.</p>
            </div>
            <CrmActionButton icon="ReceiptText" label="New Invoice" href="?modal=new-invoice" />
          </div>
          <div className="divide-y divide-nursery-sage/10">
            {data.invoices.length === 0 ? (
              <p className="px-5 py-8 text-sm text-nursery-midnight/60">No invoices on record yet.</p>
            ) : (
              data.invoices.map((invoice) => (
                <article key={invoice.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill tone={invoiceStatusTone(invoice.status)}>{invoice.status}</StatusPill>
                      {invoice.order ? (
                        <span className="rounded-full bg-[#f7f3ea] px-3 py-1 text-xs font-bold text-nursery-midnight/65">
                          {invoice.order.orderNumber}
                        </span>
                      ) : null}
                      {invoice.payments.length > 0 ? (
                        <StatusPill tone="sage">{invoice.payments.length} payment{invoice.payments.length > 1 ? "s" : ""}</StatusPill>
                      ) : null}
                    </div>
                    <h3 className="mt-3 font-serif text-2xl font-semibold text-nursery-midnight">
                      {invoice.invoiceNumber} · {invoice.customer.displayName}
                    </h3>
                    <div className="mt-4 grid gap-3 text-sm text-nursery-midnight/65 sm:grid-cols-3">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-nursery-sage" />
                        Due {dateLabel(invoice.dueDate)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-nursery-sage" />
                        Issued {dateLabel(invoice.issueDate)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-nursery-sage" />
                        Total {currency.format(invoice.total)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-lg bg-[#f7f3ea] p-4 lg:w-44 lg:flex-col lg:items-start">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-nursery-midnight/50">Balance Due</p>
                      <p className="mt-2 text-2xl font-semibold tabular-nums text-nursery-midnight">
                        {currency.format(invoice.balanceDue)}
                      </p>
                    </div>
                    <Link
                      href={`/crm/invoices?id=${invoice.id}`}
                      className="inline-flex items-center gap-1 text-sm font-bold text-nursery-terracotta"
                    >
                      View
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <div className="space-y-4">
          <StatusChart rows={data.statusBreakdown} />

          <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-nursery-sage/15 px-5 py-4">
              <h2 className="text-base font-bold text-nursery-midnight">Recent Payments</h2>
              <CreditCard className="h-4 w-4 text-nursery-sage" />
            </div>
            <div className="divide-y divide-nursery-sage/10">
              {data.payments.length === 0 ? (
                <p className="px-5 py-4 text-sm text-nursery-midnight/60">No payments recorded yet.</p>
              ) : (
                data.payments.map((payment) => (
                  <div key={payment.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-nursery-midnight">{payment.customer.displayName}</p>
                        <p className="mt-1 text-sm text-nursery-midnight/60">
                          {payment.method} · {payment.invoice?.invoiceNumber ?? "Direct"}
                        </p>
                        <p className="mt-1 text-xs text-nursery-midnight/40">{timeLabel(payment.paidAt)}</p>
                      </div>
                      <span className="font-semibold tabular-nums text-nursery-midnight">
                        {currency.format(payment.amount)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </section>

      {selected ? (
        <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_0.8fr]">
          <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-nursery-sage/15 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-nursery-midnight">Selected Invoice Detail</h2>
                <p className="mt-1 text-sm text-nursery-midnight/55">
                  {selected.invoiceNumber} · {selected.customer.displayName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill tone={invoiceStatusTone(selected.status)}>{selected.status}</StatusPill>
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
                <p className="px-5 py-6 text-center text-sm text-nursery-midnight/45">No line items yet. Click + Add Line to start building this invoice.</p>
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
                        <input type="hidden" name="parentType" value="invoice" />
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
                <p className="text-nursery-midnight/55">Tax</p>
                <p className="mt-1 font-semibold tabular-nums">{currency.format(selected.taxTotal)}</p>
              </div>
              <div>
                <p className="text-nursery-midnight/55">Total</p>
                <p className="mt-1 font-semibold tabular-nums">{currency.format(selected.total)}</p>
              </div>
              <div>
                <p className="text-nursery-midnight/55">Balance Due</p>
                <p className="mt-1 font-semibold tabular-nums">{currency.format(selected.balanceDue)}</p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-nursery-sage" />
              <h2 className="text-base font-bold text-nursery-midnight">Payment History</h2>
            </div>
            {selected.payments.length === 0 ? (
              <p className="mt-3 text-sm text-nursery-midnight/60">No payments recorded against this invoice.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {selected.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-lg bg-[#f7f3ea] p-4">
                    <div>
                      <p className="font-semibold text-nursery-midnight">{payment.method}</p>
                      <p className="mt-1 text-xs text-nursery-midnight/55">{timeLabel(payment.paidAt)}</p>
                    </div>
                    <span className="font-semibold tabular-nums text-nursery-midnight">{currency.format(payment.amount)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-nursery-sage/10 p-4">
                <p className="text-nursery-midnight/55">Deposit collected</p>
                <p className="mt-2 font-semibold tabular-nums">{currency.format(selected.depositTotal)}</p>
              </div>
              <div className="rounded-lg bg-nursery-terracotta/10 p-4">
                <p className="text-nursery-midnight/55">Remaining</p>
                <p className="mt-2 font-semibold tabular-nums">{currency.format(selected.balanceDue)}</p>
              </div>
            </div>
          </section>
        </section>
      ) : null}
      {searchParams.modal === 'new-invoice' && <NewInvoiceModal closeHref="/crm/invoices" />}
      {searchParams.modal === 'add-line-item' && searchParams.id && (
        <AddLineItemModal parentId={searchParams.id} parentType="invoice" closeHref={`/crm/invoices?id=${searchParams.id}`} />
      )}
    </CrmShell>
  );
}
