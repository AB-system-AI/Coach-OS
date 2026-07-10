"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { signUp } from "@/lib/auth/client";
import { createTenant } from "@/features/tenancy/actions/tenant-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { Dumbbell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AuthFormActions,
  AuthFormBody,
  AuthFormShell,
} from "@/features/auth/components/auth-form-shell";

type RegisterFormProps = {
  embedded?: boolean;
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
};

export function RegisterForm({
  embedded = false,
  onSuccess,
  onSwitchToLogin,
}: RegisterFormProps) {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const businessName = formData.get("businessName") as string;

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        toast.error(result.error.message ?? "Registration failed");
        return;
      }

      if (result.data?.user?.id) {
        await createTenant({
          name: businessName,
          ownerUserId: result.data.user.id,
        });
      }

      toast.success("Account created! Let's set up your business.");
      onSuccess?.();
      router.push("/onboarding");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const loginLink =
    embedded && onSwitchToLogin ? (
      <button
        type="button"
        className="text-primary hover:underline"
        onClick={onSwitchToLogin}
      >
        {t("login")}
      </button>
    ) : (
      <Link href="/login" className="text-primary hover:underline">
        {t("login")}
      </Link>
    );

  return (
    <AuthFormShell
      embedded={embedded}
      icon={<Dumbbell className="h-6 w-6" />}
      title={t("title")}
      description={t("subtitle")}
    >
      <form onSubmit={handleSubmit}>
        <AuthFormBody embedded={embedded} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={embedded ? "modal-name" : "name"}>{t("name")}</Label>
            <Input
              id={embedded ? "modal-name" : "name"}
              name="name"
              required
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={embedded ? "modal-businessName" : "businessName"}>
              {t("businessName")}
            </Label>
            <Input
              id={embedded ? "modal-businessName" : "businessName"}
              name="businessName"
              required
              placeholder="FitPro Coaching"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={embedded ? "modal-register-email" : "email"}>
              {t("email")}
            </Label>
            <Input
              id={embedded ? "modal-register-email" : "email"}
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={embedded ? "modal-register-password" : "password"}>
              {t("password")}
            </Label>
            <Input
              id={embedded ? "modal-register-password" : "password"}
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
        </AuthFormBody>
        <AuthFormActions embedded={embedded}>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {t("submit")}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            {t("hasAccount")} {loginLink}
          </p>
        </AuthFormActions>
      </form>
    </AuthFormShell>
  );
}
