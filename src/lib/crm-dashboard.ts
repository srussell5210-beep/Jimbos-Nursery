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

const startOfMonth = (offset = 0) => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
};

const endOfMonth = (offset = 0) => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + offset + 1, 0, 23, 59, 59, 999);
};

const endOfWeek = () => {
  const date = endOfToday();
  date.setDate(date.getDate() + (6 - date.getDay()));
  return date;
};

const monthKey = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

export async function getCrmCommandCenterData() {
  if (!isCrmTestDataEnabled()) {
    return {
      metrics: {
        followUpsDueToday: 0,
        newLeads: 0,
        openQuotes: 0,
        deliveriesToday: 0,
        lowStock: 0,
        unpaidInvoices: 0,
        unpaidBalance: 0,
        vendorOrders: 0,
        customerRequests: 0,
        activeServiceJobs: 0,
        totalInventoryValue: 0,
        revenueThisMonth: 0,
        revenueLastMonth: 0,
        revenueDelta: 0,
        leadConversionRate: 0,
        priorLeadConversionRate: 0,
        serviceJobsThisMonth: 0,
      },
      followUpsDueToday: [],
      deliveriesToday: [],
      lowStock: [],
      unpaidInvoices: [],
      vendorOrders: [],
      recentActivities: [],
      customerRequests: [],
      serviceJobs: [],
      notifications: [],
      charts: {
        salesByCategory: [],
        quoteStages: [],
        revenueByMonth: [],
      },
      topCustomers: [],
      customerTypes: [],
      loyaltyTiers: [],
      invoiceStatusBreakdown: [],
      topInventoryCategories: [],
      openTasksDueThisWeek: [],
      leadsCreatedThisMonth: [],
      overdueInvoices: [],
      monthlyComparison: [
        { label: "Revenue", current: 0, prior: 0, format: "currency" as const },
        { label: "New Leads", current: 0, prior: 0, format: "number" as const },
        { label: "Quotes Sent", current: 0, prior: 0, format: "number" as const },
        { label: "Invoices Paid", current: 0, prior: 0, format: "number" as const },
      ],
      leadPipelineStages: ["New", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"].map((stage) => ({
        stage,
        count: 0,
      })),
      stockAnomalies: [],
      customerRevenueByJoinQuarter: [],
      dealSizeVsLeadAge: [],
      deliveryPerformance: {
        completedToday: 0,
        onTimeRate: 0,
        pendingThisWeek: 0,
      },
    };
  }

  const todayStart = startOfToday();
  const todayEnd = endOfToday();
  const currentMonthStart = startOfMonth();
  const currentMonthEnd = endOfMonth();
  const priorMonthStart = startOfMonth(-1);
  const priorMonthEnd = endOfMonth(-1);
  const weekEnd = endOfWeek();

  const [
    followUpsDueToday,
    newLeads,
    openQuotes,
    deliveriesToday,
    unpaidInvoices,
    vendorOrders,
    recentActivities,
    quoteStages,
    salesByCategory,
    invoices,
    customers,
    stockLevels,
    customerRequests,
    serviceJobs,
    notifications,
    customerTypes,
    loyaltyTiers,
    invoiceStatusBreakdown,
    revenueThisMonthInvoices,
    revenueLastMonthInvoices,
    leadsThisMonth,
    leadsLastMonth,
    quotesSentThisMonth,
    quotesSentLastMonth,
    invoicesPaidThisMonth,
    invoicesPaidLastMonth,
    acceptedQuotes,
    totalLeads,
    acceptedQuotesPrior,
    totalLeadsPrior,
    openTasksDueThisWeek,
    leadsCreatedThisMonth,
    overdueInvoices,
    allLeadStages,
    openLeadsWithQuotes,
    serviceJobsThisMonth,
    allDeliveriesThisWeek,
    completedDeliveriesToday,
  ] = await Promise.all([
    prisma.task.findMany({
      where: { status: "Open", dueDate: { gte: todayStart, lte: todayEnd } },
      include: { customer: true, assignedTo: true, lead: true },
      orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
      take: 5,
    }),
    prisma.lead.count({ where: { stage: "New" } }),
    prisma.quote.count({ where: { stage: { notIn: ["Accepted", "Rejected", "Expired"] } } }),
    prisma.delivery.findMany({
      where: { scheduledFor: { gte: todayStart, lte: todayEnd } },
      include: { customer: true },
      orderBy: { scheduledFor: "asc" },
      take: 5,
    }),
    prisma.invoice.findMany({
      where: { status: { not: "Paid" } },
      include: { customer: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.purchaseOrder.findMany({
      where: { status: { notIn: ["Closed", "Cancelled"] } },
      include: { vendor: true },
      orderBy: { expectedDate: "asc" },
      take: 5,
    }),
    prisma.activity.findMany({
      include: { customer: true, staffUser: true },
      orderBy: { occurredAt: "desc" },
      take: 6,
    }),
    prisma.quote.groupBy({
      by: ["stage"],
      _count: { _all: true },
      where: { stage: { notIn: ["Accepted", "Rejected", "Expired"] } },
    }),
    prisma.lineItem.groupBy({
      by: ["category"],
      _sum: { total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 6,
    }),
    prisma.invoice.findMany({
      where: { issueDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1) } },
      select: { issueDate: true, total: true },
    }),
    prisma.customer.findMany({
      include: { invoices: true },
      take: 25,
    }),
    prisma.stockLevel.findMany({
      include: { inventoryItem: true, location: true },
    }),
    prisma.lead.findMany({
      where: { stage: { in: ["New", "Qualified"] } },
      include: { customer: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.serviceJob.findMany({
      where: { status: { in: ["Scheduled", "In Progress"] } },
      include: { customer: true },
      orderBy: { scheduledFor: "asc" },
      take: 5,
    }),
    prisma.notification.findMany({
      where: { status: "Unread" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.customer.groupBy({
      by: ["type"],
      _count: { _all: true },
    }),
    prisma.customer.groupBy({
      by: ["loyaltyTier"],
      _count: { _all: true },
    }),
    prisma.invoice.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { balanceDue: true },
    }),
    prisma.invoice.findMany({
      where: { issueDate: { gte: currentMonthStart, lte: currentMonthEnd } },
      select: { total: true },
    }),
    prisma.invoice.findMany({
      where: { issueDate: { gte: priorMonthStart, lte: priorMonthEnd } },
      select: { total: true },
    }),
    prisma.lead.count({ where: { createdAt: { gte: currentMonthStart, lte: currentMonthEnd } } }),
    prisma.lead.count({ where: { createdAt: { gte: priorMonthStart, lte: priorMonthEnd } } }),
    prisma.quote.count({ where: { stage: { in: ["Sent", "Review", "Revised", "Accepted"] }, updatedAt: { gte: currentMonthStart, lte: currentMonthEnd } } }),
    prisma.quote.count({ where: { stage: { in: ["Sent", "Review", "Revised", "Accepted"] }, updatedAt: { gte: priorMonthStart, lte: priorMonthEnd } } }),
    prisma.invoice.count({ where: { status: "Paid", updatedAt: { gte: currentMonthStart, lte: currentMonthEnd } } }),
    prisma.invoice.count({ where: { status: "Paid", updatedAt: { gte: priorMonthStart, lte: priorMonthEnd } } }),
    prisma.quote.count({ where: { stage: "Accepted", updatedAt: { gte: currentMonthStart, lte: currentMonthEnd } } }),
    prisma.lead.count({ where: { createdAt: { lte: currentMonthEnd } } }),
    prisma.quote.count({ where: { stage: "Accepted", updatedAt: { gte: priorMonthStart, lte: priorMonthEnd } } }),
    prisma.lead.count({ where: { createdAt: { lte: priorMonthEnd } } }),
    prisma.task.findMany({
      where: { status: "Open", dueDate: { lte: weekEnd } },
      include: { customer: true },
      orderBy: [{ dueDate: "asc" }, { priority: "asc" }],
      take: 8,
    }),
    prisma.lead.findMany({
      where: { createdAt: { gte: currentMonthStart, lte: currentMonthEnd } },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.invoice.findMany({
      where: { status: "Overdue" },
      include: { customer: true },
      orderBy: { dueDate: "asc" },
      take: 8,
    }),
    prisma.lead.groupBy({
      by: ["stage"],
      _count: { _all: true },
    }),
    prisma.lead.findMany({
      where: { stage: { notIn: ["Closed Won", "Closed Lost"] } },
      include: { customer: true, quotes: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.serviceJob.count({
      where: { scheduledFor: { gte: currentMonthStart, lte: currentMonthEnd } },
    }),
    prisma.delivery.findMany({
      where: { scheduledFor: { gte: todayStart, lte: weekEnd } },
      include: { customer: true },
      orderBy: { scheduledFor: "asc" },
    }),
    prisma.delivery.findMany({
      where: { status: "Delivered", scheduledFor: { gte: todayStart, lte: todayEnd } },
    }),
  ]);

  const lowStock = stockLevels
    .filter((level) => level.quantityOnHand <= level.inventoryItem.reorderPoint)
    .slice(0, 5);

  const revenueByMonthMap = invoices.reduce<Record<string, number>>((acc, invoice) => {
    const key = monthKey(invoice.issueDate);
    acc[key] = (acc[key] ?? 0) + invoice.total;
    return acc;
  }, {});

  const revenueByMonth = Object.entries(revenueByMonthMap).map(([label, value]) => ({
    label,
    value,
  }));

  const topCustomers = customers
    .map((customer) => ({
      id: customer.id,
      name: customer.displayName,
      type: customer.type,
      revenue: customer.invoices.reduce((sum, invoice) => sum + invoice.total, 0),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const unpaidBalance = unpaidInvoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0);
  const revenueThisMonth = revenueThisMonthInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const revenueLastMonth = revenueLastMonthInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const revenueDelta = revenueLastMonth === 0 ? (revenueThisMonth > 0 ? 100 : 0) : ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;
  const leadConversionRate = totalLeads === 0 ? 0 : (acceptedQuotes / totalLeads) * 100;
  const priorLeadConversionRate = totalLeadsPrior === 0 ? 0 : (acceptedQuotesPrior / totalLeadsPrior) * 100;

  const totalInventoryValue = stockLevels.reduce(
    (sum, sl) => sum + sl.quantityOnHand * sl.inventoryItem.landedCost,
    0
  );

  const categoryValueMap = stockLevels.reduce<Record<string, { qty: number; value: number }>>(
    (acc, sl) => {
      const cat = sl.inventoryItem.category;
      if (!acc[cat]) acc[cat] = { qty: 0, value: 0 };
      acc[cat].qty += sl.quantityOnHand;
      acc[cat].value += sl.quantityOnHand * sl.inventoryItem.landedCost;
      return acc;
    },
    {}
  );
  const topInventoryCategories = Object.entries(categoryValueMap)
    .map(([label, { qty, value }]) => ({ label, qty, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const expectedStockValue = 20;
  const stockAnomalies = stockLevels
    .map((level) => {
      const expected = Math.max(level.inventoryItem.reorderPoint * 1.5, expectedStockValue);
      const deviation = expected === 0 ? 0 : ((expected - level.quantityOnHand) / expected) * 100;
      return {
        id: level.id,
        itemName: level.inventoryItem.name,
        locationName: level.location.name,
        quantityOnHand: level.quantityOnHand,
        reorderPoint: level.inventoryItem.reorderPoint,
        expected,
        deviation,
      };
    })
    .filter((item) => item.deviation > 30 || item.quantityOnHand <= item.reorderPoint)
    .sort((a, b) => b.deviation - a.deviation)
    .slice(0, 6);

  const customerRevenueByJoinQuarter = customers
    .map((customer) => {
      const sortedInvoices = [...customer.invoices].sort((a, b) => a.issueDate.getTime() - b.issueDate.getTime());
      const firstInvoice = sortedInvoices[0];
      if (!firstInvoice) return null;
      const quarter = Math.floor(firstInvoice.issueDate.getMonth() / 3) + 1;
      const label = `Q${quarter} ${String(firstInvoice.issueDate.getFullYear()).slice(-2)}`;
      return {
        label,
        revenue: customer.invoices.reduce((sum, invoice) => sum + invoice.total, 0),
      };
    })
    .filter((row): row is { label: string; revenue: number } => row !== null)
    .reduce<Record<string, { label: string; revenue: number; count: number }>>((acc, row) => {
      acc[row.label] ??= { label: row.label, revenue: 0, count: 0 };
      acc[row.label].revenue += row.revenue;
      acc[row.label].count += 1;
      return acc;
    }, {});

  const dealSizeVsLeadAge = openLeadsWithQuotes.map((lead) => {
    const quoteValue = lead.quotes.reduce((sum, quote) => sum + quote.total, 0);
    const ageDays = Math.max(0, Math.round((Date.now() - lead.createdAt.getTime()) / 86_400_000));
    return {
      id: lead.id,
      title: lead.title,
      customerName: lead.customer?.displayName ?? "Unlinked",
      ageDays,
      quoteValue,
      stage: lead.stage,
    };
  });

  const leadPipelineStages = ["New", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"].map((stage) => ({
    stage,
    count: allLeadStages.find((row) => row.stage === stage)?._count._all ?? 0,
  }));

  const deliveryPerformance = {
    completedToday: completedDeliveriesToday.length,
    onTimeRate: completedDeliveriesToday.length > 0 ? 100 : 0,
    pendingThisWeek: allDeliveriesThisWeek.filter((delivery) => !["Delivered", "Cancelled"].includes(delivery.status)).length,
  };

  return {
    metrics: {
      followUpsDueToday: followUpsDueToday.length,
      newLeads,
      openQuotes,
      deliveriesToday: deliveriesToday.length,
      lowStock: lowStock.length,
      unpaidInvoices: unpaidInvoices.length,
      unpaidBalance,
      vendorOrders: vendorOrders.length,
      customerRequests: customerRequests.length,
      activeServiceJobs: serviceJobs.length,
      totalInventoryValue,
      revenueThisMonth,
      revenueLastMonth,
      revenueDelta,
      leadConversionRate,
      priorLeadConversionRate,
      serviceJobsThisMonth,
    },
    followUpsDueToday,
    deliveriesToday,
    lowStock,
    unpaidInvoices,
    vendorOrders,
    recentActivities,
    customerRequests,
    serviceJobs,
    notifications,
    charts: {
      salesByCategory: salesByCategory.map((row) => ({
        label: row.category,
        value: row._sum.total ?? 0,
      })),
      quoteStages: quoteStages.map((row) => ({
        label: row.stage,
        value: row._count._all,
      })),
      revenueByMonth,
    },
    topCustomers,
    customerTypes: customerTypes.map((r) => ({ type: r.type, count: r._count._all })),
    loyaltyTiers: loyaltyTiers.map((r) => ({ tier: r.loyaltyTier, count: r._count._all })),
    invoiceStatusBreakdown: invoiceStatusBreakdown.map((r) => ({
      status: r.status,
      count: r._count._all,
      balance: r._sum.balanceDue ?? 0,
    })),
    topInventoryCategories,
    openTasksDueThisWeek,
    leadsCreatedThisMonth,
    overdueInvoices,
    monthlyComparison: [
      { label: "Revenue", current: revenueThisMonth, prior: revenueLastMonth, format: "currency" as const },
      { label: "New Leads", current: leadsThisMonth, prior: leadsLastMonth, format: "number" as const },
      { label: "Quotes Sent", current: quotesSentThisMonth, prior: quotesSentLastMonth, format: "number" as const },
      { label: "Invoices Paid", current: invoicesPaidThisMonth, prior: invoicesPaidLastMonth, format: "number" as const },
    ],
    leadPipelineStages,
    stockAnomalies,
    customerRevenueByJoinQuarter: Object.values(customerRevenueByJoinQuarter),
    dealSizeVsLeadAge,
    deliveryPerformance,
  };
}
