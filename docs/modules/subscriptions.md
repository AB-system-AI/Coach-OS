# Subscription Plans Module

## Plans

| Plan | Price | Clients | Programs | Storage | Custom Domain | AI | API |
|------|-------|---------|----------|---------|---------------|-----|-----|
| Free | $0 | 5 | 1 | 1 GB | ✗ | ✗ | ✗ |
| Starter | $29 | 25 | 5 | 5 GB | ✗ | ✗ | ✗ |
| Professional | $79 | 100 | 25 | 25 GB | ✓ | ✓ | ✓ |
| Business | $149 | 500 | 100 | 100 GB | ✓ | ✓ | ✓ |
| Enterprise | $299 | ∞ | ∞ | 500 GB | ✓ | ✓ | ✓ |

## Usage

```typescript
import { assertLimit, assertFeature, getPlanSummary } from "@/features/subscriptions";

// Before creating a client
await assertLimit(tenantId, "clients");

// Before enabling AI
await assertFeature(tenantId, "ai");

// Dashboard usage display
const summary = await getPlanSummary(tenantId);
```

## Enforcement Points

- `createTenant` — assigns plan and limits
- `toggleMarketplaceVisibility` — checks `marketplace` feature
- `updateWhiteLabel` — checks `whiteLabel` feature
- `addCustomDomain` — checks `customDomain` feature
- `processAIRequest` — checks `ai` feature
- `trackMediaUpload` — checks storage limits

## Configuration

Plan limits are defined in `features/subscriptions/types/plan-limits.ts`. Values of `-1` mean unlimited.
