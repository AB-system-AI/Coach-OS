import { getCurrentTenant } from "@/lib/auth/session";
import { getShopStats, getShopProducts } from "@/features/shop";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Package, ShoppingCart, AlertTriangle } from "lucide-react";

export default async function ShopPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [stats, products] = await Promise.all([
    getShopStats(tenant.id),
    getShopProducts(tenant.id),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shop</h1>
          <p className="text-muted-foreground">Sell supplements, accessories, equipment, and more.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/shop/orders">Orders</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/shop/products/new">Add Product</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Package className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-2xl font-bold">{stats.products}</div>
              <p className="text-sm text-muted-foreground">Active Products</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-2xl font-bold">{stats.orders}</div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {products.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No products yet. Add your first product.</p>
            <Button asChild>
              <Link href="/dashboard/shop/products/new">Add Product</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm leading-tight">{product.name}</h3>
                <Badge variant={product.isActive ? "default" : "secondary"} className="shrink-0">
                  {product.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {product.category && (
                <p className="text-xs text-muted-foreground mb-2">{product.category.name}</p>
              )}
              <div className="flex items-center justify-between mt-3">
                <div>
                  <span className="font-bold">{formatCurrency(Number(product.price))}</span>
                </div>
                <span className={`text-xs font-medium ${Number(product.stockQuantity) <= 5 ? "text-yellow-600" : "text-muted-foreground"}`}>
                  Stock: {product.stockQuantity}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
