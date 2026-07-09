import { getCurrentTenant } from "@/lib/auth/session";
import { getEnterprisePage } from "@/features/enterprise";
import { getEnterpriseModuleStats } from "@/features/enterprise";
import { isModuleEnabled } from "@/features/modules";
import { ModuleOverview } from "@/components/layout/module-overview";
import { Badge } from "@/components/ui/badge";
import { redirect, notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EnterpriseModulePage({ params }: Props) {
  const { slug } = await params;
  const page = getEnterprisePage(slug);
  if (!page) notFound();

  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const enabled = await isModuleEnabled(tenant.id, page.module);
  if (!enabled) redirect("/dashboard");

  const stats = await getEnterpriseModuleStats(tenant.id, page.module);

  return (
    <div className="space-y-6">
      <ModuleOverview
        title={page.title}
        description={page.description}
        stats={stats}
        actions={page.actions}
      />
      <div className="flex flex-wrap gap-2">
        {page.features.map((feature) => (
          <Badge key={feature} variant="secondary">
            {feature}
          </Badge>
        ))}
      </div>
    </div>
  );
}
