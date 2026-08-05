import { prisma } from "@/lib/prisma";
import { isCrmTestDataEnabled } from "@/lib/crm-test-data";

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfToday = () => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};

export async function getCrmLeadsData(selectedId?: string) {
  if (!isCrmTestDataEnabled()) {
    return {
      metrics: {
        openLeads: 0,
        estimatedPipeline: 0,
        dueToday: 0,
        overdueTasks: 0,
        highPriority: 0,
        quoteReady: 0,
      },
      stageCounts: [],
      leads: [],
      openTasks: [],
      selectedLead: null,
    };
  }

  const todayStart = startOfToday();
  const todayEnd = endOfToday();

  const [leads, openTasks, dueToday, overdueTasks, stageCounts] = await Promise.all([
    prisma.lead.findMany({
      include: {
        customer: true,
        owner: true,
        tasks: {
          where: { status: "Open" },
          orderBy: { dueDate: "asc" },
        },
        quotes: true,
      },
      orderBy: [{ dueDate: "asc" }, { estimatedValue: "desc" }],
    }),
    prisma.task.findMany({
      where: { status: "Open" },
      include: { customer: true, lead: true, assignedTo: true },
      orderBy: [{ dueDate: "asc" }, { priority: "asc" }],
      take: 12,
    }),
    prisma.task.count({
      where: { status: "Open", dueDate: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.task.count({
      where: { status: "Open", dueDate: { lt: todayStart } },
    }),
    prisma.lead.groupBy({
      by: ["stage"],
      _count: { _all: true },
      _sum: { estimatedValue: true },
    }),
  ]);

  const openLeadStages = ["New", "Qualified", "Quote Needed", "Waiting on Customer", "Proposal Sent"];
  const openLeads = leads.filter((lead) => openLeadStages.includes(lead.stage));
  const estimatedPipeline = openLeads.reduce((sum, lead) => sum + lead.estimatedValue, 0);
  const highPriority = openLeads.filter((lead) => lead.priority === "High").length;
  const quoteReady = openLeads.filter((lead) => ["Qualified", "Quote Needed"].includes(lead.stage)).length;

  const selectedLead = selectedId
    ? (openLeads.find((l) => l.id === selectedId) ?? null)
    : null;

  return {
    metrics: {
      openLeads: openLeads.length,
      estimatedPipeline,
      dueToday,
      overdueTasks,
      highPriority,
      quoteReady,
    },
    stageCounts: stageCounts
      .map((stage) => ({
        label: stage.stage,
        count: stage._count._all,
        value: stage._sum.estimatedValue ?? 0,
      }))
      .sort((a, b) => b.value - a.value),
    leads: openLeads,
    openTasks,
    selectedLead,
  };
}
