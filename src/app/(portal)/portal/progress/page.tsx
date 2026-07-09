import { getSession } from "@/lib/auth/session";
import { getPortalProgress } from "@/features/client-portal/services/portal-service";
import { submitWeightEntry } from "@/features/client-portal/actions/portal-actions";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function PortalProgressPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const { weights, measurements, photos } = await getPortalProgress(session.user.id);

  const latestWeight = weights[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="text-muted-foreground text-sm">Track your weight, measurements, and photos.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Latest Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestWeight ? `${latestWeight.weight} ${latestWeight.unit}` : "—"}
            </div>
            {latestWeight && (
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(latestWeight.recordedAt).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weights.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Progress Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{photos.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Weight</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server";
                      const weight = parseFloat(formData.get("weight") as string);
              const unit = formData.get("unit") as string;
              const notes = formData.get("notes") as string;
              if (!isNaN(weight) && weight > 0) {
                await submitWeightEntry({ weight, unit: unit || "kg", notes });
              }
            }}
            className="flex flex-wrap gap-4 items-end"
          >
            <div className="space-y-1">
              <Label htmlFor="weight">Weight</Label>
              <Input id="weight" name="weight" type="number" step="0.1" min="0" placeholder="70.5" required className="w-32" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="unit">Unit</Label>
              <select id="unit" name="unit" className="h-10 rounded-md border border-input px-3 text-sm">
                <option value="KG">KG</option>
                <option value="LBS">LBS</option>
              </select>
            </div>
            <div className="space-y-1 flex-1">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input id="notes" name="notes" placeholder="Morning, fasted..." />
            </div>
            <Button type="submit">Log Weight</Button>
          </form>
        </CardContent>
      </Card>

      {weights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weight History</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {weights.map((w) => (
              <div key={w.id} className="flex justify-between py-2.5 text-sm">
                <span>{new Date(w.recordedAt).toLocaleDateString()}</span>
                <span className="font-medium">{w.weight} {w.unit}</span>
                {w.notes && <span className="text-muted-foreground text-xs">{w.notes}</span>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {measurements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Body Measurements</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {measurements.map((m) => (
              <div key={m.id} className="py-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{new Date(m.recordedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-wrap gap-3 mt-1 text-xs">
                  {m.chest && <span>Chest: {m.chest}cm</span>}
                  {m.waist && <span>Waist: {m.waist}cm</span>}
                  {m.hips && <span>Hips: {m.hips}cm</span>}
                  {m.biceps && <span>Biceps: {m.biceps}cm</span>}
                  {m.thighs && <span>Thighs: {m.thighs}cm</span>}
                  {m.bodyFat && <span>BF: {m.bodyFat}%</span>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progress Photos</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.imageUrl} alt={photo.photoType ?? "Progress photo"} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
