"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProgramAction } from "@/features/programs/actions/program-actions";

interface Props {
  tenantId: string;
}

export function NewProgramForm({ tenantId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    durationWeeks: "",
    price: "",
    isTemplate: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Program name is required");
      return;
    }
    setLoading(true);
    try {
      const result = await createProgramAction(tenantId, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        durationWeeks: form.durationWeeks ? parseInt(form.durationWeeks) : undefined,
        price: form.price ? parseFloat(form.price) : undefined,
        isTemplate: form.isTemplate,
      });
      toast.success("Program created");
      router.push(`/dashboard/programs/${result.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create program");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Program Name *</Label>
            <Input
              id="name"
              placeholder="e.g. 12-Week Strength Builder"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Describe the program goals and structure..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durationWeeks">Duration (weeks)</Label>
              <Input
                id="durationWeeks"
                type="number"
                min="1"
                max="52"
                placeholder="12"
                value={form.durationWeeks}
                onChange={(e) => setForm({ ...form, durationWeeks: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isTemplate"
              checked={form.isTemplate}
              onChange={(e) => setForm({ ...form, isTemplate: e.target.checked })}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="isTemplate">Save as template (reusable for multiple clients)</Label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Program"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
