import { CalendarDays, CheckCircle2, ClipboardList, DollarSign, Hammer, UsersRound } from "lucide-react";
import { CrmShell } from "@/components/crm/CrmShell";
import CrmActionButton from "@/components/crm/CrmActionButton";
import { getCrmServicesData } from "@/lib/crm-services";
import { NewServiceJobModal } from "@/components/crm/modals/NewServiceJobModal";

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
  icon: typeof Hammer;
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
          <p className="text-sm text-nursery-midnight/60">No service data yet.</p>
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

export default async function ServicesCrmPage({
  searchParams,
}: {
  searchParams: { modal?: string };
}) {
  const data = await getCrmServicesData();

  return (
    <CrmShell active="Services" eyebrow="Jobs and Service Calendar" title="Services">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric label="Service Jobs" value={data.metrics.totalJobs} note="Install, consultation, cleanup, and maintenance jobs." icon={Hammer} tone="sage" />
        <Metric label="Scheduled" value={data.metrics.scheduled} note="Jobs still active or awaiting completion." icon={CalendarDays} tone="midnight" />
        <Metric label="Revenue" value={currency.format(data.metrics.totalRevenue)} note="Booked service revenue in the CRM." icon={DollarSign} tone="ochre" />
        <Metric label="Costs" value={currency.format(data.metrics.totalCost)} note="Labor, material, delivery, equipment, and subcontractor cost." icon={ClipboardList} tone="terracotta" />
        <Metric label="Margin" value={currency.format(data.metrics.grossMargin)} note="Revenue minus tracked service costs." icon={CheckCircle2} tone="sage" />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_420px]">
        <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-nursery-sage/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-nursery-midnight">Service Work Board</h2>
              <p className="mt-1 text-sm text-nursery-midnight/55">Crew, schedule, property, job cost, revenue, and status.</p>
            </div>
            <CrmActionButton icon="CalendarDays" label="Schedule Job" href="?modal=new-service-job" />
          </div>
          <div className="divide-y divide-nursery-sage/10">
            {data.jobs.map((job) => {
              const totalCost = job.laborCost + job.materialCost + job.deliveryCost + job.equipmentCost + job.subcontractorCost;
              return (
                <article key={job.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-nursery-sage/15 px-3 py-1 text-xs font-bold text-nursery-midnight">{job.status}</span>
                      <span className="rounded-full bg-[#f7f3ea] px-3 py-1 text-xs font-bold text-nursery-midnight/65">{job.jobType}</span>
                    </div>
                    <h3 className="mt-3 font-serif text-2xl font-semibold text-nursery-midnight">{job.customer.displayName}</h3>
                    <p className="mt-2 text-sm leading-6 text-nursery-midnight/65">
                      {job.property?.address ?? job.customer.billingAddress ?? "No property address"} · {job.notes ?? "No job notes."}
                    </p>
                    <div className="mt-4 grid gap-3 text-sm text-nursery-midnight/65 sm:grid-cols-3">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-nursery-sage" />
                        {dateLabel(job.scheduledFor)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <UsersRound className="h-4 w-4 text-nursery-sage" />
                        {job.crewName ?? "Crew pending"}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-nursery-sage" />
                        {job.order?.orderNumber ?? "No order linked"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 rounded-lg bg-[#f7f3ea] p-4 text-sm lg:w-56">
                    <div>
                      <p className="text-nursery-midnight/55">Revenue</p>
                      <p className="mt-1 font-semibold tabular-nums text-nursery-midnight">{currency.format(job.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-nursery-midnight/55">Cost</p>
                      <p className="mt-1 font-semibold tabular-nums text-nursery-midnight">{currency.format(totalCost)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-nursery-midnight/55">Margin</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums text-nursery-midnight">{currency.format(job.revenue - totalCost)}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div className="space-y-4">
          <BarList title="Revenue by Job Type" rows={data.jobTypeTotals} />
          <BarList title="Revenue by Crew" rows={data.crewTotals} />
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-nursery-sage" />
          <h2 className="text-base font-bold text-nursery-midnight">Service Scope</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-nursery-midnight/65">
          This module now tracks scheduled jobs, crews, property context, linked orders, job type, revenue, labor cost, material cost, delivery cost, equipment cost, subcontractor cost, and gross margin.
        </p>
      </section>
      {searchParams.modal === 'new-service-job' && <NewServiceJobModal closeHref="/crm/services" />}
    </CrmShell>
  );
}
