import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata = {
  title: "Forgot Password",
  description: "Reset your CoachOS account password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <ForgotPasswordForm />
    </div>
  );
}
