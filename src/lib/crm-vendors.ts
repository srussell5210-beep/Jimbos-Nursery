import { prisma } from "@/lib/prisma";
import { isCrmTestDataEnabled } from "@/lib/crm-test-data";

export async function getCrmVendorsData() {
  if (!isCrmTestDataEnabled()) {
    return {
      metrics: {
        vendorCount: 0,
        openPurchaseOrders: 0,
        expectedValue: 0,
        orderedUnits: 0,
        receivedUnits: 0,
      },
      vendors: [],
      purchaseOrders: [],
      openPurchaseOrders: [],
      statusTotals: [],
      vendorTotals: [],
    };
  }

  const [vendors, purchaseOrders] = await Promise.all([
    prisma.vendor.findMany({
      include: {
        purchaseOrders: {
          include: { lines: { include: { inventoryItem: true } } },
          orderBy: { expectedDate: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.purchaseOrder.findMany({
      include: {
        vendor: true,
        lines: { include: { inventoryItem: true } },
      },
      orderBy: [{ expectedDate: "asc" }, { updatedAt: "desc" }],
    }),
  ]);

  const openPurchaseOrders = purchaseOrders.filter((po) => !["Closed", "Cancelled"].includes(po.status));
  const expectedValue = openPurchaseOrders.reduce((sum, po) => sum + po.total, 0);
  const orderedUnits = purchaseOrders.reduce(
    (sum, po) => sum + po.lines.reduce((lineSum, line) => lineSum + line.quantityOrdered, 0),
    0
  );
  const receivedUnits = purchaseOrders.reduce(
    (sum, po) => sum + po.lines.reduce((lineSum, line) => lineSum + line.quantityReceived, 0),
    0
  );

  const statusTotals = Object.values(
    purchaseOrders.reduce<Record<string, { label: string; count: number; value: number }>>((acc, po) => {
      acc[po.status] ??= { label: po.status, count: 0, value: 0 };
      acc[po.status].count += 1;
      acc[po.status].value += po.total;
      return acc;
    }, {})
  ).sort((a, b) => b.value - a.value);

  const vendorTotals = vendors
    .map((vendor) => ({
      label: vendor.name,
      count: vendor.purchaseOrders.length,
      value: vendor.purchaseOrders.reduce((sum, po) => sum + po.total, 0),
    }))
    .sort((a, b) => b.value - a.value);

  return {
    metrics: {
      vendorCount: vendors.length,
      openPurchaseOrders: openPurchaseOrders.length,
      expectedValue,
      orderedUnits,
      receivedUnits,
    },
    vendors,
    purchaseOrders,
    openPurchaseOrders,
    statusTotals,
    vendorTotals,
  };
}
