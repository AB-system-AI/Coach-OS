"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { updateCouponAction } from "@/features/payments/actions/payment-actions";

interface Props {
  couponId: string;
  isActive: boolean;
}

export function CouponToggle({ couponId, isActive }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      await updateCouponAction(couponId, { isActive: checked });
    });
  }

  return (
    <Switch
      checked={isActive}
      onCheckedChange={handleToggle}
      disabled={isPending}
      aria-label={isActive ? "Deactivate coupon" : "Activate coupon"}
    />
  );
}
