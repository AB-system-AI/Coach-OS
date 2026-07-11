/**
 * Read environment variables at request/runtime.
 *
 * Next.js/webpack can inline `process.env.DATABASE_URL` at build time when the
 * variable is unset during `next build`. Bracket access keeps runtime values
 * from Vercel / the host process (e.g. after deploy env injection).
 */
export function readRuntimeEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function hasRuntimeEnv(name: string): boolean {
  return readRuntimeEnv(name) !== undefined;
}

export function hasAllRuntimeEnv(...names: string[]): boolean {
  return names.every((name) => hasRuntimeEnv(name));
}
