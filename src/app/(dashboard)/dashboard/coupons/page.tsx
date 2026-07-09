import { getCurrentTenant } from "@/lib/auth/session";
import { getCoupons } from "@/features/payments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export default async function CouponsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");
  const coupons = await getCoupons(tenant.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Coupons & Offers</h1>
        <p className="text-muted-foreground mt-1">Discount codes and promotional offers.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Active Coupons</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {coupons.map((c) => (
            <div key={c.id} className="flex justify-between py-4">
              <div>
                <p className="font-mono font-medium">{c.code}</p>
                <p className="text-sm text-muted-foreground">{c.description}</p>
              </div>
              <Badge>{c.isActive ? "Active" : "Inactive"}</Badge>
            </div>
          ))}
          {coupons.length === 0 && (
            <p className="text-muted-foreground py-4">No coupons created.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
