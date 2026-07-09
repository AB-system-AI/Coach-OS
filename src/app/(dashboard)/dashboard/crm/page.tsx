import { getCurrentTenant } from "@/lib/auth/session";
import { getCrmStats } from "@/features/crm";
import { ModuleOverview } from "@/components/layout/module-overview";
import { redirect } from "next/navigation";

export default async function CrmPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");
  const stats = await getCrmStats(tenant.id);

  return (
    <ModuleOverview
      title="CRM"
      description="Lead management, pipeline, tasks, notes, calls, and customer timeline."
      stats={[
        { label: "Leads", value: stats.leads },
        { label: "Open Tasks", value: stats.tasks },
        { label: "Won Deals", value: stats.won },
      ]}
      actions={[
        { label: "Add Lead", href: "/dashboard/crm/leads/new" },
        { label: "Pipeline", href: "/dashboard/crm/pipeline" },
      ]}
    />
  );
}
