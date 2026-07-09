import { getCurrentTenant } from "@/lib/auth/session";
import { getCoupons } from "@/features/payments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { CreateCouponForm } from "./_components/create-coupon-form";
import { CouponToggle } from "./_components/coupon-toggle";

export default async function CouponsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");
  const coupons = await getCoupons(tenant.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Coupons & Offers</h1>
        <p className="text-muted-foreground mt-1">
          Discount codes and promotional offers.
        </p>
      </div>

      <CreateCouponForm />

      <Card>
        <CardHeader>
          <CardTitle>
            All Coupons
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({coupons.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {coupons.length === 0 && (
            <p className="text-muted-foreground py-6 text-sm text-center">
              No coupons yet. Create one above.
            </p>
          )}
          {coupons.map((c) => (
            <div key={c.id} className="flex items-start justify-between py-4 gap-4">
              <div className="min-w-0 space-y-0.5">
                <p className="font-mono font-semibold text-sm">{c.code}</p>
                {c.description && (
                  <p className="text-xs text-muted-foreground">{c.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {c.discountType === "percentage"
                      ? `${c.discountValue}% off`
                      : `${formatCurrency(Number(c.discountValue))} off`}
                  </Badge>
                  {c.maxUses != null && (
                    <Badge variant="outline" className="text-xs">
                      {c.usedCount}/{c.maxUses} uses
                    </Badge>
                  )}
                  {c.validUntil && (
                    <Badge variant="outline" className="text-xs">
                      Expires {new Date(c.validUntil).toLocaleDateString()}
                    </Badge>
                  )}
                  {c.minAmount != null && (
                    <Badge variant="outline" className="text-xs">
                      Min {formatCurrency(Number(c.minAmount))}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={c.isActive ? "default" : "secondary"}>
                  {c.isActive ? "Active" : "Inactive"}
                </Badge>
                <CouponToggle couponId={c.id} isActive={c.isActive} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
