import { db } from "@/lib/db";

// ── Programs ──────────────────────────────────────────────────────────────────

export async function getPublicPrograms(tenantId: string) {
  return db.program.findMany({
    where: { tenantId, status: "ACTIVE", isPublic: true, isTemplate: false },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPublicProgram(tenantId: string, slug: string) {
  return db.program.findUnique({
    where: { tenantId_slug: { tenantId, slug } },
  });
}

export async function getPublicProgramsCount(tenantId: string) {
  return db.program.count({
    where: { tenantId, status: "ACTIVE", isPublic: true, isTemplate: false },
  });
}

// ── Recovery Services ─────────────────────────────────────────────────────────

export async function getPublicServices(tenantId: string) {
  return db.recoveryService.findMany({
    where: { tenantId, isActive: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { timeSlots: { where: { isActive: true } } },
  });
}

export async function getPublicService(tenantId: string, slug: string) {
  return db.recoveryService.findUnique({
    where: { tenantId_slug: { tenantId, slug } },
    include: { timeSlots: { where: { isActive: true } } },
  });
}

export async function getPublicServicesCount(tenantId: string) {
  return db.recoveryService.count({ where: { tenantId, isActive: true } });
}

export async function getPublicPackages(tenantId: string) {
  return db.recoveryPackage.findMany({
    where: { tenantId, isActive: true },
    include: {
      items: {
        include: { service: { select: { name: true, duration: true } } },
      },
    },
    orderBy: { price: "asc" },
  });
}

export async function getTimeSlots(tenantId: string, serviceId?: string) {
  return db.timeSlot.findMany({
    where: { tenantId, isActive: true, ...(serviceId ? { serviceId } : {}) },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}

// ── Blog ──────────────────────────────────────────────────────────────────────

export async function getPublicBlogPosts(tenantId: string, limit = 20) {
  return db.blogPost.findMany({
    where: { tenantId, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: { category: { select: { name: true, slug: true } } },
  });
}

export async function getPublicBlogPost(tenantId: string, slug: string) {
  return db.blogPost.findUnique({
    where: { tenantId_slug: { tenantId, slug } },
    include: { category: { select: { name: true, slug: true } } },
  });
}

export async function getRelatedBlogPosts(
  tenantId: string,
  categoryId: string | null,
  excludeSlug: string,
  limit = 3
) {
  return db.blogPost.findMany({
    where: {
      tenantId,
      status: "PUBLISHED",
      slug: { not: excludeSlug },
      ...(categoryId ? { categoryId } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: { title: true, slug: true, excerpt: true, coverImageUrl: true, publishedAt: true },
  });
}

// ── FAQs ──────────────────────────────────────────────────────────────────────

export async function getPublicFaqs(tenantId: string) {
  return db.faq.findMany({
    where: { tenantId, isActive: true },
    orderBy: { order: "asc" },
  });
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function getPublicReviews(tenantId: string) {
  return db.review.findMany({
    where: { tenantId, isPublic: true },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, image: true } } },
    take: 50,
  });
}

export async function getReviewStats(tenantId: string) {
  const reviews = await db.review.findMany({
    where: { tenantId, isPublic: true },
    select: { rating: true },
  });
  if (reviews.length === 0) return { avg: 0, count: 0, breakdown: {} };
  const total = reviews.reduce((s, r) => s + r.rating, 0);
  const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => breakdown[r.rating]++);
  return { avg: total / reviews.length, count: reviews.length, breakdown };
}

// ── Gallery ───────────────────────────────────────────────────────────────────

export async function getPublicGallery(tenantId: string) {
  return db.coachGalleryItem.findMany({
    where: { tenantId },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
}

export async function getPublicMediaImages(tenantId: string, limit = 40) {
  return db.media.findMany({
    where: { tenantId, type: "IMAGE" },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { url: true, alt: true, name: true, width: true, height: true },
  });
}

// ── CMS Pages ─────────────────────────────────────────────────────────────────

export async function getPublicCmsPage(tenantId: string, slug: string) {
  return db.cmsPage.findUnique({
    where: { tenantId_slug: { tenantId, slug } },
  });
}

// ── Certifications & Profile ──────────────────────────────────────────────────

export async function getPublicCertifications(tenantId: string) {
  return db.coachCertification.findMany({
    where: { tenantId },
    orderBy: [{ order: "asc" }, { year: "desc" }],
  });
}

export async function getPublicMarketplaceProfile(tenantId: string) {
  return db.coachMarketplaceProfile.findUnique({
    where: { tenantId },
  });
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function searchPublicContent(tenantId: string, query: string) {
  const q = query.toLowerCase();
  const [programs, posts, services, faqs] = await Promise.all([
    db.program.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
        isPublic: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
    db.blogPost.findMany({
      where: {
        tenantId,
        status: "PUBLISHED",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
    db.recoveryService.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
    db.faq.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: [
          { question: { contains: q, mode: "insensitive" } },
          { answer: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
  ]);
  return { programs, posts, services, faqs };
}

// ── Home Page Stats ───────────────────────────────────────────────────────────

export async function getHomePageStats(tenantId: string) {
  const [programCount, serviceCount, reviewCount] = await Promise.all([
    db.program.count({ where: { tenantId, status: "ACTIVE", isPublic: true } }),
    db.recoveryService.count({ where: { tenantId, isActive: true } }),
    db.review.count({ where: { tenantId, isPublic: true } }),
  ]);
  const reviewAvg = await db.review.aggregate({
    where: { tenantId, isPublic: true },
    _avg: { rating: true },
  });
  return {
    programCount,
    serviceCount,
    reviewCount,
    avgRating: reviewAvg._avg.rating ?? 0,
  };
}
