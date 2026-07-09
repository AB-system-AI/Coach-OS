import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { routing, type Locale } from "./routing";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

  let locale: Locale = routing.defaultLocale;
  if (
    cookieLocale &&
    routing.locales.includes(cookieLocale as Locale)
  ) {
    locale = cookieLocale as Locale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
