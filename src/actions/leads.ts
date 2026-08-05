'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth-check';

export async function createLead(formData: FormData) {
  requireSession();
  const title = formData.get('title') as string;
  const source = (formData.get('source') as string) || 'Other';
  const stage = (formData.get('stage') as string) || 'New';
  const priority = (formData.get('priority') as string) || 'Normal';
  const estimatedValue = parseFloat((formData.get('estimatedValue') as string) || '0') || 0;
  const customerId = (formData.get('customerId') as string) || null;
  const dueDateStr = formData.get('dueDate') as string;
  const dueDate = dueDateStr ? new Date(dueDateStr) : null;

  await prisma.lead.create({
    data: {
      title,
      source,
      stage,
      priority,
      estimatedValue,
      customerId: customerId || undefined,
      dueDate: dueDate || undefined,
    },
  });

  revalidatePath('/crm/leads');
  redirect('/crm/leads');
}
