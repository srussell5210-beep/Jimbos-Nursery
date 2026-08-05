import { prisma } from "@/lib/prisma";
import { isCrmTestDataEnabled } from "@/lib/crm-test-data";

export async function getCrmOrdersData(selectedId?: string) {
  if (!isCrmTestDataEnabled()) {
    return {
      orders: [],
      selectedOrder: null,
      metrics: {
        openOrders: 0,
        openOrderValue: 0,
        pendingFulfillment: 0,
        totalRevenue: 0,
      },
      fulfillmentBreakdown: [],
      statusBreakdown: [],
    };
  }

  const [orders, fulfillmentBreakdown, statusBreakdown] = await Promise.all([
    prisma.salesOrder.findMany({
      include: {
        customer: true,
        quote: true,
        invoices: { select: { id: true, status: true, balanceDue: true } },
        deliveries: { select: { id: true, status: true, scheduledFor: true } },
        serviceJobs: { select: { id: true, status: true } },
        lineItems: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.salesOrder.groupBy({
      by: ["fulfillmentStatus"],
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.salesOrder.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { total: true },
    }),
  ]);

  const openOrders = orders.filter((o) => !["Closed", "Cancelled"].includes(o.status));
  const openOrderValue = openOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingFulfillment = orders.filter((o) =>
    ["Not Started", "In Progress", "Partial"].includes(o.fulfillmentStatus)
  ).length;
  const totalRevenue = orders
    .filter((o) => o.status === "Closed")
    .reduce((sum, o) => sum + o.total, 0);

  const selectedOrder = selectedId
    ? (orders.find((o) => o.id === selectedId) ?? openOrders[0] ?? orders[0] ?? null)
    : (openOrders[0] ?? orders[0] ?? null);

  return {
    orders,
    selectedOrder,
    metrics: {
      openOrders: openOrders.length,
      openOrderValue,
      pendingFulfillment,
      totalRevenue,
    },
    fulfillmentBreakdown: fulfillmentBreakdown
      .map((row) => ({ label: row.fulfillmentStatus, count: row._count._all, value: row._sum.total ?? 0 }))
      .sort((a, b) => b.value - a.value),
    statusBreakdown: statusBreakdown
      .map((row) => ({ label: row.status, count: row._count._all, value: row._sum.total ?? 0 }))
      .sort((a, b) => b.value - a.value),
  };
}

export async function getCrmInvoicesData(selectedId?: string) {
  if (!isCrmTestDataEnabled()) {
    return {
      invoices: [],
      payments: [],
      selectedInvoice: null,
      metrics: {
        totalInvoices: 0,
        unpaidCount: 0,
        overdueCount: 0,
        balanceDue: 0,
        collectedThisMonth: 0,
      },
      statusBreakdown: [],
    };
  }

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [invoices, payments, statusBreakdown] = await Promise.all([
    prisma.invoice.findMany({
      include: {
        customer: true,
        order: { select: { id: true, orderNumber: true } },
        payments: true,
        lineItems: { select: { id: true, description: true, quantity: true, unitPrice: true, total: true, category: true, discountAmount: true } },
      },
      orderBy: [{ dueDate: "asc" }, { balanceDue: "desc" }],
    }),
    prisma.payment.findMany({
      include: { customer: true, invoice: { select: { id: true, invoiceNumber: true } } },
      orderBy: { paidAt: "desc" },
      take: 10,
    }),
    prisma.invoice.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { total: true, balanceDue: true },
    }),
  ]);

  const unpaidInvoices = invoices.filter((i) => i.status !== "Paid");
  const overdueInvoices = unpaidInvoices.filter(
    (i) => i.dueDate !== null && i.dueDate < new Date()
  );
  const balanceDue = unpaidInvoices.reduce((sum, i) => sum + i.balanceDue, 0);
  const collectedThisMonth = payments
    .filter((p) => {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      return p.paidAt >= start;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const selectedInvoice = selectedId
    ? (invoices.find((i) => i.id === selectedId) ?? unpaidInvoices[0] ?? invoices[0] ?? null)
    : (unpaidInvoices[0] ?? invoices[0] ?? null);

  return {
    invoices,
    payments,
    selectedInvoice,
    metrics: {
      totalInvoices: invoices.length,
      unpaidCount: unpaidInvoices.length,
      overdueCount: overdueInvoices.length,
      balanceDue,
      collectedThisMonth,
    },
    statusBreakdown: statusBreakdown
      .map((row) => ({
        label: row.status,
        count: row._count._all,
        total: row._sum.total ?? 0,
        balance: row._sum.balanceDue ?? 0,
      }))
      .sort((a, b) => b.balance - a.balance),
  };
}

export async function getCrmCommerceData(selectedId?: string) {
  if (!isCrmTestDataEnabled()) {
    return {
      metrics: {
        activeQuotes: 0,
        quoteValue: 0,
        openOrders: 0,
        openOrderValue: 0,
        unpaidInvoices: 0,
        balanceDue: 0,
        depositsRequired: 0,
        recentPayments: 0,
      },
      quoteStages: [],
      invoiceStatuses: [],
      quotes: [],
      orders: [],
      invoices: [],
      payments: [],
      selectedQuote: null,
    };
  }

  const [quotes, orders, invoices, payments, quoteStages, invoiceStatuses] = await Promise.all([
    prisma.quote.findMany({
      include: {
        customer: true,
        owner: true,
        lead: true,
        lineItems: {
          include: { inventoryItem: true },
        },
        order: true,
      },
      orderBy: [{ updatedAt: "desc" }, { total: "desc" }],
    }),
    prisma.salesOrder.findMany({
      include: {
        customer: true,
        quote: true,
        invoices: true,
        deliveries: true,
        serviceJobs: true,
        lineItems: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.invoice.findMany({
      include: {
        customer: true,
        order: true,
        payments: true,
      },
      orderBy: [{ dueDate: "asc" }, { balanceDue: "desc" }],
    }),
    prisma.payment.findMany({
      include: { customer: true, invoice: true },
      orderBy: { paidAt: "desc" },
      take: 8,
    }),
    prisma.quote.groupBy({
      by: ["stage"],
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.invoice.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { balanceDue: true },
    }),
  ]);

  const activeQuoteStages = ["Draft", "Sent", "Review", "Revised", "Approved"];
  const activeQuotes = quotes.filter((quote) => activeQuoteStages.includes(quote.stage));
  const quoteValue = activeQuotes.reduce((sum, quote) => sum + quote.total, 0);
  const openOrders = orders.filter((order) => !["Closed", "Cancelled"].includes(order.status));
  const openOrderValue = openOrders.reduce((sum, order) => sum + order.total, 0);
  const unpaidInvoices = invoices.filter((invoice) => invoice.status !== "Paid");
  const balanceDue = unpaidInvoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0);
  const depositsRequired = activeQuotes.reduce((sum, quote) => sum + quote.depositRequired, 0);

  const selectedQuote = selectedId
    ? (quotes.find((q) => q.id === selectedId) ?? activeQuotes[0] ?? quotes[0] ?? null)
    : (activeQuotes[0] ?? quotes[0] ?? null);

  return {
    metrics: {
      activeQuotes: activeQuotes.length,
      quoteValue,
      openOrders: openOrders.length,
      openOrderValue,
      unpaidInvoices: unpaidInvoices.length,
      balanceDue,
      depositsRequired,
      recentPayments: payments.length,
    },
    quoteStages: quoteStages
      .map((stage) => ({
        label: stage.stage,
        count: stage._count._all,
        value: stage._sum.total ?? 0,
      }))
      .sort((a, b) => b.value - a.value),
    invoiceStatuses: invoiceStatuses
      .map((status) => ({
        label: status.status,
        count: status._count._all,
        value: status._sum.balanceDue ?? 0,
      }))
      .sort((a, b) => b.value - a.value),
    quotes: activeQuotes,
    orders: openOrders,
    invoices: unpaidInvoices,
    payments,
    selectedQuote,
  };
}
