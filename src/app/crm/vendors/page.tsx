import { CheckCircle2, ClipboardList, DollarSign, PackageOpen, Phone, Truck, UsersRound } from "lucide-react";
import { CrmShell } from "@/components/crm/CrmShell";
import CrmActionButton from "@/components/crm/CrmActionButton";
import { getCrmVendorsData } from "@/lib/crm-vendors";
import { NewPurchaseOrderModal } from "@/components/crm/modals/NewPurchaseOrderModal";

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateLabel = (date?: Date | null) =>
  date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Not scheduled";

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
  icon: typeof Truck;
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

function BarList({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; count: number; value: number }[];
}) {
  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-nursery-midnight">{title}</h2>
        <ClipboardList className="h-4 w-4 text-nursery-sage" />
      </div>
      <div className="mt-5 space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-nursery-midnight/60">No purchasing data yet.</p>
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
                <div className="h-full rounded-full bg-nursery-terracotta" style={{ width: `${Math.max((row.value / max) * 100, 8)}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default async function VendorsCrmPage({
  searchParams,
}: {
  searchParams: { modal?: string };
}) {
  const data = await getCrmVendorsData();

  return (
    <CrmShell active="Vendors" eyebrow="Vendors and Purchasing" title="Vendors">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric label="Vendors" value={data.metrics.vendorCount} note="Active and inactive supplier accounts." icon={UsersRound} tone="sage" />
        <Metric label="Open POs" value={data.metrics.openPurchaseOrders} note="Purchase orders not closed or cancelled." icon={ClipboardList} tone="midnight" />
        <Metric label="Expected Value" value={currency.format(data.metrics.expectedValue)} note="Open purchase order value." icon={DollarSign} tone="ochre" />
        <Metric label="Ordered Units" value={data.metrics.orderedUnits} note="Units requested across purchase orders." icon={PackageOpen} tone="sage" />
        <Metric label="Received Units" value={data.metrics.receivedUnits} note="Units currently marked received." icon={CheckCircle2} tone="terracotta" />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_420px]">
        <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-nursery-sage/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-nursery-midnight">Purchase Order Board</h2>
              <p className="mt-1 text-sm text-nursery-midnight/55">Vendor, status, expected date, incoming items, freight, and landed cost context.</p>
            </div>
            <CrmActionButton icon="ClipboardList" label="New PO" href="?modal=new-po" />
          </div>
          <div className="divide-y divide-nursery-sage/10">
            {data.purchaseOrders.map((po) => {
              const ordered = po.lines.reduce((sum, line) => sum + line.quantityOrdered, 0);
              const received = po.lines.reduce((sum, line) => sum + line.quantityReceived, 0);
              return (
                <article key={po.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-nursery-sage/15 px-3 py-1 text-xs font-bold text-nursery-midnight">{po.status}</span>
                      <span className="rounded-full bg-[#f7f3ea] px-3 py-1 text-xs font-bold text-nursery-midnight/65">{po.poNumber}</span>
                    </div>
                    <h3 className="mt-3 font-serif text-2xl font-semibold text-nursery-midnight">{po.vendor.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-nursery-midnight/65">
                      Expected {dateLabel(po.expectedDate)} · {po.lines.length} lines · {ordered} ordered / {received} received
                    </p>
                    <div className="mt-4 grid gap-3 text-sm text-nursery-midnight/65 sm:grid-cols-3">
                      {po.lines.slice(0, 3).map((line) => (
                        <span key={line.id} className="inline-flex items-center gap-2">
                          <PackageOpen className="h-4 w-4 text-nursery-sage" />
                          {line.description}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 rounded-lg bg-[#f7f3ea] p-4 text-sm lg:w-56">
                    <div>
                      <p className="text-nursery-midnight/55">Subtotal</p>
                      <p className="mt-1 font-semibold tabular-nums text-nursery-midnight">{currency.format(po.subtotal)}</p>
                    </div>
                    <div>
                      <p className="text-nursery-midnight/55">Freight</p>
                      <p className="mt-1 font-semibold tabular-nums text-nursery-midnight">{currency.format(po.freight)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-nursery-midnight/55">Total</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums text-nursery-midnight">{currency.format(po.total)}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div className="space-y-4">
          <BarList title="Purchase Orders by Vendor" rows={data.vendorTotals} />
          <BarList title="Purchase Orders by Status" rows={data.statusTotals} />
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
          <div className="border-b border-nursery-sage/15 px-5 py-4">
            <h2 className="text-base font-bold text-nursery-midnight">Vendor Directory</h2>
          </div>
          <div className="divide-y divide-nursery-sage/10">
            {data.vendors.map((vendor) => (
              <div key={vendor.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-semibold text-nursery-midnight">{vendor.name}</p>
                  <p className="mt-1 text-sm text-nursery-midnight/60">{vendor.contactName ?? "No contact"} · {vendor.terms ?? "Terms not set"}</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-nursery-sage/15 px-3 py-1 text-xs font-bold text-nursery-midnight">
                  <Phone className="h-3 w-3" />
                  {vendor.phone ?? "No phone"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-nursery-sage" />
            <h2 className="text-base font-bold text-nursery-midnight">Vendor Scope</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-nursery-midnight/65">
            This module now tracks vendors, contacts, terms, purchase orders, expected dates, freight, fees, order totals, ordered quantities, received quantities, and line-level inventory links.
          </p>
        </section>
      </section>
      {searchParams.modal === 'new-po' && <NewPurchaseOrderModal closeHref="/crm/vendors" />}
    </CrmShell>
  );
}
