"use server";

import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import { assertFeature } from "@/features/subscriptions";
import {
  updateMarketplaceProfileSchema,
  type UpdateMarketplaceProfileInput,
} from "@/features/marketplace/schemas/marketplace-filters";
import { syncMarketplaceRatings } from "@/features/marketplace/services/marketplace-search";
import { revalidatePath } from "next/cache";

export async function updateMarketplaceProfile(
  input: UpdateMarketplaceProfileInput
) {
  const data = updateMarketplaceProfileSchema.parse(input);
  const { tenantId, ...profileData } = data;

  await requireTenantAccess(tenantId);

  if (profileData.isVisible) {
    await assertFeature(tenantId, "marketplace");
    await db.tenantSettings.update({
      where: { tenantId },
      data: { marketplaceEnabled: true },
    });
  }

  const profile = await db.coachMarketplaceProfile.upsert({
    where: { tenantId },
    update: profileData,
    create: { tenantId, ...profileData },
  });

  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${(await db.tenant.findUnique({ where: { id: tenantId }, select: { slug: true } }))?.slug}`);
  revalidatePath("/dashboard/settings/marketplace");

  return profile;
}

export async function toggleMarketplaceVisibility(
  tenantId: string,
  isVisible: boolean
) {
  await requireTenantAccess(tenantId);

  if (isVisible) {
    await assertFeature(tenantId, "marketplace");
  }

  const profile = await db.coachMarketplaceProfile.upsert({
    where: { tenantId },
    update: { isVisible },
    create: { tenantId, isVisible },
  });

  if (isVisible) {
    await db.tenantSettings.update({
      where: { tenantId },
      data: { marketplaceEnabled: true },
    });
    await syncMarketplaceRatings(tenantId);
  }

  revalidatePath("/marketplace");
  revalidatePath("/dashboard/settings/marketplace");

  return profile;
}

export async function addCertification(
  tenantId: string,
  data: { name: string; issuer?: string; year?: number; documentUrl?: string }
) {
  await requireTenantAccess(tenantId);

  return db.coachCertification.create({
    data: { tenantId, ...data },
  });
}

export async function addGalleryItem(
  tenantId: string,
  data: { imageUrl: string; caption?: string }
) {
  await requireTenantAccess(tenantId);

  const count = await db.coachGalleryItem.count({ where: { tenantId } });

  return db.coachGalleryItem.create({
    data: { tenantId, ...data, order: count },
  });
}

export async function removeGalleryItem(tenantId: string, itemId: string) {
  await requireTenantAccess(tenantId);

  return db.coachGalleryItem.deleteMany({
    where: { id: itemId, tenantId },
  });
}
