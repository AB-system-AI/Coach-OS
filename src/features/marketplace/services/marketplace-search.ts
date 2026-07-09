import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import {
  marketplaceFiltersSchema,
  type MarketplaceFilters,
} from "@/features/marketplace/schemas/marketplace-filters";

export type MarketplaceCoachCard = {
  id: string;
  tenantId: string;
  slug: string;
  name: string;
  headline: string | null;
  bio: string | null;
  country: string | null;
  city: string | null;
  gender: string | null;
  yearsExperience: number | null;
  specialties: string[];
  languages: string[];
  startingPrice: number | null;
  currency: string;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  averageRating: number;
  reviewCount: number;
  isVerified: boolean;
  recoveryServiceCount: number;
  programCount: number;
};

function buildWhere(filters: MarketplaceFilters): Prisma.CoachMarketplaceProfileWhereInput {
  const where: Prisma.CoachMarketplaceProfileWhereInput = {
    isVisible: true,
    tenant: {
      status: { in: ["ACTIVE", "TRIAL"] },
      settings: { marketplaceEnabled: true },
    },
  };

  if (filters.search) {
    where.OR = [
      { tenant: { name: { contains: filters.search, mode: "insensitive" } } },
      { headline: { contains: filters.search, mode: "insensitive" } },
      { bio: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.country) where.country = { equals: filters.country, mode: "insensitive" };
  if (filters.city) where.city = { contains: filters.city, mode: "insensitive" };
  if (filters.gender) where.gender = filters.gender;
  if (filters.minRating) where.averageRating = { gte: filters.minRating };
  if (filters.maxPrice) where.startingPrice = { lte: filters.maxPrice };
  if (filters.specialty) where.specialties = { has: filters.specialty };
  if (filters.language) where.languages = { has: filters.language };

  return where;
}

function buildOrderBy(
  sortBy: MarketplaceFilters["sortBy"]
): Prisma.CoachMarketplaceProfileOrderByWithRelationInput[] {
  switch (sortBy) {
    case "price_asc":
      return [{ startingPrice: "asc" }];
    case "price_desc":
      return [{ startingPrice: "desc" }];
    case "experience":
      return [{ yearsExperience: "desc" }];
    case "newest":
      return [{ createdAt: "desc" }];
    case "rating":
    default:
      return [{ averageRating: "desc" }, { reviewCount: "desc" }];
  }
}

export async function searchMarketplaceCoaches(rawFilters: unknown) {
  const filters = marketplaceFiltersSchema.parse(rawFilters);
  const where = buildWhere(filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [profiles, total] = await Promise.all([
    db.coachMarketplaceProfile.findMany({
      where,
      skip,
      take: filters.pageSize,
      orderBy: buildOrderBy(filters.sortBy),
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            _count: {
              select: {
                recoveryServices: { where: { isActive: true } },
                programs: { where: { status: "ACTIVE" } },
              },
            },
          },
        },
      },
    }),
    db.coachMarketplaceProfile.count({ where }),
  ]);

  const coaches: MarketplaceCoachCard[] = profiles.map((p) => ({
    id: p.id,
    tenantId: p.tenantId,
    slug: p.tenant.slug,
    name: p.tenant.name,
    headline: p.headline,
    bio: p.bio,
    country: p.country,
    city: p.city,
    gender: p.gender,
    yearsExperience: p.yearsExperience,
    specialties: p.specialties,
    languages: p.languages,
    startingPrice: p.startingPrice ? Number(p.startingPrice) : null,
    currency: p.currency,
    profileImageUrl: p.profileImageUrl,
    coverImageUrl: p.coverImageUrl,
    averageRating: p.averageRating,
    reviewCount: p.reviewCount,
    isVerified: p.isVerified,
    recoveryServiceCount: p.tenant._count.recoveryServices,
    programCount: p.tenant._count.programs,
  }));

  return {
    coaches,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.ceil(total / filters.pageSize),
  };
}

export async function getMarketplaceFilterOptions() {
  const profiles = await db.coachMarketplaceProfile.findMany({
    where: { isVisible: true },
    select: {
      country: true,
      city: true,
      specialties: true,
      languages: true,
    },
  });

  const countries = new Set<string>();
  const cities = new Set<string>();
  const specialties = new Set<string>();
  const languages = new Set<string>();

  for (const p of profiles) {
    if (p.country) countries.add(p.country);
    if (p.city) cities.add(p.city);
    p.specialties.forEach((s) => specialties.add(s));
    p.languages.forEach((l) => languages.add(l));
  }

  return {
    countries: Array.from(countries).sort(),
    cities: Array.from(cities).sort(),
    specialties: Array.from(specialties).sort(),
    languages: Array.from(languages).sort(),
  };
}

export async function getMarketplaceCoachBySlug(slug: string) {
  const tenant = await db.tenant.findFirst({
    where: {
      slug,
      status: { in: ["ACTIVE", "TRIAL"] },
      marketplaceProfile: { isVisible: true },
      settings: { marketplaceEnabled: true },
    },
    include: {
      marketplaceProfile: true,
      theme: true,
      settings: true,
      certifications: { orderBy: { order: "asc" } },
      galleryItems: { orderBy: { order: "asc" } },
      recoveryServices: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
      recoveryPackages: { where: { isActive: true } },
      programs: {
        where: { status: "ACTIVE", isPublic: true },
        take: 10,
      },
      exerciseVideos: { take: 6, orderBy: { createdAt: "desc" } },
      reviews: {
        where: { isPublic: true },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, image: true } },
        },
      },
      timeSlots: { where: { isActive: true } },
      members: {
        where: { role: "COACH" },
        include: { user: { select: { name: true, image: true } } },
        take: 1,
      },
    },
  });

  return tenant;
}

export async function syncMarketplaceRatings(tenantId: string) {
  const agg = await db.review.aggregate({
    where: { tenantId, isPublic: true },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await db.coachMarketplaceProfile.upsert({
    where: { tenantId },
    update: {
      averageRating: agg._avg.rating ?? 0,
      reviewCount: agg._count.rating,
    },
    create: {
      tenantId,
      averageRating: agg._avg.rating ?? 0,
      reviewCount: agg._count.rating,
    },
  });
}
