# Shine — a car-detailing business on Whop

A minimal-friction, **end-to-end** Next.js app that walks an entrepreneur through
launching a mobile car-detailing business on real Whop infrastructure, following
the start-a-business slide flow:

1. **Create your business** — `POST /accounts` → `companies.create`
2. **Get a business plan** — `POST /ideas` (Claude when configured, else a template)
3. **Publish a service & appointment link** — `POST /products` + `POST /plans` + `POST /calendar`
4. **Find your first customers** — `POST /ads` + `POST /referrals/products/:id`
5. **Get paid** — embedded Whop balance/withdrawals + `POST /invoices`
6. **Hire friends & run payroll** — `POST /accounts` + `POST /transfers` + `PATCH /calendar`
7. **Offer a corporate special rate** — `POST /plans` + `POST /calendar`

Customers book and pay on a public page (`/book/[planId]`) using Whop's **embedded
checkout** component; the owner sees balance and withdraws using Whop's **embedded
payouts** components.

## What's real vs. simplified

Everything that Whop exposes is called for real via [`@whop/sdk`](https://www.npmjs.com/package/@whop/sdk):
business creation, products, plans, checkout sessions, invoices, transfers (payroll),
and the embedded payouts/checkout components.

Whop has **no** endpoint for some slide items, so these are simple local implementations:

- `/ideas` — local generator (Claude if `ANTHROPIC_API_KEY` is set, otherwise a static template).
- `/calendar` (+ `PATCH`) — availability is stored locally; the "calendar link" is this app's `/book/[planId]` page.
- `/ads` — composes a local ad whose destination is the plan's booking link (the SDK only exposes `ads.list/retrieve`).
- `/referrals/products/:id` — generates a code and a booking link with `?ref=CODE`; the code is forwarded to checkout as `affiliate_code`, so Whop credits the referrer for real at payment.

State (created Whop IDs, availability, bookings, ads, referrals, friends) is persisted
in a small JSON file at `.data/store.json` — no database.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in WHOP_API_KEY and WHOP_COMPANY_ID
npm run dev                   # http://localhost:3000
```

Required env (the app fails loud without them):

- `WHOP_API_KEY` — a company API key from <https://whop.com/dashboard/developer>
- `WHOP_COMPANY_ID` — the company that owns products/plans (e.g. `biz_…`)

Optional: `WHOP_PARENT_COMPANY_ID`, `NEXT_PUBLIC_WHOP_APP_ID`, `ANTHROPIC_API_KEY`,
`ANTHROPIC_MODEL`, `NEXT_PUBLIC_BASE_URL`. See `.env.example`.

## Caveats — this moves real money

- **Invoices auto-charge.** `POST /invoices` uses `charge_automatically`, so the
  customer must be a member with a payment method on file, or Whop returns an error
  (which the app surfaces rather than hides).
- **Payroll is a real transfer.** `POST /transfers` requires a funded origin balance
  and a valid `destination_id`. Errors are shown verbatim.
- **Checkout completes a real purchase.** Use a test plan / small amount.

## Layout

```
lib/        env validation, Whop SDK client, file store, ideas generator, http helpers
app/api/    business, ideas, products, plans, calendar, ads, referrals,
            checkout, invoices, friends, payroll, special-rate, token, state
app/        dashboard (page + steps), embedded payouts panel
app/book/   public booking page with embedded Whop checkout
```
