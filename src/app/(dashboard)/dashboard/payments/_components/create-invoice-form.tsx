"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBillingClientError } from "@/lib/billing/client-messages";
import { createInvoiceAction } from "@/features/payments/actions/payment-actions";

export function CreateInvoiceForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createInvoiceAction(formData);
        formRef.current?.reset();
        setOpen(false);
      } catch (e) {
        setError(formatBillingClientError(e));
      }
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="sm">
        + New Invoice
      </Button>
    );
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Create Invoice</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="inv-amount">Amount *</Label>
              <Input
                id="inv-amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="100.00"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-currency">Currency</Label>
              <Input
                id="inv-currency"
                name="currency"
                defaultValue="USD"
                placeholder="USD"
                maxLength={3}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv-due">Due Date</Label>
            <Input id="inv-due" name="dueDate" type="date" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv-notes">Notes</Label>
            <Input id="inv-notes" name="notes" placeholder="Optional notes…" />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} size="sm">
              {isPending ? "Creating…" : "Create Invoice"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setOpen(false); setError(null); }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
