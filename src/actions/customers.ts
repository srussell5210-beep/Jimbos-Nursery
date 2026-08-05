'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth-check';

export async function createCustomer(formData: FormData) {
  requireSession();
  const displayName = formData.get('displayName') as string;
  const type = (formData.get('type') as string) || 'Individual';
  const email = (formData.get('email') as string) || null;
  const phone = (formData.get('phone') as string) || null;
  const billingAddress = (formData.get('billingAddress') as string) || null;

  await prisma.customer.create({
    data: {
      displayName,
      type,
      email: email || undefined,
      phone: phone || undefined,
      billingAddress: billingAddress || undefined,
    },
  });

  revalidatePath('/crm/customers');
  redirect('/crm/customers');
}
