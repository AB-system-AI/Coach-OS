import type { TenantTheme } from "@prisma/client";

export type ThemeConfig = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  headingFont: string;
  borderRadius: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  heroImageUrl?: string | null;
};

export const DEFAULT_THEME: ThemeConfig = {
  primaryColor: "#6366f1",
  secondaryColor: "#8b5cf6",
  accentColor: "#06b6d4",
  backgroundColor: "#ffffff",
  textColor: "#0f172a",
  fontFamily: "Inter",
  headingFont: "Inter",
  borderRadius: "0.625rem",
};

export function themeFromDb(theme: TenantTheme | null): ThemeConfig {
  if (!theme) return DEFAULT_THEME;
  return {
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    accentColor: theme.accentColor,
    backgroundColor: theme.backgroundColor,
    textColor: theme.textColor,
    fontFamily: theme.fontFamily,
    headingFont: theme.headingFont,
    borderRadius: theme.borderRadius,
    logoUrl: theme.logoUrl,
    faviconUrl: theme.faviconUrl,
    heroImageUrl: theme.heroImageUrl,
  };
}

export function themeToCssVariables(theme: ThemeConfig): Record<string, string> {
  return {
    "--tenant-primary": theme.primaryColor,
    "--tenant-secondary": theme.secondaryColor,
    "--tenant-accent": theme.accentColor,
    "--tenant-background": theme.backgroundColor,
    "--tenant-text": theme.textColor,
    "--tenant-font": theme.fontFamily,
    "--tenant-heading-font": theme.headingFont,
    "--tenant-radius": theme.borderRadius,
  };
}

export function themeStyleObject(
  theme: ThemeConfig
): React.CSSProperties {
  const vars = themeToCssVariables(theme);
  return vars as React.CSSProperties;
}
