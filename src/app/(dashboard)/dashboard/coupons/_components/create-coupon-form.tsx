"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCouponAction } from "@/features/payments/actions/payment-actions";

export function CreateCouponForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    formData.set("discountType", discountType);
    setError(null);
    startTransition(async () => {
      try {
        await createCouponAction(formData);
        formRef.current?.reset();
        setDiscountType("percentage");
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create coupon");
      }
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="sm">
        + New Coupon
      </Button>
    );
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Create Coupon</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cp-code">Code *</Label>
              <Input
                id="cp-code"
                name="code"
                placeholder="SUMMER20"
                required
                className="uppercase"
                style={{ textTransform: "uppercase" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Discount Type *</Label>
              <Select
                value={discountType}
                onValueChange={(v) => setDiscountType(v as "percentage" | "fixed")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cp-value">
                {discountType === "percentage" ? "Discount %" : "Discount Amount"} *
              </Label>
              <Input
                id="cp-value"
                name="discountValue"
                type="number"
                min="0.01"
                max={discountType === "percentage" ? 100 : undefined}
                step="0.01"
                placeholder={discountType === "percentage" ? "20" : "10.00"}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-min">Min Order Amount</Label>
              <Input
                id="cp-min"
                name="minAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cp-uses">Max Uses</Label>
              <Input
                id="cp-uses"
                name="maxUses"
                type="number"
                min="1"
                placeholder="Unlimited"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-until">Valid Until</Label>
              <Input id="cp-until" name="validUntil" type="date" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cp-desc">Description</Label>
            <Input
              id="cp-desc"
              name="description"
              placeholder="Summer discount for new clients"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} size="sm">
              {isPending ? "Creating…" : "Create Coupon"}
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
