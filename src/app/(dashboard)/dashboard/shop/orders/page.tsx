import { getCurrentTenant } from "@/lib/auth/session";
import { getShopOrders, updateOrderStatus } from "@/features/shop";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function ShopOrdersPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const orders = await getShopOrders(tenant.id);

  const pending = orders.filter((o) => o.status === "PENDING").length;
  const processing = orders.filter((o) => o.status === "PROCESSING").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/shop" className="text-sm text-muted-foreground hover:underline mb-1 block">← Shop</Link>
          <h1 className="text-2xl font-bold">Orders</h1>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{orders.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{pending}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Processing</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{processing}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>All Orders</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {orders.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">No orders yet.</p>
          )}
          {orders.map((order) => (
            <div key={order.id} className="flex items-start justify-between gap-4 py-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm font-mono">#{order.orderNumber}</p>
                  <Badge variant={
                    order.status === "DELIVERED" ? "default" :
                    order.status === "CANCELLED" ? "destructive" :
                    order.status === "SHIPPED" ? "secondary" : "outline"
                  }>
                    {order.status}
                  </Badge>
                </div>
                <div className="space-y-0.5">
                  {order.items.map((item) => (
                    <p key={item.id} className="text-xs text-muted-foreground">
                      {item.quantity}× {item.product.name} — {formatCurrency(Number(item.unitPrice))}
                    </p>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(order.createdAt).toLocaleDateString()} · Total: {formatCurrency(Number(order.total))}
                </p>
              </div>
              {order.status === "PENDING" && (
                <form
                  action={async () => {
                    "use server";
                    await updateOrderStatus(tenant.id, order.id, "PROCESSING");
                    revalidatePath("/dashboard/shop/orders");
                  }}
                >
                  <Button type="submit" variant="outline" size="sm">Process</Button>
                </form>
              )}
              {order.status === "PROCESSING" && (
                <form
                  action={async () => {
                    "use server";
                    await updateOrderStatus(tenant.id, order.id, "SHIPPED");
                    revalidatePath("/dashboard/shop/orders");
                  }}
                >
                  <Button type="submit" variant="outline" size="sm">Mark Shipped</Button>
                </form>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
