import { requireRole } from "@/lib/auth/session";
import { getSupportTickets, getSupportStats } from "@/features/support";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function updateTicketStatus(ticketId: string, status: string) {
  "use server";
  await requireRole("SUPER_ADMIN");
  await db.supportTicket.update({
    where: { id: ticketId },
    data: { status: status as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" },
  });
  revalidatePath("/admin/support");
}

async function replyToTicket(ticketId: string, reply: string) {
  "use server";
  await requireRole("SUPER_ADMIN");
  if (!reply?.trim()) return;
  await db.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: "IN_PROGRESS",
      updatedAt: new Date(),
    },
  });
  revalidatePath("/admin/support");
}

export default async function AdminSupportPage() {
  await requireRole("SUPER_ADMIN");
  const [tickets, stats] = await Promise.all([
    getSupportTickets(),
    getSupportStats(),
  ]);

  const inProgress = await db.supportTicket.count({ where: { status: "IN_PROGRESS" } });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Support Tickets</h1>

      <div className="grid gap-4 md:grid-cols-4 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.open}</div>
            <p className="text-sm text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{inProgress}</div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tickets.length}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
          {tickets.map((t) => (
            <Card key={t.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{t.subject}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.creator.name} ({t.creator.email}) · {t.priority}
                    </p>
                  </div>
                  <Badge variant={
                    t.status === "OPEN" ? "destructive" :
                    t.status === "IN_PROGRESS" ? "secondary" :
                    "default"
                  }>
                    {t.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t.description}</p>

                <div className="flex flex-wrap gap-2">
                  {t.status !== "RESOLVED" && (
                    <form action={async () => {
                      "use server";
                      await updateTicketStatus(t.id, "RESOLVED");
                    }}>
                      <Button variant="outline" size="sm" type="submit">Mark Resolved</Button>
                    </form>
                  )}
                  {t.status === "OPEN" && (
                    <form action={async () => {
                      "use server";
                      await updateTicketStatus(t.id, "IN_PROGRESS");
                    }}>
                      <Button variant="outline" size="sm" type="submit">Start Working</Button>
                    </form>
                  )}
                </div>

                <form
                  action={async (formData: FormData) => {
                    "use server";
                    const reply = formData.get("reply") as string;
                    await replyToTicket(t.id, reply);
                  }}
                  className="flex gap-2"
                >
                  <Input name="reply" placeholder="Type a reply..." className="flex-1" />
                  <Button type="submit" size="sm">Reply</Button>
                </form>
              </CardContent>
            </Card>
          ))}

        {tickets.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No support tickets.
            </CardContent>
          </Card>
        )}
      </div>

      <Link href="/admin" className="text-sm text-muted-foreground hover:underline">← Admin</Link>
    </div>
  );
}
