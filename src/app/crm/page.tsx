import Link from "next/link";
import { getCrmCommandCenterData } from "@/lib/crm-dashboard";
import { CrmShell } from "@/components/crm/CrmShell";
import CommandCenterWidgets, { WidgetViewControls } from "@/components/crm/CommandCenterWidgets";

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function CrmCommandCenter() {
  const data = await getCrmCommandCenterData();
  const topThingsToDo = [
    ...data.followUpsDueToday.map((task) => ({
      id: `task-${task.id}`,
      href: task.lead ? `/crm/leads?id=${task.lead.id}` : "/crm/leads",
      label: task.title,
      context: `${task.customer?.displayName ?? "No customer"} · ${task.type}`,
      badge: task.priority,
      tone: "urgent" as const,
    })),
    ...data.customerRequests.map((lead) => ({
      id: `lead-${lead.id}`,
      href: `/crm/leads?id=${lead.id}`,
      label: lead.title,
      context: `${lead.customer?.displayName ?? "Unlinked customer"} · ${lead.stage}`,
      badge: lead.priority,
      tone: "sales" as const,
    })),
    ...data.unpaidInvoices.map((invoice) => ({
      id: `invoice-${invoice.id}`,
      href: `/crm/invoices?id=${invoice.id}`,
      label: `Collect ${currency.format(invoice.balanceDue)}`,
      context: `${invoice.customer.displayName} · ${invoice.invoiceNumber}`,
      badge: invoice.status,
      tone: "money" as const,
    })),
    ...data.lowStock.map((stock) => ({
      id: `stock-${stock.id}`,
      href: "/crm/inventory",
      label: `Reorder ${stock.inventoryItem.name}`,
      context: `${stock.location.name} · ${stock.quantityOnHand} on hand`,
      badge: "Low stock",
      tone: "inventory" as const,
    })),
    ...data.deliveriesToday.map((delivery) => ({
      id: `delivery-${delivery.id}`,
      href: "/crm/deliveries",
      label: `Confirm delivery`,
      context: `${delivery.customer.displayName} · ${delivery.routeName ?? "Route pending"}`,
      badge: delivery.status,
      tone: "operations" as const,
    })),
    ...data.notifications.map((notification) => ({
      id: `notification-${notification.id}`,
      href: "/crm",
      label: notification.title,
      context: notification.body,
      badge: notification.type,
      tone: "alert" as const,
    })),
  ].slice(0, 12);

  const toneClass = {
    urgent: "border-nursery-terracotta/25 bg-nursery-terracotta/10 text-nursery-terracotta",
    sales: "border-nursery-sage/25 bg-nursery-sage/10 text-nursery-midnight",
    money: "border-[#daa520]/25 bg-[#daa520]/10 text-nursery-midnight",
    inventory: "border-nursery-midnight/15 bg-nursery-midnight/5 text-nursery-midnight",
    operations: "border-nursery-sage/25 bg-white text-nursery-midnight",
    alert: "border-nursery-terracotta/20 bg-white text-nursery-terracotta",
  };

  return (
    <CrmShell active="Command Center" eyebrow="Small Business CRM" title="Command Center">
      <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-nursery-terracotta">Today at Jimbo&apos;s</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-nursery-midnight">
              Your command center is built into this page.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-nursery-midnight/65">
              Track sales, leads, invoices, inventory, service work, and delivery performance from one configurable dashboard.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-nursery-sage/10 p-4">
              <p className="text-nursery-midnight/55">Unread alerts</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{data.notifications.length}</p>
            </div>
            <div className="rounded-lg bg-nursery-terracotta/10 p-4">
              <p className="text-nursery-midnight/55">Balance due</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">
                {currency.format(data.metrics.unpaidBalance)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-nursery-sage/15 bg-[#f7f3ea]">
          <div className="flex items-center gap-3 border-b border-nursery-sage/15 bg-white/70 px-4 py-2">
            <p className="shrink-0 text-xs font-bold uppercase tracking-[0.18em] text-nursery-terracotta">Top Things To Do</p>
            <span className="h-px flex-1 bg-nursery-sage/20" />
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold tabular-nums text-nursery-midnight/60">
              {topThingsToDo.length} items
            </span>
          </div>
          {topThingsToDo.length === 0 ? (
            <div className="px-4 py-3 text-sm font-semibold text-nursery-midnight/55">
              Nothing urgent is waiting right now.
            </div>
          ) : (
            <div className="crm-ticker-mask">
              <div className="crm-ticker-track">
                {[...topThingsToDo, ...topThingsToDo].map((item, index) => (
                  <Link key={`${item.id}-${index}`} href={item.href} className="crm-ticker-item crm-ticker-item--link">
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${toneClass[item.tone]}`}>
                      {item.badge}
                    </span>
                    <span className="font-bold text-nursery-midnight">{item.label}</span>
                    <span className="text-nursery-midnight/45">{item.context}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-nursery-sage/20 bg-[#efe8db] p-4 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-nursery-sage/20 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-nursery-midnight/45">Dashboard Widgets</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-nursery-midnight">Command Center Widgets</h2>
          </div>
          <WidgetViewControls />
        </div>
        <CommandCenterWidgets data={data} />
      </section>

    </CrmShell>
  );
}
