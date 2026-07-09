"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createExpenseAction, deleteExpenseAction } from "@/features/enterprise/actions/enterprise-actions";

type Wallet = {
  id: string;
  balance: number | string;
  pendingBalance: number | string;
  currency: string;
} | null;

type WalletTransaction = {
  id: string;
  type: string;
  amount: number | string;
  currency: string;
  status: string;
  description: string | null;
  createdAt: Date;
};

type Expense = {
  id: string;
  category: string;
  amount: number | string;
  currency: string;
  description: string | null;
  expenseDate: Date;
};

export function FinanceModule({
  tenantId,
  wallet,
  transactions,
  expenses,
}: {
  tenantId: string;
  wallet: Wallet;
  transactions: WalletTransaction[];
  expenses: Expense[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    category: "",
    amount: "",
    currency: "USD",
    description: "",
    expenseDate: new Date().toISOString().slice(0, 10),
  });

  async function handleCreateExpense(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await createExpenseAction(tenantId, {
      category: form.category,
      amount: Number(form.amount),
      currency: form.currency,
      description: form.description || undefined,
      expenseDate: new Date(form.expenseDate),
    });
    setLoading(false);
    if (result.success) {
      setOpen(false);
      setForm({ category: "", amount: "", currency: "USD", description: "", expenseDate: new Date().toISOString().slice(0, 10) });
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleDeleteExpense(id: string) {
    if (!confirm("Delete this expense?")) return;
    await deleteExpenseAction(tenantId, id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wallet?.currency ?? "USD"} {Number(wallet?.balance ?? 0).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Pending: {Number(wallet?.pendingBalance ?? 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${expenses.reduce((s, e) => s + Number(e.amount), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Wallet Transactions</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No transactions yet.
                    </td>
                  </tr>
                )}
                {transactions.map((txn) => (
                  <tr key={txn.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{txn.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{txn.description ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={txn.status === "COMPLETED" ? "default" : "secondary"}>
                        {txn.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {txn.currency} {Number(txn.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <div className="flex justify-end mb-4">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>Add Expense</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Expense</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateExpense} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      required
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="e.g. Equipment, Rent, Utilities"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        required
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Input
                        value={form.currency}
                        onChange={(e) => setForm({ ...form, currency: e.target.value })}
                        placeholder="USD"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={form.expenseDate}
                      onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Optional description"
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Adding..." : "Add Expense"}
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
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No expenses yet.
                    </td>
                  </tr>
                )}
                {expenses.map((exp) => (
                  <tr key={exp.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(exp.expenseDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{exp.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{exp.description ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {exp.currency} {Number(exp.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteExpense(exp.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
