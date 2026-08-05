import { prisma } from "@/lib/prisma";
import { isCrmTestDataEnabled } from "@/lib/crm-test-data";

export async function getCrmServicesData() {
  if (!isCrmTestDataEnabled()) {
    return {
      metrics: {
        totalJobs: 0,
        scheduled: 0,
        totalRevenue: 0,
        totalCost: 0,
        grossMargin: 0,
      },
      jobs: [],
      scheduled: [],
      jobTypeTotals: [],
      crewTotals: [],
    };
  }

  const jobs = await prisma.serviceJob.findMany({
    include: {
      customer: true,
      order: true,
      property: true,
    },
    orderBy: [{ scheduledFor: "asc" }, { status: "asc" }],
  });

  const scheduled = jobs.filter((job) => !["Completed", "Cancelled"].includes(job.status));
  const totalRevenue = jobs.reduce((sum, job) => sum + job.revenue, 0);
  const totalCost = jobs.reduce(
    (sum, job) => sum + job.laborCost + job.materialCost + job.deliveryCost + job.equipmentCost + job.subcontractorCost,
    0
  );
  const grossMargin = totalRevenue - totalCost;

  const jobTypeTotals = Object.values(
    jobs.reduce<Record<string, { label: string; count: number; value: number }>>((acc, job) => {
      acc[job.jobType] ??= { label: job.jobType, count: 0, value: 0 };
      acc[job.jobType].count += 1;
      acc[job.jobType].value += job.revenue;
      return acc;
    }, {})
  ).sort((a, b) => b.value - a.value);

  const crewTotals = Object.values(
    jobs.reduce<Record<string, { label: string; count: number; value: number }>>((acc, job) => {
      const label = job.crewName ?? "Unassigned";
      acc[label] ??= { label, count: 0, value: 0 };
      acc[label].count += 1;
      acc[label].value += job.revenue;
      return acc;
    }, {})
  ).sort((a, b) => b.value - a.value);

  return {
    metrics: {
      totalJobs: jobs.length,
      scheduled: scheduled.length,
      totalRevenue,
      totalCost,
      grossMargin,
    },
    jobs,
    scheduled,
    jobTypeTotals,
    crewTotals,
  };
}
