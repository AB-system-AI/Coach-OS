import { PlatformHeader } from "@/components/layout/platform-header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PlatformHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
