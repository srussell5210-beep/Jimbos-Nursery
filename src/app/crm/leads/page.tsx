import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  DollarSign,
  FileText,
  PhoneCall,
  Sprout,
  UserPlus,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { CrmShell } from "@/components/crm/CrmShell";
import CrmActionButton from "@/components/crm/CrmActionButton";
import { getCrmLeadsData } from "@/lib/crm-leads";
import { NewLeadModal } from "@/components/crm/modals/NewLeadModal";

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateLabel = (date?: Date | null) =>
  date
    ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "No due date";

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
  icon: typeof Sprout;
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

function StageChart({ stages }: { stages: { label: string; count: number; value: number }[] }) {
  const max = Math.max(...stages.map((stage) => stage.value), 1);

  return (
    <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-nursery-midnight">Pipeline by Stage</h2>
        <Sprout className="h-4 w-4 text-nursery-sage" />
      </div>
      <div className="mt-5 space-y-4">
        {stages.map((stage) => (
          <div key={stage.label}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-nursery-midnight/75">{stage.label}</span>
              <span className="font-semibold tabular-nums text-nursery-midnight">
                {stage.count} · {currency.format(stage.value)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-nursery-sage/15">
              <div
                className="h-full rounded-full bg-nursery-terracotta"
                style={{ width: `${Math.max((stage.value / max) * 100, 8)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const tone =
    priority === "High"
      ? "bg-nursery-terracotta/10 text-nursery-terracotta"
      : priority === "Low"
        ? "bg-nursery-sage/15 text-nursery-midnight"
        : "bg-nursery-ochre/15 text-nursery-midnight";

  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{priority}</span>;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { id?: string; modal?: string };
}) {
  const data = await getCrmLeadsData(searchParams.id);
  const selected = data.selectedLead;

  return (
    <CrmShell active="Leads" eyebrow="Pipeline and Follow-Ups" title="Leads">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric label="Open Leads" value={data.metrics.openLeads} note="Active opportunities not closed or lost." icon={Sprout} tone="sage" />
        <Metric label="Pipeline Value" value={currency.format(data.metrics.estimatedPipeline)} note="Estimated value across open lead stages." icon={DollarSign} tone="midnight" />
        <Metric label="Due Today" value={data.metrics.dueToday} note="Open tasks requiring attention today." icon={CalendarClock} tone="terracotta" />
        <Metric label="High Priority" value={data.metrics.highPriority} note="Owner-sensitive opportunities and follow-ups." icon={AlertCircle} tone="ochre" />
        <Metric label="Quote Ready" value={data.metrics.quoteReady} note="Qualified opportunities ready for quote work." icon={FileText} tone="sage" />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_0.75fr]">
        <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-nursery-sage/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-nursery-midnight">Lead Board</h2>
              <p className="mt-1 text-sm text-nursery-midnight/55">Sorted by due date, then value.</p>
            </div>
            <CrmActionButton icon="UserPlus" label="New Lead" href="?modal=new-lead" />
          </div>
          <div className="divide-y divide-nursery-sage/10">
            {data.leads.map((lead) => {
              const isSelected = lead.id === selected?.id;
              return (
                <article key={lead.id} className={`grid gap-4 px-5 py-5 lg:grid-cols-[1fr_auto] lg:items-start transition ${isSelected ? "bg-nursery-sage/10" : ""}`}>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-nursery-sage/15 px-3 py-1 text-xs font-bold text-nursery-midnight">{lead.stage}</span>
                      <PriorityBadge priority={lead.priority} />
                      <span className="rounded-full bg-[#f7f3ea] px-3 py-1 text-xs font-bold text-nursery-midnight/65">{lead.source}</span>
                    </div>
                    <h3 className="mt-3 font-serif text-2xl font-semibold text-nursery-midnight">{lead.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-nursery-midnight/65">
                      {lead.customer?.displayName ?? "No customer linked"} · {lead.nextStep ?? "No next step recorded."}
                    </p>
                    <div className="mt-4 grid gap-3 text-sm text-nursery-midnight/65 sm:grid-cols-3">
                      <span className="inline-flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-nursery-sage" />
                        {dateLabel(lead.dueDate)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-nursery-sage" />
                        {lead.owner?.name ?? "Unassigned"}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-nursery-sage" />
                        {lead.tasks.length} open tasks
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-lg bg-[#f7f3ea] p-4 lg:w-44 lg:flex-col lg:items-start">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-nursery-midnight/50">Estimate</p>
                      <p className="mt-2 text-2xl font-semibold tabular-nums text-nursery-midnight">{currency.format(lead.estimatedValue)}</p>
                    </div>
                    <Link
                      href={`/crm/leads?id=${lead.id}`}
                      className="inline-flex items-center gap-1 text-sm font-bold text-nursery-terracotta"
                    >
                      Open
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div className="space-y-4">
          <StageChart stages={data.stageCounts} />

          <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-nursery-sage/15 px-5 py-4">
              <h2 className="text-base font-bold text-nursery-midnight">Open Follow-Ups</h2>
              <PhoneCall className="h-4 w-4 text-nursery-sage" />
            </div>
            <div className="divide-y divide-nursery-sage/10">
              {data.openTasks.map((task) => (
                <article key={task.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-nursery-midnight">{task.title}</p>
                      <p className="mt-1 text-sm text-nursery-midnight/60">
                        {task.customer?.displayName ?? "No customer"} · {task.lead?.stage ?? task.type}
                      </p>
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <p className="mt-3 inline-flex items-center gap-2 text-sm text-nursery-midnight/60">
                    <CalendarClock className="h-4 w-4 text-nursery-sage" />
                    {dateLabel(task.dueDate)}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-nursery-sage" />
              <h2 className="text-base font-bold text-nursery-midnight">Lead Workflow Scope</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-nursery-midnight/65">
              This slice supports the owner&apos;s lead workflow: source, stage, priority, estimated value, next step, assigned owner, follow-up tasks, quote readiness, and customer context.
            </p>
          </section>
        </div>
      </section>

      {selected ? (
        <section className="mt-6 rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-nursery-sage/15 px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-nursery-midnight">Lead Detail</h2>
              <p className="mt-1 text-sm text-nursery-midnight/55">{selected.title}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-nursery-sage/15 px-3 py-1 text-xs font-bold text-nursery-midnight">{selected.stage}</span>
              <PriorityBadge priority={selected.priority} />
            </div>
          </div>
          <div className="grid gap-6 p-5 xl:grid-cols-[1fr_0.6fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-nursery-midnight/50">Customer</p>
              <p className="mt-2 font-semibold text-nursery-midnight">{selected.customer?.displayName ?? "No customer linked"}</p>
              <p className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-nursery-midnight/50">Next Step</p>
              <p className="mt-2 text-sm leading-6 text-nursery-midnight/75">{selected.nextStep ?? "No next step recorded."}</p>
              {selected.tasks.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-nursery-midnight/50">Open Tasks</p>
                  <div className="mt-3 space-y-2">
                    {selected.tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between rounded-lg bg-[#f7f3ea] px-4 py-3 text-sm">
                        <span className="font-medium text-nursery-midnight">{task.title}</span>
                        <span className="text-nursery-midnight/55">{dateLabel(task.dueDate)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm xl:grid-cols-1">
              <div className="rounded-lg bg-nursery-sage/10 p-4">
                <p className="text-nursery-midnight/55">Estimated Value</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-nursery-midnight">{currency.format(selected.estimatedValue)}</p>
              </div>
              <div className="rounded-lg bg-[#f7f3ea] p-4">
                <p className="text-nursery-midnight/55">Due Date</p>
                <p className="mt-2 font-semibold text-nursery-midnight">{dateLabel(selected.dueDate)}</p>
              </div>
              <div className="rounded-lg bg-[#f7f3ea] p-4 xl:col-span-1">
                <p className="text-nursery-midnight/55">Source</p>
                <p className="mt-2 font-semibold text-nursery-midnight">{selected.source}</p>
              </div>
              <div className="rounded-lg bg-[#f7f3ea] p-4 xl:col-span-1">
                <p className="text-nursery-midnight/55">Quotes</p>
                <p className="mt-2 font-semibold text-nursery-midnight">{selected.quotes.length} linked</p>
              </div>
            </div>
          </div>
        </section>
      ) : null}
      {searchParams.modal === 'new-lead' && <NewLeadModal closeHref="/crm/leads" />}
    </CrmShell>
  );
}
