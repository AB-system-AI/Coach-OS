"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { refundPaymentAction } from "@/features/payments/actions/payment-actions";

interface Props {
  paymentId: string;
  maxAmount: number;
  currency: string;
}

export function RefundButton({ paymentId, maxAmount, currency }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRefund(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await refundPaymentAction(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Refund failed");
      }
    });
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-destructive hover:text-destructive"
      >
        Refund
      </Button>
    );
  }

  return (
    <form action={handleRefund} className="flex items-end gap-2 flex-wrap">
      <input type="hidden" name="paymentId" value={paymentId} />
      <div className="space-y-1">
        <Label className="text-xs">
          Amount ({currency}, max {maxAmount})
        </Label>
        <Input
          name="amount"
          type="number"
          min="0.01"
          max={maxAmount}
          step="0.01"
          defaultValue={maxAmount}
          className="h-8 w-28 text-sm"
        />
      </div>
      <Button type="submit" size="sm" disabled={isPending} variant="destructive">
        {isPending ? "…" : "Confirm"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => { setOpen(false); setError(null); }}
      >
        ✕
      </Button>
      {error && <p className="w-full text-xs text-destructive">{error}</p>}
    </form>
  );
}
