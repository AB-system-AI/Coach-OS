import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/components/register-form";
import { Loader2 } from "lucide-react";

function RegisterFormFallback() {
  return (
    <div className="flex w-full max-w-md items-center justify-center rounded-xl border bg-card p-12 shadow">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/20 px-4 py-12">
      <Suspense fallback={<RegisterFormFallback />}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
