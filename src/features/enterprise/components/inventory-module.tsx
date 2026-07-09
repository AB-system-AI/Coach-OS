"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createInventoryItemAction,
  deleteInventoryItemAction,
  updateInventoryItemAction,
} from "@/features/enterprise/actions/enterprise-actions";

type InventoryItem = {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  quantity: number;
  minStock: number;
  unitPrice: number | string | null;
  currency: string;
};

export function InventoryModule({
  tenantId,
  initialItems,
}: {
  tenantId: string;
  initialItems: InventoryItem[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingQty, setEditingQty] = useState<{ id: string; qty: string } | null>(null);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: 0,
    minStock: 5,
    unitPrice: "",
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await createInventoryItemAction(tenantId, {
      name: form.name,
      sku: form.sku || undefined,
      category: form.category || undefined,
      quantity: Number(form.quantity),
      minStock: Number(form.minStock),
      unitPrice: form.unitPrice ? Number(form.unitPrice) : undefined,
    });
    setLoading(false);
    if (result.success) {
      setOpen(false);
      setForm({ name: "", sku: "", category: "", quantity: 0, minStock: 5, unitPrice: "" });
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleUpdateQty(id: string, qty: number) {
    await updateInventoryItemAction(tenantId, id, { quantity: qty });
    setEditingQty(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    await deleteInventoryItemAction(tenantId, id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Inventory</h2>
          <p className="text-sm text-muted-foreground">
            {initialItems.filter((i) => i.quantity <= i.minStock).length} low-stock items
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Item name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="SKU-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Supplements"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min Stock</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.minStock}
                    onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.unitPrice}
                    onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add Item"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">SKU</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Quantity</th>
              <th className="px-4 py-3 text-left font-medium">Min Stock</th>
              <th className="px-4 py-3 text-left font-medium">Price</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialItems.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No items yet.
                </td>
              </tr>
            )}
            {initialItems.map((item) => {
              const isLow = item.quantity <= item.minStock;
              return (
                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.sku ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.category ?? "—"}</td>
                  <td className="px-4 py-3">
                    {editingQty?.id === item.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min={0}
                          className="h-7 w-20 text-xs"
                          value={editingQty.qty}
                          onChange={(e) => setEditingQty({ id: item.id, qty: e.target.value })}
                        />
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleUpdateQty(item.id, Number(editingQty.qty))}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => setEditingQty(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <button
                        className="font-medium hover:underline"
                        onClick={() => setEditingQty({ id: item.id, qty: String(item.quantity) })}
                      >
                        {item.quantity}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.minStock}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.unitPrice != null ? `${item.currency} ${Number(item.unitPrice).toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={isLow ? "destructive" : "secondary"}>
                      {isLow ? "Low Stock" : "OK"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
