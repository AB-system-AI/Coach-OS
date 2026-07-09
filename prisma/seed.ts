import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CoachOS database...");

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@coachos.app" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@coachos.app",
      emailVerified: true,
      role: "SUPER_ADMIN",
    },
  });

  console.log(`✅ Super Admin: ${superAdmin.email}`);

  const demoCoach = await prisma.user.upsert({
    where: { email: "coach@demo.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "coach@demo.com",
      emailVerified: true,
      role: "COACH",
    },
  });

  const existingTenant = await prisma.tenant.findUnique({
    where: { slug: "demo-coach" },
  });

  if (!existingTenant) {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const tenant = await prisma.tenant.create({
      data: {
        name: "Demo Coach",
        slug: "demo-coach",
        status: "ACTIVE",
        plan: "PROFESSIONAL",
        trialEndsAt,
        theme: {
          create: {
            primaryColor: "#6366f1",
            secondaryColor: "#8b5cf6",
            heroTitle: "Transform Your Body & Mind",
            heroSubtitle:
              "Professional fitness coaching tailored to your unique goals.",
            heroCtaText: "Book a Session",
          },
        },
        settings: {
          create: {
            businessName: "Demo Coach Fitness",
            businessEmail: "coach@demo.com",
            currency: "USD",
          },
        },
        subscription: {
          create: {
            plan: "PROFESSIONAL",
            status: "ACTIVE",
          },
        },
        members: {
          create: {
            userId: demoCoach.id,
            role: "COACH",
          },
        },
      },
    });

    const recoveryServices = [
      {
        name: "Sports Massage",
        slug: "sports-massage",
        description: "Deep tissue massage for athletes",
        duration: 60,
        price: 80,
      },
      {
        name: "Ice Bath",
        slug: "ice-bath",
        description: "Cold therapy for recovery",
        duration: 15,
        price: 25,
      },
      {
        name: "Stretching Session",
        slug: "stretching",
        description: "Guided flexibility training",
        duration: 45,
        price: 50,
      },
    ];

    for (const service of recoveryServices) {
      await prisma.recoveryService.create({
        data: { tenantId: tenant.id, ...service },
      });
    }

    const defaultPages = [
      "home",
      "about",
      "contact",
      "recovery",
      "pricing",
      "faq",
    ];
    for (const slug of defaultPages) {
      await prisma.cmsPage.create({
        data: {
          tenantId: tenant.id,
          slug,
          title: slug.charAt(0).toUpperCase() + slug.slice(1),
          status: "PUBLISHED",
        },
      });
    }

    console.log(`✅ Demo Tenant: ${tenant.slug} (${tenant.name})`);

    await prisma.coachMarketplaceProfile.upsert({
      where: { tenantId: tenant.id },
      update: {},
      create: {
        tenantId: tenant.id,
        isVisible: true,
        isVerified: true,
        isFeatured: true,
        instantBooking: true,
        marketplaceTier: "FEATURED",
        headline: "Elite Fitness & Recovery Coach",
        bio: "10+ years helping athletes and professionals achieve peak performance through personalized training and recovery protocols.",
        country: "United States",
        city: "Los Angeles",
        gender: "MALE",
        yearsExperience: 10,
        specialties: ["Strength Training", "Sports Recovery", "Nutrition"],
        languages: ["English", "Arabic"],
        startingPrice: 50,
        averageRating: 4.8,
        reviewCount: 24,
      },
    });

    await prisma.tenantSettings.update({
      where: { tenantId: tenant.id },
      data: { marketplaceEnabled: true },
    });

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        productLine: "COACH_OS",
        businessType: "FITNESS_COACH",
        onboardingCompleted: true,
      },
    });

    const modules = [
      "PROGRAMS", "NUTRITION", "RECOVERY", "MARKETPLACE", "BOOKINGS",
      "REPORTS", "BLOG", "MARKETING", "AI", "CRM",
      "FINANCE", "SMART_CALENDAR", "MOBILE_API", "CLIENT_APP",
      "STAFF", "ATTENDANCE", "INTEGRATIONS", "NOTIFICATION_CENTER",
      "HELP_CENTER", "GAMIFICATION", "FORMS_BUILDER",
    ] as const;
    await prisma.tenantModuleConfig.createMany({
      data: modules.map((module) => ({
        tenantId: tenant.id,
        module,
        isEnabled: true,
      })),
    });

    await prisma.financialWallet.create({
      data: { tenantId: tenant.id, balance: 1250, currency: "USD" },
    });

    await prisma.tenantIntegration.createMany({
      data: [
        { tenantId: tenant.id, provider: "STRIPE", isEnabled: true },
        { tenantId: tenant.id, provider: "WHATSAPP", isEnabled: false },
        { tenantId: tenant.id, provider: "GOOGLE_CALENDAR", isEnabled: false },
      ],
    });
  }

  await prisma.platformAnnouncement.create({
    data: {
      title: "Welcome to CoachOS Beta!",
      content:
        "We're excited to have you on board. Explore all features during your free trial.",
      isActive: true,
    },
  });

  console.log("✅ Platform announcement created");
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
