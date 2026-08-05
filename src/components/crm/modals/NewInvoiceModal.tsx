import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { CrmModal } from '@/components/crm/CrmModal';
import { SubmitButton } from '@/components/crm/SubmitButton';
import { createInvoice } from '@/actions/commerce';

const field = 'mt-1 w-full rounded-lg border border-nursery-sage/25 bg-[#f7f3ea] px-3 py-2.5 text-sm text-nursery-midnight outline-none focus:border-nursery-sage/60 focus:bg-white transition';
const label = 'block text-xs font-bold uppercase tracking-[0.14em] text-nursery-midnight/50';

export async function NewInvoiceModal({ closeHref }: { closeHref: string }) {
  const [customers, orders] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { displayName: 'asc' },
      select: { id: true, displayName: true },
    }),
    prisma.salesOrder.findMany({
      where: { status: 'Open' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, orderNumber: true, customer: { select: { displayName: true } } },
    }),
  ]);

  return (
    <CrmModal title="New Invoice" closeHref={closeHref}>
      <form action={createInvoice}>
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
          <div>
            <label className={label}>Linked Order</label>
            <select name="orderId" className={field}>
              <option value="">— None —</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>{o.orderNumber} · {o.customer.displayName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Due Date</label>
            <input name="dueDate" type="date" className={field} />
          </div>
          <p className="rounded-lg bg-nursery-sage/10 px-4 py-3 text-sm text-nursery-midnight/65">
            Invoice number is generated automatically. Add line items and record payments after creating.
          </p>
        </div>
        <div className="flex justify-end gap-3 border-t border-nursery-sage/15 px-6 py-4">
          <Link href={closeHref} className="rounded-lg px-4 py-2 text-sm font-semibold text-nursery-midnight/55 transition hover:text-nursery-midnight">Cancel</Link>
          <SubmitButton label="Create Invoice" />
        </div>
      </form>
    </CrmModal>
  );
}
