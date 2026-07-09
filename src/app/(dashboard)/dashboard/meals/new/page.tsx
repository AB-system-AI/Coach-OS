import { getCurrentTenant } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NewMealPlanForm } from "./new-meal-plan-form";

export default async function NewMealPlanPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/dashboard/meals" className="text-sm text-muted-foreground hover:text-foreground">
          ← Meal Plans
        </Link>
        <h1 className="text-3xl font-bold mt-2">New Meal Plan</h1>
        <p className="text-muted-foreground">Create a structured meal plan with daily meals and macros.</p>
      </div>
      <NewMealPlanForm tenantId={tenant.id} />
    </div>
  );
}
