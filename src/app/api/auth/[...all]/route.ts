import { getAuth } from "@/lib/auth";
import { getDeploymentEnvIssues } from "@/lib/env";
import { ServiceUnavailableError } from "@/lib/deployment/errors";
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type AuthHandlers = ReturnType<typeof toNextJsHandler>;

let handlers: AuthHandlers | undefined;

function getHandlers(): AuthHandlers {
  if (!handlers) {
    handlers = toNextJsHandler(getAuth());
  }
  return handlers;
}

function authConfigErrorResponse(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Authentication is misconfigured";
  const envIssues = getDeploymentEnvIssues();

  console.error("[CoachOS] Auth handler failed to initialize:", message);

  return NextResponse.json(
    {
      error: "AUTH_MISCONFIGURED",
      message:
        envIssues.length > 0
          ? `Authentication is not configured. Missing or invalid: ${envIssues
              .map((issue) => issue.variable)
              .join(", ")}.`
          : "Authentication is not configured. Check deployment environment variables.",
      issues: envIssues,
      detail: message,
    },
    { status: 500 }
  );
}

async function handle(request: Request) {
  try {
    const { GET, POST } = getHandlers();
    if (request.method === "GET") return GET(request);
    if (request.method === "POST") return POST(request);
    return NextResponse.json({ error: "METHOD_NOT_ALLOWED" }, { status: 405 });
  } catch (error) {
    if (error instanceof ServiceUnavailableError) {
      console.error("[CoachOS] Auth service unavailable:", error.message);
      return NextResponse.json(
        {
          error: "SERVICE_UNAVAILABLE",
          service: error.service,
          message:
            "Authentication is temporarily unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }
    return authConfigErrorResponse(error);
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
