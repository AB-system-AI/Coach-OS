import { getSession } from "@/lib/auth/session";
import { getPortalInvoices } from "@/features/client-portal/services/portal-service";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default async function PortalInvoicesPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const { invoices, payments } = await getPortalInvoices(session.user.id);

  const totalPaid = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pendingInvoices = invoices.filter((i) => i.status === "SENT" || i.status === "DRAFT");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Invoices & Payments</h1>
        <p className="text-muted-foreground text-sm">View your billing history and outstanding invoices.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Paid</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Invoices</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{invoices.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvoices.length}</div>
          </CardContent>
        </Card>
      </div>

      {invoices.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">Invoice #{inv.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(inv.createdAt).toLocaleDateString()}
                    {inv.dueDate && ` · Due: ${new Date(inv.dueDate).toLocaleDateString()}`}
                  </p>
                  {inv.notes && <p className="text-xs text-muted-foreground">{inv.notes}</p>}
                </div>
                <div className="text-end">
                  <Badge
                    variant={
                      inv.status === "PAID"
                        ? "default"
                        : inv.status === "OVERDUE"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {inv.status}
                  </Badge>
                  <p className="text-sm font-medium mt-1">{formatCurrency(Number(inv.amount))}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {payments.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">{p.description ?? "Payment"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.createdAt).toLocaleDateString()}
                    {p.provider && ` · ${p.provider}`}
                  </p>
                </div>
                <div className="text-end">
                  <Badge variant={p.status === "COMPLETED" ? "default" : p.status === "REFUNDED" ? "secondary" : "outline"}>
                    {p.status}
                  </Badge>
                  <p className="text-sm font-medium mt-1">{formatCurrency(Number(p.amount))}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {invoices.length === 0 && payments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No billing history found.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
