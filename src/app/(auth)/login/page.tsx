import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";
import { Loader2 } from "lucide-react";

function LoginFormFallback() {
  return (
    <div className="flex w-full max-w-md items-center justify-center rounded-xl border bg-card p-12 shadow">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
