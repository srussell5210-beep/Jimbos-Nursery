'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth-check';

export async function createDelivery(formData: FormData) {
  requireSession();
  const customerId = formData.get('customerId') as string;
  const routeName = (formData.get('routeName') as string) || null;
  const driverName = (formData.get('driverName') as string) || null;
  const truckName = (formData.get('truckName') as string) || null;
  const deliveryWindow = (formData.get('deliveryWindow') as string) || null;
  const scheduledForStr = formData.get('scheduledFor') as string;
  const scheduledFor = scheduledForStr ? new Date(scheduledForStr) : null;
  const notes = (formData.get('notes') as string) || null;

  await prisma.delivery.create({
    data: {
      customerId,
      routeName: routeName || undefined,
      driverName: driverName || undefined,
      truckName: truckName || undefined,
      deliveryWindow: deliveryWindow || undefined,
      scheduledFor: scheduledFor || undefined,
      notes: notes || undefined,
      status: 'Scheduled',
    },
  });

  revalidatePath('/crm/deliveries');
  redirect('/crm/deliveries');
}
