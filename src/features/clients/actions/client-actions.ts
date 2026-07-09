"use server";

import { revalidatePath } from "next/cache";
import { requireTenantAccess } from "@/lib/auth/session";
import {
  createClient,
  updateClient,
  addClientNote,
  addClientFile,
} from "@/features/clients/services/client-service";
import type { ClientGoalType, ClientSubscriptionStatus } from "@prisma/client";

export async function createClientAction(
  tenantId: string,
  data: {
    email: string;
    name: string;
    phone?: string;
    goals?: string;
    goalType?: ClientGoalType;
  }
) {
  const { session } = await requireTenantAccess(tenantId);
  await createClient(tenantId, data, session.user.id);
  revalidatePath("/dashboard/clients");
}

export async function updateClientAction(
  tenantId: string,
  clientId: string,
  data: Partial<{
    phone: string;
    goals: string;
    goalType: ClientGoalType;
    subscriptionStatus: ClientSubscriptionStatus;
    isActive: boolean;
  }>
) {
  const { session } = await requireTenantAccess(tenantId);
  await updateClient(tenantId, clientId, data, session.user.id);
  revalidatePath(`/dashboard/clients/${clientId}`);
  revalidatePath("/dashboard/clients");
}

export async function addClientNoteAction(
  tenantId: string,
  clientId: string,
  content: string
) {
  const { session } = await requireTenantAccess(tenantId);
  await addClientNote(tenantId, clientId, session.user.id, content);
  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function addClientFileAction(
  tenantId: string,
  clientId: string,
  data: { name: string; url: string; mimeType?: string; sizeBytes?: number }
) {
  await requireTenantAccess(tenantId);
  await addClientFile(tenantId, clientId, data);
  revalidatePath(`/dashboard/clients/${clientId}`);
}
