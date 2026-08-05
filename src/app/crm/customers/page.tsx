import {
  BadgeCheck,
  CalendarDays,
  FileText,
  Home,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sprout,
  Truck,
  UserPlus,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { CrmShell } from "@/components/crm/CrmShell";
import CrmActionButton from "@/components/crm/CrmActionButton";
import { getCrmCustomerDirectoryData } from "@/lib/crm-customers";
import { NewCustomerModal } from "@/components/crm/modals/NewCustomerModal";

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-nursery-midnight/50">{label}</p>
      <p className="mt-3 text-3xl font-semibold tabular-nums text-nursery-midnight">{value}</p>
      <p className="mt-3 text-sm leading-6 text-nursery-midnight/60">{note}</p>
    </section>
  );
}

function Pill({ children, tone = "sage" }: { children: ReactNode; tone?: "sage" | "terracotta" | "ochre" }) {
  const tones = {
    sage: "bg-nursery-sage/15 text-nursery-midnight",
    terracotta: "bg-nursery-terracotta/10 text-nursery-terracotta",
    ochre: "bg-nursery-ochre/15 text-nursery-midnight",
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

function DetailSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Users;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-nursery-sage/15 px-5 py-4">
        <Icon className="h-4 w-4 text-nursery-sage" />
        <h2 className="text-base font-bold text-nursery-midnight">{title}</h2>
      </div>
      <div className="divide-y divide-nursery-sage/10">{children}</div>
    </section>
  );
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { id?: string; modal?: string };
}) {
  const data = await getCrmCustomerDirectoryData(searchParams.id);
  const selected = data.selectedCustomer;

  return (
    <CrmShell active="Customers" eyebrow="Customer Database" title="Customers">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric label="Total Customers" value={data.metrics.totalCustomers} note="Companies, homeowners, vendors, and public-sector buyers." />
        <Metric label="Active" value={data.metrics.activeRelationships} note="Current relationships with sales or service potential." />
        <Metric label="Contract Accounts" value={data.metrics.contractorAccounts} note="Contractor, wholesale, municipal, and property accounts." />
        <Metric label="Open Balance" value={currency.format(data.metrics.openBalance)} note="Outstanding invoice balances across customers." />
        <Metric label="Opted In" value={data.metrics.consentReady} note="Ready for future email, SMS, or marketing workflows." />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[0.95fr_1.35fr]">
        <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-nursery-sage/15 px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-nursery-midnight">Customer Directory</h2>
              <p className="mt-1 text-sm text-nursery-midnight/55">Sorted by current account value.</p>
            </div>
            <CrmActionButton icon="UserPlus" label="New Customer" href="?modal=new-customer" />
          </div>
          <div className="grid grid-cols-3 gap-2 border-b border-nursery-sage/15 p-4 text-sm">
            {data.typeCounts.slice(0, 3).map((type) => (
              <div key={type.label} className="rounded-lg bg-[#f7f3ea] p-3">
                <p className="text-xs leading-5 text-nursery-midnight/55">{type.label}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-nursery-midnight">{type.value}</p>
              </div>
            ))}
          </div>
          <div className="divide-y divide-nursery-sage/10">
            {data.customers.map((customer) => {
              const isSelected = customer.id === selected?.id;
              return (
                <Link
                  key={customer.id}
                  href={`/crm/customers?id=${customer.id}`}
                  className={`block px-5 py-4 transition hover:bg-nursery-sage/5 ${isSelected ? "bg-nursery-sage/10" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-nursery-midnight">{customer.displayName}</h3>
                      <p className="mt-1 text-sm text-nursery-midnight/60">{customer.type}</p>
                    </div>
                    <span className={`mt-1 h-2 w-2 rounded-full ${isSelected ? "bg-nursery-terracotta" : "bg-nursery-sage/30"}`} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-nursery-midnight/65">
                    <span className="inline-flex min-w-0 max-w-full items-center gap-2">
                      <Mail className="h-4 w-4 text-nursery-sage" />
                      <span className="truncate">{customer.primaryContact?.email ?? customer.email ?? "No email"}</span>
                    </span>
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <Phone className="h-4 w-4 text-nursery-sage" />
                      {customer.primaryContact?.phone ?? customer.phone ?? "No phone"}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Pill>{customer.status}</Pill>
                    {customer.taxExempt ? <Pill tone="ochre">Tax Exempt</Pill> : null}
                    {customer.balanceDue > 0 ? <Pill tone="terracotta">{currency.format(customer.balanceDue)} due</Pill> : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {selected ? (
          <section className="space-y-4">
            <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-nursery-terracotta">{selected.type}</p>
                  <h2 className="mt-2 font-serif text-3xl font-semibold text-nursery-midnight">{selected.displayName}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-nursery-midnight/65">
                    {selected.plantPreferences ?? "No plant preferences recorded yet."}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm lg:w-72">
                  <div className="rounded-lg bg-nursery-sage/10 p-4">
                    <p className="text-nursery-midnight/55">Revenue</p>
                    <p className="mt-2 text-2xl font-semibold tabular-nums">{currency.format(selected.revenue)}</p>
                  </div>
                  <div className="rounded-lg bg-nursery-terracotta/10 p-4">
                    <p className="text-nursery-midnight/55">Balance</p>
                    <p className="mt-2 text-2xl font-semibold tabular-nums">{currency.format(selected.balanceDue)}</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Pill>{selected.loyaltyTier} loyalty</Pill>
                <Pill>{selected.loyaltyPoints} points</Pill>
                {selected.priceList ? <Pill tone="ochre">{selected.priceList}</Pill> : null}
                {selected.emailOptIn ? <Pill>Email opt-in</Pill> : null}
                {selected.smsOptIn ? <Pill>SMS opt-in</Pill> : null}
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              <DetailSection title="Contacts" icon={Users}>
                {selected.contacts.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-nursery-midnight/60">No contacts yet.</p>
                ) : (
                  selected.contacts.map((contact) => (
                    <div key={contact.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-nursery-midnight">{contact.name}</p>
                          <p className="mt-1 text-sm text-nursery-midnight/60">{contact.role ?? "Contact"} · {contact.email ?? "No email"}</p>
                        </div>
                        {contact.isPrimary ? <Pill>Primary</Pill> : null}
                      </div>
                    </div>
                  ))
                )}
              </DetailSection>

              <DetailSection title="Properties / Job Sites" icon={Home}>
                {selected.properties.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-nursery-midnight/60">No properties yet.</p>
                ) : (
                  selected.properties.map((property) => (
                    <div key={property.id} className="px-5 py-4">
                      <p className="font-semibold text-nursery-midnight">{property.label}</p>
                      <p className="mt-1 flex items-start gap-2 text-sm text-nursery-midnight/60">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-nursery-sage" />
                        {property.address}
                      </p>
                      {property.deliveryInstructions ? (
                        <p className="mt-2 text-sm text-nursery-midnight/60">{property.deliveryInstructions}</p>
                      ) : null}
                    </div>
                  ))
                )}
              </DetailSection>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
              <DetailSection title="Pipeline" icon={Sprout}>
                <div className="px-5 py-4">
                  <p className="font-semibold text-nursery-midnight">{selected.openQuotes} open quotes</p>
                  <p className="mt-1 text-sm text-nursery-midnight/60">{selected.openOrders} open orders · {selected.leads.length} leads tracked</p>
                </div>
              </DetailSection>

              <DetailSection title="Service / Delivery" icon={Truck}>
                <div className="px-5 py-4">
                  <p className="font-semibold text-nursery-midnight">{selected.serviceJobs.length} service jobs</p>
                  <p className="mt-1 text-sm text-nursery-midnight/60">{selected.deliveries.length} deliveries linked to this customer.</p>
                </div>
              </DetailSection>

              <DetailSection title="Compliance" icon={ShieldCheck}>
                <div className="px-5 py-4">
                  <p className="font-semibold text-nursery-midnight">{selected.taxExempt ? "Tax exempt" : "Standard tax rules"}</p>
                  <p className="mt-1 text-sm text-nursery-midnight/60">{selected.taxCertificateNumber ?? "No tax certificate on file."}</p>
                </div>
              </DetailSection>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              <DetailSection title="Open Tasks" icon={CalendarDays}>
                {selected.tasks.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-nursery-midnight/60">No open tasks.</p>
                ) : (
                  selected.tasks.map((task) => (
                    <div key={task.id} className="px-5 py-4">
                      <p className="font-semibold text-nursery-midnight">{task.title}</p>
                      <p className="mt-1 text-sm text-nursery-midnight/60">{task.type} · {task.priority}</p>
                    </div>
                  ))
                )}
              </DetailSection>

              <DetailSection title="Recent Activity" icon={BadgeCheck}>
                {selected.activities.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-nursery-midnight/60">No activity yet.</p>
                ) : (
                  selected.activities.map((activity) => (
                    <div key={activity.id} className="px-5 py-4">
                      <p className="font-semibold text-nursery-midnight">{activity.title}</p>
                      <p className="mt-1 text-sm text-nursery-midnight/60">{activity.details}</p>
                    </div>
                  ))
                )}
              </DetailSection>
            </section>

            <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-nursery-sage" />
                <h2 className="text-base font-bold text-nursery-midnight">Customer Record Scope</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-nursery-midnight/65">
                This page is wired for the records the nursery owner needs first: customer type, contacts, job sites, pricing list, tax status, consent, loyalty, quotes, orders, invoices, tasks, service work, deliveries, warranties, and activity history.
              </p>
            </section>
          </section>
        ) : (
          <section className="rounded-lg border border-nursery-sage/20 bg-white p-6 text-sm text-nursery-midnight/60 shadow-sm">
            No customers found.
          </section>
        )}
      </section>
      {searchParams.modal === 'new-customer' && <NewCustomerModal closeHref="/crm/customers" />}
    </CrmShell>
  );
}
