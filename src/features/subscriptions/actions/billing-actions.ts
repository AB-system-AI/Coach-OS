"use server";

import { revalidatePath } from "next/cache";
import { getCurrentTenant, requireTenantAccess } from "@/lib/auth/session";
import {
  createSubscriptionCheckout,
  createBillingPortalSession,
  changePlan,
  cancelSubscription,
  syncSubscriptionFromStripe,
} from "@/features/subscriptions/services/billing-service";
import type { SubscriptionPlan } from "@prisma/client";

/**
 * Returns a Stripe Checkout URL for the given plan.
 * The client should redirect window.location.href to this URL.
 */
export async function createSubscriptionCheckoutAction(
  plan: SubscriptionPlan
): Promise<{ url: string }> {
  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error("Not authenticated");

  return createSubscriptionCheckout(tenant.id, plan);
}

/**
 * Returns a Stripe Billing Portal URL.
 * The client should redirect window.location.href to this URL.
 */
export async function createBillingPortalAction(): Promise<{ url: string }> {
  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error("Not authenticated");

  return createBillingPortalSession(tenant.id);
}

export async function changePlanAction(newPlan: SubscriptionPlan): Promise<void> {
  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error("Not authenticated");

  const { session } = await requireTenantAccess(tenant.id);

  await changePlan(tenant.id, newPlan, session.user.id);
  revalidatePath("/dashboard/settings/subscription");
}

export async function cancelSubscriptionAction(
  immediately = false
): Promise<void> {
  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error("Not authenticated");

  const { session } = await requireTenantAccess(tenant.id);

  await cancelSubscription(tenant.id, immediately, session.user.id);
  revalidatePath("/dashboard/settings/subscription");
}

export async function syncSubscriptionAction(
  stripeSubscriptionId: string
): Promise<void> {
  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error("Not authenticated");

  await requireTenantAccess(tenant.id);

  await syncSubscriptionFromStripe(stripeSubscriptionId);
  revalidatePath("/dashboard/settings/subscription");
}
