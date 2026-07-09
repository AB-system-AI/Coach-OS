"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientAction } from "@/features/clients/actions/client-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

type Props = { tenantId: string };

export function AddClientForm({ tenantId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await createClientAction(tenantId, {
        name: form.get("name") as string,
        email: form.get("email") as string,
        phone: (form.get("phone") as string) || undefined,
        goals: (form.get("goals") as string) || undefined,
        goalType: (form.get("goalType") as "WEIGHT_LOSS" | "MUSCLE_GAIN" | "FITNESS") || undefined,
      });
      toast.success("Client added");
      router.push("/dashboard/clients");
    } catch {
      toast.error("Failed to add client");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Add Client</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" />
          </div>
          <div>
            <Label htmlFor="goals">Goal</Label>
            <Input id="goals" name="goals" placeholder="e.g. Weight loss, muscle gain" />
          </div>
          <div>
            <Label htmlFor="goalType">Goal Type</Label>
            <select id="goalType" name="goalType" className="w-full border rounded-md h-10 px-3 text-sm">
              <option value="">Select...</option>
              <option value="WEIGHT_LOSS">Weight Loss</option>
              <option value="MUSCLE_GAIN">Muscle Gain</option>
              <option value="FITNESS">Fitness</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Add Client"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/clients">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
