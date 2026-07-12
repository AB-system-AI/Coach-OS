"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { markInvoicePaidAction } from "@/features/payments/actions/payment-actions";
import { formatBillingClientError } from "@/lib/billing/client-messages";

interface Props {
  invoiceId: string;
}

export function MarkInvoicePaidButton({ invoiceId }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        await markInvoicePaidAction(invoiceId);
      } catch (e) {
        setError(formatBillingClientError(e));
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={handleClick}
        disabled={isPending}
      >
        {isPending ? "…" : "Mark Paid"}
      </Button>
      {error && <p className="text-xs text-destructive max-w-[12rem] text-right">{error}</p>}
    </div>
  );
}
