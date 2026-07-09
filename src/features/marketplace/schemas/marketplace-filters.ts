import { z } from "zod";

export const marketplaceFiltersSchema = z.object({
  search: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  specialty: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxPrice: z.coerce.number().positive().optional(),
  language: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(12),
  sortBy: z
    .enum(["rating", "price_asc", "price_desc", "experience", "newest"])
    .default("rating"),
});

export type MarketplaceFilters = z.infer<typeof marketplaceFiltersSchema>;

export const updateMarketplaceProfileSchema = z.object({
  tenantId: z.string(),
  isVisible: z.boolean().optional(),
  headline: z.string().max(120).optional(),
  bio: z.string().max(2000).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  yearsExperience: z.number().int().min(0).max(50).optional(),
  specialties: z.array(z.string()).max(10).optional(),
  languages: z.array(z.string()).max(10).optional(),
  startingPrice: z.number().positive().optional(),
  currency: z.string().optional(),
  profileImageUrl: z.string().url().nullable().optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  videoIntroUrl: z.string().url().nullable().optional(),
});

export type UpdateMarketplaceProfileInput = z.infer<
  typeof updateMarketplaceProfileSchema
>;
