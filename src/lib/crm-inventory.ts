import { prisma } from "@/lib/prisma";
import { isCrmTestDataEnabled } from "@/lib/crm-test-data";

export async function getCrmInventoryData() {
  if (!isCrmTestDataEnabled()) {
    return {
      metrics: {
        itemCount: 0,
        lowStockCount: 0,
        quantityOnHand: 0,
        damagedQuantity: 0,
        inventoryValue: 0,
        retailValue: 0,
        activePurchaseOrders: 0,
      },
      items: [],
      lowStockItems: [],
      categoryTotals: [],
      locationTotals: [],
      purchaseOrders: [],
    };
  }

  const [items, locations, purchaseOrders] = await Promise.all([
    prisma.inventoryItem.findMany({
      include: {
        stockLevels: {
          include: { location: true },
        },
        purchaseLines: {
          include: { purchaseOrder: { include: { vendor: true } } },
        },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.stockLocation.findMany({
      include: {
        stockLevels: {
          include: { inventoryItem: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.purchaseOrder.findMany({
      include: { vendor: true, lines: true },
      where: { status: { notIn: ["Closed", "Cancelled"] } },
      orderBy: { expectedDate: "asc" },
    }),
  ]);

  const enrichedItems = items.map((item) => {
    const quantityOnHand = item.stockLevels.reduce((sum, level) => sum + level.quantityOnHand, 0);
    const quantityDamaged = item.stockLevels.reduce((sum, level) => sum + level.quantityDamaged, 0);
    const inventoryValue = quantityOnHand * item.landedCost;
    const availableValue = quantityOnHand * item.unitPrice;
    const lowStock = quantityOnHand <= item.reorderPoint;

    return {
      ...item,
      quantityOnHand,
      quantityDamaged,
      inventoryValue,
      availableValue,
      lowStock,
    };
  });

  const lowStockItems = enrichedItems.filter((item) => item.lowStock);
  const inventoryValue = enrichedItems.reduce((sum, item) => sum + item.inventoryValue, 0);
  const retailValue = enrichedItems.reduce((sum, item) => sum + item.availableValue, 0);
  const quantityOnHand = enrichedItems.reduce((sum, item) => sum + item.quantityOnHand, 0);
  const damagedQuantity = enrichedItems.reduce((sum, item) => sum + item.quantityDamaged, 0);

  const categoryTotals = Object.values(
    enrichedItems.reduce<Record<string, { label: string; count: number; quantity: number; value: number }>>((acc, item) => {
      acc[item.category] ??= { label: item.category, count: 0, quantity: 0, value: 0 };
      acc[item.category].count += 1;
      acc[item.category].quantity += item.quantityOnHand;
      acc[item.category].value += item.inventoryValue;
      return acc;
    }, {})
  ).sort((a, b) => b.value - a.value);

  const locationTotals = locations.map((location) => ({
    id: location.id,
    name: location.name,
    type: location.locationType,
    quantity: location.stockLevels.reduce((sum, level) => sum + level.quantityOnHand, 0),
    value: location.stockLevels.reduce((sum, level) => sum + level.quantityOnHand * level.inventoryItem.landedCost, 0),
  }));

  return {
    metrics: {
      itemCount: items.length,
      lowStockCount: lowStockItems.length,
      quantityOnHand,
      damagedQuantity,
      inventoryValue,
      retailValue,
      activePurchaseOrders: purchaseOrders.length,
    },
    items: enrichedItems,
    lowStockItems,
    categoryTotals,
    locationTotals,
    purchaseOrders,
  };
}
