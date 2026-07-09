"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { createPosTransactionAction } from "@/features/enterprise/actions/enterprise-actions";
import type { PosPaymentMethod } from "@prisma/client";

type PosItem = {
  productName: string;
  quantity: number;
  unitPrice: number;
};

type PosTransaction = {
  id: string;
  total: number | string;
  currency: string;
  paymentMethod: PosPaymentMethod;
  cashierName: string | null;
  createdAt: Date;
  items: { id: string; productName: string; quantity: number; unitPrice: number | string; total: number | string }[];
};

const PAYMENT_METHODS: PosPaymentMethod[] = ["CASH", "CARD", "WALLET", "MIXED"];

export function PosModule({
  tenantId,
  initialTransactions,
}: {
  tenantId: string;
  initialTransactions: PosTransaction[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cashierName, setCashierName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PosPaymentMethod>("CASH");
  const [items, setItems] = useState<PosItem[]>([
    { productName: "", quantity: 1, unitPrice: 0 },
  ]);

  function addItem() {
    setItems([...items, { productName: "", quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof PosItem, value: string | number) {
    setItems(
      items.map((item, i) =>
        i === idx ? { ...item, [field]: field === "productName" ? value : Number(value) } : item
      )
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (items.some((i) => !i.productName)) {
      setError("All items must have a product name.");
      return;
    }
    setLoading(true);
    setError("");
    const result = await createPosTransactionAction(tenantId, {
      paymentMethod,
      cashierName: cashierName || undefined,
      items,
    });
    setLoading(false);
    if (result.success) {
      setOpen(false);
      setCashierName("");
      setPaymentMethod("CASH");
      setItems([{ productName: "", quantity: 1, unitPrice: 0 }]);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">POS Transactions</h2>
          <p className="text-sm text-muted-foreground">{initialTransactions.length} records</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>New Sale</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>New POS Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cashier Name</Label>
                  <Input
                    value={cashierName}
                    onChange={(e) => setCashierName(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as PosPaymentMethod)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Items</Label>
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_80px_80px_32px] gap-2 items-center">
                    <Input
                      placeholder="Product name"
                      value={item.productName}
                      onChange={(e) => updateItem(idx, "productName", e.target.value)}
                      required
                    />
                    <Input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                    />
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => removeItem(idx)}
                      disabled={items.length === 1}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  + Add Item
                </Button>
              </div>

              <div className="text-right font-semibold">
                Total: ${subtotal.toFixed(2)}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Processing..." : "Complete Sale"}
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
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Cashier</th>
              <th className="px-4 py-3 text-left font-medium">Items</th>
              <th className="px-4 py-3 text-left font-medium">Payment</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {initialTransactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No transactions yet.
                </td>
              </tr>
            )}
            {initialTransactions.map((txn) => (
              <tr key={txn.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(txn.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">{txn.cashierName ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {txn.items.length} item{txn.items.length !== 1 ? "s" : ""}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{txn.paymentMethod}</Badge>
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  {txn.currency} {Number(txn.total).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
