"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { signUp } from "@/lib/auth/client";
import { createTenant } from "@/features/tenancy/actions/tenant-actions";
import { getPostLoginDestination } from "@/features/auth/actions/redirect-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { Dumbbell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AuthFormActions,
  AuthFormBody,
  AuthFormField,
  AuthFormShell,
  authButtonClassName,
  authInputClassName,
  authLinkClassName,
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

      const destination = await getPostLoginDestination();
      toast.success(
        destination === "/verify-email"
          ? "Account created! Verify your email to continue."
          : "Account created! Let's set up your business."
      );
      onSuccess?.();
      if (embedded) {
        window.location.assign(destination);
      } else {
        router.push(destination);
      }
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
        className={authLinkClassName}
        onClick={onSwitchToLogin}
      >
        {t("login")}
      </button>
    ) : (
      <Link href="/login" className={authLinkClassName}>
        {t("login")}
      </Link>
    );

  return (
    <AuthFormShell
      embedded={embedded}
      icon={<Dumbbell className="h-5 w-5" />}
      title={t("title")}
      description={t("subtitle")}
    >
      <form onSubmit={handleSubmit}>
        <AuthFormBody embedded={embedded} className="space-y-3.5">
          <AuthFormField label={t("name")} htmlFor={embedded ? "modal-name" : "name"}>
            <Input
              id={embedded ? "modal-name" : "name"}
              name="name"
              required
              autoComplete="name"
              className={authInputClassName}
            />
          </AuthFormField>
          <AuthFormField
            label={t("businessName")}
            htmlFor={embedded ? "modal-businessName" : "businessName"}
          >
            <Input
              id={embedded ? "modal-businessName" : "businessName"}
              name="businessName"
              required
              placeholder="FitPro Coaching"
              className={authInputClassName}
            />
          </AuthFormField>
          <AuthFormField
            label={t("email")}
            htmlFor={embedded ? "modal-register-email" : "email"}
          >
            <Input
              id={embedded ? "modal-register-email" : "email"}
              name="email"
              type="email"
              required
              autoComplete="email"
              className={authInputClassName}
            />
          </AuthFormField>
          <AuthFormField
            label={t("password")}
            htmlFor={embedded ? "modal-register-password" : "password"}
          >
            <Input
              id={embedded ? "modal-register-password" : "password"}
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={authInputClassName}
            />
          </AuthFormField>
        </AuthFormBody>
        <AuthFormActions embedded={embedded}>
          <Button
            type="submit"
            className={authButtonClassName}
            disabled={loading}
          >
            {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {t("submit")}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t("hasAccount")} {loginLink}
          </p>
        </AuthFormActions>
      </form>
    </AuthFormShell>
  );
}
