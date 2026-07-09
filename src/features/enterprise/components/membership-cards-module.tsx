"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  issueMembershipCardAction,
  revokeMembershipCardAction,
} from "@/features/enterprise/actions/enterprise-actions";
import type { MembershipCardType } from "@prisma/client";

type MembershipCard = {
  id: string;
  cardNumber: string;
  cardType: MembershipCardType;
  isActive: boolean;
  issuedAt: Date;
  expiresAt: Date | null;
  client: { user: { name: string } } | null;
};

const CARD_TYPES: MembershipCardType[] = ["QR", "BARCODE", "NFC"];

export function MembershipCardsModule({
  tenantId,
  initialCards,
}: {
  tenantId: string;
  initialCards: MembershipCard[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    cardNumber: "",
    cardType: "QR" as MembershipCardType,
    expiresAt: "",
  });

  function generateCardNumber() {
    const num = "MC" + Date.now().toString(36).toUpperCase();
    setForm((f) => ({ ...f, cardNumber: num }));
  }

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await issueMembershipCardAction(tenantId, {
      cardNumber: form.cardNumber,
      cardType: form.cardType,
      expiresAt: form.expiresAt ? new Date(form.expiresAt) : undefined,
    });
    setLoading(false);
    if (result.success) {
      setOpen(false);
      setForm({ cardNumber: "", cardType: "QR", expiresAt: "" });
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm("Revoke this card?")) return;
    await revokeMembershipCardAction(tenantId, id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Membership Cards</h2>
          <p className="text-sm text-muted-foreground">
            {initialCards.filter((c) => c.isActive).length} active
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Issue Card</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue Membership Card</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleIssue} className="space-y-4">
              <div className="space-y-2">
                <Label>Card Number</Label>
                <div className="flex gap-2">
                  <Input
                    required
                    value={form.cardNumber}
                    onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                    placeholder="MC123456"
                  />
                  <Button type="button" variant="outline" onClick={generateCardNumber}>
                    Generate
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Card Type</Label>
                <Select
                  value={form.cardType}
                  onValueChange={(v) => setForm({ ...form, cardType: v as MembershipCardType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expires At (optional)</Label>
                <Input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Issuing..." : "Issue Card"}
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
              <th className="px-4 py-3 text-left font-medium">Card Number</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Member</th>
              <th className="px-4 py-3 text-left font-medium">Issued</th>
              <th className="px-4 py-3 text-left font-medium">Expires</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialCards.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No cards issued yet.
                </td>
              </tr>
            )}
            {initialCards.map((card) => (
              <tr key={card.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-mono font-medium">{card.cardNumber}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{card.cardType}</Badge>
                </td>
                <td className="px-4 py-3">{card.client?.user.name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(card.issuedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {card.expiresAt ? new Date(card.expiresAt).toLocaleDateString() : "No expiry"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={card.isActive ? "default" : "secondary"}>
                    {card.isActive ? "Active" : "Revoked"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {card.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleRevoke(card.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
