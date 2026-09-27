# Bella Pizza 🍕

A full-stack pizza delivery platform — built for the **Oasis Infobyte Level 3
Web Development & Designing internship**. Retro Italian branding, a custom
pizza builder, real Razorpay test-mode payments, live order tracking, and
an admin panel for inventory and order management.

---

## Table of contents

1. [Project overview](#project-overview)
2. [Features](#features)
3. [Tech stack](#tech-stack)
4. [Architecture](#architecture)
5. [Application workflow](#application-workflow)
6. [Database structure](#database-structure)
7. [API overview](#api-overview)
8. [Authentication architecture](#authentication-architecture)
9. [Payment architecture](#payment-architecture)
10. [Inventory logic](#inventory-logic)
11. [Real-time order tracking](#real-time-order-tracking)
12. [Scheduled low-stock notifications](#scheduled-low-stock-notifications)
13. [Screenshots](#screenshots)
14. [Local setup](#local-setup)
15. [Environment variables](#environment-variables)
16. [Testing](#testing)
17. [Deployment](#deployment)
18. [Security considerations](#security-considerations)
19. [Future improvements](#future-improvements)
20. [Internship context & requirements checklist](#internship-context--requirements-checklist)

---

## Project overview

Bella Pizza is a two-sided platform: a customer-facing ordering site (browse
the menu, build a custom pizza, pay, and track delivery) and a separate
admin panel (inventory, order management, low-stock alerting). It's built
as a production-style app, not a tutorial project — real payment
verification, transactional inventory decrement, rate limiting, and a
proper auth/authorization boundary between users and admins.

## Features

### User features
- Register, verify email, log in, reset a forgotten password
- Browse the fixed menu or build a custom pizza (base → sauce → cheese →
  vegetables, live price preview)
- Checkout with Razorpay (test mode)
- View order history and track an order's status live (polling, no refresh needed)

### Admin features
- Separate login — **no public registration path to an admin account**
- Dashboard (order/revenue/low-stock summary)
- Inventory management (view stock, edit quantity/threshold inline)
- Order management (view all orders, advance status through
  Order Received → In Kitchen → Sent to Delivery)
- Configurable low-stock alert recipient and default threshold

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript, React Router |
| Backend | Node.js, Express 5, TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT (httpOnly cookies) + bcrypt |
| Payments | Razorpay (test mode) |
| Email | Nodemailer (SMTP) |
| Scheduling | node-cron |
| Validation | Zod |

## Architecture

```
+------------------+        HTTPS/JSON        +-------------------+
|  React Frontend   | ------------------------>|  Express Backend   |
|  (Vite, TS)        |<------------------------ |  (Node, TS)          |
+------------------+     httpOnly cookie auth  +---------+---------+
                                                           |
                                      +--------------------+--------------------+
                                      v                    v                    v
                               +------------+       +--------------+     +-------------+
                               |  MongoDB   |       |   Razorpay    |     |  SMTP        |
                               |  (Atlas)   |       |  (test mode)  |     |  (Nodemailer)|
                               +------------+       +--------------+     +-------------+
                                      ^
                                      |
                               +------------+
                               | node-cron   |  (hourly low-stock check)
                               +------------+
```

**Backend layout** (`backend/src/`):
```
config/      env, db, razorpay client, email transporter
models/      Mongoose schemas
controllers/ thin HTTP layer -- parse request, call service, shape response
services/    business logic (the actual "how")
routes/      route wiring + middleware composition
middleware/  auth guards, validation, rate limiting, error handling
validation/  Zod schemas
utils/       pure helper functions (pricing, cooldown logic, tokens, etc.)
jobs/        node-cron scheduled tasks
seed/        dev seed script
```

**Frontend layout** (`frontend/src/`):
```
components/  common/ (shared UI), user/ (builder, order cards, etc.), admin/
pages/       one file per route, user/ and admin/ subfolders
layouts/     MainLayout (user), AdminLayout (separate nav/auth boundary)
lib/         API client, auth contexts, order draft context
hooks/       reusable hooks (polling, health check)
styles/      design tokens + global styles
```

## Application workflow

```
Browse menu / Build pizza
        |
        v
   Add to order draft (client-side, no backend order yet)
        |
        v
   Checkout -> POST /api/orders/checkout
        |        (server prices the draft, opens a Razorpay order)
        v
   Razorpay Checkout modal (test mode)
        |
        v
   POST /api/orders/verify
        |  1. Verify HMAC signature
        |  2. Check for duplicate payment (idempotent)
        |  3. Re-price items server-side, cross-check against
        |     the amount actually authorized on Razorpay's order
        |  4. Atomically decrement inventory + create the Order
        |     (single MongoDB transaction -- all or nothing)
        v
   Order created (status: "Order Received", paymentStatus: "Paid")
        |
        v
   Admin advances status --> User's tracker polls and picks it up (~6s)
```

## Database structure

- **User** -- name, email (unique), hashed password, isVerified
- **Admin** -- separate collection; no schema/route ever lets a User become an Admin
- **Pizza** -- fixed menu items (name, description, price, category, toppings)
- **InventoryItem** -- doubles as both the stock ledger *and* the buildable
  ingredient catalog for the custom builder (category, quantity, threshold,
  unit, addOnPrice, isActive)
- **Order** -- embeds a full snapshot of each item's configuration (base,
  sauce, cheese, vegetables -- name + price at order time, not just a
  reference), plus a `statusHistory` array with a timestamp per stage
- **VerificationToken** / **PasswordResetToken** -- hashed, TTL-indexed
  (MongoDB auto-deletes expired ones)
- **Settings** -- singleton document for admin-configurable notify email / default threshold
- **LowStockNotification** -- tracks `lastNotifiedAt` per ingredient, so the
  cron job doesn't re-alert every cycle

## API overview

All routes are prefixed `/api`. Full request/response shapes are in the
source (`backend/src/routes/`, `backend/src/validation/`) -- this is the map:

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/health` | none | Never blocks on DB state |
| POST | `/auth/register` \| `/login` \| `/logout` | none | Rate-limited |
| GET | `/auth/me` | user | Session check |
| POST | `/auth/verify-email` \| `/resend-verification` \| `/forgot-password` \| `/reset-password` | none | Rate-limited (except verify/reset itself) |
| GET | `/pizzas` \| `/pizzas/:id` | none | Menu catalog |
| GET | `/ingredients` | none | Buildable ingredients, grouped by category |
| POST | `/orders/checkout` | user | Step 1 of payment -- no order created yet |
| POST | `/orders/verify` | user | Step 2 -- verifies payment, creates the order |
| GET | `/orders` \| `/orders/:id` | user | Own orders only (404, not 403, for others') |
| POST | `/admin/login` \| `/logout` | none | Rate-limited |
| GET | `/admin/me` | admin | |
| GET | `/admin/inventory` | admin | |
| PATCH | `/admin/inventory/:id` | admin | |
| GET | `/admin/orders` \| `/admin/orders/:id` | admin | |
| PATCH | `/admin/orders/:id/status` | admin | Forward-only transitions enforced |
| GET/PATCH | `/admin/settings` | admin | Notify email, default threshold |

## Authentication architecture

- Passwords hashed with bcrypt (10 rounds)
- JWTs are role-scoped (`user` or `admin`) and stored in **httpOnly
  cookies** (`token` / `adminToken` -- separate names, separate middleware,
  no cross-use possible)
- `requireUser` / `requireAdmin` middleware each explicitly reject the
  other role's token, not just "any valid token"
- Admin accounts are provisioned **only** via the seed script -- there is no
  `/admin/register` route, and no code path lets a User become an Admin
- Email verification and password reset use single-use, hashed, TTL-expiring tokens

## Payment architecture

Order creation is **payment-gated** -- there is no endpoint that creates an
unpaid order. See [Application workflow](#application-workflow) above for
the full checkout -> verify sequence. Three independent checks must all
pass before an Order document is ever written:
1. HMAC-SHA256 signature verification (proves the response came from Razorpay)
2. Duplicate-payment check (idempotent on `razorpay_payment_id`, backed by
   a DB-level unique index, not just application logic)
3. Amount cross-check (re-fetches the actual Razorpay order and compares
   its authorized amount to a fresh server-side re-pricing of the items)

## Inventory logic

Only **custom-build** ingredients are tracked against inventory (fixed menu
pizzas aren't linked to a bill-of-materials in this schema). Stock
decrement happens atomically inside the same MongoDB transaction as order
creation -- a conditional `$inc` (`quantity: { $gte: needed }`) per
ingredient, so two simultaneous orders competing for the last unit can't
both succeed, and a failure partway through never leaves some ingredients
decremented and others not.

## Real-time order tracking

Polling, not WebSockets (per the spec: "polling... unless there is a
strong reason to use WebSockets" -- there wasn't one here). The user's order
detail page polls every 6s, the admin order list every 8s, both stopping
automatically once an order reaches its final state. Each status
transition is timestamped (`statusHistory`), so the tracker shows real
per-stage times.

## Scheduled low-stock notifications

An hourly (configurable) `node-cron` job checks every active ingredient
against its threshold. To avoid spamming the same alert every cycle, each
item's `lastNotifiedAt` is tracked with a configurable cooldown (default
24h) -- and cleared entirely once the item recovers above threshold, so a
*future* dip alerts fresh rather than inheriting a stale cooldown.

## Screenshots

_Add screenshots here before final submission -- e.g. homepage, builder,
checkout, order tracker, and the admin dashboard/inventory views._

## Local setup

```bash
# Backend
cd backend
cp .env.example .env      # fill in MONGODB_URI, JWT_SECRET at minimum
npm install
npm run seed               # pizzas, inventory, one admin account
npm run dev                 # http://localhost:5000

# Frontend (separate terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:5173
```

Requires a reachable MongoDB (local or Atlas). **MongoDB transactions are
used for inventory decrement, which requires a replica set** -- Atlas
provides this automatically; a plain local `mongod` does not (see
`backend/.env.example` for the workaround).

## Environment variables

See `backend/.env.example` and `frontend/.env.example` -- every variable is
documented inline there, including which ones are safe to leave blank in
dev (Razorpay/SMTP degrade gracefully rather than crashing) and which are
required (`MONGODB_URI`, `JWT_SECRET`).

## Testing

```bash
cd backend && npm test    # 67 tests, no database required
cd frontend && npm run lint && npm run build
```

Backend tests are deliberately structured to run **without a live
database** -- pure business logic (pricing, stock-status thresholds,
required-quantity aggregation, notification cooldown, status transitions)
is extracted into standalone functions and unit-tested directly; auth
guards, input validation, rate limiting, and centralized error handling
are tested at the HTTP layer via requests that fail *before* reaching
Mongo. Flows that genuinely need a database (registration -> login -> order
-> payment end-to-end) are documented for manual verification against a
real MongoDB -- see `MANUAL_TESTING.md` for the exact steps.

## Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) -- Vercel (frontend), Render
(backend), MongoDB Atlas, with a full post-deploy verification checklist.

## Security considerations

- Rate limiting on all auth endpoints (10 attempts / 15 min) and a general
  API-wide limit (300 / 15 min)
- Centralized error handling -- Mongoose `CastError`/`ValidationError` are
  mapped to clean `400`s rather than leaking a raw `500`; stack traces are
  only included in non-production responses
- CORS locked to a single configured origin, not a wildcard
- httpOnly cookies for session tokens (not accessible to JS, so immune to
  token-stealing XSS) + `SameSite=Lax` (blocks cross-site POST from
  attaching cookies, covering most CSRF scenarios for this JSON API
  without needing a separate CSRF token scheme)
- All input validated with Zod before touching the database -- including
  effectively closing off NoSQL-injection-via-object-instead-of-string,
  since Zod rejects non-string values for string-typed fields
- Passwords never returned from the API (`select: false` on the schema
  field); dev-mode verification/reset tokens are explicitly stripped from
  responses when `NODE_ENV=production`
- No secrets logged anywhere (audited)
- Order/inventory writes are atomic (MongoDB transactions), preventing
  race-condition overselling

## Future improvements

- WebSocket-based order updates (would reduce polling overhead at scale)
- Refresh tokens / shorter-lived access tokens
- Multi-item cart persisted server-side (currently client-only until checkout)
- Automated end-to-end tests against a real database (CI-provisioned MongoDB)
- Image uploads for pizzas/ingredients instead of illustrated icons

## Internship context & requirements checklist

Built phase-by-phase per the Oasis Infobyte Level 3 brief. Status below --
**"Tested" means verified by an automated test or a documented live check;
nothing here is marked tested that wasn't actually run.**

| Requirement | Implemented | Tested |
|---|---|---|
| React frontend | Yes | Yes (build+lint clean) |
| Node/Express backend | Yes | Yes (67 automated tests) |
| MongoDB/Mongoose | Yes | Partial -- schema-level tests pass; live CRUD needs your DB |
| JWT auth | Yes | Yes (expired/forged/wrong-role token tests) |
| Razorpay test-mode payment | Yes | Partial -- signature/amount-check logic tested; live payment needs your Razorpay keys |
| node-cron scheduled jobs | Yes | Partial -- cooldown logic tested; live email needs your SMTP |
| Polling-based real-time updates | Yes | Yes (live-tested in dev) |
| Email/SMTP | Yes | Partial -- graceful-degradation tested; real delivery needs your SMTP creds |
| REST API | Yes | Yes |
| User registration/login/roles | Yes | Yes |
| Admin separate auth (no public registration) | Yes | Yes |
| Custom pizza builder | Yes | Yes |
| Inventory management + atomic decrement | Yes | Yes (unit + logic tests; live concurrency test needs your DB) |
| Admin order management | Yes | Yes |
| Low-stock notifications | Yes | Partial -- logic tested; live cron cycle needs time + your SMTP |

**"Partial" items** all share one root cause, documented honestly
throughout development: the development sandbox this was built in has no
network access to MongoDB Atlas, Razorpay's API, or any SMTP relay. Every
piece of *logic* that could be tested without those was -- see
`MANUAL_TESTING.md` for the specific steps to close each one out against
your live setup.
