import { getSession } from "@/lib/auth/session";
import { getPortalCertificates } from "@/features/client-portal/services/portal-service";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download } from "lucide-react";

export default async function PortalCertificatesPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const certificates = await getPortalCertificates(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Certificates</h1>
        <p className="text-muted-foreground text-sm">Your course completion certificates.</p>
      </div>

      {certificates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Award className="h-8 w-8 mx-auto mb-2 opacity-40" />
            No certificates yet. Complete a course to earn your first certificate.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {certificates.map((enrollment) => (
          <Card key={enrollment.id} className="border-2 border-primary/20">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">{enrollment.course.title}</p>
                  <p className="text-sm text-muted-foreground">{enrollment.course.description?.slice(0, 80)}</p>
                  {enrollment.completedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Completed: {new Date(enrollment.completedAt).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <Badge>Certificate Earned</Badge>
                    {enrollment.certificateUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={enrollment.certificateUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
