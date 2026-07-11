"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Database,
  Lock,
  CreditCard,
  Wrench,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServiceKind } from "@/lib/deployment/errors";
import type { ServiceUnavailableProps } from "@/lib/deployment/guards";

const ICONS: Record<ServiceKind, typeof AlertTriangle> = {
  database: Database,
  authentication: Lock,
  maintenance: Wrench,
  payments: CreditCard,
  email: AlertTriangle,
  realtime: AlertTriangle,
  general: AlertTriangle,
};

export function ServiceUnavailableScreen({
  service,
  title,
  description,
  showHomeLink = true,
}: ServiceUnavailableProps) {
  const Icon = ICONS[service] ?? AlertTriangle;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Icon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try again
          </Button>
          {showHomeLink && (
            <Button asChild variant="secondary">
              <Link href="/">
                <Home className="me-2 h-4 w-4" />
                Go to homepage
              </Link>
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          If you need urgent help, contact your CoachOS administrator.
        </p>
      </div>
    </div>
  );
}

/** Server-safe variant without client reload button. */
export function ServiceUnavailablePage({
  service,
  title,
  description,
  showHomeLink = true,
}: ServiceUnavailableProps) {
  const Icon = ICONS[service] ?? AlertTriangle;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Icon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>
        {showHomeLink && (
          <Button asChild variant="secondary">
            <Link href="/">
              <Home className="me-2 h-4 w-4" />
              Go to homepage
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
