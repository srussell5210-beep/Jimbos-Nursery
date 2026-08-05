'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth-check';

type ParentType = 'quote' | 'order' | 'invoice';
const parentPaths: Record<ParentType, string> = {
  quote: '/crm/quotes',
  order: '/crm/orders',
  invoice: '/crm/invoices',
};

async function recomputeTotals(parentType: ParentType, parentId: string) {
  const where =
    parentType === 'quote'
      ? { quoteId: parentId }
      : parentType === 'order'
        ? { orderId: parentId }
        : { invoiceId: parentId };

  const items = await prisma.lineItem.findMany({ where });
  const subtotal = items.reduce((s, i) => s + (i.quantity * i.unitPrice - i.discountAmount), 0);
  const discountTotal = items.reduce((s, i) => s + i.discountAmount, 0);
  const taxTotal = items.reduce((s, i) => s + (i.quantity * i.unitPrice - i.discountAmount) * i.taxRate, 0);
  const total = subtotal + taxTotal;

  if (parentType === 'quote') {
    await prisma.quote.update({ where: { id: parentId }, data: { subtotal, discountTotal, taxTotal, total } });
  } else if (parentType === 'order') {
    await prisma.salesOrder.update({ where: { id: parentId }, data: { subtotal, discountTotal, taxTotal, total } });
  } else {
    await prisma.invoice.update({ where: { id: parentId }, data: { subtotal, discountTotal, taxTotal, total, balanceDue: total } });
  }
}

function genNumber(prefix: string, count: number) {
  const d = new Date();
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  return `${prefix}-${ym}-${String(count + 1).padStart(4, '0')}`;
}

export async function createQuote(formData: FormData) {
  requireSession();
  const customerId = formData.get('customerId') as string;
  const stage = (formData.get('stage') as string) || 'Draft';
  const notes = (formData.get('notes') as string) || null;
  const depositRequired = parseFloat((formData.get('depositRequired') as string) || '0') || 0;

  const count = await prisma.quote.count();
  const quoteNumber = genNumber('Q', count);

  await prisma.quote.create({
    data: {
      quoteNumber,
      customerId,
      stage,
      notes: notes || undefined,
      depositRequired,
    },
  });

  revalidatePath('/crm/quotes');
  redirect('/crm/quotes');
}

export async function createOrder(formData: FormData) {
  requireSession();
  const customerId = formData.get('customerId') as string;
  const status = (formData.get('status') as string) || 'Open';

  const count = await prisma.salesOrder.count();
  const orderNumber = genNumber('ORD', count);

  await prisma.salesOrder.create({
    data: { orderNumber, customerId, status },
  });

  revalidatePath('/crm/orders');
  redirect('/crm/orders');
}

export async function createInvoice(formData: FormData) {
  requireSession();
  const customerId = formData.get('customerId') as string;
  const orderId = (formData.get('orderId') as string) || null;
  const dueDateStr = formData.get('dueDate') as string;
  const dueDate = dueDateStr ? new Date(dueDateStr) : null;

  const count = await prisma.invoice.count();
  const invoiceNumber = genNumber('INV', count);

  await prisma.invoice.create({
    data: {
      invoiceNumber,
      customerId,
      orderId: orderId || undefined,
      dueDate: dueDate || undefined,
    },
  });

  revalidatePath('/crm/invoices');
  redirect('/crm/invoices');
}

export async function addLineItem(formData: FormData) {
  requireSession();
  const parentType = formData.get('parentType') as ParentType;
  const parentId = formData.get('parentId') as string;
  const description = formData.get('description') as string;
  const category = (formData.get('category') as string) || 'Other';
  const quantity = parseFloat((formData.get('quantity') as string) || '1');
  const unitPrice = parseFloat((formData.get('unitPrice') as string) || '0');
  const unitCost = parseFloat((formData.get('unitCost') as string) || '0');
  const discountAmount = parseFloat((formData.get('discountAmount') as string) || '0');
  const taxRate = parseFloat((formData.get('taxRate') as string) || '0');
  const total = quantity * unitPrice - discountAmount;

  await prisma.lineItem.create({
    data: {
      description,
      category,
      quantity,
      unitPrice,
      unitCost,
      discountAmount,
      taxRate,
      total,
      quoteId: parentType === 'quote' ? parentId : undefined,
      orderId: parentType === 'order' ? parentId : undefined,
      invoiceId: parentType === 'invoice' ? parentId : undefined,
    },
  });

  await recomputeTotals(parentType, parentId);
  revalidatePath(parentPaths[parentType]);
  redirect(`${parentPaths[parentType]}?id=${parentId}`);
}

export async function deleteLineItem(formData: FormData) {
  requireSession();
  const lineItemId = formData.get('lineItemId') as string;
  const parentType = formData.get('parentType') as ParentType;
  const parentId = formData.get('parentId') as string;

  await prisma.lineItem.delete({ where: { id: lineItemId } });
  await recomputeTotals(parentType, parentId);
  revalidatePath(parentPaths[parentType]);
  redirect(`${parentPaths[parentType]}?id=${parentId}`);
}
