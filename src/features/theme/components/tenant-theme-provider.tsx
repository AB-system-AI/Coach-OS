import { themeFromDb, themeStyleObject } from "@/features/theme/types";
import type { TenantTheme } from "@prisma/client";

type ThemeProviderProps = {
  theme: TenantTheme | null;
  children: React.ReactNode;
};

export function TenantThemeProvider({ theme, children }: ThemeProviderProps) {
  const config = themeFromDb(theme);
  const style = themeStyleObject(config);

  return (
    <div style={style} className="tenant-theme min-h-full">
      {children}
    </div>
  );
}
