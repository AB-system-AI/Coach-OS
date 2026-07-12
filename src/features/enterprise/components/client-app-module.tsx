import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink, Users, BookOpen, TrendingUp } from "lucide-react";

export function ClientAppModule({
  clientsCount,
  bookingsCount,
  enrollmentsCount,
}: {
  clientsCount: number;
  bookingsCount: number;
  enrollmentsCount: number;
}) {
  const features = [
    { icon: "🏋️", title: "Workouts", description: "Clients access their assigned programs and log completed workouts." },
    { icon: "🥗", title: "Nutrition", description: "View meal plans, log meals, and track macros in real time." },
    { icon: "📈", title: "Progress", description: "Body measurements, photos, and weekly check-in submissions." },
    { icon: "💳", title: "Payments", description: "View invoices, pay securely, and download receipts." },
    { icon: "📅", title: "Bookings", description: "Book sessions, view appointments, join waitlists." },
    { icon: "💬", title: "Messaging", description: "Direct messaging with coaches and support." },
    { icon: "🏆", title: "Community", description: "Community feed, challenges, and leaderboards." },
    { icon: "🎓", title: "Courses", description: "Access purchased courses and track completion." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Client App</h2>
          <p className="text-sm text-muted-foreground">
            Mobile experience for your clients — iOS, Android, and Web.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/clients">
            Manage Clients
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Users, label: "Active Clients", value: clientsCount },
          { icon: BookOpen, label: "Total Bookings", value: bookingsCount },
          { icon: TrendingUp, label: "Enrollments", value: enrollmentsCount },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-base font-semibold mb-3">App Features</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="border rounded-lg p-3 space-y-1">
              <div className="text-xl">{feature.icon}</div>
              <div className="font-medium text-sm">{feature.title}</div>
              <div className="text-xs text-muted-foreground">{feature.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
