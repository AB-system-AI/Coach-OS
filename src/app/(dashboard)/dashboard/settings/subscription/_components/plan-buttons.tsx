"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  createSubscriptionCheckoutAction,
  createBillingPortalAction,
  cancelSubscriptionAction,
} from "@/features/subscriptions/actions/billing-actions";
import { formatBillingClientError } from "@/lib/billing/client-messages";
import type { SubscriptionPlan } from "@prisma/client";

interface UpgradeButtonProps {
  plan: SubscriptionPlan;
  currentPlan: SubscriptionPlan;
  hasSubscription: boolean;
}

export function UpgradeButton({ plan, currentPlan, hasSubscription }: UpgradeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isCurrent = currentPlan === plan;

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const { url } = await createSubscriptionCheckoutAction(plan);
        window.location.href = url;
      } catch (e) {
        setError(formatBillingClientError(e));
      }
    });
  }

  if (isCurrent) {
    return (
      <Button className="w-full mt-4" variant="secondary" disabled>
        Current Plan
      </Button>
    );
  }

  return (
    <div className="mt-4 space-y-1">
      <Button
        className="w-full"
        onClick={handleClick}
        disabled={isPending}
      >
        {isPending ? "Redirecting…" : hasSubscription ? "Switch Plan" : "Upgrade"}
      </Button>
      {error && <p className="text-xs text-destructive text-center">{error}</p>}
    </div>
  );
}

interface ManageBillingButtonProps {
  hasSubscription: boolean;
}

export function ManageBillingButton({ hasSubscription }: ManageBillingButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!hasSubscription) return null;

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const { url } = await createBillingPortalAction();
        window.location.href = url;
      } catch (e) {
        setError(formatBillingClientError(e));
      }
    });
  }

  return (
    <div className="space-y-1">
      <Button variant="outline" onClick={handleClick} disabled={isPending}>
        {isPending ? "Opening portal…" : "Manage Billing"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

interface CancelSubscriptionButtonProps {
  hasActiveSubscription: boolean;
  cancelAtPeriodEnd: boolean;
}

export function CancelSubscriptionButton({
  hasActiveSubscription,
  cancelAtPeriodEnd,
}: CancelSubscriptionButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  if (!hasActiveSubscription || cancelAtPeriodEnd) return null;

  function handleCancel() {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await cancelSubscriptionAction(false);
        setConfirmed(false);
      } catch (e) {
        setError(formatBillingClientError(e));
      }
    });
  }

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={handleCancel}
        disabled={isPending}
      >
        {isPending
          ? "Cancelling…"
          : confirmed
          ? "Click again to confirm cancellation"
          : "Cancel Subscription"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
