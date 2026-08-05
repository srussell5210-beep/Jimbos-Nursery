'use client';

import Link from 'next/link';
import type React from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  FileText,
  Leaf,
  PackageCheck,
  Sprout,
  Star,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';
import type { getCrmCommandCenterData } from '@/lib/crm-dashboard';

export type DashData = Awaited<ReturnType<typeof getCrmCommandCenterData>>;

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const d = (v: Date | string | null | undefined) => {
  if (!v) return '—';
  const dt = typeof v === 'string' ? new Date(v) : v;
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ─── Shared mini-preview primitives ──────────────────────────────────────────

function PreviewShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[90px] w-[168px] shrink-0 overflow-hidden rounded border border-nursery-sage/20 bg-white p-2 shadow-sm">
      {children}
    </div>
  );
}

function PreviewTitle({ text }: { text: string }) {
  return <div className="mb-1.5 h-1.5 w-2/5 rounded-full bg-nursery-midnight/20" title={text} />;
}

function PreviewVBars({ bars }: { bars: number[] }) {
  const max = Math.max(...bars, 1);
  return (
    <div className="flex h-14 items-end gap-1">
      {bars.map((v, i) => (
        <div key={i} className="flex-1 rounded-t bg-nursery-terracotta/70" style={{ height: `${Math.max((v / max) * 100, 10)}%` }} />
      ))}
    </div>
  );
}

function PreviewHBars({ rows }: { rows: number[] }) {
  const max = Math.max(...rows, 1);
  return (
    <div className="space-y-1.5">
      {rows.map((v, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="h-1 w-8 rounded-full bg-nursery-midnight/15" />
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-nursery-sage/15">
            <div className="h-full rounded-full bg-nursery-terracotta/70" style={{ width: `${Math.max((v / max) * 100, 12)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function PreviewList({ rows, badge = false }: { rows: number; badge?: boolean }) {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-2">
          <div className="space-y-0.5 flex-1">
            <div className="h-1.5 w-3/4 rounded-full bg-nursery-midnight/20" />
            <div className="h-1 w-1/2 rounded-full bg-nursery-midnight/10" />
          </div>
          {badge && <div className="h-3 w-8 shrink-0 rounded-full bg-nursery-terracotta/20" />}
        </div>
      ))}
    </div>
  );
}

function PreviewStatBig({ value, sub }: { value: string; sub: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1">
      <div className="text-xl font-bold tabular-nums text-nursery-midnight">{value}</div>
      <div className="h-1 w-12 rounded-full bg-nursery-midnight/20" title={sub} />
    </div>
  );
}

function PreviewStatRow({ count }: { count: number }) {
  const colors = ['bg-nursery-terracotta/20', 'bg-nursery-sage/30', 'bg-nursery-ochre/30', 'bg-nursery-midnight/15', 'bg-nursery-terracotta/30'];
  return (
    <div className="flex h-full items-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`flex-1 rounded p-1.5 ${colors[i % colors.length]}`}>
          <div className="h-1.5 w-full rounded-full bg-current opacity-50" />
          <div className="mt-1 h-3 w-3/4 rounded-full bg-current opacity-30" />
        </div>
      ))}
    </div>
  );
}

function PreviewGrid({ cols, rows }: { cols: number; rows: number }) {
  const colors = ['bg-nursery-sage/20', 'bg-nursery-terracotta/15', 'bg-nursery-ochre/20', 'bg-nursery-midnight/10', 'bg-nursery-sage/30', 'bg-nursery-terracotta/25'];
  return (
    <div className={`grid gap-1`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div key={i} className={`h-8 rounded ${colors[i % colors.length]} flex items-center justify-center`}>
          <div className="h-2 w-4 rounded-full bg-current opacity-40" />
        </div>
      ))}
    </div>
  );
}

// ─── Full widget components ───────────────────────────────────────────────────

function ChartWidget({ title, items, fmt, icon: Icon, href }: {
  title: string; items: { label: string; value: number }[]; fmt?: (v: number) => string; icon: typeof BarChart3; href?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  const format = fmt ?? String;
  return (
    <section className="overflow-hidden rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
      <div className="h-1 bg-gradient-to-r from-nursery-midnight via-nursery-sage to-nursery-terracotta" />
      <div className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-nursery-midnight">{title}</h2>
        {href ? <Link href={href}><Icon className="h-4 w-4 text-nursery-sage" /></Link> : <Icon className="h-4 w-4 text-nursery-sage" />}
      </div>
      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-nursery-midnight/60">No data yet.</p>
        ) : items.map((item, index) => {
          const width = Math.max((item.value / max) * 100, 8);
          return (
          <div key={item.label} className="rounded-lg border border-nursery-sage/10 bg-[#f7f3ea] p-3">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-semibold text-nursery-midnight/80">{item.label}</span>
              <span className="font-semibold tabular-nums text-nursery-midnight">{format(item.value)}</span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-white shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-nursery-midnight via-nursery-sage to-nursery-terracotta shadow-sm"
                style={{ width: `${width}%`, opacity: 1 - Math.min(index * 0.05, 0.28) }}
              />
              <div className="absolute inset-y-0 left-1/2 w-px bg-nursery-midnight/10" />
            </div>
          </div>
          );
        })}
      </div>
      </div>
    </section>
  );
}

function ListWidget({ title, children, href }: { title: string; children: React.ReactNode; href?: string }) {
  return (
    <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-nursery-sage/15 px-5 py-4">
        <h2 className="text-base font-bold text-nursery-midnight">{title}</h2>
        {href && (
          <Link href={href} className="text-xs font-semibold text-nursery-terracotta hover:underline">View all</Link>
        )}
      </div>
      <div className="divide-y divide-nursery-sage/10">{children}</div>
    </section>
  );
}

function StatWidget({ label, value, note, icon: Icon, tone = 'sage' }: {
  label: string; value: string | number; note: string; icon: typeof BarChart3; tone?: 'sage' | 'terracotta' | 'ochre' | 'midnight';
}) {
  const tones = {
    sage: 'bg-nursery-sage/15 text-nursery-midnight ring-nursery-sage/25',
    terracotta: 'bg-nursery-terracotta/10 text-nursery-terracotta ring-nursery-terracotta/20',
    ochre: 'bg-nursery-ochre/15 text-nursery-midnight ring-nursery-ochre/25',
    midnight: 'bg-nursery-midnight text-nursery-ivory ring-nursery-midnight',
  };
  return (
    <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-nursery-midnight/50">{label}</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-nursery-midnight">{value}</p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ring-1 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-nursery-midnight/60">{note}</p>
    </section>
  );
}

// ─── 20 Widget definitions ────────────────────────────────────────────────────

export type WidgetCategory = 'Quick Stats' | 'Financial' | 'Sales Pipeline' | 'Operations' | 'Inventory' | 'Customers';

export type WidgetDef = {
  key: string;
  name: string;
  category: WidgetCategory;
  tooltip: string;
  colSpan: 1 | 2 | 3;
  MiniPreview: React.FC;
  Widget: React.FC<{ data: DashData }>;
};

const BASE_WIDGET_CATALOG: WidgetDef[] = [
  // ── Quick Stats ──
  {
    key: 'daily-snapshot',
    name: 'Daily Snapshot',
    category: 'Quick Stats',
    tooltip: 'Five key metrics in a single row — follow-ups due, new leads, open quotes, deliveries today, and low-stock items. The fastest read on your day without opening a single module.',
    colSpan: 3,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="Daily Snapshot" />
        <PreviewStatRow count={5} />
      </PreviewShell>
    ),
    Widget: ({ data }) => (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatWidget label="Follow-ups" value={data.metrics.followUpsDueToday} note="Due today across leads and customers." icon={ClipboardList} tone="terracotta" />
        <StatWidget label="New Leads" value={data.metrics.newLeads} note="Fresh requests waiting for owner review." icon={Sprout} tone="sage" />
        <StatWidget label="Open Quotes" value={data.metrics.openQuotes} note="Active quotes not accepted or closed." icon={FileText} tone="ochre" />
        <StatWidget label="Deliveries" value={data.metrics.deliveriesToday} note="Scheduled for today." icon={Truck} tone="midnight" />
        <StatWidget label="Low Stock" value={data.metrics.lowStock} note="Items at or below reorder point." icon={AlertTriangle} tone="terracotta" />
      </section>
    ),
  },
  {
    key: 'alert-center',
    name: 'Alert Center',
    category: 'Quick Stats',
    tooltip: 'Unread system notifications and alerts in one place. Surface issues — overdue invoices, low stock, pending tasks — before they become problems.',
    colSpan: 1,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="Alert Center" />
        <PreviewList rows={3} badge />
      </PreviewShell>
    ),
    Widget: ({ data }) => (
      <ListWidget title="Alerts" href="/crm">
        {data.notifications.length === 0 ? (
          <p className="px-5 py-4 text-sm text-nursery-midnight/55">No unread alerts.</p>
        ) : data.notifications.map((n) => (
          <div key={n.id} className="flex items-start gap-3 px-5 py-4">
            <Bell className="mt-0.5 h-4 w-4 shrink-0 text-nursery-terracotta" />
            <div>
              <p className="font-semibold text-nursery-midnight">{n.title}</p>
              <p className="mt-0.5 text-sm text-nursery-midnight/60">{n.body}</p>
            </div>
          </div>
        ))}
      </ListWidget>
    ),
  },

  // ── Financial ──
  {
    key: 'revenue-chart',
    name: 'Revenue by Month',
    category: 'Financial',
    tooltip: 'Monthly invoice totals for the last 6 months rendered as a bar chart. Spot revenue trends, seasonal peaks, and whether you are growing month-over-month without pulling a report.',
    colSpan: 1,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="Revenue by Month" />
        <div className="flex h-14 items-end gap-1 px-1">
          {[40, 65, 50, 80, 60, 90].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-nursery-terracotta/60" style={{ height: `${h}%` }} />
          ))}
        </div>
      </PreviewShell>
    ),
    Widget: ({ data }) => (
      <ChartWidget title="Revenue by Month" items={data.charts.revenueByMonth} fmt={currency.format} icon={BarChart3} href="/crm/invoices" />
    ),
  },
  {
    key: 'sales-by-category',
    name: 'Sales by Category',
    category: 'Financial',
    tooltip: 'Horizontal bar chart of line-item revenue organized by category — Plants, Labor, Delivery, Materials, and more. Shows which product lines drive the most revenue so you can focus on your best sellers.',
    colSpan: 1,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="Sales by Category" />
        <PreviewHBars rows={[90, 55, 70, 30, 45]} />
      </PreviewShell>
    ),
    Widget: ({ data }) => (
      <ChartWidget title="Sales by Category" items={data.charts.salesByCategory} fmt={currency.format} icon={BarChart3} href="/crm/invoices" />
    ),
  },
  {
    key: 'unpaid-invoices',
    name: 'Unpaid Invoices',
    category: 'Financial',
    tooltip: 'All outstanding invoices with customer name and balance due, sorted by due date. Your daily collection list — who owes what and when payment was expected.',
    colSpan: 1,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="Unpaid Invoices" />
        <PreviewList rows={3} badge />
      </PreviewShell>
    ),
    Widget: ({ data }) => (
      <ListWidget title="Unpaid Invoices" href="/crm/invoices">
        {data.unpaidInvoices.length === 0 ? (
          <p className="px-5 py-4 text-sm text-nursery-midnight/55">All invoices paid.</p>
        ) : data.unpaidInvoices.map((inv) => (
          <div key={inv.id} className="flex items-start justify-between gap-4 px-5 py-4">
            <div>
              <p className="font-semibold text-nursery-midnight">{inv.invoiceNumber}</p>
              <p className="mt-0.5 text-sm text-nursery-midnight/60">{inv.customer.displayName} · {inv.status}</p>
            </div>
            <span className="font-semibold tabular-nums text-nursery-midnight">{currency.format(inv.balanceDue)}</span>
          </div>
        ))}
      </ListWidget>
    ),
  },
  {
    key: 'balance-summary',
    name: 'Balance Summary',
    category: 'Financial',
    tooltip: 'Total receivables snapshot with a breakdown by invoice status — Unpaid, Partial, Overdue. Know exactly what is owed and in which collection stage at any moment.',
    colSpan: 1,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="Balance Summary" />
        <PreviewGrid cols={2} rows={2} />
      </PreviewShell>
    ),
    Widget: ({ data }) => (
      <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-nursery-midnight">Balance Summary</h2>
          <Wallet className="h-4 w-4 text-nursery-sage" />
        </div>
        <p className="mt-4 text-3xl font-semibold tabular-nums text-nursery-midnight">{currency.format(data.metrics.unpaidBalance)}</p>
        <p className="mt-1 text-sm text-nursery-midnight/55">Total outstanding receivables</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {data.invoiceStatusBreakdown.map((row) => (
            <div key={row.status} className="rounded-lg bg-[#f7f3ea] p-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-nursery-midnight/50">{row.status}</p>
              <p className="mt-1.5 text-xl font-semibold tabular-nums text-nursery-midnight">{currency.format(row.balance)}</p>
              <p className="mt-0.5 text-xs text-nursery-midnight/45">{row.count} invoice{row.count !== 1 ? 's' : ''}</p>
            </div>
          ))}
        </div>
      </section>
    ),
  },

  // ── Sales Pipeline ──
  {
    key: 'quote-pipeline',
    name: 'Quote Pipeline',
    category: 'Sales Pipeline',
    tooltip: 'Open quotes organized by stage — Draft, Sent, Review, Accepted — as a horizontal bar chart. See your revenue-in-progress and identify where deals are stalling before they expire.',
    colSpan: 1,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="Quote Pipeline" />
        <PreviewHBars rows={[80, 50, 30, 20]} />
      </PreviewShell>
    ),
    Widget: ({ data }) => (
      <ChartWidget title="Quote Pipeline" items={data.charts.quoteStages} icon={FileText} href="/crm/quotes" />
    ),
  },
  {
    key: 'follow-ups-today',
    name: "Follow-ups Today",
    category: 'Sales Pipeline',
    tooltip: "All tasks and callbacks due today across leads and customers. Your contact obligations for the day in one prioritized list — nothing slips through.",
    colSpan: 1,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="Follow-ups Today" />
        <PreviewList rows={3} badge />
      </PreviewShell>
    ),
    Widget: ({ data }) => (
      <ListWidget title="Follow-ups Today" href="/crm/leads">
        {data.followUpsDueToday.length === 0 ? (
          <p className="px-5 py-4 text-sm text-nursery-midnight/55">No follow-ups due today.</p>
        ) : data.followUpsDueToday.map((task) => (
          <div key={task.id} className="flex items-start justify-between gap-4 px-5 py-4">
            <div>
              <p className="font-semibold text-nursery-midnight">{task.title}</p>
              <p className="mt-0.5 text-sm text-nursery-midnight/60">{task.customer?.displayName ?? 'No customer'} · {task.type}</p>
            </div>
            <span className="rounded-full bg-nursery-terracotta/10 px-3 py-1 text-xs font-bold text-nursery-terracotta">{task.priority}</span>
          </div>
        ))}
      </ListWidget>
    ),
  },
  {
    key: 'new-leads',
    name: 'New Leads',
    category: 'Sales Pipeline',
    tooltip: 'Qualified and new customer requests sorted by due date. Your next revenue opportunities at a glance — catch new business before it goes cold and moves to a competitor.',
    colSpan: 1,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="New Leads" />
        <PreviewList rows={3} badge />
      </PreviewShell>
    ),
    Widget: ({ data }) => (
      <ListWidget title="New Leads" href="/crm/leads">
        {data.customerRequests.length === 0 ? (
          <p className="px-5 py-4 text-sm text-nursery-midnight/55">No new leads in queue.</p>
        ) : data.customerRequests.map((lead) => (
          <div key={lead.id} className="flex items-start justify-between gap-4 px-5 py-4">
            <div>
              <p className="font-semibold text-nursery-midnight">{lead.title}</p>
              <p className="mt-0.5 text-sm text-nursery-midnight/60">{lead.customer?.displayName ?? 'No customer'} · Due {d(lead.dueDate)}</p>
            </div>
            <span className="rounded-full bg-nursery-sage/15 px-3 py-1 text-xs font-bold text-nursery-midnight">{lead.stage}</span>
          </div>
        ))}
      </ListWidget>
    ),
  },
  {
    key: 'customer-requests',
    name: 'Customer Requests',
    category: 'Sales Pipeline',
    tooltip: 'Incoming leads in New or Qualified stage with customer name and estimated close date. A focused view on inbound demand — separate from your existing pipeline work.',
    colSpan: 1,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="Customer Requests" />
        <PreviewList rows={3} badge />
      </PreviewShell>
    ),
    Widget: ({ data }) => (
      <ListWidget title="Customer Requests" href="/crm/leads">
        {data.customerRequests.length === 0 ? (
          <p className="px-5 py-4 text-sm text-nursery-midnight/55">No pending requests.</p>
        ) : data.customerRequests.map((lead) => (
          <div key={lead.id} className="flex items-start justify-between gap-4 px-5 py-4">
            <div>
              <p className="font-semibold text-nursery-midnight">{lead.customer?.displayName ?? 'No customer'}</p>
              <p className="mt-0.5 text-sm text-nursery-midnight/60">{lead.title} · {lead.source}</p>
            </div>
            <span className="rounded-full bg-nursery-ochre/15 px-3 py-1 text-xs font-bold text-nursery-midnight">{lead.stage}</span>
          </div>
        ))}
      </ListWidget>
    ),
  },

  // ── Operations ──
  {
    key: 'deliveries-today',
    name: "Today's Deliveries",
    category: 'Operations',
    tooltip: "Scheduled delivery stops for today with route name, driver, and time window. Brief your crew before they leave the yard so every stop has the right context.",
    colSpan: 1,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="Today's Deliveries" />
        <PreviewList rows={3} badge />
      </PreviewShell>
    ),
    Widget: ({ data }) => (
      <ListWidget title="Deliveries Today" href="/crm/deliveries">
        {data.deliveriesToday.length === 0 ? (
          <p className="px-5 py-4 text-sm text-nursery-midnight/55">No deliveries scheduled today.</p>
        ) : data.deliveriesToday.map((delivery) => (
          <div key={delivery.id} className="flex items-start justify-between gap-4 px-5 py-4">
            <div>
              <p className="font-semibold text-nursery-midnight">{delivery.customer.displayName}</p>
              <p className="mt-0.5 text-sm text-nursery-midnight/60">{delivery.routeName ?? 'Route pending'} · {delivery.deliveryWindow ?? d(delivery.scheduledFor)}</p>
            </div>
            <span className="rounded-full bg-nursery-sage/15 px-3 py-1 text-xs font-bold text-nursery-midnight">{delivery.status}</span>
          </div>
        ))}
      </ListWidget>
    ),
  },
  {
    key: 'service-jobs',
    name: 'Service Jobs',
    category: 'Operations',
    tooltip: 'Upcoming scheduled service work — installs, consultations, cleanups, and maintenance — with crew assignment and job date. Know what your teams are doing this week without calling anyone.',
    colSpan: 1,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="Service Jobs" />
        <PreviewList rows={3} badge />
      </PreviewShell>
    ),
    Widget: ({ data }) => (
      <ListWidget title="Service Jobs" href="/crm/services">
        {data.serviceJobs.length === 0 ? (
          <p className="px-5 py-4 text-sm text-nursery-midnight/55">No service jobs scheduled.</p>
        ) : data.serviceJobs.map((job) => (
          <div key={job.id} className="flex items-start justify-between gap-4 px-5 py-4">
            <div>
              <p className="font-semibold text-nursery-midnight">{job.customer.displayName}</p>
              <p className="mt-0.5 text-sm text-nursery-midnight/60">{job.jobType} · {job.crewName ?? 'Crew pending'} · {d(job.scheduledFor)}</p>
            </div>
            <span className="rounded-full bg-nursery-sage/15 px-3 py-1 text-xs font-bold text-nursery-midnight">{job.status}</span>
          </div>
        ))}
      </ListWidget>
    ),
  },
  {
    key: 'vendor-orders',
    name: 'Vendor Orders',
    category: 'Operations',
    tooltip: 'Active purchase orders with vendor name and expected delivery date. Track what is incoming, flag overdue shipments, and avoid being caught without stock when the busy season starts.',
    colSpan: 1,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="Vendor Orders" />
        <PreviewList rows={3} badge />
      </PreviewShell>
    ),
    Widget: ({ data }) => (
      <ListWidget title="Vendor Orders" href="/crm/vendors">
        {data.vendorOrders.length === 0 ? (
          <p className="px-5 py-4 text-sm text-nursery-midnight/55">No open purchase orders.</p>
        ) : data.vendorOrders.map((po) => (
          <div key={po.id} className="flex items-start justify-between gap-4 px-5 py-4">
            <div>
              <p className="font-semibold text-nursery-midnight">{po.poNumber} · {po.vendor.name}</p>
              <p className="mt-0.5 text-sm text-nursery-midnight/60">{po.status} · Expected {d(po.expectedDate)}</p>
            </div>
            <span className="rounded-full bg-nursery-sage/15 px-3 py-1 text-xs font-bold text-nursery-midnight">{po.status}</span>
          </div>
        ))}
      </ListWidget>
    ),
  },
  {
    key: 'recent-activity',
    name: 'Recent Activity',
    category: 'Operations',
    tooltip: 'Latest CRM actions across customers, quotes, orders, and service records. Stay current on what the team has done without checking every module individually.',
    colSpan: 2,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="Recent Activity" />
        <div className="space-y-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-4 w-4 shrink-0 rounded bg-nursery-sage/20" />
              <div className="space-y-0.5 flex-1">
                <div className="h-1.5 w-3/4 rounded-full bg-nursery-midnight/20" />
                <div className="h-1 w-1/2 rounded-full bg-nursery-midnight/10" />
              </div>
            </div>
          ))}
        </div>
      </PreviewShell>
    ),
    Widget: ({ data }) => (
      <ListWidget title="Recent Activity" href="/crm/customers">
        {data.recentActivities.length === 0 ? (
          <p className="px-5 py-4 text-sm text-nursery-midnight/55">No recent activity.</p>
        ) : data.recentActivities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 px-5 py-4">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-nursery-sage/15">
              <Leaf className="h-4 w-4 text-nursery-midnight" />
            </span>
            <div>
              <p className="font-semibold text-nursery-midnight">{activity.title}</p>
              <p className="mt-0.5 text-sm text-nursery-midnight/60">{activity.customer?.displayName ?? 'General'} · {activity.details}</p>
            </div>
          </div>
        ))}
      </ListWidget>
    ),
  },

  // ── Inventory ──
  {
    key: 'low-stock',
    name: 'Low Stock Alerts',
    category: 'Inventory',
    tooltip: 'All items at or below their reorder point, by location. Order before you run short on your top sellers — especially critical in peak planting season when restocking takes days.',
    colSpan: 1,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="Low Stock Alerts" />
        <PreviewList rows={3} badge />
      </PreviewShell>
    ),
    Widget: ({ data }) => (
      <ListWidget title="Low Stock Alerts" href="/crm/inventory">
        {data.lowStock.length === 0 ? (
          <p className="px-5 py-4 text-sm text-nursery-midnight/55">All stock levels healthy.</p>
        ) : data.lowStock.map((sl) => (
          <div key={sl.id} className="flex items-start justify-between gap-4 px-5 py-4">
            <div>
              <p className="font-semibold text-nursery-midnight">{sl.inventoryItem.name}</p>
              <p className="mt-0.5 text-sm text-nursery-midnight/60">{sl.location.name} · {sl.quantityOnHand} on hand · reorder at {sl.inventoryItem.reorderPoint}</p>
            </div>
            <span className="rounded-full bg-nursery-terracotta/10 px-3 py-1 text-xs font-bold text-nursery-terracotta">Reorder</span>
          </div>
        ))}
      </ListWidget>
    ),
  },
  {
    key: 'inventory-value',
    name: 'Inventory Value',
    category: 'Inventory',
    tooltip: 'Total landed-cost inventory value across all locations. Know your asset position at a glance — and watch it shift as you sell, receive, and write off stock.',
    colSpan: 1,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="Inventory Value" />
        <PreviewStatBig value="$0k" sub="Total value" />
      </PreviewShell>
    ),
    Widget: ({ data }) => (
      <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-nursery-midnight">Inventory Value</h2>
          <PackageCheck className="h-4 w-4 text-nursery-sage" />
        </div>
        <p className="mt-4 text-3xl font-semibold tabular-nums text-nursery-midnight">{currency.format(data.metrics.totalInventoryValue)}</p>
        <p className="mt-1 text-sm text-nursery-midnight/55">Landed-cost value across all locations</p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-nursery-sage/10 p-3">
            <p className="text-nursery-midnight/55">Low stock items</p>
            <p className="mt-1 text-xl font-semibold">{data.metrics.lowStock}</p>
          </div>
          <div className="rounded-lg bg-[#f7f3ea] p-3">
            <p className="text-nursery-midnight/55">Open POs</p>
            <p className="mt-1 text-xl font-semibold">{data.metrics.vendorOrders}</p>
          </div>
        </div>
      </section>
    ),
  },
  {
    key: 'top-categories',
    name: 'Category Breakdown',
    category: 'Inventory',
    tooltip: 'Stock quantity and landed value organized by inventory category. See which categories represent your biggest asset investment and which are running lean.',
    colSpan: 1,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="Category Breakdown" />
        <PreviewHBars rows={[80, 60, 45, 30, 20]} />
      </PreviewShell>
    ),
    Widget: ({ data }) => (
      <ChartWidget
        title="Category Breakdown"
        items={data.topInventoryCategories.map((c) => ({ label: c.label, value: c.value }))}
        fmt={currency.format}
        icon={BarChart3}
        href="/crm/inventory"
      />
    ),
  },

  // ── Customers ──
  {
    key: 'top-customers',
    name: 'Top Customers',
    category: 'Customers',
    tooltip: 'Your highest-revenue customers ranked by total invoice value. Know your best accounts at a glance — protect those relationships and prioritize their service and fulfillment.',
    colSpan: 1,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="Top Customers" />
        <PreviewList rows={4} badge />
      </PreviewShell>
    ),
    Widget: ({ data }) => (
      <ListWidget title="Top Customers" href="/crm/customers">
        {data.topCustomers.length === 0 ? (
          <p className="px-5 py-4 text-sm text-nursery-midnight/55">No customer data.</p>
        ) : data.topCustomers.map((c) => (
          <div key={c.id} className="flex items-start justify-between gap-4 px-5 py-4">
            <div>
              <p className="font-semibold text-nursery-midnight">{c.name}</p>
              <p className="mt-0.5 text-sm text-nursery-midnight/60">{c.type}</p>
            </div>
            <span className="font-semibold tabular-nums text-nursery-midnight">{currency.format(c.revenue)}</span>
          </div>
        ))}
      </ListWidget>
    ),
  },
  {
    key: 'customer-stats',
    name: 'Customer Stats',
    category: 'Customers',
    tooltip: 'Total customer count broken down by account type — Retail, Contractor, Wholesale, Municipal. Understand the composition of your customer base and how it shifts over time.',
    colSpan: 1,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="Customer Stats" />
        <PreviewHBars rows={[70, 50, 35, 20]} />
      </PreviewShell>
    ),
    Widget: ({ data }) => (
      <ChartWidget
        title="Customer Stats"
        items={data.customerTypes.map((t) => ({ label: t.type, value: t.count }))}
        icon={Users}
        href="/crm/customers"
      />
    ),
  },
  {
    key: 'loyalty-overview',
    name: 'Loyalty Tiers',
    category: 'Customers',
    tooltip: 'Breakdown of customers by loyalty tier — Standard, Bronze, Silver, Gold, Platinum. See how your loyalty program is tracking and which tier has the most members.',
    colSpan: 1,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="Loyalty Tiers" />
        <PreviewGrid cols={3} rows={2} />
      </PreviewShell>
    ),
    Widget: ({ data }) => (
      <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-nursery-midnight">Loyalty Tiers</h2>
          <Star className="h-4 w-4 text-nursery-sage" />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          {data.loyaltyTiers.map((tier) => (
            <div key={tier.tier} className="rounded-lg bg-[#f7f3ea] p-3 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-nursery-midnight/50">{tier.tier}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-nursery-midnight">{tier.count}</p>
            </div>
          ))}
        </div>
        <Link href="/crm/customers" className="mt-4 block text-right text-xs font-semibold text-nursery-terracotta hover:underline">View customers</Link>
      </section>
    ),
  },
  {
    key: 'service-revenue',
    name: 'Service Revenue',
    category: 'Operations',
    tooltip: 'Active service jobs with booked revenue and crew assignment. A quick read on billable field work in progress — how much is booked and who is on it.',
    colSpan: 1,
    MiniPreview: () => (
      <PreviewShell>
        <PreviewTitle text="Service Revenue" />
        <div className="space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-nursery-midnight/15" />
              <div className="h-3 w-10 rounded bg-nursery-sage/30" />
            </div>
          ))}
          <div className="mt-2 h-4 w-1/2 rounded bg-nursery-midnight/10" />
        </div>
      </PreviewShell>
    ),
    Widget: ({ data }) => {
      const totalRev = data.serviceJobs.reduce((s, j) => s + j.revenue, 0);
      return (
        <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-nursery-midnight">Service Revenue</h2>
            <CheckCircle2 className="h-4 w-4 text-nursery-sage" />
          </div>
          <p className="mt-4 text-3xl font-semibold tabular-nums text-nursery-midnight">{currency.format(totalRev)}</p>
          <p className="mt-1 text-sm text-nursery-midnight/55">{data.metrics.activeServiceJobs} active job{data.metrics.activeServiceJobs !== 1 ? 's' : ''} booked</p>
          <div className="mt-5 divide-y divide-nursery-sage/10">
            {data.serviceJobs.slice(0, 4).map((job) => (
              <div key={job.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div>
                  <span className="font-medium text-nursery-midnight">{job.customer.displayName}</span>
                  <span className="ml-2 text-nursery-midnight/50">{job.jobType}</span>
                </div>
                <span className="font-semibold tabular-nums text-nursery-midnight">{currency.format(job.revenue)}</span>
              </div>
            ))}
          </div>
          <Link href="/crm/services" className="mt-3 block text-right text-xs font-semibold text-nursery-terracotta hover:underline">View all jobs</Link>
        </section>
      );
    },
  },
];

const MONTHLY_REVENUE_TARGET = 50000;
const SERVICE_JOB_TARGET = 20;

const pct = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
const plainPct = (value: number) => `${Math.round(value)}%`;

function DeltaBadge({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${positive ? 'bg-nursery-sage/15 text-nursery-midnight' : 'bg-nursery-terracotta/10 text-nursery-terracotta'}`}>
      {positive ? '↑' : '↓'} {pct(value)}
    </span>
  );
}

function SimpleMeter({ value, target }: { value: number; target: number }) {
  const fill = Math.min((value / Math.max(target, 1)) * 100, 100);
  return (
    <div className="h-3 overflow-hidden rounded-full bg-nursery-sage/15">
      <div className="h-full rounded-full bg-nursery-terracotta" style={{ width: `${fill}%` }} />
    </div>
  );
}

function DonutWidget({ data }: { data: DashData }) {
  const colors = ['#1a2f23', '#8ba888', '#c05d33', '#daa520'];
  const total = data.invoiceStatusBreakdown.reduce((sum, row) => sum + row.count, 0) || 1;
  let cursor = 0;
  const gradient = data.invoiceStatusBreakdown.map((row, index) => {
    const start = cursor;
    const end = cursor + (row.count / total) * 100;
    cursor = end;
    return `${colors[index % colors.length]} ${start}% ${end}%`;
  }).join(', ');
  return (
    <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-nursery-midnight">Invoice Status Breakdown</h2>
        <Wallet className="h-4 w-4 text-nursery-sage" />
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-[120px_1fr] sm:items-center">
        <div className="relative mx-auto h-32 w-32 rounded-full p-2 shadow-[inset_0_0_0_1px_rgba(139,168,136,0.2)]" style={{ background: `conic-gradient(${gradient || '#8ba888 0% 100%'})` }}>
          <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white shadow-inner">
            <span className="text-2xl font-bold tabular-nums text-nursery-midnight">{total}</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-nursery-midnight/45">Invoices</span>
          </div>
        </div>
        <div className="space-y-2">
          {data.invoiceStatusBreakdown.map((row, index) => (
            <div key={row.status} className="rounded-lg border border-nursery-sage/10 bg-[#f7f3ea] px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-nursery-midnight/70">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                {row.status}
              </span>
              <span className="font-semibold tabular-nums text-nursery-midnight">{row.count}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full" style={{ width: `${(row.count / total) * 100}%`, backgroundColor: colors[index % colors.length] }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AreaChartWidget({ data }: { data: DashData }) {
  const rows = data.charts.revenueByMonth;
  const max = Math.max(...rows.map((row) => row.value), 1);
  const points = rows.map((row, index) => {
    const x = rows.length === 1 ? 180 : (index / (rows.length - 1)) * 360;
    const y = 126 - (row.value / max) * 100;
    return { ...row, x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(' ');
  const area = points.length > 0 ? `0,145 ${line} 360,145` : '0,145 360,145';
  return (
    <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-nursery-midnight">Revenue Trend</h2>
        <BarChart3 className="h-4 w-4 text-nursery-sage" />
      </div>
      <svg viewBox="0 0 360 170" className="mt-4 h-44 w-full rounded-lg bg-[#f7f3ea]">
        <defs>
          <linearGradient id="revenueAreaFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#c05d33" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#8ba888" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="revenueLineStroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#1a2f23" />
            <stop offset="58%" stopColor="#8ba888" />
            <stop offset="100%" stopColor="#c05d33" />
          </linearGradient>
        </defs>
        {[35, 70, 105, 140].map((y) => <line key={y} x1="0" x2="360" y1={y} y2={y} stroke="#1a2f23" strokeOpacity="0.07" />)}
        <polygon points={area} fill="url(#revenueAreaFill)" />
        <polyline points={line} fill="none" stroke="url(#revenueLineStroke)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="6" fill="#fff" stroke="#1a2f23" strokeWidth="2" />
            <text x={point.x} y="160" textAnchor="middle" className="fill-nursery-midnight/45 text-[10px] font-bold">{point.label}</text>
          </g>
        ))}
      </svg>
      <div className="grid grid-cols-3 gap-2 text-xs text-nursery-midnight/55">
        {rows.slice(-3).map((row) => (
          <span key={row.label}>{row.label}: {currency.format(row.value)}</span>
        ))}
      </div>
    </section>
  );
}

function FunnelWidget({ data }: { data: DashData }) {
  const ordered = ['Draft', 'Sent', 'Review', 'Accepted'].map((stage) => ({
    label: stage,
    value: data.charts.quoteStages.find((row) => row.label === stage)?.value ?? 0,
  }));
  const max = Math.max(...ordered.map((row) => row.value), 1);
  return (
    <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-nursery-midnight">Sales Pipeline Funnel</h2>
      <div className="mt-5 space-y-3 rounded-lg bg-[#f7f3ea] p-4">
        {ordered.map((row, index) => (
          <div key={row.label} className="grid grid-cols-[76px_1fr_28px] items-center gap-3">
            <span className="text-sm font-semibold text-nursery-midnight/70">{row.label}</span>
            <div className="flex-1">
              <div
                className="mx-auto h-8 rounded-md bg-gradient-to-r from-nursery-midnight via-nursery-sage to-nursery-terracotta shadow-sm"
                style={{ width: `${Math.max((row.value / max) * 100, 18)}%`, opacity: 1 - index * 0.09 }}
              />
            </div>
            <span className="text-right text-sm font-bold tabular-nums text-nursery-midnight">{row.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function StagePipelineWidget({ data }: { data: DashData }) {
  const max = Math.max(...data.leadPipelineStages.map((row) => row.count), 1);
  return (
    <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-nursery-midnight">Lead Pipeline Progress</h2>
      <div className="mt-5 grid gap-3 rounded-lg bg-[#f7f3ea] p-4">
        {data.leadPipelineStages.map((stage, index, rows) => {
          const next = rows[index + 1]?.count ?? 0;
          const conversion = stage.count === 0 ? 0 : (next / stage.count) * 100;
          return (
            <div key={stage.stage}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-nursery-midnight/75">{stage.stage}</span>
                <span className="tabular-nums text-nursery-midnight/55">{stage.count} · {plainPct(conversion)}</span>
              </div>
              <div className="h-3 rounded-full bg-white shadow-inner">
                <div className="h-full rounded-full bg-gradient-to-r from-nursery-midnight to-nursery-sage" style={{ width: `${Math.max((stage.count / max) * 100, 8)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ComparatorWidget({ data }: { data: DashData }) {
  return (
    <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-nursery-midnight">This Month vs. Last Month</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {data.monthlyComparison.map((row) => {
          const delta = row.prior === 0 ? (row.current > 0 ? 100 : 0) : ((row.current - row.prior) / row.prior) * 100;
          const format = row.format === 'currency' ? currency.format : String;
          return (
            <div key={row.label} className="rounded-lg border border-nursery-sage/10 bg-[#f7f3ea] p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-nursery-midnight/50">{row.label}</p>
                <DeltaBadge value={delta} />
              </div>
              <p className="mt-3 text-2xl font-semibold tabular-nums text-nursery-midnight">{format(row.current)}</p>
              <p className="text-sm text-nursery-midnight/55">Last: {format(row.prior)}</p>
              <div className="mt-3 grid gap-1.5">
                <div className="h-2 rounded-full bg-white">
                  <div className="h-full rounded-full bg-nursery-terracotta" style={{ width: `${Math.min((row.current / Math.max(row.current, row.prior, 1)) * 100, 100)}%` }} />
                </div>
                <div className="h-2 rounded-full bg-white">
                  <div className="h-full rounded-full bg-nursery-sage" style={{ width: `${Math.min((row.prior / Math.max(row.current, row.prior, 1)) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MiniDonutPreview() {
  return (
    <PreviewShell>
      <PreviewTitle text="Donut" />
      <div className="mx-auto h-14 w-14 rounded-full bg-[conic-gradient(#1a2f23_0_35%,#8ba888_35%_60%,#c05d33_60%_82%,#daa520_82%_100%)]">
        <div className="m-3 h-8 w-8 rounded-full bg-white" />
      </div>
    </PreviewShell>
  );
}

function MiniAreaPreview() {
  return (
    <PreviewShell>
      <PreviewTitle text="Area" />
      <svg viewBox="0 0 160 60" className="h-14 w-full">
        <polygon points="0,55 20,42 50,48 80,24 110,30 150,10 160,55" fill="#8ba888" opacity="0.25" />
        <polyline points="20,42 50,48 80,24 110,30 150,10" fill="none" stroke="#c05d33" strokeWidth="4" />
      </svg>
    </PreviewShell>
  );
}

function MiniFunnelPreview() {
  return (
    <PreviewShell>
      <PreviewTitle text="Funnel" />
      <div className="space-y-1.5">
        {[100, 82, 58, 36].map((width) => (
          <div key={width} className="mx-auto h-2.5 rounded bg-nursery-terracotta/70" style={{ width: `${width}%` }} />
        ))}
      </div>
    </PreviewShell>
  );
}

const ZOHO_WIDGETS: WidgetDef[] = [
  {
    key: 'zoho-revenue-month',
    name: 'Revenue This Month',
    category: 'Financial',
    tooltip: 'Standard KPI for current-month invoice revenue with a delta against last month.',
    colSpan: 1,
    MiniPreview: () => <PreviewShell><PreviewTitle text="Revenue This Month" /><PreviewStatBig value="$0k" sub="vs. last month" /></PreviewShell>,
    Widget: ({ data }) => (
      <StatWidget
        label="Revenue This Month"
        value={currency.format(data.metrics.revenueThisMonth)}
        note={`vs. last month ${pct(data.metrics.revenueDelta)}`}
        icon={DollarSign}
        tone={data.metrics.revenueDelta >= 0 ? 'sage' : 'terracotta'}
      />
    ),
  },
  {
    key: 'zoho-lead-conversion',
    name: 'Lead Conversion Rate',
    category: 'Sales Pipeline',
    tooltip: 'Growth-index KPI showing accepted quotes divided by total leads, compared with the prior period.',
    colSpan: 1,
    MiniPreview: () => <PreviewShell><PreviewTitle text="Lead Conversion" /><div className="mx-auto h-14 w-14 rounded-full border-[10px] border-nursery-sage border-r-nursery-terracotta" /></PreviewShell>,
    Widget: ({ data }) => (
      <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-nursery-midnight">Lead Conversion Rate</h2>
          <Sprout className="h-4 w-4 text-nursery-sage" />
        </div>
        <div className="mt-5 flex items-center gap-5">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full bg-[conic-gradient(#c05d33_var(--fill),#e7ded1_var(--fill)_100%)]"
            style={{ '--fill': `${Math.min(data.metrics.leadConversionRate, 100)}%` } as React.CSSProperties & Record<'--fill', string>}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-xl font-bold text-nursery-midnight">{plainPct(data.metrics.leadConversionRate)}</div>
          </div>
          <div>
            <DeltaBadge value={data.metrics.leadConversionRate - data.metrics.priorLeadConversionRate} />
            <p className="mt-2 text-sm text-nursery-midnight/60">Prior period: {plainPct(data.metrics.priorLeadConversionRate)}</p>
          </div>
        </div>
      </section>
    ),
  },
  {
    key: 'zoho-business-health',
    name: 'Business Health',
    category: 'Quick Stats',
    tooltip: 'Scorecard KPI with four operating values: open quotes, active service jobs, unpaid balance, and low-stock count.',
    colSpan: 2,
    MiniPreview: () => <PreviewShell><PreviewTitle text="Business Health" /><PreviewGrid cols={2} rows={2} /></PreviewShell>,
    Widget: ({ data }) => (
      <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-nursery-midnight">Business Health</h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            ['Open Quotes', data.metrics.openQuotes],
            ['Active Jobs', data.metrics.activeServiceJobs],
            ['Unpaid Balance', currency.format(data.metrics.unpaidBalance)],
            ['Low Stock', data.metrics.lowStock],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-[#f7f3ea] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-nursery-midnight/50">{label}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-nursery-midnight">{value}</p>
            </div>
          ))}
        </div>
      </section>
    ),
  },
  {
    key: 'zoho-sales-rankings',
    name: 'Top Sales Categories',
    category: 'Financial',
    tooltip: 'Rankings KPI for line-item categories by total sales revenue.',
    colSpan: 1,
    MiniPreview: () => <PreviewShell><PreviewTitle text="Top Sales Categories" /><PreviewHBars rows={[90, 70, 48, 28]} /></PreviewShell>,
    Widget: ({ data }) => <ChartWidget title="Top Sales Categories" items={data.charts.salesByCategory} fmt={currency.format} icon={BarChart3} />,
  },
  {
    key: 'zoho-revenue-target',
    name: 'Monthly Revenue Goal',
    category: 'Financial',
    tooltip: 'Target meter comparing current-month revenue against a $50,000 goal.',
    colSpan: 1,
    MiniPreview: () => <PreviewShell><PreviewTitle text="Revenue Goal" /><SimpleMeter value={60} target={100} /></PreviewShell>,
    Widget: ({ data }) => (
      <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-nursery-midnight">Monthly Revenue Goal</h2>
        <p className="mt-4 text-3xl font-semibold tabular-nums text-nursery-midnight">{currency.format(data.metrics.revenueThisMonth)}</p>
        <p className="mt-1 text-sm text-nursery-midnight/55">Goal: {currency.format(MONTHLY_REVENUE_TARGET)}</p>
        <div className="mt-5"><SimpleMeter value={data.metrics.revenueThisMonth} target={MONTHLY_REVENUE_TARGET} /></div>
      </section>
    ),
  },
  { key: 'zoho-invoice-donut', name: 'Invoice Status Donut', category: 'Financial', tooltip: 'CSS donut chart showing invoice status breakdown.', colSpan: 1, MiniPreview: MiniDonutPreview, Widget: DonutWidget },
  { key: 'zoho-revenue-area', name: 'Revenue Trend Area', category: 'Financial', tooltip: 'Six-month revenue trend rendered as an SVG area chart.', colSpan: 2, MiniPreview: MiniAreaPreview, Widget: AreaChartWidget },
  { key: 'zoho-sales-funnel', name: 'Sales Pipeline Funnel', category: 'Sales Pipeline', tooltip: 'Funnel chart for quote stages from Draft through Accepted.', colSpan: 1, MiniPreview: MiniFunnelPreview, Widget: FunnelWidget },
  {
    key: 'zoho-customer-types',
    name: 'Customer Type Breakdown',
    category: 'Customers',
    tooltip: 'Horizontal bar widget ranking customer types by count.',
    colSpan: 1,
    MiniPreview: () => <PreviewShell><PreviewTitle text="Customer Types" /><PreviewHBars rows={[80, 54, 32, 18]} /></PreviewShell>,
    Widget: ({ data }) => <ChartWidget title="Customer Type Breakdown" items={data.customerTypes.map((row) => ({ label: row.type, value: row.count }))} icon={Users} />,
  },
  {
    key: 'zoho-tasks-week',
    name: 'Open Tasks Due This Week',
    category: 'Operations',
    tooltip: 'Filtered task list for open tasks due by the end of this week.',
    colSpan: 2,
    MiniPreview: () => <PreviewShell><PreviewTitle text="Tasks" /><PreviewList rows={3} badge /></PreviewShell>,
    Widget: ({ data }) => (
      <ListWidget title="Open Tasks Due This Week" href="/crm">
        {data.openTasksDueThisWeek.map((task) => (
          <div key={task.id} className="grid gap-2 px-5 py-4 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center">
            <span className="font-semibold text-nursery-midnight">{task.title}</span>
            <span className="text-nursery-midnight/60">{d(task.dueDate)}</span>
            <span className="rounded-full bg-nursery-sage/15 px-3 py-1 text-xs font-bold text-nursery-midnight">{task.priority}</span>
          </div>
        ))}
      </ListWidget>
    ),
  },
  {
    key: 'zoho-leads-month',
    name: 'Leads Created This Month',
    category: 'Sales Pipeline',
    tooltip: 'Filtered lead list for new leads created during the current month.',
    colSpan: 2,
    MiniPreview: () => <PreviewShell><PreviewTitle text="Leads" /><PreviewList rows={3} badge /></PreviewShell>,
    Widget: ({ data }) => (
      <ListWidget title="Leads Created This Month" href="/crm/leads">
        {data.leadsCreatedThisMonth.map((lead) => (
          <div key={lead.id} className="grid gap-2 px-5 py-4 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center">
            <span className="font-semibold text-nursery-midnight">{lead.title}</span>
            <span className="text-nursery-midnight/60">{lead.source}</span>
            <span className="rounded-full bg-nursery-terracotta/10 px-3 py-1 text-xs font-bold text-nursery-terracotta">{lead.stage}</span>
          </div>
        ))}
      </ListWidget>
    ),
  },
  {
    key: 'zoho-overdue-invoices',
    name: 'Invoices Overdue',
    category: 'Financial',
    tooltip: 'Filtered invoice list for overdue invoice balances.',
    colSpan: 2,
    MiniPreview: () => <PreviewShell><PreviewTitle text="Overdue" /><PreviewList rows={3} badge /></PreviewShell>,
    Widget: ({ data }) => (
      <ListWidget title="Invoices Overdue" href="/crm/invoices">
        {data.overdueInvoices.length === 0 ? <p className="px-5 py-4 text-sm text-nursery-midnight/55">No overdue invoices.</p> : data.overdueInvoices.map((invoice) => (
          <div key={invoice.id} className="grid gap-2 px-5 py-4 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center">
            <span className="font-semibold text-nursery-midnight">{invoice.invoiceNumber} · {invoice.customer.displayName}</span>
            <span className="text-nursery-midnight/60">{d(invoice.dueDate)}</span>
            <span className="font-bold tabular-nums text-nursery-terracotta">{currency.format(invoice.balanceDue)}</span>
          </div>
        ))}
      </ListWidget>
    ),
  },
  { key: 'zoho-lead-stage', name: 'Lead Pipeline Progress', category: 'Sales Pipeline', tooltip: 'Stage component showing lead counts and conversion rate between stages.', colSpan: 2, MiniPreview: MiniFunnelPreview, Widget: StagePipelineWidget },
  { key: 'zoho-month-comparator', name: 'This Month vs. Last Month', category: 'Financial', tooltip: 'Comparator widget for revenue, new leads, quotes sent, and invoices paid.', colSpan: 2, MiniPreview: () => <PreviewShell><PreviewTitle text="Comparator" /><PreviewGrid cols={2} rows={2} /></PreviewShell>, Widget: ComparatorWidget },
  {
    key: 'zoho-activity-expanded',
    name: 'Expanded Activity Feed',
    category: 'Operations',
    tooltip: 'Expanded activity feed with the latest CRM activity.',
    colSpan: 2,
    MiniPreview: () => <PreviewShell><PreviewTitle text="Activity" /><PreviewList rows={4} /></PreviewShell>,
    Widget: ({ data }) => (
      <ListWidget title="Expanded Activity Feed" href="/crm">
        {data.recentActivities.slice(0, 10).map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 px-5 py-4">
            <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-nursery-sage/15 text-nursery-midnight">{activity.type[0]}</span>
            <div>
              <p className="font-semibold text-nursery-midnight">{activity.title}</p>
              <p className="mt-0.5 text-sm text-nursery-midnight/60">{activity.customer?.displayName ?? 'General'} · {activity.details}</p>
            </div>
          </div>
        ))}
      </ListWidget>
    ),
  },
  {
    key: 'zoho-stock-anomaly',
    name: 'Stock Deviation Alerts',
    category: 'Inventory',
    tooltip: 'Anomaly detector for items below expected stock or furthest below reorder point.',
    colSpan: 1,
    MiniPreview: () => <PreviewShell><PreviewTitle text="Anomalies" /><PreviewList rows={3} badge /></PreviewShell>,
    Widget: ({ data }) => (
      <ListWidget title="Stock Deviation Alerts" href="/crm/inventory">
        {data.stockAnomalies.map((item) => (
          <div key={item.id} className="px-5 py-4">
            <p className="font-semibold text-nursery-midnight">{item.itemName}</p>
            <p className="mt-0.5 text-sm text-nursery-midnight/60">{item.locationName} · {item.quantityOnHand} on hand · {plainPct(item.deviation)} below expected</p>
          </div>
        ))}
      </ListWidget>
    ),
  },
  {
    key: 'zoho-customer-cohort',
    name: 'Customer Revenue Cohorts',
    category: 'Customers',
    tooltip: 'Customer revenue grouped by first invoice quarter.',
    colSpan: 2,
    MiniPreview: () => <PreviewShell><PreviewTitle text="Cohort" /><PreviewVBars bars={[30, 80, 45, 68]} /></PreviewShell>,
    Widget: ({ data }) => <ChartWidget title="Customer Revenue by Join Quarter" items={data.customerRevenueByJoinQuarter.map((row) => ({ label: `${row.label} (${row.count})`, value: row.revenue }))} fmt={currency.format} icon={Users} />,
  },
  {
    key: 'zoho-deal-quadrant',
    name: 'Deal Size vs. Lead Age',
    category: 'Sales Pipeline',
    tooltip: 'Quadrant analysis showing open leads by age and quote value.',
    colSpan: 2,
    MiniPreview: () => <PreviewShell><PreviewTitle text="Quadrant" /><PreviewGrid cols={2} rows={2} /></PreviewShell>,
    Widget: ({ data }) => {
      const maxValue = Math.max(...data.dealSizeVsLeadAge.map((lead) => lead.quoteValue), 1);
      return (
        <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-nursery-midnight">Deal Size vs. Lead Age</h2>
          <svg viewBox="0 0 360 220" className="mt-4 h-64 w-full rounded-lg bg-[#f7f3ea]">
            <defs>
              <radialGradient id="dealPointGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#c05d33" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#c05d33" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect x="20" y="20" width="160" height="90" fill="#8ba888" opacity="0.08" rx="8" />
            <rect x="180" y="20" width="160" height="90" fill="#daa520" opacity="0.09" rx="8" />
            <rect x="20" y="110" width="160" height="90" fill="#c05d33" opacity="0.07" rx="8" />
            <rect x="180" y="110" width="160" height="90" fill="#1a2f23" opacity="0.05" rx="8" />
            {[60, 100, 140, 180].map((x) => <line key={`x-${x}`} x1={x} x2={x} y1="20" y2="200" stroke="#1a2f23" strokeOpacity="0.05" />)}
            {[50, 80, 140, 170].map((y) => <line key={`y-${y}`} x1="20" x2="340" y1={y} y2={y} stroke="#1a2f23" strokeOpacity="0.05" />)}
            <line x1="180" x2="180" y1="20" y2="200" stroke="#8ba888" strokeDasharray="4 4" />
            <line x1="20" x2="340" y1="110" y2="110" stroke="#8ba888" strokeDasharray="4 4" />
            {['Quick Wins', 'Nurture', 'Urgent', 'Deprioritize'].map((label, index) => (
              <text key={label} x={index % 2 === 0 ? 28 : 188} y={index < 2 ? 36 : 128} className="fill-nursery-midnight/45 text-[10px] font-bold uppercase">{label}</text>
            ))}
            {data.dealSizeVsLeadAge.map((lead) => (
              <g key={lead.id}>
                <circle cx={20 + Math.min(lead.ageDays, 90) / 90 * 320} cy={200 - lead.quoteValue / maxValue * 170} r="12" fill="url(#dealPointGlow)" />
                <circle cx={20 + Math.min(lead.ageDays, 90) / 90 * 320} cy={200 - lead.quoteValue / maxValue * 170} r="5" fill="#c05d33" stroke="#fff" strokeWidth="2" />
              </g>
            ))}
            <text x="180" y="214" textAnchor="middle" className="fill-nursery-midnight/45 text-[10px] font-bold uppercase">Lead age</text>
            <text x="8" y="112" textAnchor="middle" transform="rotate(-90 8 112)" className="fill-nursery-midnight/45 text-[10px] font-bold uppercase">Quote value</text>
          </svg>
        </section>
      );
    },
  },
  {
    key: 'zoho-service-target',
    name: 'Service Jobs Target',
    category: 'Operations',
    tooltip: 'Target meter comparing service jobs scheduled this month against a target of 20.',
    colSpan: 1,
    MiniPreview: () => <PreviewShell><PreviewTitle text="Service Target" /><SimpleMeter value={45} target={100} /></PreviewShell>,
    Widget: ({ data }) => (
      <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-nursery-midnight">Service Jobs This Month</h2>
        <p className="mt-4 text-3xl font-semibold tabular-nums text-nursery-midnight">{data.metrics.serviceJobsThisMonth}</p>
        <p className="mt-1 text-sm text-nursery-midnight/55">Target: {SERVICE_JOB_TARGET} jobs</p>
        <div className="mt-5"><SimpleMeter value={data.metrics.serviceJobsThisMonth} target={SERVICE_JOB_TARGET} /></div>
      </section>
    ),
  },
  {
    key: 'zoho-delivery-performance',
    name: 'Delivery Performance',
    category: 'Operations',
    tooltip: 'Scorecard for completed deliveries today, on-time rate, and pending deliveries this week.',
    colSpan: 1,
    MiniPreview: () => <PreviewShell><PreviewTitle text="Delivery" /><PreviewStatRow count={3} /></PreviewShell>,
    Widget: ({ data }) => (
      <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-nursery-midnight">Delivery Performance</h2>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-lg bg-[#f7f3ea] p-3"><p className="text-xs text-nursery-midnight/50">Done</p><p className="mt-1 text-xl font-bold">{data.deliveryPerformance.completedToday}</p></div>
          <div className="rounded-lg bg-[#f7f3ea] p-3"><p className="text-xs text-nursery-midnight/50">On Time</p><p className="mt-1 text-xl font-bold">{plainPct(data.deliveryPerformance.onTimeRate)}</p></div>
          <div className="rounded-lg bg-[#f7f3ea] p-3"><p className="text-xs text-nursery-midnight/50">Pending</p><p className="mt-1 text-xl font-bold">{data.deliveryPerformance.pendingThisWeek}</p></div>
        </div>
      </section>
    ),
  },
];

export const WIDGET_CATALOG: WidgetDef[] = [...ZOHO_WIDGETS, ...BASE_WIDGET_CATALOG];
