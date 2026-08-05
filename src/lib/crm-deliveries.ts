import { prisma } from "@/lib/prisma";
import { isCrmTestDataEnabled } from "@/lib/crm-test-data";

export async function getCrmDeliveriesData() {
  if (!isCrmTestDataEnabled()) {
    return {
      metrics: {
        totalDeliveries: 0,
        scheduled: 0,
        deliveriesToday: 0,
        proofMissing: 0,
        assignedRoutes: 0,
      },
      deliveries: [],
      scheduled: [],
      deliveriesToday: [],
      proofMissing: [],
      routeTotals: [],
      statusTotals: [],
    };
  }

  const deliveries = await prisma.delivery.findMany({
    include: {
      customer: true,
      order: true,
      property: true,
    },
    orderBy: [{ scheduledFor: "asc" }, { status: "asc" }],
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const scheduled = deliveries.filter((delivery) => delivery.status !== "Delivered" && delivery.status !== "Cancelled");
  const deliveriesToday = deliveries.filter((delivery) => {
    if (!delivery.scheduledFor) return false;
    const scheduledFor = new Date(delivery.scheduledFor);
    return scheduledFor >= today && scheduledFor < tomorrow;
  });
  const proofMissing = deliveries.filter((delivery) => delivery.status === "Delivered" && !delivery.proofOfDelivery);

  const routeTotals = Object.values(
    deliveries.reduce<Record<string, { label: string; count: number; value: number }>>((acc, delivery) => {
      const label = delivery.routeName ?? "Unassigned";
      acc[label] ??= { label, count: 0, value: 0 };
      acc[label].count += 1;
      acc[label].value += delivery.order?.total ?? 0;
      return acc;
    }, {})
  ).sort((a, b) => b.count - a.count);

  const statusTotals = Object.values(
    deliveries.reduce<Record<string, { label: string; count: number; value: number }>>((acc, delivery) => {
      acc[delivery.status] ??= { label: delivery.status, count: 0, value: 0 };
      acc[delivery.status].count += 1;
      acc[delivery.status].value += delivery.order?.total ?? 0;
      return acc;
    }, {})
  ).sort((a, b) => b.count - a.count);

  return {
    metrics: {
      totalDeliveries: deliveries.length,
      scheduled: scheduled.length,
      deliveriesToday: deliveriesToday.length,
      proofMissing: proofMissing.length,
      assignedRoutes: routeTotals.filter((route) => route.label !== "Unassigned").length,
    },
    deliveries,
    scheduled,
    deliveriesToday,
    proofMissing,
    routeTotals,
    statusTotals,
  };
}
