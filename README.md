# Shine — mobile car detailing storefront

A minimal customer-facing booking site built on Whop. Customers browse detailing
services, pick an appointment time, and pay — all on the site.

- **Home** (`/`) lists the business's bookable services, read live from Whop
  (`plans.list`). Each card links to its booking page.
- **Booking** (`/book/[planId]`) lets the customer choose a time, enter their
  email, and pay via Whop's **embedded checkout** (`<WhopCheckoutEmbed>`). The
  chosen time + email are attached to the checkout session metadata; a `?ref=CODE`
  in the URL is forwarded to Whop as an affiliate code.

The catalog has two plans on one product: a **one-time** Full Detail and a
**monthly** membership.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev                   # http://localhost:3000
```

Env:

- `WHOP_API_KEY` *(required)* — company API key from <https://whop.com/dashboard/developer>
- `WHOP_COMPANY_ID` *(required)* — the company whose plans are sold (e.g. `biz_…`)
- `WHOP_PRODUCT_ID` *(optional)* — restrict the storefront to one product's plans
- `NEXT_PUBLIC_BASE_URL` *(optional)* — defaults to the Vercel production URL, else localhost

## Seeding the catalog

`scripts/seed.mjs` creates the product and the two plans (one-time + monthly):

```bash
set -a; . ./.env.local; set +a
node scripts/seed.mjs        # prints PRODUCT / PLAN ids → set WHOP_PRODUCT_ID
```

## Layout

```
lib/         env validation, Whop SDK client, catalog (plans.list/retrieve), http helpers
app/         home storefront (server-rendered from Whop)
app/book/    booking page with embedded Whop checkout
app/api/     checkout (create a Whop checkout session)
scripts/     one-off catalog seed
```

Notes: completing checkout is a real Whop purchase; the monthly plan starts a real
subscription. Time slots are generated (next business days at 9:00 / 14:00) and
attached to the checkout as metadata.
