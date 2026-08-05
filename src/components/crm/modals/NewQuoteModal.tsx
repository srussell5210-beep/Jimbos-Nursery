import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { CrmModal } from '@/components/crm/CrmModal';
import { SubmitButton } from '@/components/crm/SubmitButton';
import { createQuote } from '@/actions/commerce';

const field = 'mt-1 w-full rounded-lg border border-nursery-sage/25 bg-[#f7f3ea] px-3 py-2.5 text-sm text-nursery-midnight outline-none focus:border-nursery-sage/60 focus:bg-white transition';
const label = 'block text-xs font-bold uppercase tracking-[0.14em] text-nursery-midnight/50';

export async function NewQuoteModal({ closeHref }: { closeHref: string }) {
  const customers = await prisma.customer.findMany({
    orderBy: { displayName: 'asc' },
    select: { id: true, displayName: true },
  });

  return (
    <CrmModal title="New Quote" closeHref={closeHref}>
      <form action={createQuote}>
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
              <label className={label}>Stage</label>
              <select name="stage" defaultValue="Draft" className={field}>
                <option>Draft</option>
                <option>Sent</option>
                <option>Under Review</option>
                <option>Approved</option>
              </select>
            </div>
            <div>
              <label className={label}>Deposit Required</label>
              <input name="depositRequired" type="number" min="0" step="0.01" placeholder="0.00" className={field} />
            </div>
          </div>
          <div>
            <label className={label}>Notes</label>
            <textarea name="notes" rows={3} placeholder="Quote scope, special instructions…" className={field} />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-nursery-sage/15 px-6 py-4">
          <Link href={closeHref} className="rounded-lg px-4 py-2 text-sm font-semibold text-nursery-midnight/55 transition hover:text-nursery-midnight">Cancel</Link>
          <SubmitButton label="Create Quote" />
        </div>
      </form>
    </CrmModal>
  );
}
