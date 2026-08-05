import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { CrmModal } from '@/components/crm/CrmModal';
import { SubmitButton } from '@/components/crm/SubmitButton';
import { createPurchaseOrder } from '@/actions/vendors';

const field = 'mt-1 w-full rounded-lg border border-nursery-sage/25 bg-[#f7f3ea] px-3 py-2.5 text-sm text-nursery-midnight outline-none focus:border-nursery-sage/60 focus:bg-white transition';
const label = 'block text-xs font-bold uppercase tracking-[0.14em] text-nursery-midnight/50';

export async function NewPurchaseOrderModal({ closeHref }: { closeHref: string }) {
  const vendors = await prisma.vendor.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  return (
    <CrmModal title="New Purchase Order" closeHref={closeHref}>
      <form action={createPurchaseOrder}>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className={label}>Vendor <span className="text-nursery-terracotta">*</span></label>
            <select name="vendorId" required className={field}>
              <option value="">Select vendor…</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Expected Date</label>
              <input name="expectedDate" type="date" className={field} />
            </div>
            <div>
              <label className={label}>Freight</label>
              <input name="freight" type="number" min="0" step="0.01" placeholder="0.00" className={field} />
            </div>
          </div>
          <p className="rounded-lg bg-nursery-sage/10 px-4 py-3 text-sm text-nursery-midnight/65">
            PO number is generated automatically. Add line items after creating the order.
          </p>
        </div>
        <div className="flex justify-end gap-3 border-t border-nursery-sage/15 px-6 py-4">
          <Link href={closeHref} className="rounded-lg px-4 py-2 text-sm font-semibold text-nursery-midnight/55 transition hover:text-nursery-midnight">Cancel</Link>
          <SubmitButton label="Create PO" />
        </div>
      </form>
    </CrmModal>
  );
}
