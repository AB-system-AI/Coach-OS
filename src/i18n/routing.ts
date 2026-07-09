import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  // App routes live outside app/[locale]/ — use cookie/header locale detection.
  localePrefix: "never",
});

export type Locale = (typeof routing.locales)[number];
