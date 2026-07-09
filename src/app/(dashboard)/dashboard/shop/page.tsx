import { getCurrentTenant } from "@/lib/auth/session";
import { getShopStats } from "@/features/shop";
import { ModuleOverview } from "@/components/layout/module-overview";
import { redirect } from "next/navigation";

export default async function ShopPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");
  const stats = await getShopStats(tenant.id);

  return (
    <ModuleOverview
      title="Shop"
      description="Sell supplements, accessories, equipment, clothes, and gift cards."
      stats={[
        { label: "Products", value: stats.products },
        { label: "Orders", value: stats.orders },
        { label: "Low Stock", value: stats.lowStock },
      ]}
      actions={[
        { label: "Add Product", href: "/dashboard/shop/products/new" },
        { label: "View Orders", href: "/dashboard/shop/orders" },
      ]}
    />
  );
}
