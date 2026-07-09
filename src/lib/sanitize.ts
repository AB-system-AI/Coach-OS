import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes an HTML string to prevent XSS, preserving safe markup.
 * Safe for server-side and client-side use via isomorphic-dompurify.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script", "object", "embed", "form", "input", "meta", "link"],
    FORBID_ATTR: [
      "onerror",
      "onload",
      "onclick",
      "onmouseover",
      "onmouseout",
      "onfocus",
      "onblur",
      "onkeydown",
      "onkeyup",
      "onkeypress",
      "onsubmit",
      "onreset",
      "onchange",
      "oninput",
    ],
  });
}

/**
 * Strips all HTML tags and returns plain text only.
 * Use when you want to ensure no markup is preserved.
 */
export function stripDangerousHtml(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/**
 * Sanitizes a plain text value for safe insertion into the DOM (no HTML allowed).
 */
export function sanitizeText(input: string): string {
  return stripDangerousHtml(input);
}
