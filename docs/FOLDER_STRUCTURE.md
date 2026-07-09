# CoachOS Folder Structure

```
coachos/
├── docs/                              # Documentation
│   ├── ROADMAP.md
│   ├── ARCHITECTURE.md
│   ├── FOLDER_STRUCTURE.md
│   └── modules/                       # Per-module docs
│
├── prisma/
│   ├── schema.prisma                  # Database schema
│   ├── seed.ts                        # Seed data
│   └── migrations/                    # Migration history
│
├── public/
│   ├── icons/                         # PWA icons
│   ├── images/                        # Static images
│   └── manifest.json                  # PWA manifest
│
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── (platform)/                # CoachOS marketing site
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx               # Landing page
│   │   │   ├── pricing/
│   │   │   └── features/
│   │   │
│   │   ├── (auth)/                    # Auth pages
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   │
│   │   ├── (admin)/                   # Super Admin
│   │   │   ├── admin/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx           # Admin overview
│   │   │   │   ├── coaches/
│   │   │   │   ├── subscriptions/
│   │   │   │   ├── analytics/
│   │   │   │   ├── domains/
│   │   │   │   ├── logs/
│   │   │   │   └── support/
│   │   │
│   │   ├── (dashboard)/               # Coach Dashboard
│   │   │   ├── dashboard/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx           # Coach overview
│   │   │   │   ├── programs/
│   │   │   │   ├── meals/
│   │   │   │   ├── clients/
│   │   │   │   ├── recovery/
│   │   │   │   ├── bookings/
│   │   │   │   ├── calendar/
│   │   │   │   ├── videos/
│   │   │   │   ├── blog/
│   │   │   │   ├── media/
│   │   │   │   ├── payments/
│   │   │   │   ├── coupons/
│   │   │   │   ├── reports/
│   │   │   │   ├── website/
│   │   │   │   └── settings/
│   │   │
│   │   ├── (portal)/                  # Client Portal
│   │   │   ├── portal/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── program/
│   │   │   │   ├── meals/
│   │   │   │   ├── progress/
│   │   │   │   ├── recovery/
│   │   │   │   ├── chat/
│   │   │   │   └── invoices/
│   │   │
│   │   ├── [tenant]/                  # Public coach websites
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── about/
│   │   │   ├── programs/
│   │   │   ├── recovery/
│   │   │   ├── blog/
│   │   │   ├── pricing/
│   │   │   ├── contact/
│   │   │   └── book/
│   │   │
│   │   ├── api/                       # API routes
│   │   │   ├── auth/[...all]/
│   │   │   ├── webhooks/
│   │   │   │   ├── stripe/
│   │   │   │   └── paymob/
│   │   │   ├── uploadthing/
│   │   │   └── trpc/                  # Optional tRPC
│   │   │
│   │   ├── globals.css
│   │   └── layout.tsx                 # Root layout
│   │
│   ├── components/                    # Shared UI components
│   │   ├── ui/                        # shadcn/ui primitives
│   │   ├── layout/                    # Layout components
│   │   ├── forms/                     # Form components
│   │   ├── data-table/                # Data table
│   │   ├── charts/                    # Chart wrappers
│   │   └── providers/                 # Context providers
│   │
│   ├── features/                      # Feature modules
│   │   ├── auth/
│   │   ├── tenancy/
│   │   ├── theme/
│   │   ├── admin/
│   │   ├── coach-dashboard/
│   │   ├── client-portal/
│   │   ├── website/
│   │   ├── cms/
│   │   ├── programs/
│   │   ├── workouts/
│   │   ├── meals/
│   │   ├── recovery/
│   │   ├── bookings/
│   │   ├── calendar/
│   │   ├── payments/
│   │   ├── invoices/
│   │   ├── coupons/
│   │   ├── subscriptions/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   ├── email/
│   │   ├── chat/
│   │   ├── media/
│   │   ├── blog/
│   │   ├── reviews/
│   │   ├── progress/
│   │   ├── seo/
│   │   └── ai-assistant/
│   │
│   ├── lib/                           # Infrastructure
│   │   ├── auth/                      # Better Auth config
│   │   ├── db/                        # Prisma client + extensions
│   │   ├── email/                     # Resend integration
│   │   ├── payments/                  # Stripe + Paymob
│   │   ├── upload/                    # UploadThing + Cloudinary
│   │   ├── pusher/                    # Real-time
│   │   ├── rate-limit/                # Rate limiting
│   │   └── utils/                     # Shared utilities
│   │
│   ├── i18n/                          # Internationalization
│   │   ├── request.ts
│   │   ├── routing.ts
│   │   └── messages/
│   │       ├── en.json
│   │       └── ar.json
│   │
│   ├── middleware.ts                  # Tenant + auth middleware
│   │
│   └── types/                         # Global TypeScript types
│       ├── index.ts
│       └── global.d.ts
│
├── .env.example
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Layer Responsibilities

| Folder | Layer | Purpose |
|--------|-------|---------|
| `app/` | Presentation | Routes, pages, layouts |
| `components/` | Presentation | Reusable UI components |
| `features/` | Application + Domain | Business logic per feature |
| `lib/` | Infrastructure | External service integrations |
| `prisma/` | Infrastructure | Database schema & migrations |
| `i18n/` | Infrastructure | Localization |
| `types/` | Domain | Shared type definitions |
