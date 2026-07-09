# Enterprise Platform Extension

## Multi-Product Architecture

One shared core powers multiple product lines:

| Product Line | Target |
|---|---|
| **CoachOS** | Coaches & personal trainers |
| **GymOS** | Gyms & fitness clubs |
| **AcademyOS** | Academies & schools |
| **PhysioOS** | Physiotherapy & rehab |
| **SportsOS** | Sports teams & clubs |

Each tenant has a `productLine` and toggleable modules via `TenantModuleConfig`.

## 35 Enterprise Priorities

All priorities are implemented as Prisma models, module registry entries, dashboard pages, and APIs:

1. **Mobile App Ready** — `/api/v1/mobile/*` (Flutter, React Native, push, deep links, offline sync)
2. **Financial Module** — Wallet, expenses, transactions, refunds
3. **Staff Management** — Roles with JSON permissions
4. **Attendance** — QR, barcode, NFC, manual
5. **Smart Calendar** — Events + Google/Outlook sync connections
6. **Forms Builder** — Dynamic forms + submissions
7. **Automation Builder** — Zapier-like workflows
8. **AI Voice Notes** — Record, transcribe, save
9. **Media Library Pro** — Folders + media (extended)
10. **Audit Center** — Audit logs with rollback fields
11. **Backup Center** — Backup records
12. **Theme Builder** — Theme templates
13. **Landing Page Builder** — Landing pages (marketing module)
14. **Email Builder** — Email templates + campaigns
15. **Invoice Designer** — Invoice templates
16. **Public API** — `/developers`, OpenAPI at `/api/v1/openapi`
17. **Integrations** — Tenant integrations (Stripe, Paymob, WhatsApp, etc.)
18. **Gamification** — XP, badges, achievements, leaderboards
19. **Client App** — `/api/v1/mobile/client/dashboard`
20. **Coach Marketplace** — Featured, sponsored, instant booking, tiers
21. **Multi Brand** — Brand model
22. **Franchise** — Franchise locations + parent tenant tree
23. **POS** — POS transactions
24. **Inventory** — Inventory items
25. **Staff Payroll** — Payroll records
26. **Membership Cards** — QR/barcode/NFC cards
27. **Referral System** — ReferralCode (loyalty module)
28. **Gift Cards** — GiftCard model
29. **Coupons** — Coupon model (existing)
30. **Affiliate System** — Affiliate referrals
31. **Notification Center** — Channel config per tenant
32. **Help Center** — Knowledge articles
33. **System Health** — `/admin/system-health`
34. **Enterprise Dashboard** — `/dashboard/enterprise`
35. **Security Center** — User devices, login history, API logs

## Dashboard Routes

Enterprise module pages: `/dashboard/enterprise/{slug}`

Examples:
- `/dashboard/enterprise/finance`
- `/dashboard/enterprise/staff`
- `/dashboard/enterprise/mobile-api`

## Developer Portal

- **Portal:** `/developers`
- **OpenAPI:** `/api/v1/openapi`
- **API Root:** `/api/v1`

## Mobile API

| Endpoint | Description |
|---|---|
| `GET /api/v1/mobile/config` | App config + enabled modules |
| `GET/POST /api/v1/mobile/sync` | Offline sync |
| `POST /api/v1/mobile/push/register` | Push registration |
| `GET /api/v1/mobile/deep-links/{code}` | Deep link resolver |
| `GET /api/v1/mobile/client/dashboard` | Client app data |
| `GET /api/v1/mobile/flutter` | Flutter metadata |
| `GET /api/v1/mobile/react-native` | React Native metadata |
