"use server";

import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import { assertFeature } from "@/features/subscriptions";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const whiteLabelSchema = z.object({
  tenantId: z.string(),
  // Theme
  logoUrl: z.string().nullable().optional(),
  faviconUrl: z.string().nullable().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  fontFamily: z.string().optional(),
  headingFont: z.string().optional(),
  socialLinks: z.record(z.string()).optional(),
  // SEO
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  seoKeywords: z.string().nullable().optional(),
  // Email branding
  emailFromName: z.string().nullable().optional(),
  emailFromAddress: z.string().email().nullable().optional(),
  emailLogoUrl: z.string().nullable().optional(),
  emailPrimaryColor: z.string().nullable().optional(),
  emailFooterText: z.string().nullable().optional(),
});

export async function updateWhiteLabel(
  input: z.infer<typeof whiteLabelSchema>
) {
  const data = whiteLabelSchema.parse(input);
  const { tenantId, ...fields } = data;

  await requireTenantAccess(tenantId);
  await assertFeature(tenantId, "whiteLabel");

  const themeFields = {
    logoUrl: fields.logoUrl,
    faviconUrl: fields.faviconUrl,
    primaryColor: fields.primaryColor,
    secondaryColor: fields.secondaryColor,
    accentColor: fields.accentColor,
    fontFamily: fields.fontFamily,
    headingFont: fields.headingFont,
    socialLinks: fields.socialLinks,
  };

  const settingsFields = {
    seoTitle: fields.seoTitle,
    seoDescription: fields.seoDescription,
    seoKeywords: fields.seoKeywords,
    emailFromName: fields.emailFromName,
    emailFromAddress: fields.emailFromAddress,
    emailLogoUrl: fields.emailLogoUrl,
    emailPrimaryColor: fields.emailPrimaryColor,
    emailFooterText: fields.emailFooterText,
  };

  const cleanTheme = Object.fromEntries(
    Object.entries(themeFields).filter(([, v]) => v !== undefined)
  );
  const cleanSettings = Object.fromEntries(
    Object.entries(settingsFields).filter(([, v]) => v !== undefined)
  );

  await db.$transaction([
    db.tenantTheme.upsert({
      where: { tenantId },
      update: cleanTheme,
      create: { tenantId, ...cleanTheme },
    }),
    db.tenantSettings.upsert({
      where: { tenantId },
      update: cleanSettings,
      create: { tenantId, ...cleanSettings },
    }),
  ]);

  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: { slug: true },
  });

  revalidatePath("/dashboard/settings/branding");
  if (tenant) revalidatePath(`/${tenant.slug}`);

  return { success: true };
}

export async function getWhiteLabelConfig(tenantId: string) {
  await requireTenantAccess(tenantId);

  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    include: { theme: true, settings: true },
  });

  return tenant;
}
