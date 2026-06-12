import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(import.meta.dir, "../../../../apps/server/.env"),
});

const [{ default: prisma }, { getRedis }, { seedRbac }, { seedEcommerce }] =
  await Promise.all([
    import("../../src/client.server"),
    import("../../../redis/src/index.server"),
    import("./rbac"),
    import("./ecommerce"),
  ]);

await seedRbac();
console.log("RBAC seed completed");

await seedEcommerce();
console.log("Ecommerce seed completed");

await prisma.$disconnect();

try {
  const redis = getRedis();
  if (redis.status === "ready") {
    await redis.quit();
  }
} catch {
  // Redis optional during seed
}
