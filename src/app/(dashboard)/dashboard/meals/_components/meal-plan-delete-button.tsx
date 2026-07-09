"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteMealPlanAction } from "@/features/meals/actions/meal-actions";

interface Props {
  tenantId: string;
  planId: string;
  planName: string;
}

export function MealPlanDeleteButton({ tenantId, planId, planName }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete "${planName}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await deleteMealPlanAction(tenantId, planId);
      toast.success("Meal plan deleted");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleDelete}
      disabled={loading}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
