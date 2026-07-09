import { getCurrentTenant } from "@/lib/auth/session";
import { getPayments, getInvoices, getPaymentStats } from "@/features/payments";
import { ModuleOverview } from "@/components/layout/module-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export default async function PaymentsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [payments, invoices, stats] = await Promise.all([
    getPayments(tenant.id),
    getInvoices(tenant.id),
    getPaymentStats(tenant.id),
  ]);

  return (
    <div className="space-y-8">
      <ModuleOverview
        title="Payments & Billing"
        description="Stripe, Paymob, Apple Pay ready. Subscriptions, programs, bookings, and products."
        stats={[
          { label: "Revenue (month)", value: formatCurrency(stats.revenue) },
          { label: "Pending", value: stats.pending },
          { label: "Invoices", value: stats.invoices },
        ]}
        actions={[{ label: "Coupons", href: "/dashboard/coupons" }]}
      />
      <div className="flex flex-wrap gap-2">
        {["Stripe", "Paymob", "Apple Pay", "Wallet", "Invoices", "Receipts"].map((f) => (
          <Badge key={f} variant="secondary">{f}</Badge>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {payments.slice(0, 10).map((p) => (
              <div key={p.id} className="flex justify-between py-3 text-sm">
                <span>{p.user.name}</span>
                <span>
                  {formatCurrency(Number(p.amount))} · <Badge variant="outline">{p.status}</Badge>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {invoices.slice(0, 10).map((inv) => (
              <div key={inv.id} className="flex justify-between py-3 text-sm">
                <span>{inv.invoiceNumber}</span>
                <Badge variant="outline">{inv.status}</Badge>
              </div>
            ))}
            {invoices.length === 0 && (
              <p className="text-muted-foreground py-4 text-sm">No invoices yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
