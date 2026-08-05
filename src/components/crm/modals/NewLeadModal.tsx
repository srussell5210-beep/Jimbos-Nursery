import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { CrmModal } from '@/components/crm/CrmModal';
import { SubmitButton } from '@/components/crm/SubmitButton';
import { createLead } from '@/actions/leads';

const field = 'mt-1 w-full rounded-lg border border-nursery-sage/25 bg-[#f7f3ea] px-3 py-2.5 text-sm text-nursery-midnight outline-none focus:border-nursery-sage/60 focus:bg-white transition';
const label = 'block text-xs font-bold uppercase tracking-[0.14em] text-nursery-midnight/50';

export async function NewLeadModal({ closeHref }: { closeHref: string }) {
  const customers = await prisma.customer.findMany({
    orderBy: { displayName: 'asc' },
    select: { id: true, displayName: true },
  });

  return (
    <CrmModal title="New Lead" closeHref={closeHref}>
      <form action={createLead}>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className={label}>Lead Title <span className="text-nursery-terracotta">*</span></label>
            <input name="title" required placeholder="Spring planting consultation" className={field} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Source <span className="text-nursery-terracotta">*</span></label>
              <select name="source" className={field}>
                <option>Walk-in</option>
                <option>Referral</option>
                <option>Social Media</option>
                <option>Website</option>
                <option>Returning Customer</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className={label}>Priority</label>
              <select name="priority" defaultValue="Normal" className={field}>
                <option>High</option>
                <option>Normal</option>
                <option>Low</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Stage</label>
              <select name="stage" defaultValue="New" className={field}>
                <option>New</option>
                <option>Contacted</option>
                <option>Qualified</option>
                <option>Proposal Sent</option>
                <option>Negotiating</option>
              </select>
            </div>
            <div>
              <label className={label}>Estimated Value</label>
              <input name="estimatedValue" type="number" min="0" step="0.01" placeholder="0.00" className={field} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Customer</label>
              <select name="customerId" className={field}>
                <option value="">— None —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.displayName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Due Date</label>
              <input name="dueDate" type="date" className={field} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-nursery-sage/15 px-6 py-4">
          <Link href={closeHref} className="rounded-lg px-4 py-2 text-sm font-semibold text-nursery-midnight/55 transition hover:text-nursery-midnight">Cancel</Link>
          <SubmitButton label="Create Lead" />
        </div>
      </form>
    </CrmModal>
  );
}
