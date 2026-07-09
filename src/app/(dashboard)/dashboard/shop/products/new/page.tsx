import { getCurrentTenant } from "@/lib/auth/session";
import { createShopProduct, getShopCategories } from "@/features/shop";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";

export default async function NewShopProductPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const categories = await getShopCategories(tenant.id);

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Add Product</h1>
        <p className="text-muted-foreground text-sm">Add a new product to your shop.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form
            action={async (formData: FormData) => {
              "use server";
              await createShopProduct(tenant.id, {
                name: formData.get("name") as string,
                description: (formData.get("description") as string) || undefined,
                price: parseFloat(formData.get("price") as string) || 0,
                stockQuantity: formData.get("stock") ? parseInt(formData.get("stock") as string, 10) : 0,
                sku: (formData.get("sku") as string) || undefined,
                categoryId: (formData.get("categoryId") as string) || undefined,
              });
              redirect("/dashboard/shop");
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" name="name" required placeholder="Protein Powder 1kg" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
                placeholder="Product description..."
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="price">Price ($) *</Label>
              <Input id="price" name="price" type="number" min="0" step="0.01" required placeholder="29.99" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input id="stock" name="stock" type="number" min="0" defaultValue="0" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" name="sku" placeholder="PROD-001" />
              </div>
            </div>
            {categories.length > 0 && (
              <div className="space-y-1">
                <Label htmlFor="categoryId">Category</Label>
                <select id="categoryId" name="categoryId" className="h-10 w-full rounded-md border border-input px-3 text-sm">
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit">Add Product</Button>
              <Button type="button" variant="outline" formAction={() => redirect("/dashboard/shop")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
