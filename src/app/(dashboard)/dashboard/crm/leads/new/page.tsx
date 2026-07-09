import { getCurrentTenant } from "@/lib/auth/session";
import { createCrmLead } from "@/features/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";

export default async function NewCrmLeadPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Add Lead</h1>
        <p className="text-muted-foreground text-sm">Add a new lead to your CRM pipeline.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form
            action={async (formData: FormData) => {
              "use server";
              const lead = await createCrmLead(tenant.id, {
                name: formData.get("name") as string,
                email: (formData.get("email") as string) || undefined,
                phone: (formData.get("phone") as string) || undefined,
                source: (formData.get("source") as string) || undefined,
                value: formData.get("value") ? parseFloat(formData.get("value") as string) : undefined,
                notes: (formData.get("notes") as string) || undefined,
              });
              redirect(`/dashboard/crm`);
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required placeholder="John Smith" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+1 555 000 0000" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="source">Source</Label>
              <select id="source" name="source" className="h-10 w-full rounded-md border border-input px-3 text-sm">
                <option value="">Select source...</option>
                <option value="WEBSITE">Website</option>
                <option value="REFERRAL">Referral</option>
                <option value="SOCIAL_MEDIA">Social Media</option>
                <option value="MARKETPLACE">Marketplace</option>
                <option value="EMAIL">Email Campaign</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="value">Deal Value ($)</Label>
              <Input id="value" name="value" type="number" min="0" step="0.01" placeholder="500" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
                placeholder="Any relevant notes..."
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Add Lead</Button>
              <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
