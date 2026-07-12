import { getCurrentTenant } from "@/lib/auth/session";
import { getPayments, getInvoices, getPaymentStats } from "@/features/payments";
import { ModuleOverview } from "@/components/layout/module-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { CreateInvoiceForm } from "./_components/create-invoice-form";
import { RefundButton } from "./_components/refund-button";
import { MarkInvoicePaidButton } from "./_components/mark-invoice-paid-button";

export default async function PaymentsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [{ items: payments }, invoices, stats] = await Promise.all([
    getPayments(tenant.id),
    getInvoices(tenant.id),
    getPaymentStats(tenant.id),
  ]);

  return (
    <div className="space-y-8">
      <ModuleOverview
        title="Payments & Billing"
        description="Stripe, Paymob, Apple Pay ready. Manage payments, invoices, and refunds."
        stats={[
          { label: "Revenue (month)", value: formatCurrency(stats.revenue) },
          { label: "Pending", value: stats.pending },
          { label: "Invoices", value: stats.invoices },
          { label: "Active Coupons", value: stats.coupons },
        ]}
        actions={[{ label: "Coupons", href: "/dashboard/coupons" }]}
      />

      <div className="flex flex-wrap gap-2">
        {["Stripe", "Paymob", "Apple Pay", "Invoices", "Refunds", "Receipts"].map((f) => (
          <Badge key={f} variant="secondary">{f}</Badge>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payments list */}
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {payments.length === 0 && (
              <p className="text-muted-foreground py-4 text-sm">No payments yet.</p>
            )}
            {payments.slice(0, 20).map((p) => (
              <div key={p.id} className="py-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{p.user.name}</span>
                  <span className="flex items-center gap-2">
                    {formatCurrency(Number(p.amount), p.currency)}
                    <Badge variant="outline">{p.status}</Badge>
                  </span>
                </div>
                {p.description && (
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                )}
                {p.status === "COMPLETED" && p.provider === "STRIPE" && (
                  <RefundButton
                    paymentId={p.id}
                    maxAmount={Number(p.amount)}
                    currency={p.currency}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle>Invoices</CardTitle>
            <CreateInvoiceForm />
          </CardHeader>
          <CardContent className="divide-y">
            {invoices.length === 0 && (
              <p className="text-muted-foreground py-4 text-sm">No invoices yet.</p>
            )}
            {invoices.slice(0, 15).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-3 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-mono font-medium">{inv.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(Number(inv.amount), inv.currency)}
                    {inv.dueDate &&
                      ` · Due ${new Date(inv.dueDate).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline">{inv.status}</Badge>
                  {inv.status === "DRAFT" || inv.status === "SENT" ? (
                    <MarkInvoicePaidButton invoiceId={inv.id} />
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
