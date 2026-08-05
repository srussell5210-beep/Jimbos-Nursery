import Link from 'next/link';
import { CrmModal } from '@/components/crm/CrmModal';
import { SubmitButton } from '@/components/crm/SubmitButton';
import { createCustomer } from '@/actions/customers';

const field = 'mt-1 w-full rounded-lg border border-nursery-sage/25 bg-[#f7f3ea] px-3 py-2.5 text-sm text-nursery-midnight outline-none focus:border-nursery-sage/60 focus:bg-white transition';
const label = 'block text-xs font-bold uppercase tracking-[0.14em] text-nursery-midnight/50';

export function NewCustomerModal({ closeHref }: { closeHref: string }) {
  return (
    <CrmModal title="New Customer" closeHref={closeHref}>
      <form action={createCustomer}>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className={label}>Name <span className="text-nursery-terracotta">*</span></label>
            <input name="displayName" required placeholder="Jimbo Smith" className={field} />
          </div>
          <div>
            <label className={label}>Type <span className="text-nursery-terracotta">*</span></label>
            <select name="type" defaultValue="Individual" className={field}>
              <option>Individual</option>
              <option>Business</option>
              <option>Contractor</option>
              <option>Wholesale</option>
              <option>Municipal</option>
              <option>Other</option>
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Email</label>
              <input name="email" type="email" placeholder="email@example.com" className={field} />
            </div>
            <div>
              <label className={label}>Phone</label>
              <input name="phone" type="tel" placeholder="(512) 555-0100" className={field} />
            </div>
          </div>
          <div>
            <label className={label}>Billing Address</label>
            <textarea name="billingAddress" rows={2} placeholder="123 Main St, Austin TX 78701" className={field} />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-nursery-sage/15 px-6 py-4">
          <Link href={closeHref} className="rounded-lg px-4 py-2 text-sm font-semibold text-nursery-midnight/55 transition hover:text-nursery-midnight">Cancel</Link>
          <SubmitButton label="Create Customer" />
        </div>
      </form>
    </CrmModal>
  );
}
