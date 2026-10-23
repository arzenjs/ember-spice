# Ember & Spice

A restaurant website with a complete reservation system: public booking, instant confirmation (page + email), secure owner/staff sign-in, staff invitations, and a reception dashboard.

*All restaurant details in `src/config/restaurant.js` are fictional demo data and must be replaced before a real launch.*

## Features

**Public website:** premium dark design, responsive layouts, animated sections, menu, gallery, location and contact pages.

**Reservations:** guests book without an account. Availability is capacity-based and checked on the server. Each booking gets an unguessable reference and a private confirmation page, plus a confirmation email.

**Owner and staff:** one shared sign-in page (`/staff/login`). Admins get an overview with search and filters, staff management and invitations (`/admin`). Staff get a day view for reception: search, check-in, seating, table notes, cancellations and no-shows (`/staff/dashboard`).

## Tech stack

Next.js 16 (App Router) · React 19 · JavaScript · Tailwind CSS 3 · Framer Motion · MongoDB + Mongoose 9 · Auth.js v5 (`next-auth@beta`, credentials + JWT sessions) · Resend · bcryptjs.

Tailwind stays on v3 to match the existing design tokens and conventions (v4 is a separate styling migration).
Auth.js v5 is published under the `beta` tag on npm, which is why `package.json` uses `next-auth@^5.0.0-beta.30`.

## Setup (local)

You need Node.js 20.19+ (22 LTS recommended), npm, and a MongoDB database.

### 1. Install dependencies

```bash
npm install
```

### 2. MongoDB

Easiest: a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.
1. Create a cluster, then **Database Access** → add a database user with a strong password.
2. **Network Access** → allow your IP (for Vercel, allow `0.0.0.0/0` or use the Atlas–Vercel integration).
3. **Connect → Drivers** → copy the connection string and add a database name (e.g. `/ember-spice`).

A local MongoDB (`mongodb://127.0.0.1:27017/ember-spice`) works too.

### 3. Environment variables and Auth.js

```bash
cp .env.example .env.local
```

Fill in `.env.local` (never commit it):

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `AUTH_SECRET` | Signs session cookies. Generate: `npx auth secret` or `openssl rand -base64 33` |
| `AUTH_URL` | Public site URL, no trailing slash (`http://localhost:3000` locally). Also used for links in emails |
| `AUTH_TRUST_HOST` | Only if self-hosting behind a proxy (not needed on Vercel) |
| `NEXT_PUBLIC_SITE_URL` | Used by site metadata |
| `EMAIL_MODE` | `log` (print emails to the console, local dev) or `resend` (real sending, required in production) |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Resend credentials (see below) |
| `RESTAURANT_TIMEZONE` | IANA zone, e.g. `America/New_York`. Opening hours and "today" use it |

### 4. Create the database indexes

```bash
npm run db:indexes
```

Unique indexes (references, emails, invitation tokens, one pending invitation per email) are part of the safety guarantees. The app also ensures them on first connection, but run this once so they exist before traffic arrives.

### 5. Create the initial admin (owner) account

```bash
npm run create-admin
```

It prompts for email, name and a hidden password (min. 10 characters), hashes the password with bcrypt, and writes the account directly to MongoDB. It refuses to run if an admin already exists. There is no public endpoint that can create an admin, and invitations can only create **staff** accounts.

### 6. Run the app

```bash
npm run dev
```

Open http://localhost:3000. Sign in at http://localhost:3000/staff/login.

## Reservation rules

All rules live in `src/config/reservations.js`. Opening days and hours are read from `src/config/restaurant.js` (`structuredHours`), so there is one source of truth. The remaining numbers are **starting defaults, not facts about a real restaurant. Review them before launch:**

| Setting | Default | Meaning |
|---|---|---|
| `slotMinutes` | 30 | Spacing between bookable times |
| `diningMinutes` | 90 | How long a booking occupies seats |
| `lastSeatingBeforeCloseMinutes` | 90 | Last start time = closing time minus this (21:30 for an 11 PM close) |
| `seatCapacity` | 40 | Seats available at any moment |
| `minPartySize` / `maxPartySize` | 1 / 8 | Online party size limits |
| `minLeadMinutes` | 60 | Earliest bookable time is "now" + this |
| `maxAdvanceDays` | 60 | How far ahead guests can book |
| `maxActiveReservationsPerEmail` | 3 | Upcoming bookings one email can hold |

Rate limits, invitation lifetime (72 h), session length (8 h) and password length are in `src/config/security.js`.

**How overbooking is prevented:** each (date, 30-minute slot) has a counter document. A booking claims seats in every slot it overlaps using one conditional atomic update per slot (`seatsBooked <= capacity - partySize`). If any slot is full, seats already claimed are returned and the guest is told the time is gone. Cancelling or recording a no-show returns the seats. No transactions or replica set are required.

## Resend (email)

1. Create a Resend account and an API key → `RESEND_API_KEY`.
2. In Resend → **Domains**, add a domain you own (a subdomain such as `mail.yourdomain.com` works well) and add the DNS records Resend shows (SPF, DKIM) at your DNS provider. Wait until it shows **Verified**.
3. Set `RESEND_FROM_EMAIL=reservations@your-verified-domain.com` (a bare address, or `Name <address>`).
4. Set `EMAIL_MODE=resend`.

Until a domain is verified, Resend restricts what you can send (typically only to your own account address, from their shared test sender). See Resend's current docs. For development use `EMAIL_MODE=log`, which prints each email, including the confirmation and invitation links, to the terminal running `npm run dev` and sends nothing. Production refuses `log` mode.

If an email fails after a booking is saved, the booking is kept. The confirmation page shows a warning and a "Resend" button (limited to 5 attempts, 60 s apart); staff can also resend from the dashboard.

## Testing the flows manually

**Booking and email:** go to `/reserve`, pick a Tuesday–Sunday date, choose a time, submit. You land on `/reserve/confirmation/<token>`; refreshing it never creates another booking. With `EMAIL_MODE=log` the email appears in the server console.

**Inviting staff and automatic login:**
1. Sign in as admin → **Staff & invitations** → enter an email → **Invite staff**.
2. Copy the `accept-invitation?token=…` link from the console (log mode) or the email.
3. Open it in a private window, enter name and password → **Activate account**. You are signed in and taken straight to `/staff/dashboard` with no second login.
4. Re-open the same link: it is rejected as already used. Revoke or let invitations expire to see those states; use **Resend / Send new link** to issue a fresh one.

**Reception workflow:** `/staff/dashboard` → search by reference, name or phone → **Mark arrived** → optionally enter a table → **Mark seated**. Cancellations and no-shows return the seats.

## Automated tests

```bash
npm test
```

Runs with Node's built-in test runner (no extra dependencies): opening hours, slot generation, lead time, validation, tokens, redirects, status transitions, email templates. Three MongoDB integration tests for the concurrency guarantee are skipped unless you set `MONGODB_TEST_URI` to a **throwaway** database (the test wipes the slot-capacity collection).

```bash
MONGODB_TEST_URI=mongodb://127.0.0.1:27017/ember-spice-test npm test
npm run lint
npm run build
```

## Security notes

- Every admin/staff page and every server action calls `requireUser()` (`src/server/session.js`). It re-reads the user from MongoDB on each request, so the role is never taken from the browser and deactivating an account takes effect immediately, even with an existing session. The app deliberately does not rely on middleware/proxy for protection.
- Passwords: bcrypt (cost 12), never selected by default queries. Login errors are identical for unknown email, wrong password, disabled account and rate limiting, and unknown emails cost the same time as real ones.
- Invitation and confirmation tokens: 256-bit random, only the SHA-256 hash is stored. Invitations are single-use (atomic claim), expire after 72 h and can be revoked. Resending rotates the token.
- Confirmation pages are reachable only with the secret token; there is no lookup by id, email or name.
- Rate limits (stored in MongoDB, so they hold on serverless): sign-in, booking, slot lookup, email resend, invitations.
- Post-login redirects accept only same-site paths the user's role may visit.
- Cookies are `httpOnly` and `Secure` on HTTPS (Auth.js defaults). Security headers are set in `next.config.mjs`.
- Client IP for rate limiting is read from `x-forwarded-for`. Behind Vercel this is set by the platform; if you self-host, make sure your proxy overwrites it.

## Deploying (Vercel)

1. Push the repo and import it in Vercel.
2. Add environment variables (Production): `MONGODB_URI`, `AUTH_SECRET`, `AUTH_URL` (your production URL), `NEXT_PUBLIC_SITE_URL`, `EMAIL_MODE=resend`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESTAURANT_TIMEZONE`.
3. Create the admin in production **from your own machine**, pointing `MONGODB_URI` in `.env.local` at the production database: `npm run db:indexes` then `npm run create-admin`.
4. Deploy, sign in at `/staff/login`, send yourself a test invitation and test booking.

## Project structure

| Path | Purpose |
|---|---|
| `src/config/` | `restaurant.js` (business info), `reservations.js` (booking rules), `security.js` (limits), `site.js` |
| `src/lib/` | Pure logic with no database: time, availability, validation, tokens, status rules, safe redirects |
| `src/models/` | Mongoose models: `User`, `Reservation`, `Invitation`, `SlotCapacity`, `RateLimit` |
| `src/server/` | Database, capacity, reservations, invitations, staff, credentials, session, email, rate limiting |
| `src/emails/` | Reusable email templates (HTML + text), separate from business logic |
| `src/auth.js` | Auth.js configuration |
| `src/app/reserve/` | Booking page, actions, confirmation page |
| `src/app/staff/` | Login, invitation acceptance, staff dashboard, actions |
| `src/app/admin/` | Reservation overview and staff/invitation management |
| `scripts/` | `create-admin.mjs`, `sync-indexes.mjs` |
| `tests/` | Unit tests and optional MongoDB integration tests |

## Original site notes

### Required: add photography
Place these files in `public/images/` (about 1600px wide, JPG): `hearth`, `ribeye`, `dining-room`, `spices`, `cocktail`, `octopus`, `wine-cellar`, `chefs-counter`, `cheesecake` (`.jpg`). Paths and alt text live in `src/data/gallery.js`.
The Stitch image URLs are temporary and were intentionally not hard-linked.

### Where site content lives
- `src/config/restaurant.js` — name, phone, WhatsApp, email, address, hours, social links
- `src/config/navigation.js` — nav items
- `src/data/menu.js`, `src/data/gallery.js` — content

### Replace before a real client launch
Every value in `restaurant.js` (all fictional), menu items and prices, photography, the "Demo restaurant" line in `SiteFooter.js`, and the JSON-LD in `src/app/layout.js` (no city/region/geo is set).

### Design notes
- Copper `#B85C32` is ~3.4:1 on Ember Black, so it is used for borders, icons, and large text only. Small accent text uses `copper-soft` (`#E08A62`, a tint of the same hue). Primary buttons use Deep Terracotta with Ivory text (≈7:1).
- The fixed mobile bottom nav from the Stitch export was dropped; the header menu covers navigation, avoiding content/footer obstruction and a second nav pattern.
