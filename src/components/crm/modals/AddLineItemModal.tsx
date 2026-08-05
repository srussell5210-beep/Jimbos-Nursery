import Link from 'next/link';
import { CrmModal } from '@/components/crm/CrmModal';
import { SubmitButton } from '@/components/crm/SubmitButton';
import { addLineItem } from '@/actions/commerce';

const field = 'mt-1 w-full rounded-lg border border-nursery-sage/25 bg-[#f7f3ea] px-3 py-2.5 text-sm text-nursery-midnight outline-none focus:border-nursery-sage/60 focus:bg-white transition';
const label = 'block text-xs font-bold uppercase tracking-[0.14em] text-nursery-midnight/50';

export function AddLineItemModal({
  parentId,
  parentType,
  closeHref,
}: {
  parentId: string;
  parentType: 'quote' | 'order' | 'invoice';
  closeHref: string;
}) {
  return (
    <CrmModal title="Add Line Item" closeHref={closeHref}>
      <form action={addLineItem}>
        <input type="hidden" name="parentId" value={parentId} />
        <input type="hidden" name="parentType" value={parentType} />
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className={label}>Description <span className="text-nursery-terracotta">*</span></label>
            <input
              name="description"
              required
              autoFocus
              placeholder="Knock Out Rose 3gal, Installation labor, Delivery…"
              className={field}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Category</label>
              <select name="category" className={field}>
                <option>Plants</option>
                <option>Materials</option>
                <option>Labor</option>
                <option>Delivery</option>
                <option>Supplies</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className={label}>Quantity <span className="text-nursery-terracotta">*</span></label>
              <input name="quantity" type="number" min="0.01" step="0.01" defaultValue="1" required className={field} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Unit Price <span className="text-nursery-terracotta">*</span></label>
              <input name="unitPrice" type="number" min="0" step="0.01" placeholder="0.00" required className={field} />
            </div>
            <div>
              <label className={label}>Unit Cost</label>
              <input name="unitCost" type="number" min="0" step="0.01" placeholder="0.00" className={field} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Tax Rate</label>
              <select name="taxRate" className={field}>
                <option value="0">0% — No tax</option>
                <option value="0.0825">8.25%</option>
                <option value="0.085">8.5%</option>
                <option value="0.09">9%</option>
                <option value="0.10">10%</option>
              </select>
            </div>
            <div>
              <label className={label}>Discount $</label>
              <input name="discountAmount" type="number" min="0" step="0.01" placeholder="0.00" className={field} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-nursery-sage/15 px-6 py-4">
          <Link href={closeHref} className="rounded-lg px-4 py-2 text-sm font-semibold text-nursery-midnight/55 transition hover:text-nursery-midnight">Cancel</Link>
          <SubmitButton label="Add Line" />
        </div>
      </form>
    </CrmModal>
  );
}
