import { PrismaClient } from "@prisma/client";
import { seedDemoTenant, seedSuperAdmin } from "../prisma/seed/demo-tenant";
import { DEMO_SEED_PASSWORD } from "../prisma/seed/helpers";

async function globalSetup() {
  if (!process.env.DATABASE_URL) {
    console.warn(
      "[e2e] DATABASE_URL is not set — auth regression tests require a database."
    );
    return;
  }

  const prisma = new PrismaClient();

  try {
    await seedSuperAdmin(prisma);
    await seedDemoTenant(prisma);
    process.env.E2E_DEMO_PASSWORD = DEMO_SEED_PASSWORD;
    console.log("[e2e] Seed data ready for auth regression tests.");
  } finally {
    await prisma.$disconnect();
  }
}

export default globalSetup;
