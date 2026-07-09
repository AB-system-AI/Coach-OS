"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Trash2, Plus, Pencil } from "lucide-react";
import {
  addMealAction,
  deleteMealAction,
  updateMealPlanAction,
  deleteMealPlanAction,
} from "@/features/meals/actions/meal-actions";

const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK", "PRE_WORKOUT", "POST_WORKOUT"];

type Meal = {
  id: string;
  name: string;
  mealType: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
};

type Plan = {
  id: string;
  name: string;
  description: string | null;
  isTemplate: boolean | null;
  meals: Meal[];
  program: { name: string } | null;
};

export function MealPlanDetailClient({ plan: initial, tenantId }: { plan: Plan; tenantId: string }) {
  const router = useRouter();
  const [plan] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(initial.name);
  const [saving, setSaving] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [mealForm, setMealForm] = useState({
    name: "", mealType: "BREAKFAST", calories: "", protein: "", carbs: "", fat: "",
  });
  const [adding, setAdding] = useState(false);

  const totalMacros = plan.meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories ?? 0),
      protein: acc.protein + (m.protein ?? 0),
      carbs: acc.carbs + (m.carbs ?? 0),
      fat: acc.fat + (m.fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  async function handleSave() {
    if (!editName.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    try {
      await updateMealPlanAction(tenantId, plan.id, { name: editName });
      toast.success("Meal plan updated");
      setEditing(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${plan.name}"? This cannot be undone.`)) return;
    try {
      await deleteMealPlanAction(tenantId, plan.id);
      toast.success("Meal plan deleted");
      router.push("/dashboard/meals");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  async function handleAddMeal() {
    if (!mealForm.name.trim()) { toast.error("Meal name required"); return; }
    setAdding(true);
    try {
      await addMealAction(tenantId, plan.id, {
        name: mealForm.name,
        mealType: mealForm.mealType,
        calories: mealForm.calories ? parseInt(mealForm.calories) : undefined,
        protein: mealForm.protein ? parseFloat(mealForm.protein) : undefined,
        carbs: mealForm.carbs ? parseFloat(mealForm.carbs) : undefined,
        fat: mealForm.fat ? parseFloat(mealForm.fat) : undefined,
      });
      toast.success("Meal added");
      setMealForm({ name: "", mealType: "BREAKFAST", calories: "", protein: "", carbs: "", fat: "" });
      setShowAdd(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add meal");
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteMeal(mealId: string) {
    if (!confirm("Remove this meal?")) return;
    try {
      await deleteMealAction(tenantId, mealId, plan.id);
      toast.success("Meal removed");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove");
    }
  }

  const groupedMeals = MEAL_TYPES.reduce((acc, type) => {
    acc[type] = plan.meals.filter((m) => m.mealType === type);
    return acc;
  }, {} as Record<string, Meal[]>);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/meals" className="text-sm text-muted-foreground hover:text-foreground">
          ← Meal Plans
        </Link>
        {editing ? (
          <div className="mt-2 space-y-2 max-w-md">
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mt-2">{plan.name}</h1>
            {plan.description && <p className="text-muted-foreground">{plan.description}</p>}
            {plan.program && <p className="text-sm text-muted-foreground">Linked to: {plan.program.name}</p>}
          </>
        )}
      </div>

      {!editing && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4 me-1" />Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 me-1" />Delete Plan
          </Button>
        </div>
      )}

      {/* Daily Totals */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Calories", value: `${totalMacros.calories} kcal` },
          { label: "Protein", value: `${totalMacros.protein.toFixed(0)}g` },
          { label: "Carbs", value: `${totalMacros.carbs.toFixed(0)}g` },
          { label: "Fat", value: `${totalMacros.fat.toFixed(0)}g` },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className="text-lg font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Meals by type */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Meals ({plan.meals.length})</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)}>
              <Plus className="h-4 w-4 me-1" />Add Meal
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAdd && (
            <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
              <p className="font-medium text-sm">Add Meal</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Meal Name *</Label>
                  <Input
                    placeholder="e.g. Oatmeal with berries"
                    value={mealForm.name}
                    onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Meal Type</Label>
                  <select
                    className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    value={mealForm.mealType}
                    onChange={(e) => setMealForm({ ...mealForm, mealType: e.target.value })}
                  >
                    {MEAL_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
                {[
                  { key: "calories", label: "Calories (kcal)" },
                  { key: "protein", label: "Protein (g)" },
                  { key: "carbs", label: "Carbs (g)" },
                  { key: "fat", label: "Fat (g)" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">{label}</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="0"
                      value={(mealForm as Record<string, string>)[key]}
                      onChange={(e) => setMealForm({ ...mealForm, [key]: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddMeal} disabled={adding}>{adding ? "Adding..." : "Add"}</Button>
                <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {MEAL_TYPES.map((type) => {
            const meals = groupedMeals[type] ?? [];
            if (meals.length === 0) return null;
            return (
              <div key={type}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">{type.replace("_", " ")}</h3>
                <div className="space-y-2">
                  {meals.map((meal) => (
                    <div key={meal.id} className="flex items-start justify-between rounded-md border px-4 py-3">
                      <div>
                        <p className="font-medium text-sm">{meal.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {meal.calories != null && `${meal.calories} kcal`}
                          {meal.protein != null && ` · P: ${meal.protein}g`}
                          {meal.carbs != null && ` · C: ${meal.carbs}g`}
                          {meal.fat != null && ` · F: ${meal.fat}g`}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="text-destructive hover:text-destructive h-7 w-7 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {plan.meals.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-6">
              No meals yet. Add your first meal above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
