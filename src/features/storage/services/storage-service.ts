import { db } from "@/lib/db";
import { getPlanLimits, getTenantPlan } from "@/features/subscriptions";
import type { MediaCategory } from "@prisma/client";

export async function getStorageUsage(tenantId: string) {
  const [tenant, byCategory] = await Promise.all([
    db.tenant.findUnique({
      where: { id: tenantId },
      select: { storageUsedBytes: true, storageLimitBytes: true, plan: true },
    }),
    db.media.groupBy({
      by: ["category"],
      where: { tenantId },
      _sum: { sizeBytes: true },
      _count: true,
    }),
  ]);

  if (!tenant) throw new Error("Tenant not found");

  const plan = await getTenantPlan(tenantId);
  const limits = getPlanLimits(plan);
  const used = Number(tenant.storageUsedBytes);
  const limit = limits.storageBytes as number;

  return {
    usedBytes: used,
    limitBytes: limit,
    usedPercent: limit > 0 ? Math.round((used / limit) * 100) : 0,
    byCategory: byCategory.map((c) => ({
      category: c.category,
      count: c._count,
      sizeBytes: Number(c._sum.sizeBytes ?? 0),
    })),
  };
}

export async function trackMediaUpload(
  tenantId: string,
  sizeBytes: number,
  category: MediaCategory = "GENERAL"
) {
  const plan = await getTenantPlan(tenantId);
  const limits = getPlanLimits(plan);

  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: { storageUsedBytes: true },
  });

  const currentUsed = Number(tenant?.storageUsedBytes ?? 0);
  const storageLimit = limits.storageBytes as number;
  if (currentUsed + sizeBytes > storageLimit) {
    throw new Error("Storage limit exceeded. Please upgrade your plan or delete files.");
  }

  await db.tenant.update({
    where: { id: tenantId },
    data: {
      storageUsedBytes: { increment: BigInt(sizeBytes) },
    },
  });

  return { category, sizeBytes };
}

export async function deleteMediaFile(tenantId: string, mediaId: string) {
  const media = await db.media.findFirst({
    where: { id: mediaId, tenantId },
  });
  if (!media) throw new Error("Media not found");

  await db.$transaction([
    db.media.delete({ where: { id: mediaId } }),
    ...(media.sizeBytes
      ? [
          db.tenant.update({
            where: { id: tenantId },
            data: {
              storageUsedBytes: { decrement: media.sizeBytes },
            },
          }),
        ]
      : []),
  ]);
}

export const STORAGE_CATEGORIES: {
  category: MediaCategory;
  label: string;
  description: string;
}[] = [
  { category: "IMAGE", label: "Images", description: "Photos, graphics, thumbnails" },
  { category: "VIDEO", label: "Videos", description: "Exercise videos, tutorials" },
  { category: "DOCUMENT", label: "Documents", description: "General documents" },
  { category: "PDF", label: "PDFs", description: "Plans, guides, contracts" },
  { category: "EXERCISE_FILE", label: "Exercise Files", description: "Workout attachments" },
];
