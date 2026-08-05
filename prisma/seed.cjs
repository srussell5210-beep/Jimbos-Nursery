const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(9, 0, 0, 0);
  return date;
};

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.widgetPreference.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.savedView.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.warrantyClaim.deleteMany();
  await prisma.serviceJob.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.purchaseOrderLine.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.stockLevel.deleteMany();
  await prisma.stockLocation.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.task.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.property.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.staffUser.deleteMany();

  const owner = await prisma.staffUser.create({
    data: {
      name: "Jimbo's Owner",
      email: "owner@jimbosnursery.local",
      role: "Owner/Admin",
      phone: "(409) 555-5210",
    },
  });

  const locations = await Promise.all(
    [
      ["Greenhouse", "Production"],
      ["Nursery Yard", "Retail"],
      ["Retail Floor", "Retail"],
      ["Warehouse", "Storage"],
      ["Delivery Truck", "Mobile"],
      ["Job Site", "Field"],
      ["Hold / Reserved Area", "Reserved"],
      ["Quarantine / Damaged Area", "Exception"],
    ].map(([name, locationType]) =>
      prisma.stockLocation.create({ data: { name, locationType } })
    )
  );

  const inventory = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        sku: "PALM-SABAL-15G",
        barcode: "850001000101",
        name: "Sabal Palm - 15 Gallon",
        category: "Trees & Shrubs",
        itemType: "Plant",
        botanicalName: "Sabal palmetto",
        commonName: "Sabal Palm",
        size: "15 gal",
        sunExposure: "Full sun",
        waterNeeds: "Moderate",
        hardinessZone: "8-11",
        nativeStatus: "Native",
        pollinatorFriendly: true,
        unitPrice: 185,
        unitCost: 92,
        landedCost: 106,
        reorderPoint: 12,
        seasonalAvailability: "Spring through fall",
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: "MULCH-HARDWOOD-CY",
        barcode: "850001000202",
        name: "Hardwood Mulch",
        category: "Bulk Materials",
        itemType: "Material",
        size: "Cubic yard",
        unitPrice: 42,
        unitCost: 19,
        landedCost: 24,
        reorderPoint: 20,
        seasonalAvailability: "Year round",
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: "FERT-PALM-25LB",
        barcode: "850001000303",
        name: "Palm Fertilizer - 25 lb",
        category: "Garden Supplies",
        itemType: "Supply",
        unitPrice: 34,
        unitCost: 16,
        landedCost: 18,
        reorderPoint: 10,
        seasonalAvailability: "Year round",
      },
    }),
  ]);

  await Promise.all([
    prisma.stockLevel.create({ data: { inventoryItemId: inventory[0].id, locationId: locations[1].id, quantityOnHand: 8 } }),
    prisma.stockLevel.create({ data: { inventoryItemId: inventory[1].id, locationId: locations[3].id, quantityOnHand: 18 } }),
    prisma.stockLevel.create({ data: { inventoryItemId: inventory[2].id, locationId: locations[2].id, quantityOnHand: 24 } }),
  ]);

  const contractor = await prisma.customer.create({
    data: {
      displayName: "Bay Area Landscape Co.",
      type: "Landscaper / Contractor",
      email: "orders@bayarealandscape.local",
      phone: "(409) 555-0198",
      billingAddress: "1204 Gulf Way, Santa Fe, TX",
      plantPreferences: "Cold-hardy palms, bulk mulch, contractor volume pricing",
      emailOptIn: true,
      smsOptIn: true,
      marketingOptIn: true,
      priceList: "Contractor 2026",
      contacts: {
        create: [{ name: "Maria Torres", role: "Purchasing Manager", email: "maria@bayarealandscape.local", phone: "(409) 555-0199", isPrimary: true }],
      },
      properties: {
        create: [{ label: "Commercial Client Site", address: "800 Garden Ridge Rd, League City, TX", contactPerson: "Maria Torres", deliveryInstructions: "Call 30 minutes before arrival." }],
      },
    },
  });

  const homeowner = await prisma.customer.create({
    data: {
      displayName: "Elaine Parker",
      type: "Repeat Homeowner",
      email: "elaine.parker@example.local",
      phone: "(409) 555-0142",
      billingAddress: "5210 Avenue S, Santa Fe, TX",
      plantPreferences: "Pollinator-friendly color, palms, low-maintenance shrubs",
      loyaltyPoints: 420,
      loyaltyTier: "Gold",
      emailOptIn: true,
      smsOptIn: true,
      properties: {
        create: [{ label: "Home Garden", address: "5210 Avenue S, Santa Fe, TX", serviceNotes: "Prefers Saturday consultations." }],
      },
    },
  });

  const municipality = await prisma.customer.create({
    data: {
      displayName: "City Parks Department",
      type: "Municipality",
      email: "parks@example.local",
      phone: "(409) 555-0111",
      taxExempt: true,
      taxCertificateNumber: "TX-PARKS-2044",
      priceList: "Municipal Contract",
    },
  });

  const lead = await prisma.lead.create({
    data: {
      customerId: homeowner.id,
      ownerId: owner.id,
      title: "Backyard palm and pollinator bed refresh",
      source: "Website request",
      stage: "Qualified",
      priority: "High",
      estimatedValue: 2850,
      nextStep: "Send revised quote with delivery window",
      dueDate: addDays(0),
    },
  });

  const contractorLead = await prisma.lead.create({
    data: {
      customerId: contractor.id,
      ownerId: owner.id,
      title: "Contractor spring replenishment order",
      source: "Repeat account",
      stage: "New",
      priority: "High",
      estimatedValue: 4200,
      nextStep: "Confirm plant list and contractor price sheet",
      dueDate: addDays(0),
    },
  });

  const municipalLead = await prisma.lead.create({
    data: {
      customerId: municipality.id,
      ownerId: owner.id,
      title: "City park seasonal color refresh",
      source: "Phone call",
      stage: "Quote Needed",
      priority: "Normal",
      estimatedValue: 7800,
      nextStep: "Prepare tax-exempt quote and delivery plan",
      dueDate: addDays(3),
    },
  });

  const designLead = await prisma.lead.create({
    data: {
      customerId: homeowner.id,
      ownerId: owner.id,
      title: "Front entry tropical redesign",
      source: "In-store conversation",
      stage: "Waiting on Customer",
      priority: "Normal",
      estimatedValue: 1650,
      nextStep: "Wait for customer photos before quote",
      dueDate: addDays(5),
    },
  });

  await prisma.task.createMany({
    data: [
      { customerId: homeowner.id, leadId: lead.id, assignedToId: owner.id, title: "Call Elaine about revised quote", type: "Follow-up", priority: "High", dueDate: addDays(0) },
      { customerId: contractor.id, leadId: contractorLead.id, assignedToId: owner.id, title: "Confirm contractor plant list", type: "Follow-up", priority: "High", dueDate: addDays(0) },
      { customerId: contractor.id, assignedToId: owner.id, title: "Confirm contractor mulch delivery count", type: "Delivery", priority: "Normal", dueDate: addDays(0) },
      { customerId: municipality.id, leadId: municipalLead.id, assignedToId: owner.id, title: "Request updated tax-exempt certificate", type: "Admin", priority: "Normal", dueDate: addDays(2) },
      { customerId: municipality.id, leadId: municipalLead.id, assignedToId: owner.id, title: "Draft seasonal color quote", type: "Quote", priority: "Normal", dueDate: addDays(3) },
      { customerId: homeowner.id, leadId: designLead.id, assignedToId: owner.id, title: "Ask Elaine for entry photos", type: "Follow-up", priority: "Low", dueDate: addDays(5) },
    ],
  });

  const quote = await prisma.quote.create({
    data: {
      quoteNumber: "Q-1001",
      customerId: homeowner.id,
      leadId: lead.id,
      ownerId: owner.id,
      stage: "Sent",
      subtotal: 2420,
      taxTotal: 199.65,
      depositRequired: 500,
      total: 2619.65,
      lineItems: {
        create: [
          { inventoryItemId: inventory[0].id, category: "Trees & Shrubs", description: "Sabal Palm - 15 Gallon", quantity: 4, unitPrice: 185, unitCost: 106, taxRate: 0.0825, total: 740 },
          { category: "Landscaping Services", description: "Planting and bed preparation", quantity: 1, unitPrice: 1680, unitCost: 850, taxRate: 0.0825, total: 1680 },
        ],
      },
    },
  });

  await prisma.quote.create({
    data: {
      quoteNumber: "Q-1002",
      customerId: contractor.id,
      leadId: contractorLead.id,
      ownerId: owner.id,
      stage: "Draft",
      subtotal: 3920,
      discountTotal: 220,
      taxTotal: 305.25,
      depositRequired: 800,
      total: 4005.25,
      notes: "Contractor spring replenishment package with price list adjustment.",
      lineItems: {
        create: [
          { inventoryItemId: inventory[0].id, category: "Trees & Shrubs", description: "Sabal Palm - 15 Gallon", quantity: 12, unitPrice: 170, unitCost: 106, discountAmount: 180, taxRate: 0.0825, total: 2040 },
          { inventoryItemId: inventory[2].id, category: "Garden Supplies", description: "Palm Fertilizer - 25 lb", quantity: 20, unitPrice: 31, unitCost: 18, discountAmount: 40, taxRate: 0.0825, total: 620 },
          { category: "Delivery Fees", description: "Contractor yard delivery", quantity: 1, unitPrice: 1260, unitCost: 650, taxRate: 0.0825, total: 1260 },
        ],
      },
    },
  });

  await prisma.quote.create({
    data: {
      quoteNumber: "Q-1003",
      customerId: municipality.id,
      leadId: municipalLead.id,
      ownerId: owner.id,
      stage: "Review",
      subtotal: 7800,
      taxTotal: 0,
      depositRequired: 0,
      total: 7800,
      notes: "Tax-exempt municipal seasonal color refresh.",
      lineItems: {
        create: [
          { category: "Landscaping Services", description: "Seasonal color design and install", quantity: 1, unitPrice: 5200, unitCost: 2850, total: 5200 },
          { category: "Trees & Shrubs", description: "Public park shrubs and color beds", quantity: 1, unitPrice: 2600, unitCost: 1420, total: 2600 },
        ],
      },
    },
  });

  const order = await prisma.salesOrder.create({
    data: {
      orderNumber: "O-1001",
      customerId: contractor.id,
      ownerId: owner.id,
      status: "Open",
      fulfillmentStatus: "Scheduled",
      subtotal: 1260,
      taxTotal: 103.95,
      total: 1363.95,
      lineItems: {
        create: [{ inventoryItemId: inventory[1].id, category: "Bulk Materials", description: "Hardwood Mulch", quantity: 30, unitPrice: 42, unitCost: 24, taxRate: 0.0825, total: 1260 }],
      },
    },
  });

  const homeownerOrder = await prisma.salesOrder.create({
    data: {
      orderNumber: "O-1002",
      customerId: homeowner.id,
      quoteId: quote.id,
      ownerId: owner.id,
      status: "Open",
      fulfillmentStatus: "Awaiting Deposit",
      subtotal: 2420,
      taxTotal: 199.65,
      total: 2619.65,
      lineItems: {
        create: [
          { inventoryItemId: inventory[0].id, category: "Trees & Shrubs", description: "Sabal Palm - 15 Gallon", quantity: 4, unitPrice: 185, unitCost: 106, taxRate: 0.0825, total: 740 },
          { category: "Landscaping Services", description: "Planting and bed preparation", quantity: 1, unitPrice: 1680, unitCost: 850, taxRate: 0.0825, total: 1680 },
        ],
      },
    },
  });

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-1001",
      customerId: contractor.id,
      orderId: order.id,
      ownerId: owner.id,
      status: "Partial",
      dueDate: addDays(14),
      subtotal: 1260,
      taxTotal: 103.95,
      depositTotal: 500,
      total: 1363.95,
      balanceDue: 863.95,
    },
  });

  await prisma.payment.create({
    data: {
      customerId: contractor.id,
      invoiceId: invoice.id,
      method: "ACH / Bank Transfer",
      amount: 500,
      reference: "DEP-1001",
    },
  });

  const homeownerInvoice = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-1002",
      customerId: homeowner.id,
      orderId: homeownerOrder.id,
      ownerId: owner.id,
      status: "Unpaid",
      dueDate: addDays(7),
      subtotal: 2420,
      taxTotal: 199.65,
      depositTotal: 0,
      total: 2619.65,
      balanceDue: 2619.65,
    },
  });

  await prisma.payment.create({
    data: {
      customerId: homeowner.id,
      invoiceId: homeownerInvoice.id,
      method: "Store Credit",
      amount: 0,
      status: "Pending",
      reference: "PENDING-DEP-1002",
      notes: "Awaiting deposit before inventory fulfillment.",
    },
  });

  await prisma.delivery.create({
    data: {
      customerId: contractor.id,
      orderId: order.id,
      status: "Scheduled",
      routeName: "South Yard Route",
      driverName: "Crew Driver",
      truckName: "Truck 1",
      deliveryWindow: "9:00 AM - 11:00 AM",
      scheduledFor: addDays(0),
      notes: "Deliver mulch to side entrance.",
    },
  });

  await prisma.serviceJob.create({
    data: {
      customerId: homeowner.id,
      propertyId: (await prisma.property.findFirstOrThrow({ where: { customerId: homeowner.id } })).id,
      jobType: "Planting / Install",
      status: "Scheduled",
      crewName: "Install Crew A",
      scheduledFor: addDays(3),
      laborCost: 520,
      materialCost: 424,
      revenue: 1680,
    },
  });

  const vendor = await prisma.vendor.create({
    data: {
      name: "Gulf Coast Growers",
      contactName: "Randy Cole",
      email: "orders@gulfcoastgrowers.local",
      phone: "(409) 555-0188",
      terms: "Net 15",
    },
  });

  await prisma.purchaseOrder.create({
    data: {
      poNumber: "PO-1001",
      vendorId: vendor.id,
      status: "Ordered",
      expectedDate: addDays(5),
      subtotal: 1840,
      freight: 160,
      total: 2000,
      lines: {
        create: [{ inventoryItemId: inventory[0].id, description: "Sabal Palm - 15 Gallon", quantityOrdered: 20, unitCost: 92 }],
      },
    },
  });

  await prisma.notification.createMany({
    data: [
      { title: "Low stock: Sabal Palm", body: "Sabal Palm is below reorder point in Nursery Yard.", type: "Inventory", recordType: "InventoryItem", recordId: inventory[0].id },
      { title: "Quote follow-up due", body: "Elaine Parker quote needs follow-up today.", type: "Follow-up", recordType: "Quote", recordId: quote.id },
      { title: "Delivery scheduled today", body: "Bay Area Landscape Co. delivery is scheduled this morning.", type: "Delivery", recordType: "Delivery" },
    ],
  });

  await prisma.activity.createMany({
    data: [
      { customerId: homeowner.id, staffUserId: owner.id, type: "Quote", title: "Quote Q-1001 sent", details: "Palm install quote sent with deposit request." },
      { customerId: contractor.id, staffUserId: owner.id, type: "Payment", title: "Deposit received", details: "$500 ACH deposit posted to INV-1001." },
      { customerId: contractor.id, staffUserId: owner.id, type: "Delivery", title: "Delivery scheduled", details: "South Yard Route assigned to Truck 1." },
    ],
  });

  await prisma.widgetPreference.createMany({
    data: [
      "followups",
      "new-leads",
      "open-quotes",
      "deliveries",
      "low-stock",
      "unpaid-invoices",
      "top-customers",
      "vendor-orders",
      "recent-activity",
    ].map((widgetKey, position) => ({
      staffUserId: owner.id,
      widgetKey,
      title: widgetKey.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" "),
      position,
      size: position < 4 ? "medium" : "small",
    })),
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
