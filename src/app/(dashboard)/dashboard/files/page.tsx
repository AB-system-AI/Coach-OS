import { getCurrentTenant } from "@/lib/auth/session";
import { getStorageUsage, STORAGE_CATEGORIES } from "@/features/storage";
import { ModuleOverview } from "@/components/layout/module-overview";
import { bytesToReadable } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function FilesPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");
  const usage = await getStorageUsage(tenant.id);

  return (
    <ModuleOverview
      title="Files & Storage"
      description="Cloud storage with folders for images, videos, documents, PDFs, and exercise files."
      stats={[
        { label: "Used", value: bytesToReadable(usage.usedBytes) },
        { label: "Limit", value: bytesToReadable(usage.limitBytes) },
        { label: "Usage", value: `${usage.usedPercent}%` },
        { label: "Categories", value: STORAGE_CATEGORIES.length },
      ]}
      actions={[{ label: "Upload Files", href: "/dashboard/media" }]}
    />
  );
}
