import { Suspense } from "react";
import { redirectIfAuthenticated } from "@/lib/auth/redirects";
import { MagicLinkForm } from "@/features/auth/components/magic-link-form";
import { Loader2 } from "lucide-react";

function MagicLinkFallback() {
  return (
    <div className="flex w-full max-w-md items-center justify-center rounded-xl border bg-card p-12 shadow">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export const metadata = {
  title: "Magic Link Sign In",
  description: "Sign in to CoachOS with a one-time email link.",
};

export default async function MagicLinkPage() {
  await redirectIfAuthenticated();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/20 px-4 py-12">
      <Suspense fallback={<MagicLinkFallback />}>
        <MagicLinkForm />
      </Suspense>
    </div>
  );
}
