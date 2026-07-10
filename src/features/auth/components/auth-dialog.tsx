"use client";

import { Suspense } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import { Loader2 } from "lucide-react";

export type AuthDialogMode = "login" | "register";

type AuthDialogProps = {
  mode: AuthDialogMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModeChange: (mode: AuthDialogMode) => void;
};

function AuthDialogBody({
  mode,
  onModeChange,
  onSuccess,
}: {
  mode: AuthDialogMode;
  onModeChange: (mode: AuthDialogMode) => void;
  onSuccess: () => void;
}) {
  if (mode === "register") {
    return (
      <RegisterForm
        embedded
        onSuccess={onSuccess}
        onSwitchToLogin={() => onModeChange("login")}
      />
    );
  }

  return (
    <LoginForm
      embedded
      onSuccess={onSuccess}
      onSwitchToRegister={() => onModeChange("register")}
    />
  );
}

export function AuthDialog({
  mode,
  open,
  onOpenChange,
  onModeChange,
}: AuthDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,800px)] max-w-md gap-0 overflow-y-auto p-0 sm:max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {mode === "register" ? "Create your account" : "Sign in to CoachOS"}
          </DialogTitle>
          <DialogDescription>
            {mode === "register"
              ? "Register for CoachOS"
              : "Log in to your CoachOS account"}
          </DialogDescription>
        </DialogHeader>
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <AuthDialogBody
            mode={mode}
            onModeChange={onModeChange}
            onSuccess={() => onOpenChange(false)}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}
