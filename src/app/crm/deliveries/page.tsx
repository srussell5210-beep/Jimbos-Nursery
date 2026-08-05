import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  MapPinned,
  PackageCheck,
  Route,
  Truck,
} from "lucide-react";
import { CrmShell } from "@/components/crm/CrmShell";
import CrmActionButton from "@/components/crm/CrmActionButton";
import { getCrmDeliveriesData } from "@/lib/crm-deliveries";
import { NewDeliveryModal } from "@/components/crm/modals/NewDeliveryModal";

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateLabel = (date?: Date | null) =>
  date
    ? date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "Unscheduled";

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
  const max = Math.max(...rows.map((row) => row.count), 1);

  return (
    <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-nursery-midnight">{title}</h2>
        <Route className="h-4 w-4 text-nursery-sage" />
      </div>
      <div className="mt-5 space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-nursery-midnight/60">No route data yet.</p>
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
                <div className="h-full rounded-full bg-nursery-terracotta" style={{ width: `${Math.max((row.count / max) * 100, 8)}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default async function DeliveriesCrmPage({
  searchParams,
}: {
  searchParams: { modal?: string };
}) {
  const data = await getCrmDeliveriesData();

  return (
    <CrmShell active="Deliveries" eyebrow="Routes and Delivery" title="Deliveries">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric label="Total Deliveries" value={data.metrics.totalDeliveries} note="All delivery records currently in the CRM." icon={Truck} tone="sage" />
        <Metric label="Scheduled" value={data.metrics.scheduled} note="Open deliveries not completed or cancelled." icon={CalendarDays} tone="midnight" />
        <Metric label="Today" value={data.metrics.deliveriesToday} note="Deliveries scheduled for the current day." icon={Clock3} tone="ochre" />
        <Metric label="Routes" value={data.metrics.assignedRoutes} note="Named routes currently assigned." icon={Route} tone="sage" />
        <Metric label="Proof Gaps" value={data.metrics.proofMissing} note="Delivered stops missing proof of delivery." icon={ClipboardCheck} tone="terracotta" />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_420px]">
        <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-nursery-sage/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-nursery-midnight">Delivery Board</h2>
              <p className="mt-1 text-sm text-nursery-midnight/55">Customer, route, driver, truck, time window, and order context.</p>
            </div>
            <CrmActionButton icon="MapPinned" label="Plan Route" href="?modal=new-delivery" />
          </div>
          <div className="divide-y divide-nursery-sage/10">
            {data.deliveries.map((delivery) => (
              <article key={delivery.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_auto] lg:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-nursery-sage/15 px-3 py-1 text-xs font-bold text-nursery-midnight">{delivery.status}</span>
                    <span className="rounded-full bg-[#f7f3ea] px-3 py-1 text-xs font-bold text-nursery-midnight/65">{delivery.routeName ?? "Unassigned route"}</span>
                  </div>
                  <h3 className="mt-3 font-serif text-2xl font-semibold text-nursery-midnight">{delivery.customer.displayName}</h3>
                  <p className="mt-2 text-sm leading-6 text-nursery-midnight/65">
                    {delivery.property?.address ?? delivery.customer.billingAddress ?? "No delivery address"} · {delivery.notes ?? "No delivery notes."}
                  </p>
                  <div className="mt-4 grid gap-3 text-sm text-nursery-midnight/65 sm:grid-cols-3">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-nursery-sage" />
                      {dateLabel(delivery.scheduledFor)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Truck className="h-4 w-4 text-nursery-sage" />
                      {delivery.truckName ?? "Truck pending"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <PackageCheck className="h-4 w-4 text-nursery-sage" />
                      {delivery.order?.orderNumber ?? "No order linked"}
                    </span>
                  </div>
                </div>
                <div className="grid gap-3 rounded-lg bg-[#f7f3ea] p-4 text-sm lg:w-56">
                  <div>
                    <p className="text-nursery-midnight/55">Window</p>
                    <p className="mt-1 font-semibold text-nursery-midnight">{delivery.deliveryWindow ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-nursery-midnight/55">Driver</p>
                    <p className="mt-1 font-semibold text-nursery-midnight">{delivery.driverName ?? "Unassigned"}</p>
                  </div>
                  <div>
                    <p className="text-nursery-midnight/55">Order value</p>
                    <p className="mt-1 font-semibold tabular-nums text-nursery-midnight">{currency.format(delivery.order?.total ?? 0)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-4">
          <BarList title="Deliveries by Route" rows={data.routeTotals} />
          <BarList title="Deliveries by Status" rows={data.statusTotals} />
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
          <div className="border-b border-nursery-sage/15 px-5 py-4">
            <h2 className="text-base font-bold text-nursery-midnight">Today&apos;s Route Stops</h2>
          </div>
          <div className="divide-y divide-nursery-sage/10">
            {data.deliveriesToday.length === 0 ? (
              <p className="px-5 py-4 text-sm text-nursery-midnight/60">No deliveries scheduled for today.</p>
            ) : (
              data.deliveriesToday.map((delivery) => (
                <div key={delivery.id} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="font-semibold text-nursery-midnight">{delivery.customer.displayName}</p>
                    <p className="mt-1 text-sm text-nursery-midnight/60">{delivery.routeName ?? "Route pending"} · {delivery.deliveryWindow ?? "Window pending"}</p>
                  </div>
                  <span className="rounded-full bg-nursery-sage/15 px-3 py-1 text-xs font-bold text-nursery-midnight">{delivery.status}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-nursery-sage" />
            <h2 className="text-base font-bold text-nursery-midnight">Delivery Scope</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-nursery-midnight/65">
            This module now tracks route names, scheduled windows, drivers, trucks, linked orders, delivery notes, address context, status, and proof-of-delivery gaps.
          </p>
        </section>
      </section>
      {searchParams.modal === 'new-delivery' && <NewDeliveryModal closeHref="/crm/deliveries" />}
    </CrmShell>
  );
}
