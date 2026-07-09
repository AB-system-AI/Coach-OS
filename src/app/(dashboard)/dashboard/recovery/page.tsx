import { getCurrentTenant } from "@/lib/auth/session";
import { getRecoveryServices, getRecoveryStats } from "@/features/recovery";
import { ModuleOverview } from "@/components/layout/module-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export default async function RecoveryPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [services, stats] = await Promise.all([
    getRecoveryServices(tenant.id),
    getRecoveryStats(tenant.id),
  ]);

  return (
    <div className="space-y-8">
      <ModuleOverview
        title="Recovery Services"
        description="Massage, sports massage, ice bath, stretching, cupping, rehabilitation."
        stats={[
          { label: "Services", value: stats.services },
          { label: "Packages", value: stats.packages },
        ]}
        actions={[
          { label: "Add Service", href: "/dashboard/recovery/new" },
          { label: "Time Slots", href: "/dashboard/bookings" },
        ]}
      />
      <Card>
        <CardHeader><CardTitle>Services</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {services.map((s) => (
            <div key={s.id} className="flex justify-between py-4">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-muted-foreground">
                  {s.duration} min · Capacity {s.capacity} · {s._count.bookings} bookings
                </p>
              </div>
              <div className="text-end">
                <p className="font-semibold">{formatCurrency(Number(s.price))}</p>
                <Badge variant={s.isActive ? "default" : "secondary"} className="mt-1">
                  {s.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
