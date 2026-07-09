import { getCurrentTenant } from "@/lib/auth/session";
import { AIPanel } from "@/features/ai/components/ai-panel";
import { redirect } from "next/navigation";

export default async function AIPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  return <AIPanel tenantId={tenant.id} />;
}
