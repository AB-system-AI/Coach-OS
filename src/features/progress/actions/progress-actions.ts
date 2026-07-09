"use server";

import { revalidatePath } from "next/cache";
import { requireTenantAccess } from "@/lib/auth/session";
import { replyToCheckIn } from "@/features/progress/services/progress-service";

export async function replyToCheckInAction(
  tenantId: string,
  checkInId: string,
  coachReply: string
) {
  await requireTenantAccess(tenantId);
  await replyToCheckIn(tenantId, checkInId, coachReply);
  revalidatePath("/dashboard/progress");
}
