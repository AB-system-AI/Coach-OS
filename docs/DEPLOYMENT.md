# CoachOS Deployment Guide

This guide covers local setup, database provisioning, and deploying CoachOS to Vercel.

## Prerequisites

- **Node.js 20+** (see `engines` in `package.json`)
- **PostgreSQL** database (local Docker, Neon, Supabase, Railway, etc.)
- **Vercel** account (for production hosting)

## Local setup

1. **Clone and install**

   ```bash
   git clone https://github.com/AB-system-AI/Coach-OS.git
   cd Coach-OS
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Fill in the required variables (see below).

3. **Generate Prisma client and apply schema**

   ```bash
   npx prisma generate
   npx prisma db push
   # Or use migrations:
   # npx prisma migrate dev
   ```

4. **Seed (optional)**

   ```bash
   npm run db:seed
   ```

5. **Run development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Required environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string. Required at **runtime** (dev and production). |
| `BETTER_AUTH_SECRET` | Session signing secret, minimum 32 characters. Generate with `openssl rand -base64 32`. |
| `BETTER_AUTH_URL` | Public URL of the app for Better Auth callbacks (e.g. `https://your-app.vercel.app`). |
| `NEXT_PUBLIC_APP_URL` | Same public URL, exposed to the browser for the auth client. |

Optional integrations (Stripe, Paymob, UploadThing, etc.) are documented in `.env.example`.

### Development vs build vs production

- **Local development** (`npm run dev`): Missing required variables throw clear errors in the terminal.
- **Production build** (`npm run build`): Build uses safe placeholders so compilation succeeds without a live database. No database queries run during static analysis.
- **Production runtime** (Vercel): All required variables must be set in the Vercel dashboard.

## Database setup

### Local PostgreSQL (Docker example)

```bash
docker run --name coachos-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=coachos -p 5432:5432 -d postgres:16
```

Set in `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/coachos?schema=public
```

### Managed PostgreSQL (recommended for production)

1. Create a database on [Neon](https://neon.tech), [Supabase](https://supabase.com), or similar.
2. Copy the connection string into `DATABASE_URL`.
3. Use the **pooled** connection string on serverless platforms when available.

## Vercel deployment

### 1. Import project

1. Push your repository to GitHub.
2. In [Vercel](https://vercel.com), click **Add New → Project** and import the repo.
3. Framework preset: **Next.js** (auto-detected).

### 2. Build settings

Vercel uses `vercel.json` and `package.json`:

| Setting | Value |
|---------|-------|
| Install command | `npm install` |
| Build command | `npm run build` (runs `prisma generate && next build`) |
| Node version | 20.x (from `engines`) |

`postinstall` also runs `prisma generate` after dependencies install.

### 3. Environment variables

In **Project → Settings → Environment Variables**, add for **Production**, **Preview**, and **Development**:

- `DATABASE_URL` (**required**)
- `BETTER_AUTH_SECRET` (**required**, ≥32 characters)
- `BETTER_AUTH_URL` — e.g. `https://your-project.vercel.app` (falls back to `VERCEL_URL` if unset)
- `NEXT_PUBLIC_APP_URL` — same as `BETTER_AUTH_URL` (recommended so the browser auth client matches)

Add optional keys from `.env.example` as needed.

### 4. Deploy

Click **Deploy**. The first deploy runs migrations only if you configure a build step for them (see below).

## Database migrations

### Option A: `prisma db push` (prototyping / small teams)

From your machine with production `DATABASE_URL`:

```bash
npx prisma db push
```

### Option B: Prisma Migrate (recommended for production)

1. Create migrations locally:

   ```bash
   npx prisma migrate dev --name init
   ```

2. Apply to production:

   ```bash
   DATABASE_URL="your-production-url" npx prisma migrate deploy
   ```

   Run this after each deploy that includes schema changes, or add a Vercel **Deploy Hook** / CI step.

### Option C: Vercel build hook (advanced)

Add a custom script or use Vercel's `buildCommand` extension only if you need `migrate deploy` on every deploy. For most setups, run migrations manually or via CI before/after deploy.

## Post-deploy checklist

- [ ] All four required env vars set on Vercel
- [ ] Database schema applied (`migrate deploy` or `db push`)
- [ ] `BETTER_AUTH_URL` matches your live domain (including custom domain)
- [ ] Stripe/Paymob webhooks point to `https://your-domain.com/api/webhooks/...`
- [ ] Smoke test: register, login, dashboard load

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `DATABASE_URL is missing` in dev | Copy `.env.example` → `.env` and set the URL |
| Better Auth callback errors | Ensure `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` match the live URL |
| `POST /api/auth/sign-in/email` returns 403 `INVALID_ORIGIN` | Origin must match trusted origins. www/non-www are auto-aliased; for extra domains set `BETTER_AUTH_TRUSTED_ORIGINS` |
| Prisma client not found on Vercel | `postinstall` and `build` both run `prisma generate` |
| Build fails on Node version | Use Node 20+ in Vercel project settings |

## Useful commands

```bash
npx prisma validate    # Validate schema
npx prisma generate    # Generate client
npx prisma studio      # Database GUI
npm run lint           # ESLint
npm run build          # Production build
```
