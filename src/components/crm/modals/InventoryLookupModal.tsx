import Link from 'next/link';
import { Search } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { CrmModal } from '@/components/crm/CrmModal';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export async function InventoryLookupModal({ closeHref, q }: { closeHref: string; q?: string }) {
  const items = q
    ? await prisma.inventoryItem.findMany({
        where: {
          OR: [
            { sku: { contains: q } },
            { barcode: { contains: q } },
            { name: { contains: q } },
          ],
        },
        include: {
          stockLevels: { include: { location: { select: { name: true } } } },
        },
        take: 12,
      })
    : [];

  return (
    <CrmModal title="Scan / Lookup" closeHref={closeHref}>
      <div className="px-6 py-5">
        <form method="get" action="/crm/inventory" className="flex gap-2">
          <input type="hidden" name="modal" value="inventory-lookup" />
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nursery-midnight/40" />
            <input
              name="q"
              defaultValue={q}
              autoFocus
              placeholder="SKU, barcode, or plant name…"
              className="w-full rounded-lg border border-nursery-sage/25 bg-[#f7f3ea] py-2.5 pl-9 pr-3 text-sm text-nursery-midnight outline-none focus:border-nursery-sage/60 focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-nursery-midnight px-4 py-2 text-sm font-bold text-nursery-ivory transition hover:bg-nursery-terracotta"
          >
            Search
          </button>
        </form>

        {q && items.length === 0 && (
          <p className="mt-6 text-center text-sm text-nursery-midnight/55">No items matching &ldquo;{q}&rdquo;.</p>
        )}

        {items.length > 0 && (
          <div className="mt-4 divide-y divide-nursery-sage/10">
            {items.map((item) => {
              const totalOnHand = item.stockLevels.reduce((s, l) => s + l.quantityOnHand, 0);
              return (
                <div key={item.id} className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-nursery-midnight">{item.name}</p>
                      <p className="mt-0.5 text-xs text-nursery-midnight/55">{item.sku}{item.barcode ? ` · ${item.barcode}` : ''} · {item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums text-nursery-midnight">{currency.format(item.unitPrice)}</p>
                      <p className="mt-0.5 text-xs text-nursery-midnight/55">{totalOnHand} on hand</p>
                    </div>
                  </div>
                  {item.stockLevels.length > 1 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.stockLevels.map((sl) => (
                        <span key={sl.id} className="rounded-full bg-nursery-sage/10 px-2 py-0.5 text-xs text-nursery-midnight/65">
                          {sl.location.name}: {sl.quantityOnHand}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!q && (
          <p className="mt-8 text-center text-sm text-nursery-midnight/45">Enter a SKU, barcode, or plant name to search inventory.</p>
        )}
      </div>
      <div className="border-t border-nursery-sage/15 px-6 py-4 text-right">
        <Link href={closeHref} className="rounded-lg px-4 py-2 text-sm font-semibold text-nursery-midnight/55 transition hover:text-nursery-midnight">Close</Link>
      </div>
    </CrmModal>
  );
}
