# Phases 4–12: Core Fitness Platform

Implementation of coach operations, recovery, payments, website, marketing, AI, marketplace, admin, and mobile APIs.

## Phase 4 — Core Fitness Platform

| Feature | Route | Service |
|---------|-------|---------|
| Client Management | `/dashboard/clients` | `src/features/clients/` |
| Workout Builder | `/dashboard/programs` | `src/features/programs/` |
| Exercise Library | `/dashboard/videos` | `src/features/exercises/` |
| Meal Plan Builder | `/dashboard/meals` | `src/features/meals/` |
| Client Progress | `/dashboard/progress` | `src/features/progress/` |
| Weekly Check-in | `WeeklyCheckIn` model + progress page | `submitWeeklyCheckIn` |
| Client Dashboard | `/portal` | `src/features/client-portal/` |

## Phase 5 — Recovery & Booking

- `/dashboard/recovery` — Recovery services
- `/dashboard/bookings` — Booking management
- `/dashboard/calendar` — Calendar + events

## Phase 6 — Payments & Billing

- `/dashboard/payments` — Stripe, Paymob, Apple Pay ready
- `/dashboard/coupons` — Discount codes
- Webhooks: `/api/webhooks/stripe`, `/api/webhooks/paymob`

## Phase 7 — Website & Theme

- `/dashboard/website` — CMS pages builder
- `/dashboard/blog` — Blog management
- `/dashboard/settings/branding` — Theme (existing)

## Phase 8–12

- Marketing, AI, Marketplace — existing + enhanced
- Admin: `/admin/coaches`, `/admin/subscriptions`, `/admin/support`, `/admin/logs`
- Mobile API: `/api/v1/programs`, `/exercises`, `/bookings`, `/payments`, `/progress`, `/ai`

## Cross-Cutting

- `src/lib/audit.ts` — Audit log writer
- `src/lib/activity.ts` — Client activity timeline
- `src/lib/permissions.ts` — Staff RBAC
- Course certificates — `issueCertificate()` in courses service
