"use client";

import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const authInputClassName =
  "h-11 rounded-xl border-border/50 bg-muted/30 shadow-none transition-all placeholder:text-muted-foreground/60 focus-visible:border-primary/40 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/15";

export const authLabelClassName = "text-[13px] font-medium text-foreground/80";

export const authButtonClassName =
  "h-11 w-full rounded-xl text-[15px] font-semibold shadow-sm";

export const authLinkClassName =
  "font-medium text-primary transition-colors hover:text-primary/80";

type AuthFormShellProps = {
  embedded?: boolean;
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

function AuthFormHeader({
  icon,
  title,
  description,
}: Pick<AuthFormShellProps, "icon" | "title" | "description">) {
  return (
    <div className="space-y-2 text-center">
      <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
        {icon}
      </div>
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

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
      <div className={cn("w-full text-foreground", className)}>
        <div className="px-8 pb-1 pt-8">
          <AuthFormHeader icon={icon} title={title} description={description} />
        </div>
        {children}
        {footer ? <div className="px-8 pb-8 pt-2">{footer}</div> : null}
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "w-full max-w-md border-border/50 bg-card/80 shadow-xl backdrop-blur-sm",
        className
      )}
    >
      <CardHeader className="space-y-0 px-8 pb-2 pt-8 text-center">
        <AuthFormHeader icon={icon} title={title} description={description} />
      </CardHeader>
      {children}
      {footer ? (
        <CardFooter className="flex flex-col gap-4 px-8 pb-8">{footer}</CardFooter>
      ) : null}
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
    return <div className={cn("space-y-4 px-8", className)}>{children}</div>;
  }

  return (
    <CardContent className={cn("space-y-4 px-8", className)}>{children}</CardContent>
  );
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
      <div className={cn("flex flex-col gap-3 px-8 pb-8 pt-2", className)}>
        {children}
      </div>
    );
  }

  return (
    <CardFooter className={cn("flex flex-col gap-3 px-8 pb-8", className)}>
      {children}
    </CardFooter>
  );
}

export function AuthFormField({
  label,
  htmlFor,
  children,
}: {
  label: ReactNode;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className={authLabelClassName}>
        {label}
      </label>
      {children}
    </div>
  );
}
