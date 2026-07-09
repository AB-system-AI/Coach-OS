import { getCurrentTenant } from "@/lib/auth/session";
import { getMealPlanById } from "@/features/meals/services/meal-service";
import { redirect, notFound } from "next/navigation";
import { MealPlanDetailClient } from "./meal-plan-detail-client";

type Props = { params: Promise<{ id: string }> };

export default async function MealPlanDetailPage({ params }: Props) {
  const { id } = await params;
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const plan = await getMealPlanById(tenant.id, id);
  if (!plan) notFound();

  return <MealPlanDetailClient plan={plan} tenantId={tenant.id} />;
}
