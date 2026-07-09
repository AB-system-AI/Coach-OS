import { getSession } from "@/lib/auth/session";
import { getPortalDownloads } from "@/features/client-portal/services/portal-service";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

export default async function PortalDownloadsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const files = await getPortalDownloads(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Downloads</h1>
        <p className="text-muted-foreground text-sm">Files and resources shared by your coach.</p>
      </div>

      {files.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Download className="h-8 w-8 mx-auto mb-2 opacity-40" />
            No files available yet.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {files.map((file) => (
          <Card key={file.id}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file.mimeType ?? "File"} · {new Date(file.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={file.url} target="_blank" rel="noopener noreferrer" download>
                  <Download className="h-3.5 w-3.5" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
