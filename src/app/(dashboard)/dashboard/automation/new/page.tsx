import { getCurrentTenant } from "@/lib/auth/session";
import { createAutomationRule } from "@/features/automation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";

const TRIGGERS = [
  { value: "CLIENT_CREATED", label: "Client Created" },
  { value: "BOOKING_CREATED", label: "Booking Created" },
  { value: "BOOKING_REMINDER", label: "Booking Reminder" },
  { value: "PAYMENT_RECEIVED", label: "Payment Received" },
  { value: "SUBSCRIPTION_RENEWAL", label: "Subscription Renewal" },
  { value: "RECOVERY_REMINDER", label: "Recovery Reminder" },
  { value: "APPOINTMENT_REMINDER", label: "Appointment Reminder" },
  { value: "BIRTHDAY", label: "Birthday" },
  { value: "COURSE_ENROLLED", label: "Course Enrolled" },
  { value: "CHALLENGE_JOINED", label: "Challenge Joined" },
];

const ACTIONS = [
  { value: "SEND_EMAIL", label: "Send Email" },
  { value: "SEND_NOTIFICATION", label: "Send Notification" },
  { value: "SEND_WHATSAPP", label: "Send WhatsApp" },
  { value: "CREATE_TASK", label: "Create CRM Task" },
  { value: "AWARD_POINTS", label: "Award Loyalty Points" },
];

export default async function NewAutomationPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Create Automation Rule</h1>
        <p className="text-muted-foreground text-sm">Set up an automated action triggered by an event.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form
            action={async (formData: FormData) => {
              "use server";
              await createAutomationRule(tenant.id, {
                name: formData.get("name") as string,
                trigger: formData.get("trigger") as Parameters<typeof createAutomationRule>[1]["trigger"],
                action: formData.get("action") as Parameters<typeof createAutomationRule>[1]["action"],
                config: {
                  subject: (formData.get("emailSubject") as string) || undefined,
                  body: (formData.get("emailBody") as string) || undefined,
                  title: (formData.get("notifTitle") as string) || undefined,
                  message: (formData.get("notifMessage") as string) || undefined,
                  points: formData.get("points") ? parseInt(formData.get("points") as string, 10) : 10,
                },
              });
              redirect("/dashboard/automation");
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="name">Rule Name *</Label>
              <Input id="name" name="name" required placeholder="Welcome new client" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="trigger">When (Trigger) *</Label>
                <select id="trigger" name="trigger" required className="h-10 w-full rounded-md border border-input px-3 text-sm">
                  {TRIGGERS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="action">Then (Action) *</Label>
                <select id="action" name="action" required className="h-10 w-full rounded-md border border-input px-3 text-sm">
                  {ACTIONS.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="emailSubject">Email Subject</Label>
              <Input id="emailSubject" name="emailSubject" placeholder="Welcome to {{tenantName}}!" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="emailBody">Email Body / Message</Label>
              <textarea
                id="emailBody"
                name="emailBody"
                rows={4}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
                placeholder="Hi {{name}}, welcome to our platform! We're excited to have you. Use {{tenantName}}, {{name}}, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="notifTitle">Notification Title</Label>
                <Input id="notifTitle" name="notifTitle" placeholder="Welcome!" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="points">Points to Award</Label>
                <Input id="points" name="points" type="number" min="1" defaultValue="10" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">Create Rule</Button>
              <Button type="button" variant="outline" formAction={() => redirect("/dashboard/automation")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
