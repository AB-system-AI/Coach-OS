import { getCurrentTenant } from "@/lib/auth/session";
import { getAutomationRules } from "@/features/automation";
import { ModuleOverview } from "@/components/layout/module-overview";
import { redirect } from "next/navigation";

export default async function AutomationPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");
  const rules = await getAutomationRules(tenant.id);

  return (
    <ModuleOverview
      title="Automation"
      description="Automatic emails, welcome messages, reminders, and birthday messages."
      stats={[
        { label: "Active Rules", value: rules.filter((r) => r.isActive).length },
        { label: "Total Rules", value: rules.length },
      ]}
      actions={[{ label: "Create Rule", href: "/dashboard/automation/new" }]}
    />
  );
}
