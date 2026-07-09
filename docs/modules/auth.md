# Authentication Module

## Overview

CoachOS uses [Better Auth](https://www.better-auth.com/) for authentication with email/password and optional Google OAuth.

## Roles

| Role | Description |
|------|-------------|
| `SUPER_ADMIN` | Platform administrator |
| `COACH` | Tenant owner with full access |
| `ASSISTANT_COACH` | Limited coach permissions |
| `CLIENT` | End user with portal access |

## Key Files

| File | Purpose |
|------|---------|
| `lib/auth/index.ts` | Better Auth server configuration |
| `lib/auth/client.ts` | Client-side auth hooks |
| `lib/auth/session.ts` | Server session helpers |
| `app/api/auth/[...all]/route.ts` | Auth API handler |
| `features/auth/components/` | Login & register forms |

## Server Session Helpers

```typescript
// Get current session (nullable)
const session = await getSession();

// Require authenticated user (throws if not)
const session = await requireAuth();

// Require specific role
const { session, user } = await requireRole("COACH", "SUPER_ADMIN");

// Require tenant access
const { membership } = await requireTenantAccess(tenantId);
```

## Client Usage

```typescript
import { signIn, signUp, signOut, useSession } from "@/lib/auth/client";

// Sign in
await signIn.email({ email, password });

// Sign up
await signUp.email({ email, password, name });

// Sign out
await signOut();

// React hook
const { data: session } = useSession();
```

## Registration Flow

1. User submits registration form
2. Better Auth creates user account
3. `createTenant()` provisions coach workspace
4. User role updated to `COACH`
5. Redirect to `/dashboard`

## Protected Routes

Middleware protects these route prefixes:

- `/admin/*` — Requires authentication (role checked in layout)
- `/dashboard/*` — Requires authentication + tenant membership
- `/portal/*` — Requires authentication + client membership

## Environment Variables

```env
BETTER_AUTH_SECRET=your-secret-min-32-chars
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=optional
GOOGLE_CLIENT_SECRET=optional
```
