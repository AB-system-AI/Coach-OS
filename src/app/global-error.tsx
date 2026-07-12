"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { sanitizeErrorMessageForClient } from "@/lib/deployment/sanitize-error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { title, description } = sanitizeErrorMessageForClient(error);

  useEffect(() => {
    console.error("[CoachOS] Critical global error:", error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
            padding: "24px",
          }}
        >
          <div style={{ maxWidth: "400px", textAlign: "center" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "12px" }}>
              {title}
            </h1>
            <p style={{ color: "#666", marginBottom: "24px" }}>{description}</p>
            {error.digest && (
              <p style={{ fontSize: "12px", color: "#999", fontFamily: "monospace", marginBottom: "16px" }}>
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                padding: "8px 24px",
                background: "#000",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                marginRight: "8px",
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              style={{
                padding: "8px 24px",
                background: "transparent",
                color: "#000",
                border: "1px solid #ccc",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
