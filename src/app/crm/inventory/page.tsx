import {
  AlertTriangle,
  Barcode,
  Boxes,
  ClipboardList,
  Leaf,
  MapPin,
  Package,
  PackageCheck,
  Truck,
} from "lucide-react";
import { CrmShell } from "@/components/crm/CrmShell";
import CrmActionButton from "@/components/crm/CrmActionButton";
import { getCrmInventoryData } from "@/lib/crm-inventory";
import { InventoryLookupModal } from "@/components/crm/modals/InventoryLookupModal";

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
  icon: Icon,
  tone = "sage",
}: {
  label: string;
  value: string | number;
  note: string;
  icon: typeof Package;
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
  rows: { label: string; value: number; quantity?: number; count?: number }[];
}) {
  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <section className="rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-nursery-midnight">{title}</h2>
        <Boxes className="h-4 w-4 text-nursery-sage" />
      </div>
      <div className="mt-5 space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-nursery-midnight/75">{row.label}</span>
              <span className="font-semibold tabular-nums text-nursery-midnight">
                {row.quantity ?? row.count ?? 0} · {currency.format(row.value)}
              </span>
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

export default async function InventoryCrmPage({
  searchParams,
}: {
  searchParams: { modal?: string; q?: string };
}) {
  const data = await getCrmInventoryData();

  return (
    <CrmShell active="Inventory" eyebrow="Inventory and Stock" title="Inventory">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric label="Catalog Items" value={data.metrics.itemCount} note="Plants, materials, supplies, and sellable services." icon={Package} tone="sage" />
        <Metric label="On Hand" value={data.metrics.quantityOnHand} note="Total quantity across all stock locations." icon={PackageCheck} tone="midnight" />
        <Metric label="Low Stock" value={data.metrics.lowStockCount} note="Items at or below reorder point." icon={AlertTriangle} tone="terracotta" />
        <Metric label="Inventory Cost" value={currency.format(data.metrics.inventoryValue)} note="Current landed-cost inventory value." icon={Boxes} tone="ochre" />
        <Metric label="Open POs" value={data.metrics.activePurchaseOrders} note="Purchase orders not closed or cancelled." icon={ClipboardList} tone="sage" />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_420px]">
        <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-nursery-sage/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-nursery-midnight">Inventory Catalog</h2>
              <p className="mt-1 text-sm text-nursery-midnight/55">SKU, barcode, category, stock, cost, and reorder state.</p>
            </div>
            <CrmActionButton icon="Barcode" label="Scan / Lookup" href="?modal=inventory-lookup" />
          </div>
          <div className="divide-y divide-nursery-sage/10">
            {data.items.map((item) => (
              <article key={item.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_auto] lg:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-nursery-sage/15 px-3 py-1 text-xs font-bold text-nursery-midnight">{item.category}</span>
                    <span className="rounded-full bg-[#f7f3ea] px-3 py-1 text-xs font-bold text-nursery-midnight/65">{item.sku}</span>
                    {item.lowStock ? <span className="rounded-full bg-nursery-terracotta/10 px-3 py-1 text-xs font-bold text-nursery-terracotta">Reorder</span> : null}
                  </div>
                  <h3 className="mt-3 font-serif text-2xl font-semibold text-nursery-midnight">{item.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-nursery-midnight/65">
                    {item.botanicalName ?? item.itemType} · {item.size ?? "Standard"} · {item.seasonalAvailability ?? "Availability not set"}
                  </p>
                  <div className="mt-4 grid gap-3 text-sm text-nursery-midnight/65 sm:grid-cols-3">
                    <span className="inline-flex items-center gap-2">
                      <Barcode className="h-4 w-4 text-nursery-sage" />
                      {item.barcode ?? "No barcode"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-nursery-sage" />
                      {item.sunExposure ?? item.itemType}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Truck className="h-4 w-4 text-nursery-sage" />
                      Reorder at {item.reorderPoint}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 rounded-lg bg-[#f7f3ea] p-4 text-sm lg:w-56">
                  <div>
                    <p className="text-nursery-midnight/55">On hand</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums text-nursery-midnight">{item.quantityOnHand}</p>
                  </div>
                  <div>
                    <p className="text-nursery-midnight/55">Retail</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums text-nursery-midnight">{currency.format(item.unitPrice)}</p>
                  </div>
                  <div>
                    <p className="text-nursery-midnight/55">Landed</p>
                    <p className="mt-1 font-semibold tabular-nums text-nursery-midnight">{currency.format(item.landedCost)}</p>
                  </div>
                  <div>
                    <p className="text-nursery-midnight/55">Value</p>
                    <p className="mt-1 font-semibold tabular-nums text-nursery-midnight">{currency.format(item.inventoryValue)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-4">
          <BarList title="Inventory by Category" rows={data.categoryTotals} />
          <BarList title="Stock by Location" rows={data.locationTotals.map((location) => ({ label: location.name, quantity: location.quantity, value: location.value }))} />
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
          <div className="border-b border-nursery-sage/15 px-5 py-4">
            <h2 className="text-base font-bold text-nursery-midnight">Low-Stock Exceptions</h2>
          </div>
          <div className="divide-y divide-nursery-sage/10">
            {data.lowStockItems.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-semibold text-nursery-midnight">{item.name}</p>
                  <p className="mt-1 text-sm text-nursery-midnight/60">{item.quantityOnHand} on hand · reorder point {item.reorderPoint}</p>
                </div>
                <span className="rounded-full bg-nursery-terracotta/10 px-3 py-1 text-xs font-bold text-nursery-terracotta">Reorder</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-nursery-sage/20 bg-white shadow-sm">
          <div className="border-b border-nursery-sage/15 px-5 py-4">
            <h2 className="text-base font-bold text-nursery-midnight">Open Purchase Orders</h2>
          </div>
          <div className="divide-y divide-nursery-sage/10">
            {data.purchaseOrders.map((po) => (
              <div key={po.id} className="px-5 py-4">
                <p className="font-semibold text-nursery-midnight">{po.poNumber} · {po.vendor.name}</p>
                <p className="mt-1 text-sm text-nursery-midnight/60">{po.status} · {po.lines.length} lines · expected {po.expectedDate?.toLocaleDateString("en-US") ?? "not scheduled"}</p>
                <p className="mt-2 font-semibold tabular-nums text-nursery-midnight">{currency.format(po.total)}</p>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="mt-6 rounded-lg border border-nursery-sage/20 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-nursery-sage" />
          <h2 className="text-base font-bold text-nursery-midnight">Inventory Scope</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-nursery-midnight/65">
          This module now tracks catalog items, SKUs, barcodes, stock locations, low-stock exceptions, landed cost, retail value, damaged stock fields, and open vendor purchase orders.
        </p>
      </section>
      {searchParams.modal === 'inventory-lookup' && <InventoryLookupModal closeHref="/crm/inventory" q={searchParams.q} />}
    </CrmShell>
  );
}
