import { getCurrentTenant } from "@/lib/auth/session";
import { getProgramById } from "@/features/programs";
import { getClients } from "@/features/clients";
import { redirect, notFound } from "next/navigation";
import { ProgramDetailClient } from "./program-detail-client";

type Props = { params: Promise<{ id: string }> };

export default async function ProgramDetailPage({ params }: Props) {
  const { id } = await params;
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [program, clients] = await Promise.all([
    getProgramById(tenant.id, id),
    getClients(tenant.id),
  ]);
  if (!program) notFound();

  const serializedProgram = { ...program, price: Number(program.price) };

  return (
    <ProgramDetailClient
      program={serializedProgram}
      clients={clients}
      tenantId={tenant.id}
    />
  );
}
