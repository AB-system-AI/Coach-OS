import Link from "next/link";

export default function TenantNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4 py-20">
      <p className="text-6xl font-bold text-muted-foreground/30 mb-4">404</p>
      <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground max-w-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href=".."
          className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--tenant-primary)" }}
        >
          Go Back
        </Link>
        <Link
          href="."
          className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
