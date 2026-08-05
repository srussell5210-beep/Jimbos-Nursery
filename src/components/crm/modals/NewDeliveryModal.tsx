import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { CrmModal } from '@/components/crm/CrmModal';
import { SubmitButton } from '@/components/crm/SubmitButton';
import { createDelivery } from '@/actions/deliveries';

const field = 'mt-1 w-full rounded-lg border border-nursery-sage/25 bg-[#f7f3ea] px-3 py-2.5 text-sm text-nursery-midnight outline-none focus:border-nursery-sage/60 focus:bg-white transition';
const label = 'block text-xs font-bold uppercase tracking-[0.14em] text-nursery-midnight/50';

export async function NewDeliveryModal({ closeHref }: { closeHref: string }) {
  const customers = await prisma.customer.findMany({
    orderBy: { displayName: 'asc' },
    select: { id: true, displayName: true },
  });

  return (
    <CrmModal title="Plan Route Stop" closeHref={closeHref}>
      <form action={createDelivery}>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className={label}>Customer <span className="text-nursery-terracotta">*</span></label>
            <select name="customerId" required className={field}>
              <option value="">Select customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.displayName}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Scheduled Date</label>
              <input name="scheduledFor" type="date" className={field} />
            </div>
            <div>
              <label className={label}>Delivery Window</label>
              <select name="deliveryWindow" className={field}>
                <option value="">— Not set —</option>
                <option>Morning</option>
                <option>Afternoon</option>
                <option>All Day</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Route Name</label>
              <input name="routeName" placeholder="North Route A" className={field} />
            </div>
            <div>
              <label className={label}>Driver</label>
              <input name="driverName" placeholder="Driver name" className={field} />
            </div>
          </div>
          <div>
            <label className={label}>Truck</label>
            <input name="truckName" placeholder="Truck 1 / F-250" className={field} />
          </div>
          <div>
            <label className={label}>Notes</label>
            <textarea name="notes" rows={2} placeholder="Gate code, access notes…" className={field} />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-nursery-sage/15 px-6 py-4">
          <Link href={closeHref} className="rounded-lg px-4 py-2 text-sm font-semibold text-nursery-midnight/55 transition hover:text-nursery-midnight">Cancel</Link>
          <SubmitButton label="Add to Route" />
        </div>
      </form>
    </CrmModal>
  );
}
