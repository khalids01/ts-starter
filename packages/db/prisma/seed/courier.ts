import prisma from "../../src/client.server";

export const steadfastCourierProvider = {
  code: "steadfast",
  displayName: "Steadfast Courier",
  capabilities: [
    "createConsignment",
    "getConsignmentStatus",
    "bulkCreateConsignments",
    "requestPickup",
    "createReturn",
    "listReturns",
    "getReturn",
    "getBalance",
    "listSettlements",
    "getSettlement",
    "getServiceAreas",
  ],
} as const;

export async function seedCourierProviders() {
  await prisma.courierProvider.upsert({
    where: { code: steadfastCourierProvider.code },
    create: {
      code: steadfastCourierProvider.code,
      displayName: steadfastCourierProvider.displayName,
      capabilities: [...steadfastCourierProvider.capabilities],
    },
    update: {
      displayName: steadfastCourierProvider.displayName,
      capabilities: [...steadfastCourierProvider.capabilities],
    },
  });
}

if (import.meta.main) {
  try {
    await seedCourierProviders();
    console.log("Courier provider seed completed");
  } finally {
    await prisma.$disconnect();
  }
}
