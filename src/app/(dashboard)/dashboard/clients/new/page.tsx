import { getCurrentTenant } from "@/lib/auth/session";
import { AddClientForm } from "@/features/clients/components/add-client-form";
import { redirect } from "next/navigation";

export default async function NewClientPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Add Client</h1>
      <AddClientForm tenantId={tenant.id} />
    </div>
  );
}
