'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth-check';

export async function createPurchaseOrder(formData: FormData) {
  requireSession();
  const vendorId = formData.get('vendorId') as string;
  const expectedDateStr = formData.get('expectedDate') as string;
  const expectedDate = expectedDateStr ? new Date(expectedDateStr) : null;
  const freight = parseFloat((formData.get('freight') as string) || '0') || 0;

  const count = await prisma.purchaseOrder.count();
  const d = new Date();
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  const poNumber = `PO-${ym}-${String(count + 1).padStart(4, '0')}`;

  await prisma.purchaseOrder.create({
    data: {
      poNumber,
      vendorId,
      expectedDate: expectedDate || undefined,
      freight,
      total: freight,
    },
  });

  revalidatePath('/crm/vendors');
  redirect('/crm/vendors');
}
