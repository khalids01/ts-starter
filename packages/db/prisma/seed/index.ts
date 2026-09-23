import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(import.meta.dir, "../../../../apps/server/.env"),
});

const [
  { default: prisma },
  { getRedis },
  { seedRbac },
  { seedCourierProviders },
  { seedEcommerce },
] =
  await Promise.all([
    import("../../src/client.server"),
    import("../../../redis/src/index.server"),
    import("./rbac"),
    import("./courier"),
    import("./ecommerce"),
  ]);

try {
  await seedRbac();
  console.log("RBAC seed completed");

  await seedCourierProviders();
  console.log("Courier provider seed completed");

  await seedEcommerce();
  console.log("Ecommerce seed completed");
} finally {
  await prisma.$disconnect();

  try {
    const redis = getRedis();
    if (redis.status === "ready") {
      await redis.quit();
    }
  } catch {
    // Redis optional during seed
  }
}
