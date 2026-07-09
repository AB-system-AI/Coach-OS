import { getCurrentTenant } from "@/lib/auth/session";
import { getClientById } from "@/features/clients";
import { redirect, notFound } from "next/navigation";
import { ClientDetailClient } from "./client-detail-client";

type Props = { params: Promise<{ id: string }> };

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const client = await getClientById(tenant.id, id);
  if (!client) notFound();

  return <ClientDetailClient client={client} tenantId={tenant.id} />;
}
