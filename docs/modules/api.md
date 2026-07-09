# REST API v1

## Overview

CoachOS exposes a versioned REST API for mobile apps (Flutter, React Native) and third-party integrations.

## Base URL

```
https://your-domain.com/api/v1
```

## Authentication

```
Authorization: Bearer cos_<api_key>
```

API keys are scoped: `READ`, `WRITE`, `FULL`.

## Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1` | No | API discovery document |
| GET | `/api/v1/marketplace/coaches` | No | List marketplace coaches |
| GET | `/api/v1/clients` | Yes | List tenant clients |
| POST | `/api/v1/clients` | Yes | Create client |
| GET | `/api/v1/reports?period=30d` | Yes | Tenant analytics report |

## Webhooks

Tenants on Business+ can register webhook endpoints. Events:

- `BOOKING_CREATED`, `BOOKING_CANCELLED`
- `PAYMENT_COMPLETED`, `PAYMENT_FAILED`
- `CLIENT_CREATED`, `CLIENT_UPDATED`
- `PROGRAM_ENROLLED`, `REVIEW_CREATED`

Signature header: `X-CoachOS-Signature` (HMAC-SHA256)

## Mobile Ready

All responses use consistent JSON:

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "message" }
```

Compatible with Flutter `http`/`dio` and React Native `fetch`.
