import { getCurrentTenant } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NewRecoveryServiceForm } from "./new-recovery-service-form";

export default async function NewRecoveryServicePage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/dashboard/recovery" className="text-sm text-muted-foreground hover:text-foreground">
          ← Recovery Services
        </Link>
        <h1 className="text-3xl font-bold mt-2">New Recovery Service</h1>
        <p className="text-muted-foreground">Add a massage, ice bath, stretching, or rehabilitation service.</p>
      </div>
      <NewRecoveryServiceForm tenantId={tenant.id} />
    </div>
  );
}
