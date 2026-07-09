/**
 * Security headers applied to all non-API responses.
 * CSP is intentionally kept practical for a Next.js app with external services.
 */

export interface SecurityHeadersOptions {
  nonce?: string;
}

export function buildSecurityHeaders(
  opts: SecurityHeadersOptions = {}
): Record<string, string> {
  const { nonce } = opts;

  const nonceDirective = nonce ? ` 'nonce-${nonce}'` : "";

  const csp = [
    `default-src 'self'`,
    `script-src 'self'${nonceDirective} 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://accounts.google.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob: https: http:`,
    `connect-src 'self' https://api.resend.com https://api.stripe.com https://accounts.google.com wss: ws:`,
    `frame-src https://js.stripe.com https://accounts.google.com https://hooks.stripe.com`,
    `media-src 'self' blob: https:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  return {
    "Content-Security-Policy": csp,
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    "X-DNS-Prefetch-Control": "on",
    "Strict-Transport-Security":
      "max-age=63072000; includeSubDomains; preload",
  };
}

export const SECURITY_HEADERS = buildSecurityHeaders();
