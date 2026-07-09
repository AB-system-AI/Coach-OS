import { getCurrentTenant } from "@/lib/auth/session";
import { getStorageUsage, STORAGE_CATEGORIES } from "@/features/storage";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { bytesToReadable } from "@/lib/utils";
import { MediaLibraryClient } from "./_components/media-library-client";

export default async function MediaPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [usage, mediaFiles] = await Promise.all([
    getStorageUsage(tenant.id),
    db.media.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <MediaLibraryClient
      usage={usage}
      mediaFiles={mediaFiles}
      tenantId={tenant.id}
      storageCategories={STORAGE_CATEGORIES}
    />
  );
}
