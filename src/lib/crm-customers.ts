import { prisma } from "@/lib/prisma";
import { isCrmTestDataEnabled } from "@/lib/crm-test-data";

export async function getCrmCustomerDirectoryData(selectedId?: string) {
  if (!isCrmTestDataEnabled()) {
    return {
      metrics: {
        totalCustomers: 0,
        activeRelationships: 0,
        contractorAccounts: 0,
        consentReady: 0,
        totalRevenue: 0,
        openBalance: 0,
      },
      typeCounts: [],
      customers: [],
      selectedCustomer: null,
    };
  }

  const customers = await prisma.customer.findMany({
    include: {
      contacts: true,
      properties: true,
      leads: true,
      quotes: true,
      orders: true,
      invoices: true,
      payments: true,
      tasks: {
        where: { status: "Open" },
        orderBy: { dueDate: "asc" },
        take: 3,
      },
      serviceJobs: {
        orderBy: { scheduledFor: "asc" },
        take: 3,
      },
      deliveries: {
        orderBy: { scheduledFor: "asc" },
        take: 3,
      },
      warrantyClaims: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
      activities: {
        orderBy: { occurredAt: "desc" },
        take: 4,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const typeCounts = await prisma.customer.groupBy({
    by: ["type"],
    _count: { _all: true },
    orderBy: { _count: { type: "desc" } },
  });

  const totalRevenue = customers.reduce(
    (sum, customer) => sum + customer.invoices.reduce((invoiceSum, invoice) => invoiceSum + invoice.total, 0),
    0
  );

  const openBalance = customers.reduce(
    (sum, customer) => sum + customer.invoices.reduce((invoiceSum, invoice) => invoiceSum + invoice.balanceDue, 0),
    0
  );

  const activeRelationships = customers.filter((customer) => customer.status === "Active").length;
  const contractorAccounts = customers.filter((customer) =>
    ["Landscaper / Contractor", "Wholesale Buyer", "Municipality", "Property Manager"].includes(customer.type)
  ).length;
  const consentReady = customers.filter((customer) => customer.emailOptIn || customer.smsOptIn || customer.marketingOptIn).length;

  const directory = customers.map((customer) => {
    const revenue = customer.invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const balanceDue = customer.invoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0);
    const primaryContact = customer.contacts.find((contact) => contact.isPrimary) ?? customer.contacts[0];
    const openQuotes = customer.quotes.filter((quote) => !["Accepted", "Rejected", "Expired"].includes(quote.stage)).length;
    const openOrders = customer.orders.filter((order) => !["Closed", "Cancelled"].includes(order.status)).length;

    return {
      ...customer,
      revenue,
      balanceDue,
      primaryContact,
      openQuotes,
      openOrders,
    };
  }).sort((a, b) => b.revenue - a.revenue || b.balanceDue - a.balanceDue || a.displayName.localeCompare(b.displayName));

  return {
    metrics: {
      totalCustomers: customers.length,
      activeRelationships,
      contractorAccounts,
      consentReady,
      totalRevenue,
      openBalance,
    },
    typeCounts: typeCounts.map((row) => ({
      label: row.type,
      value: row._count._all,
    })),
    customers: directory,
    selectedCustomer: selectedId
      ? (directory.find((c) => c.id === selectedId) ?? directory[0] ?? null)
      : (directory[0] ?? null),
  };
}
