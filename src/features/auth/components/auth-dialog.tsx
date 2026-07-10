"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";

export type AuthDialogMode = "login" | "register";

type AuthDialogProps = {
  mode: AuthDialogMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModeChange: (mode: AuthDialogMode) => void;
};

export function AuthDialog({
  mode,
  open,
  onOpenChange,
  onModeChange,
}: AuthDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent className="max-h-[min(90vh,800px)] min-h-[320px] max-w-[420px] gap-0 overflow-y-auto rounded-2xl border-border/40 bg-background p-0 shadow-2xl sm:max-w-[420px] [&>button]:end-4 [&>button]:start-auto [&>button]:top-4 [&>button]:flex [&>button]:h-8 [&>button]:w-8 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:border [&>button]:border-border/50 [&>button]:bg-muted/50 [&>button]:opacity-100 [&>button]:transition-colors [&>button]:hover:bg-muted">
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
          {mode === "register" ? (
            <RegisterForm
              embedded
              onSuccess={() => onOpenChange(false)}
              onSwitchToLogin={() => onModeChange("login")}
            />
          ) : (
            <LoginForm
              embedded
              onSuccess={() => onOpenChange(false)}
              onSwitchToRegister={() => onModeChange("register")}
            />
          )}
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
