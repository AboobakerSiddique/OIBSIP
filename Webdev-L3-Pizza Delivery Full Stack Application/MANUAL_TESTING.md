# Setup & manual testing guide

Everything here needs to be run on a machine that can actually reach
MongoDB, Razorpay, and (optionally) an SMTP server — none of which this
project's development sandbox could reach. Every piece of logic that
*could* be tested without those was (67 automated backend tests, 0
lint/build errors on either side) — this document covers the rest.

---

## 1. One-time setup

### 1.1 MongoDB
Either:
- **Local**: `docker run -d -p 27017:27017 --name bella-mongo mongo:7`
- **Atlas** (required if you want to test payments, since transactions need
  a replica set — Atlas provides one automatically; a plain local `mongod`
  does not): create a free M0 cluster, add your IP (or `0.0.0.0/0` for
  quick testing) to Network Access, grab the connection string.

### 1.2 Razorpay
1. Sign up at [razorpay.com](https://razorpay.com), switch to **Test Mode**
   (toggle in the dashboard).
2. Settings → API Keys → Generate Test Keys. You'll get a `rzp_test_...`
   key ID and a secret.

### 1.3 (Optional) SMTP
Any of: a Gmail account with an
[App Password](https://myaccount.google.com/apppasswords), or a free dev
service like [Mailtrap](https://mailtrap.io) or
[Ethereal](https://ethereal.email) if you just want to see emails without
real delivery. **Not required** — registration/checkout work fine without
it; you'll just use the dev-mode token fallback instead of clicking an
email link.

### 1.4 Install & configure

```bash
cd backend
cp .env.example .env
# Fill in at minimum: MONGODB_URI, JWT_SECRET (openssl rand -hex 32)
# Fill in RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to test payments
# Fill in SMTP_* to test real email delivery (optional)
npm install
npm run seed        # creates pizzas, inventory, and one admin account
npm run dev          # http://localhost:5000
```

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev          # http://localhost:5173
```

The seed script prints the admin login it created
(`admin@bellapizza.test` / `ChangeMe123!` unless you set
`SEED_ADMIN_PASSWORD` first). **Change that password** if this will ever
be anything other than a local throwaway environment.

---

## 2. Smoke test (2 minutes)

1. `curl http://localhost:5000/api/health` → `"database": "connected"`
2. Open `http://localhost:5173` → homepage loads with real pizzas from the seed data
3. `/pizzas` → catalog renders, category filter works
4. `/build` → all four ingredient steps populate with real options and prices

If any of these fail, check the backend terminal for connection errors
before going further.

---

## 3. Auth flows

| Test | Steps | Expected |
|---|---|---|
| Register | `/register`, real email + 8+ char password | Redirects to `/verify-email`; if no SMTP configured, the token is pre-filled and auto-verifies |
| Duplicate registration | Register the same email again | `409` — "An account with this email already exists" |
| Invalid login | Wrong password | `401` — generic "Invalid email or password" (doesn't reveal which field was wrong) |
| Valid login | Correct credentials | Redirects to `/dashboard`, navbar shows your name |
| Forgot/reset password | `/forgot-password` → (email or dev token) → `/reset-password` | Old password stops working, new one logs in |
| Logout | Click "Log out" | Redirected, `/dashboard` now redirects to `/login` |
| Route guard | Visit `/dashboard` while logged out | Redirects to `/login`, then back to `/dashboard` after logging in |
| Admin separation | Try logging into `/admin` with a **user** account's credentials | Fails — admin login only accepts seeded/admin-collection accounts |
| Rate limiting | Submit wrong password 11 times fast | 11th attempt returns `429`, not `401` |

---

## 4. Ordering & payment

1. Add a pizza from the menu, or build a custom one, to your order draft.
2. `/checkout` → click Pay → Razorpay test modal opens.
3. Use a [Razorpay test card](https://razorpay.com/docs/payments/payments/test-card-upi-details/)
   (e.g. `4111 1111 1111 1111`, any future expiry, any CVV) to simulate success.
4. **Verify in your database**: the `Order` document has `paymentStatus: "Paid"`,
   and the `InventoryItem`s used in a custom build have had their `quantity` reduced
   by the right amount.
5. **Test a failed payment**: Razorpay's test mode has specific card numbers that
   simulate failure — confirm no order gets created and you see a clean error, not a crash.
6. **Test insufficient stock**: manually set an ingredient's quantity to 0 in
   the database, try to order it — should fail at checkout with a clear message,
   before you're even prompted to pay.
7. **Test the concurrency guard** (optional, trickier): set an ingredient's
   quantity to exactly 1, then fire two checkout+payment flows for it back to
   back — one should succeed, the other should get a stock-conflict error, and
   the final quantity should be 0, not negative.

---

## 5. Order tracking & admin

1. Place an order, note its ID.
2. Log into `/admin/login` with the seeded admin.
3. `/admin/orders` → find the order → open it → click "Move to In Kitchen".
4. Open the same order on the **user** side (`/orders/:id`) in another tab —
   within ~6 seconds it should show "In Kitchen" without a manual refresh.
5. Advance it again to "Sent to Delivery" — confirm polling stops (check your
   browser's network tab: no more repeating requests for that order).
6. Try to move a "Sent to Delivery" order further — should be rejected
   (no next stage exists).

---

## 6. Inventory & low-stock email

1. `/admin/inventory` → edit an item's quantity down to at/below its threshold, save.
2. Confirm the status badge updates to "Low Stock" or "Out of Stock".
3. If you configured SMTP: temporarily set `LOW_STOCK_CRON_SCHEDULE="*/1 * * * *"`
   in `.env` (every minute) and restart the backend. Within a minute you should
   get exactly **one** combined alert email.
4. Wait a few more cron cycles — confirm you do **not** get repeat emails
   (that's the cooldown working — default 24h, or whatever you configured).
5. Restock the item above threshold, then drop it low again — confirm a
   **new** alert fires immediately rather than waiting out the old cooldown.
6. Set a custom notify email via `/admin/settings` and confirm alerts go
   there instead of the `ADMIN_ALERT_EMAIL` fallback.

---

## 7. Edge cases worth deliberately trying to break

- A logged-in **user** hitting an admin-only endpoint directly (e.g. `curl`
  with a user's cookie against `/api/admin/inventory`) → `403`, not `401`
  (proves the role check fires, not just a missing-auth check)
- A logged-in **admin** token used against a user route (`/api/orders`) → `403`
- An expired or garbage JWT → `401`, not a crash
- Requesting another user's order by ID → `404` (not `403` — doesn't reveal
  that the order exists)
- A malformed MongoDB ID in any `:id` route (e.g. `/api/pizzas/not-an-id`) →
  clean `400`, not a raw `500`
- Replaying the same Razorpay payment verification twice → same order
  returned both times, not a duplicate and not an error

---

If everything in this document checks out, the app is genuinely working
end-to-end, not just "built." Anything that doesn't match the expected
result is worth flagging before considering this submission-final.
