import { getCurrentTenant } from "@/lib/auth/session";
import { getDigitalProductStats } from "@/features/digital-products";
import { ModuleOverview } from "@/components/layout/module-overview";
import { redirect } from "next/navigation";

export default async function DigitalProductsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");
  const stats = await getDigitalProductStats(tenant.id);

  return (
    <ModuleOverview
      title="Digital Products"
      description="Sell PDF programs, workout plans, meal plans, ebooks, guides, and downloads."
      stats={[
        { label: "Products", value: stats.total },
        { label: "Total Orders", value: stats.orders },
      ]}
      actions={[{ label: "Add Product", href: "/dashboard/digital-products/new" }]}
    />
  );
}
