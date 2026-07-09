import type { PrismaClient } from "@prisma/client";
import { daysAgo, daysFromNow, upsertUserWithCredentials } from "./helpers";

const TENANT_SLUG = "apex-performance";

export async function seedDemoTenant(prisma: PrismaClient) {
  const existing = await prisma.tenant.findUnique({
    where: { slug: TENANT_SLUG },
    include: { programs: { take: 1 } },
  });

  if (existing?.programs.length) {
    console.log(`⏭️  Demo tenant "${TENANT_SLUG}" already seeded — skipping`);
    return existing;
  }

  const coach = await upsertUserWithCredentials(prisma, {
    email: "coach@demo.coachos.app",
    name: "Apex Demo Coach",
    role: "COACH",
  });

  const trialEndsAt = daysFromNow(14);
  const periodEnd = daysFromNow(30);

  const tenant = await prisma.tenant.upsert({
    where: { slug: TENANT_SLUG },
    update: {
      name: "Apex Performance Coaching",
      status: "ACTIVE",
      plan: "PROFESSIONAL",
      businessType: "FITNESS_COACH",
      productLine: "COACH_OS",
      onboardingCompleted: true,
      trialEndsAt,
    },
    create: {
      name: "Apex Performance Coaching",
      slug: TENANT_SLUG,
      status: "ACTIVE",
      plan: "PROFESSIONAL",
      businessType: "FITNESS_COACH",
      productLine: "COACH_OS",
      onboardingCompleted: true,
      trialEndsAt,
      theme: {
        create: {
          primaryColor: "#0d9488",
          secondaryColor: "#14b8a6",
          heroTitle: "Train Smarter. Recover Faster.",
          heroSubtitle:
            "Personalized strength and conditioning programs for busy professionals.",
          heroCtaText: "Book a Consultation",
        },
      },
      settings: {
        create: {
          businessName: "Apex Performance Coaching",
          businessEmail: "coach@demo.coachos.app",
          businessPhone: "+1-555-0100",
          currency: "USD",
          timezone: "America/New_York",
          city: "Demo City",
          country: "United States",
          marketplaceEnabled: true,
        },
      },
      subscription: {
        create: {
          plan: "PROFESSIONAL",
          status: "ACTIVE",
          currentPeriodStart: daysAgo(5),
          currentPeriodEnd: periodEnd,
        },
      },
      members: {
        create: {
          userId: coach.id,
          role: "COACH",
        },
      },
    },
    include: { settings: true },
  });

  await prisma.tenantMember.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: coach.id } },
    update: { role: "COACH", isActive: true },
    create: { tenantId: tenant.id, userId: coach.id, role: "COACH" },
  });

  await seedRecoveryServices(prisma, tenant.id);
  await seedCmsPages(prisma, tenant.id);
  await seedMarketplaceProfile(prisma, tenant.id);
  await seedTenantModules(prisma, tenant.id);
  await seedExerciseLibrary(prisma, tenant.id);
  await seedPrograms(prisma, tenant.id);
  const clients = await seedClients(prisma, tenant.id, coach.id);
  await seedBookings(prisma, tenant.id, clients);
  await seedPlatformExtras(prisma, tenant.id);

  console.log(`✅ Demo tenant: ${tenant.slug} (${tenant.name})`);
  return tenant;
}

async function seedRecoveryServices(prisma: PrismaClient, tenantId: string) {
  const services = [
    {
      name: "Sports Massage",
      slug: "sports-massage",
      description: "Deep tissue massage focused on athletic recovery",
      duration: 60,
      price: 85,
    },
    {
      name: "Mobility Session",
      slug: "mobility-session",
      description: "Guided mobility and flexibility work",
      duration: 45,
      price: 55,
    },
    {
      name: "Recovery Consultation",
      slug: "recovery-consultation",
      description: "Assessment and recovery plan review",
      duration: 30,
      price: 40,
    },
  ];

  for (const service of services) {
    await prisma.recoveryService.upsert({
      where: { tenantId_slug: { tenantId, slug: service.slug } },
      update: service,
      create: { tenantId, ...service },
    });
  }

  const massage = await prisma.recoveryService.findUnique({
    where: { tenantId_slug: { tenantId, slug: "sports-massage" } },
  });

  if (massage) {
    const days = ["MONDAY", "WEDNESDAY", "FRIDAY"] as const;
    for (const dayOfWeek of days) {
      const exists = await prisma.timeSlot.findFirst({
        where: { tenantId, serviceId: massage.id, dayOfWeek },
      });
      if (!exists) {
        await prisma.timeSlot.create({
          data: {
            tenantId,
            serviceId: massage.id,
            dayOfWeek,
            startTime: "09:00",
            endTime: "17:00",
            capacity: 4,
          },
        });
      }
    }
  }
}

async function seedCmsPages(prisma: PrismaClient, tenantId: string) {
  const pages = ["home", "about", "contact", "recovery", "pricing", "faq"];
  for (const slug of pages) {
    await prisma.cmsPage.upsert({
      where: { tenantId_slug: { tenantId, slug } },
      update: {},
      create: {
        tenantId,
        slug,
        title: slug.charAt(0).toUpperCase() + slug.slice(1),
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  }
}

async function seedMarketplaceProfile(prisma: PrismaClient, tenantId: string) {
  await prisma.coachMarketplaceProfile.upsert({
    where: { tenantId },
    update: {},
    create: {
      tenantId,
      isVisible: true,
      isVerified: true,
      isFeatured: true,
      instantBooking: true,
      marketplaceTier: "FEATURED",
      headline: "Strength & Conditioning for Professionals",
      bio: "Demo coaching business showcasing programs, bookings, and client management in CoachOS.",
      country: "United States",
      city: "Demo City",
      yearsExperience: 8,
      specialties: ["Strength Training", "Conditioning", "Recovery"],
      languages: ["English"],
      startingPrice: 75,
      averageRating: 4.9,
      reviewCount: 12,
    },
  });
}

async function seedTenantModules(prisma: PrismaClient, tenantId: string) {
  const modules = [
    "PROGRAMS",
    "NUTRITION",
    "RECOVERY",
    "MARKETPLACE",
    "BOOKINGS",
    "REPORTS",
    "BLOG",
    "MARKETING",
    "AI",
    "CRM",
    "FINANCE",
    "SMART_CALENDAR",
    "MOBILE_API",
    "CLIENT_APP",
    "STAFF",
    "ATTENDANCE",
    "INTEGRATIONS",
    "NOTIFICATION_CENTER",
    "HELP_CENTER",
    "GAMIFICATION",
    "FORMS_BUILDER",
  ] as const;

  for (const module of modules) {
    await prisma.tenantModuleConfig.upsert({
      where: { tenantId_module: { tenantId, module } },
      update: { isEnabled: true },
      create: { tenantId, module, isEnabled: true },
    });
  }

  await prisma.financialWallet.upsert({
    where: { tenantId },
    update: { balance: 2480, currency: "USD" },
    create: { tenantId, balance: 2480, currency: "USD" },
  });

  const integrations = ["STRIPE", "WHATSAPP", "GOOGLE_CALENDAR"] as const;
  for (const provider of integrations) {
    await prisma.tenantIntegration.upsert({
      where: { tenantId_provider: { tenantId, provider } },
      update: {},
      create: {
        tenantId,
        provider,
        isEnabled: provider === "STRIPE",
      },
    });
  }
}

async function seedExerciseLibrary(prisma: PrismaClient, tenantId: string) {
  const exercises = [
    {
      title: "Barbell Back Squat",
      category: "Strength",
      muscleGroup: "Legs",
      equipment: "Barbell",
      level: "Intermediate",
      videoUrl: "https://example.com/demo/squat",
      tips: "Brace core, track knees over toes.",
    },
    {
      title: "Romanian Deadlift",
      category: "Strength",
      muscleGroup: "Hamstrings",
      equipment: "Barbell",
      level: "Intermediate",
      videoUrl: "https://example.com/demo/rdl",
      tips: "Hinge at hips, keep bar close to legs.",
    },
    {
      title: "Push-Up",
      category: "Bodyweight",
      muscleGroup: "Chest",
      equipment: "None",
      level: "Beginner",
      videoUrl: "https://example.com/demo/pushup",
      tips: "Maintain a straight line from head to heels.",
    },
    {
      title: "Plank Hold",
      category: "Core",
      muscleGroup: "Core",
      equipment: "Mat",
      level: "Beginner",
      videoUrl: "https://example.com/demo/plank",
      tips: "Squeeze glutes and avoid sagging hips.",
    },
  ];

  for (const exercise of exercises) {
    const existing = await prisma.exerciseVideo.findFirst({
      where: { tenantId, title: exercise.title },
    });
    if (!existing) {
      await prisma.exerciseVideo.create({ data: { tenantId, ...exercise } });
    }
  }
}

async function seedPrograms(prisma: PrismaClient, tenantId: string) {
  const program = await prisma.program.upsert({
    where: { tenantId_slug: { tenantId, slug: "12-week-strength" } },
    update: {},
    create: {
      tenantId,
      name: "12-Week Strength Foundation",
      slug: "12-week-strength",
      description:
        "Progressive full-body strength program for intermediate trainees.",
      durationWeeks: 12,
      status: "ACTIVE",
      isPublic: true,
      price: 199,
      currency: "USD",
      features: ["Weekly workouts", "Form check-ins", "Recovery guidance"],
    },
  });

  const existingWorkout = await prisma.workoutPlan.findFirst({
    where: { tenantId, programId: program.id, weekNumber: 1, dayNumber: 1 },
  });

  if (!existingWorkout) {
    const workoutPlan = await prisma.workoutPlan.create({
      data: {
        tenantId,
        programId: program.id,
        name: "Week 1 — Full Body A",
        weekNumber: 1,
        dayNumber: 1,
        order: 1,
        exercises: {
          create: [
            {
              name: "Barbell Back Squat",
              muscleGroup: "Legs",
              sets: 4,
              reps: "6-8",
              restSeconds: 120,
            },
            {
              name: "Romanian Deadlift",
              muscleGroup: "Hamstrings",
              sets: 3,
              reps: "8-10",
              restSeconds: 90,
            },
            {
              name: "Push-Up",
              muscleGroup: "Chest",
              sets: 3,
              reps: "10-15",
              restSeconds: 60,
            },
            {
              name: "Plank Hold",
              muscleGroup: "Core",
              sets: 3,
              reps: "45s",
              restSeconds: 45,
            },
          ],
        },
      },
    });
    console.log(`   Program: ${program.slug}, workout plan: ${workoutPlan.name}`);
  } else {
    console.log(`   Program: ${program.slug} (workout plan exists)`);
  }

  const existingMealPlan = await prisma.mealPlan.findFirst({
    where: { tenantId, programId: program.id, name: "Balanced Performance Nutrition" },
  });

  if (!existingMealPlan) {
    const mealPlan = await prisma.mealPlan.create({
      data: {
        tenantId,
        programId: program.id,
        name: "Balanced Performance Nutrition",
        description: "Demo meal plan with moderate protein and whole foods.",
        isTemplate: true,
        meals: {
          create: {
            name: "Training Day Breakfast",
            mealType: "breakfast",
            order: 1,
            calories: 520,
            protein: 35,
            carbs: 55,
            fat: 18,
          },
        },
      },
    });
    console.log(`   Meal plan: ${mealPlan.name}`);
  }

  return program;
}

async function seedClients(
  prisma: PrismaClient,
  tenantId: string,
  coachId: string
) {
  const clientDefs = [
    {
      email: "client-alpha@demo.coachos.app",
      name: "Demo Client Alpha",
      goalType: "MUSCLE_GAIN" as const,
      goals: "Build lean muscle and improve squat form",
    },
    {
      email: "client-beta@demo.coachos.app",
      name: "Demo Client Beta",
      goalType: "WEIGHT_LOSS" as const,
      goals: "Lose 8kg while maintaining strength",
    },
    {
      email: "client-gamma@demo.coachos.app",
      name: "Demo Client Gamma",
      goalType: "FITNESS" as const,
      goals: "Improve energy and consistency with training",
    },
  ];

  const clients: { userId: string; profileId: string }[] = [];

  for (const def of clientDefs) {
    const user = await upsertUserWithCredentials(prisma, {
      email: def.email,
      name: def.name,
      role: "CLIENT",
    });

    await prisma.tenantMember.upsert({
      where: { tenantId_userId: { tenantId, userId: user.id } },
      update: { role: "CLIENT", isActive: true },
      create: { tenantId, userId: user.id, role: "CLIENT" },
    });

    const profile = await prisma.clientProfile.upsert({
      where: { userId: user.id },
      update: {
        tenantId,
        goals: def.goals,
        goalType: def.goalType,
        subscriptionStatus: "ACTIVE",
        subscriptionStartDate: daysAgo(30),
      },
      create: {
        tenantId,
        userId: user.id,
        goals: def.goals,
        goalType: def.goalType,
        subscriptionStatus: "ACTIVE",
        subscriptionStartDate: daysAgo(30),
        height: 175,
      },
    });

    const noteExists = await prisma.clientNote.findFirst({
      where: { tenantId, clientId: profile.id },
    });
    if (!noteExists) {
      await prisma.clientNote.create({
        data: {
          tenantId,
          clientId: profile.id,
          authorId: coachId,
          content: `Initial assessment completed. Focus: ${def.goals}`,
        },
      });
    }

    clients.push({ userId: user.id, profileId: profile.id });
  }

  const program = await prisma.program.findFirst({
    where: { tenantId, slug: "12-week-strength" },
  });

  if (program && clients[0]) {
    await prisma.programEnrollment.upsert({
      where: {
        programId_userId: { programId: program.id, userId: clients[0].userId },
      },
      update: { isActive: true, progress: 15 },
      create: {
        programId: program.id,
        userId: clients[0].userId,
        progress: 15,
        isActive: true,
      },
    });
  }

  console.log(`   Clients: ${clients.length} demo profiles`);
  return clients;
}

async function seedBookings(
  prisma: PrismaClient,
  tenantId: string,
  clients: { userId: string; profileId: string }[]
) {
  const service = await prisma.recoveryService.findUnique({
    where: { tenantId_slug: { tenantId, slug: "sports-massage" } },
  });

  if (!service || !clients.length) return;

  const bookingDate = daysFromNow(3);

  const existing = await prisma.booking.findFirst({
    where: { tenantId, userId: clients[0].userId, date: bookingDate },
  });

  if (!existing) {
    const payment = await prisma.payment.create({
      data: {
        tenantId,
        userId: clients[0].userId,
        amount: service.price,
        currency: "USD",
        status: "COMPLETED",
        provider: "MANUAL",
        description: "Demo sports massage booking",
      },
    });

    await prisma.booking.create({
      data: {
        tenantId,
        userId: clients[0].userId,
        serviceId: service.id,
        date: bookingDate,
        startTime: "10:00",
        endTime: "11:00",
        status: "CONFIRMED",
        price: service.price,
        currency: "USD",
        paymentId: payment.id,
        notes: "Demo booking — first recovery session",
      },
    });

    await prisma.booking.create({
      data: {
        tenantId,
        userId: clients[1].userId,
        serviceId: service.id,
        date: daysFromNow(5),
        startTime: "14:00",
        endTime: "15:00",
        status: "PENDING",
        price: service.price,
        currency: "USD",
        notes: "Demo booking — pending confirmation",
      },
    });

    console.log("   Bookings: 2 demo appointments");
  }
}

async function seedPlatformExtras(prisma: PrismaClient, tenantId: string) {
  const existing = await prisma.platformAnnouncement.findFirst({
    where: { title: "Welcome to CoachOS" },
  });

  if (!existing) {
    await prisma.platformAnnouncement.create({
      data: {
        title: "Welcome to CoachOS",
        content:
          "This environment includes demo data for exploring the platform. Replace with your own business data before going live.",
        isActive: true,
      },
    });
  }

  await prisma.coupon.upsert({
    where: { tenantId_code: { tenantId, code: "APEX10" } },
    update: {},
    create: {
      tenantId,
      code: "APEX10",
      description: "10% off first program enrollment",
      discountType: "PERCENTAGE",
      discountValue: 10,
      maxUses: 100,
      isActive: true,
    },
  });
}

export async function seedSuperAdmin(prisma: PrismaClient) {
  const admin = await upsertUserWithCredentials(prisma, {
    email: "admin@coachos.app",
    name: "Platform Administrator",
    role: "SUPER_ADMIN",
  });
  console.log(`✅ Super admin: ${admin.email}`);
  return admin;
}
