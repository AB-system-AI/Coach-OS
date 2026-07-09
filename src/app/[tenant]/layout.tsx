import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveTenantFromSlug } from "@/features/tenancy";
import { TenantThemeProvider } from "@/features/theme";

type TenantLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
};

export default async function TenantWebsiteLayout({
  children,
  params,
}: TenantLayoutProps) {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);

  if (!resolved) {
    notFound();
  }

  const { tenant } = resolved;

  return (
    <TenantThemeProvider theme={tenant.theme}>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 border-b bg-[var(--tenant-background)]/80 backdrop-blur-lg">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2 font-bold text-lg">
              {tenant.theme?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tenant.theme.logoUrl}
                  alt={tenant.name}
                  className="h-8 w-auto"
                />
              ) : (
                <span style={{ color: "var(--tenant-primary)" }}>
                  {tenant.name}
                </span>
              )}
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              {["About", "Programs", "Recovery", "Pricing", "Contact"].map(
                (item) => (
                  <a
                    key={item}
                    href={`/${slug}/${item.toLowerCase()}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item}
                  </a>
                )
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t py-8 bg-muted/30">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} {tenant.name}. Powered by{" "}
              <Link href="/" className="text-primary hover:underline">
                CoachOS
              </Link>
            </p>
          </div>
        </footer>
      </div>
    </TenantThemeProvider>
  );
}
