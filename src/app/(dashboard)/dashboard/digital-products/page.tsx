import { getCurrentTenant } from "@/lib/auth/session";
import { getDigitalProducts, createDigitalProduct, getDigitalProductStats } from "@/features/digital-products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { formatCurrency } from "@/lib/utils";

export default async function DigitalProductsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [products, stats] = await Promise.all([
    getDigitalProducts(tenant.id),
    getDigitalProductStats(tenant.id),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Digital Products</h1>
        <p className="text-muted-foreground">Sell ebooks, PDFs, workout plans, and templates.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Products</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.orders}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Products</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.productCount}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Add Digital Product</CardTitle></CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server";
              await createDigitalProduct(tenant.id, {
                name: formData.get("name") as string,
                type: (formData.get("type") as "PDF_PROGRAM" | "WORKOUT_PLAN" | "MEAL_PLAN" | "TEMPLATE" | "EBOOK" | "GUIDE" | "CHALLENGE") || "PDF_PROGRAM",
                price: parseFloat(formData.get("price") as string) || 0,
                description: (formData.get("description") as string) || undefined,
                fileUrl: (formData.get("fileUrl") as string) || undefined,
              });
              revalidatePath("/dashboard/digital-products");
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="space-y-1">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required placeholder="Fat Loss Guide" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="type">Type</Label>
              <select id="type" name="type" className="h-10 w-full rounded-md border border-input px-3 text-sm">
                <option value="PDF_PROGRAM">PDF Program</option>
                <option value="EBOOK">Ebook</option>
                <option value="WORKOUT_PLAN">Workout Plan</option>
                <option value="MEAL_PLAN">Meal Plan</option>
                <option value="TEMPLATE">Template</option>
                <option value="GUIDE">Guide</option>
                <option value="CHALLENGE">Challenge</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="price">Price ($)</Label>
              <Input id="price" name="price" type="number" min="0" step="0.01" defaultValue="0" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fileUrl">File URL</Label>
              <Input id="fileUrl" name="fileUrl" type="url" placeholder="https://..." />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Brief product description" />
            </div>
            <Button type="submit" className="sm:col-span-2 w-fit">Add Product</Button>
          </form>
        </CardContent>
      </Card>

      {products.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No digital products yet. Add your first product above.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm">{product.name}</h3>
                <Badge variant="outline" className="text-xs shrink-0">{product.type}</Badge>
              </div>
              {product.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold">{formatCurrency(Number(product.price))}</span>
                <span className="text-xs text-muted-foreground">{product._count.orders} orders</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
