"use client";

import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthFormShellProps = {
  embedded?: boolean;
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function AuthFormShell({
  embedded = false,
  icon,
  title,
  description,
  children,
  footer,
  className,
}: AuthFormShellProps) {
  if (embedded) {
    return (
      <div className={cn("w-full bg-background text-foreground", className)}>
        <div className="space-y-1.5 px-6 pb-2 pt-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            {icon}
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
        {footer ? <div className="px-6 pb-6 pt-2">{footer}</div> : null}
      </div>
    );
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          {icon}
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children}
      {footer ? <CardFooter className="flex flex-col gap-4">{footer}</CardFooter> : null}
    </Card>
  );
}

export function AuthFormBody({
  embedded = false,
  children,
  className,
}: {
  embedded?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  if (embedded) {
    return <div className={cn("space-y-4 px-6", className)}>{children}</div>;
  }

  return <CardContent className={cn("space-y-4", className)}>{children}</CardContent>;
}

export function AuthFormActions({
  embedded = false,
  children,
  className,
}: {
  embedded?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  if (embedded) {
    return (
      <div className={cn("flex flex-col gap-4 px-6 pb-6", className)}>
        {children}
      </div>
    );
  }

  return <CardFooter className={cn("flex flex-col gap-4", className)}>{children}</CardFooter>;
}
