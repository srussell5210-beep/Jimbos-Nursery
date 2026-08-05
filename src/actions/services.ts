'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth-check';

export async function createServiceJob(formData: FormData) {
  requireSession();
  const customerId = formData.get('customerId') as string;
  const jobType = (formData.get('jobType') as string) || 'Other';
  const scheduledForStr = formData.get('scheduledFor') as string;
  const scheduledFor = scheduledForStr ? new Date(scheduledForStr) : null;
  const crewName = (formData.get('crewName') as string) || null;
  const revenue = parseFloat((formData.get('revenue') as string) || '0') || 0;
  const notes = (formData.get('notes') as string) || null;

  await prisma.serviceJob.create({
    data: {
      customerId,
      jobType,
      scheduledFor: scheduledFor || undefined,
      crewName: crewName || undefined,
      revenue,
      notes: notes || undefined,
      status: 'Scheduled',
    },
  });

  revalidatePath('/crm/services');
  redirect('/crm/services');
}
