"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { sanitizeErrorMessageForClient } from "@/lib/deployment/sanitize-error";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { title, description } = sanitizeErrorMessageForClient(error);

  useEffect(() => {
    console.error("[CoachOS] Admin error:", error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
            {error.digest && (
              <p className="text-xs text-muted-foreground font-mono mt-2">ID: {error.digest}</p>
            )}
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={reset} size="sm">Try Again</Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin">Admin Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
