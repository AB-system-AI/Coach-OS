import { db } from "@/lib/db";
import type { ClientActivityType } from "@prisma/client";

export async function logClientActivity(input: {
  tenantId: string;
  clientId: string;
  type: ClientActivityType;
  title: string;
  description?: string;
  metadata?: object;
}) {
  return db.clientActivity.create({
    data: {
      tenantId: input.tenantId,
      clientId: input.clientId,
      type: input.type,
      title: input.title,
      description: input.description,
      metadata: input.metadata ?? {},
    },
  });
}
