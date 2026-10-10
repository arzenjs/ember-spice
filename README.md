# Ember & Spice — Stage 1 marketing site

Next.js 14 (App Router) · JavaScript · Tailwind CSS 3 · Lucide · Framer Motion.

## Run
```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build && npm start
```
Optional: set `NEXT_PUBLIC_SITE_URL` (e.g. your Vercel domain) for Open Graph metadata. Deploy by importing the repo into Vercel; no other settings are required.

## Required: add photography
Place these files in `public/images/` (about 1600px wide, JPG): `hearth`, `ribeye`, `dining-room`, `spices`, `cocktail`, `octopus`, `wine-cellar`, `chefs-counter`, `cheesecake` (`.jpg`). Paths and alt text live in `src/data/gallery.js`.
The Stitch image URLs are temporary and were intentionally not hard-linked.

## Where things live
- `src/config/restaurant.js` — name, phone, WhatsApp, email, address, hours, social links
- `src/config/navigation.js` — nav items
- `src/data/menu.js`, `src/data/gallery.js` — content

## Replace before a real client launch
Every value in `restaurant.js` (all fictional), menu items and prices, photography, the "Demo restaurant" line in `SiteFooter.js`, and the JSON-LD in `src/app/layout.js` (no city/region/geo is set).

## Design notes
- Copper `#B85C32` is ~3.4:1 on Ember Black, so it is used for borders, icons, and large text only. Small accent text uses `copper-soft` (`#E08A62`, a tint of the same hue). Primary buttons use Deep Terracotta with Ivory text (≈7:1).
- The fixed mobile bottom nav from the Stitch export was dropped; the header menu covers navigation, avoiding content/footer obstruction and a second nav pattern.
