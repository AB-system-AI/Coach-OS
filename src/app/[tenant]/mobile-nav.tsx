"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

type NavItem = { label: string; path: string };

type MobileNavProps = {
  slug: string;
  navItems: NavItem[];
  tenantName: string;
};

export function MobileNav({ slug, navItems, tenantName }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md text-muted-foreground hover:text-foreground"
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-sm">
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {tenantName}
            </p>
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={`/${slug}${item.path ? `/${item.path}` : ""}`}
                onClick={() => setOpen(false)}
                className="text-lg font-medium hover:text-[var(--tenant-primary)] transition-colors py-1 border-b border-border/50"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={`/${slug}/booking`}
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--tenant-primary)" }}
            >
              Book Now
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
