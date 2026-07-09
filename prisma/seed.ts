import { PrismaClient } from "@prisma/client";
import { DEMO_SEED_PASSWORD } from "./seed/helpers";
import { seedDemoTenant, seedSuperAdmin } from "./seed/demo-tenant";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CoachOS database...\n");

  await seedSuperAdmin(prisma);
  await seedDemoTenant(prisma);

  console.log("\n📋 Demo credentials (development / staging only):");
  console.log("   Super admin: admin@coachos.app");
  console.log("   Coach:       coach@demo.coachos.app");
  console.log("   Clients:     client-alpha@demo.coachos.app, client-beta@..., client-gamma@...");
  console.log(`   Password:    ${DEMO_SEED_PASSWORD}`);
  console.log("   Tenant slug: apex-performance");
  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
