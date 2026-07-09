"use server";

import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateThemeSchema = z.object({
  tenantId: z.string(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  fontFamily: z.string().optional(),
  headingFont: z.string().optional(),
  borderRadius: z.string().optional(),
  logoUrl: z.string().nullable().optional(),
  faviconUrl: z.string().nullable().optional(),
  heroImageUrl: z.string().nullable().optional(),
  heroTitle: z.string().nullable().optional(),
  heroSubtitle: z.string().nullable().optional(),
  heroCtaText: z.string().nullable().optional(),
  heroCtaLink: z.string().nullable().optional(),
  footerText: z.string().nullable().optional(),
  whatsappNumber: z.string().nullable().optional(),
  socialLinks: z.record(z.string()).optional(),
});

export async function updateTenantTheme(
  input: z.infer<typeof updateThemeSchema>
) {
  const data = updateThemeSchema.parse(input);
  const { tenantId, ...themeData } = data;

  await requireTenantAccess(tenantId);

  const theme = await db.tenantTheme.upsert({
    where: { tenantId },
    update: themeData,
    create: { tenantId, ...themeData },
  });

  revalidatePath("/dashboard/website");
  revalidatePath(`/${(await db.tenant.findUnique({ where: { id: tenantId }, select: { slug: true } }))?.slug}`);

  return theme;
}
