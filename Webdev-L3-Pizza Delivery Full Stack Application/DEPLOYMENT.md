# Deploying Bella Pizza

This covers deploying the frontend to **Vercel**, the backend to **Render**,
and using **MongoDB Atlas** as the database — the stack named in the project
spec. None of these steps could be executed from the development sandbox
(no reachable network to Vercel/Render/Atlas), so this is a guide to run
yourself, not a record of an already-completed deployment.

## 1. MongoDB Atlas

You're likely already using this from local development.

1. In Atlas → **Network Access**, add `0.0.0.0/0` (allow from anywhere) —
   Render's outbound IPs aren't static on the free tier, so a fixed IP
   allowlist isn't practical without a paid static-IP add-on.
2. Grab your connection string from **Database → Connect → Drivers**.
3. Use a **separate database name** for production vs. local dev (e.g.
   `bella-pizza-prod` vs `bella-pizza`) so seeding/testing locally never
   touches production data.

## 2. Backend → Render

1. Push this repo to GitHub (if you haven't already).
2. In Render: **New → Blueprint**, point it at your repo. It will pick up
   `backend/render.yaml` automatically. Alternatively, **New → Web Service**
   and configure manually:
   - Root directory: `backend`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Health check path: `/api/health`
3. Set every environment variable marked `sync: false` in `render.yaml` in
   the Render dashboard (Environment tab). At minimum:
   - `MONGODB_URI` — your Atlas connection string (include a database name)
   - `JWT_SECRET` — generate with `openssl rand -hex 32`, don't reuse the dev one
   - `CORS_ORIGIN` and `FRONTEND_URL` — your Vercel URL (step 3), set these
     *after* you have that URL
   - `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — **live** keys if this is a
     real production deploy, or test keys if it's a staging/demo deploy.
     The spec calls for Razorpay **test mode**, so test keys are correct
     unless you're intentionally going live.
   - `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` — real SMTP
     credentials, or leave blank if you're fine with emails just logging
     "not configured" server-side (registration/checkout still work either
     way — see `backend/.env.example` for the graceful-degradation notes)
4. Deploy. Watch the logs for `[server] Bella Pizza API listening...` and
   `[cron] Low-stock check scheduled...`.
5. Render's free tier **cold-starts** after inactivity — the first request
   after idle can take 30–60s. The frontend's `apiClient` doesn't currently
   have a specific cold-start retry/timeout UI; a slow first load is
   expected behavior on the free tier, not a bug.

## 3. Frontend → Vercel

1. In Vercel: **New Project**, import the repo, set the root directory to
   `frontend`. Vercel auto-detects the Vite framework preset.
2. Set the environment variable:
   - `VITE_API_BASE_URL` = `https://<your-render-service>.onrender.com/api`
3. Deploy. `vercel.json` in `frontend/` handles the SPA rewrite so
   client-side routes (e.g. `/orders/abc123`) don't 404 on a hard refresh.
4. Once deployed, go back to Render and set `CORS_ORIGIN` / `FRONTEND_URL`
   to this Vercel URL, then redeploy the backend so cookies and CORS
   actually work cross-origin.

## 4. Post-deploy checklist

Run through this against the **live** URLs, not localhost:

- [ ] `GET https://<render-url>/api/health` → `200`, `database: "connected"`
- [ ] Register a real account, confirm the verification flow (email if
      SMTP is configured, or the dev-mode token response if not)
- [ ] Log in, browse `/pizzas`, open the builder, confirm ingredients load
- [ ] Complete a full checkout with a
      [Razorpay test card](https://razorpay.com/docs/payments/payments/test-card-upi-details/)
- [ ] Confirm the order appears with `paymentStatus: "Paid"` and inventory
      actually decremented
- [ ] Log in as the seeded admin (`npm run seed` must be run once against
      the **production** database — see below), advance an order's status,
      confirm the customer's tracking page picks it up within ~6s
- [ ] Trigger a low-stock condition, confirm the cron job alerts (or set
      `LOW_STOCK_CRON_SCHEDULE` to something fast temporarily to test sooner)

### Seeding production

`npm run seed` runs against whatever `MONGODB_URI` is in your **local**
`.env` at the time you run it — so to seed the production database,
temporarily point your local `.env` at the production `MONGODB_URI`, run
`npm run seed` once, then switch it back. Do **not** commit the production
URI anywhere, and rotate the seeded admin password immediately after
(`SEED_ADMIN_PASSWORD` env var controls it — see `backend/.env.example`).

## 5. Things that will *not* work until configured

- Email delivery (verification/reset/low-stock) — needs real `SMTP_*` vars
- Real payments — needs live Razorpay keys instead of test-mode ones (not
  recommended per the project spec, which specifies test mode throughout)
- MongoDB transactions (used for atomic inventory decrement) — **require a
  replica set**. Atlas provides this automatically; this is only a concern
  if you point `MONGODB_URI` at a non-Atlas, non-replica-set MongoDB instance.
