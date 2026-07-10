import type { Page } from "@playwright/test";

const HYDRATION_PATTERNS = [
  /hydration/i,
  /did not match/i,
  /Text content does not match/i,
  /Minified React error #418/,
  /Minified React error #423/,
  /Minified React error #425/,
];

export function attachHydrationGuard(page: Page) {
  const errors: string[] = [];

  page.on("pageerror", (error) => {
    if (HYDRATION_PATTERNS.some((pattern) => pattern.test(error.message))) {
      errors.push(error.message);
    }
  });

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (HYDRATION_PATTERNS.some((pattern) => pattern.test(text))) {
      errors.push(text);
    }
  });

  return {
    assertNoHydrationErrors() {
      if (errors.length > 0) {
        throw new Error(
          `Hydration/runtime errors detected:\n${errors.join("\n")}`
        );
      }
    },
    getErrors: () => [...errors],
  };
}
