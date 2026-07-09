import { getSession } from "@/lib/auth/session";
import { getClientPortalData } from "@/features/client-portal";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default async function ClientPortalPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const data = await getClientPortalData(session.user.id);
  if (!data) redirect("/register");

  const { tenant, enrollments, bookings, payments, notifications, weights } = data;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="font-bold text-lg">{tenant.name}</h1>
          <span className="text-sm text-muted-foreground">{session.user.name}</span>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold">My Dashboard</h2>
          <p className="text-muted-foreground">Workouts, meals, progress, bookings, and messages.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Programs</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{enrollments.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Bookings</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{bookings.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Weight Entries</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weights[weights.length - 1]?.weight ?? "—"} kg
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Notifications</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{notifications.length}</div></CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Today&apos;s Workout</CardTitle></CardHeader>
            <CardContent>
              {enrollments[0]?.program.workoutPlans[0] ? (
                <ul className="space-y-2 text-sm">
                  {enrollments[0].program.workoutPlans[0].exercises.map((ex) => (
                    <li key={ex.id} className="flex justify-between">
                      <span>{ex.name}</span>
                      <span className="text-muted-foreground">{ex.sets}×{ex.reps}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No workout assigned.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Meal Plan</CardTitle></CardHeader>
            <CardContent>
              {enrollments[0]?.program.mealPlans[0]?.meals.length ? (
                <ul className="space-y-2 text-sm">
                  {enrollments[0].program.mealPlans[0].meals.map((m) => (
                    <li key={m.id} className="flex justify-between">
                      <span>{m.name} ({m.mealType})</span>
                      <span className="text-muted-foreground">{m.calories} cal</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No meal plan assigned.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Upcoming Bookings</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {bookings.map((b) => (
              <div key={b.id} className="flex justify-between py-3 text-sm">
                <span>{b.service.name}</span>
                <span>{b.date.toLocaleDateString()} · <Badge variant="outline">{b.status}</Badge></span>
              </div>
            ))}
            {bookings.length === 0 && <p className="text-muted-foreground py-2 text-sm">No bookings.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {payments.map((p) => (
              <div key={p.id} className="flex justify-between py-3 text-sm">
                <span>{p.description ?? "Payment"}</span>
                <span>{formatCurrency(Number(p.amount))} · {p.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">Back to home</Link>
        </p>
      </main>
    </div>
  );
}
