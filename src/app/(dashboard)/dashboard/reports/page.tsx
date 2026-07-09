import { getCurrentTenant } from "@/lib/auth/session";
import { getFullReport } from "@/features/reports";
import { ReportsDashboard } from "@/features/reports/components/reports-dashboard";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const report = await getFullReport(tenant.id, "30d");

  return <ReportsDashboard report={report} />;
}
