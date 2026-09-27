# Customizing Bella Pizza

This is your codebase — nothing here is locked. This is a map of where to
make the changes people usually want first.

---

## 1. Rebrand the colors, fonts, and name

Everything lives in one place: **`frontend/src/styles/global.css`**, under
`:root`.

```css
--green: #294c29;      /* nav, headings, primary ink */
--deep-red: #9f280a;   /* secondary accents */
--tomato: #b43e17;     /* primary buttons/CTAs */
--yellow: #e7af67;     /* sparse highlights only */
--cream: #f6e4c9;      /* page background */
```

Change these five values and the whole site re-themes — buttons, badges,
the navbar, everything references these tokens rather than hardcoded colors.

**Fonts**: also in `global.css`, plus the actual font files are loaded in
`frontend/index.html` via a Google Fonts `<link>`. Swap the font names in
both places (`--font-display`, `--font-heading`, `--font-body`) and the
`index.html` URL to match.

**The name "Bella Pizza"**: it appears in a lot of places by design (not
pulled from a single config) — search for `Bella Pizza` and `Bella` across
`frontend/src` and `backend/src` (email templates, page titles, the
seeded admin email, etc.) and replace as needed. The `wordmark` CSS class
in `Navbar.tsx` / `Footer.tsx` / auth pages is what renders the script logo.

## 2. Change the menu

`backend/src/seed/seed.ts` is the source of truth for what gets created
when you run `npm run seed`. Edit the `PIZZAS`, `BASES`, `SAUCES`,
`CHEESES`, and `VEGETABLES` arrays, then re-run `npm run seed` (this
**wipes and recreates** pizzas/inventory/admin — don't run it against a
database with real customer orders you care about).

For day-to-day changes without touching code, use the admin panel instead:
`/admin/inventory` lets you edit stock/threshold/pricing for existing
ingredients live. Adding a brand-new pizza or ingredient currently requires
either editing the seed script or inserting directly into MongoDB — there's
no "add pizza" admin UI yet (see `README.md`'s Future Improvements).

## 3. Adjust pricing logic

- **Base dough price** (the flat cost added to every custom build before
  ingredient add-ons): `BASE_DOUGH_PRICE` in
  `backend/src/services/order.service.ts`.
- **Delivery fee**: currently hardcoded as `2.5` in
  `frontend/src/pages/user/Checkout.tsx`. If you want this server-controlled
  instead of client-controlled (recommended before real production use —
  right now a modified frontend could claim a different delivery fee,
  though the *pizza* pricing itself is always server-verified), move this
  into the backend's checkout/verify pricing calculation instead.
- **Per-ingredient pricing**: `addOnPrice` field on each `InventoryItem`,
  editable via `/admin/inventory` or the seed script.

## 4. Add or change frontend pages

Every route is one file in `frontend/src/pages/` (or `pages/user/`,
`pages/admin/`), wired up in `frontend/src/router.tsx`. To add a new page:
1. Create the component in the right `pages/` subfolder.
2. Import and add it to the `children` array in `router.tsx` — wrap it in
   `<RequireUser>` or put it under the `<RequireAdmin>`-guarded `/admin`
   tree if it needs auth.
3. If it needs a nav link, add it to `Navbar.tsx` (user) or `AdminLayout.tsx` (admin).

## 5. Design system components

Reusable pieces live in `frontend/src/components/common/`:
`Button`, `Input`, `Toast`, `StatusBadge`, `States` (loading/empty/error),
`StepIndicator`, `QuantityStepper`, plus the hand-drawn SVG icon set in
`icons.tsx`. Change these once, and every page using them updates.

Utility CSS classes worth knowing (in `global.css`): `.row-between`,
`.price-total`, `.card--padded`, `.max-w-sm/md/lg`, `.mt-*`/`.mb-*`
(spacing scale), `.text-muted`. Prefer these over new inline styles when
you're adding UI — keeps things visually consistent.

## 6. Backend structure, if you're adding features

- **New data model**: add a schema in `backend/src/models/`, a Zod
  validation schema in `backend/src/validation/`, business logic in
  `backend/src/services/`, a thin controller in `backend/src/controllers/`,
  and wire the route in `backend/src/routes/` + `routes/index.ts`.
- **New protected route**: use the existing `requireUser` or `requireAdmin`
  middleware (`backend/src/middleware/`) — don't roll your own auth check.
- **Tests**: this project's test suite deliberately runs without a live
  database (see `README.md` → Testing). If you add business logic, prefer
  extracting the core decision as a pure function (like
  `computeCustomPizzaPrice` or `isValidStatusTransition`) so it stays
  unit-testable the same way.

## 7. Things that are intentionally NOT easily customizable without more work

- **Fixed menu pizzas aren't linked to ingredient inventory** — ordering a
  menu pizza doesn't decrement any `InventoryItem`. If you want menu pizzas
  to also draw from stock, you'd need to add a bill-of-materials reference
  from `Pizza` to `InventoryItem` and extend `order.service.ts`'s
  `buildOrderItem` — this was a deliberate scope decision, not an oversight
  (see the Inventory logic section of `README.md`).
- **Single delivery address / no multi-location support** — there's no
  address model at all currently; checkout doesn't collect one. Adding
  delivery addresses would touch the `Order` model, checkout UI, and
  probably a new `Address` model tied to `User`.
