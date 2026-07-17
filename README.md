# Hospital PRO Tracker

Live GPS and photo visit verification for hospital PRO field teams. Built with Next.js App Router, PostgreSQL, Tailwind CSS, Framer Motion, and Zustand.

## Features

- PRO and admin login backed by secure, HTTP-only server sessions
- Start-duty workflow with GPS and an optional selfie
- Hospital visit capture with photo, fresh GPS coordinates, device context, and distance tracking
- Admin dashboard with active employees, recent visits, and latest PRO locations
- Automatic PRO IDs, ID/email login, employee management, duty timelines, and visit photos
- PostgreSQL-backed records and protected image storage
- PWA manifest, service worker, offline navigation fallback, and client-side image compression

## Local setup

1. Create a PostgreSQL database (the default example is `pro-traacker`).
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL` and the bootstrap admin values.
3. Install dependencies and start the app:

```bash
npm install
npm run dev
```

The schema and indexes are created automatically on the first API request. If the database contains no admin, the first admin login matching `ADMIN_EMAIL` and `ADMIN_PASSWORD` creates the bootstrap account. Change or remove `ADMIN_PASSWORD` after the account has been created.

## Architecture

```text
app/                 pages and protected API routes
components/          shared UI plus PRO/admin components
context/             authentication state initialization
lib/server/          PostgreSQL, authentication, and HTTP helpers
lib/*Client.js       browser API adapters and polling subscriptions
store/               Zustand auth and duty state
public/              PWA assets and service worker
```

PostgreSQL credentials are read only by server modules. Never expose them using a `NEXT_PUBLIC_` environment variable.

## Production deployment

- Use a hosted PostgreSQL instance; `localhost` in `DATABASE_URL` only works for local development.
- Set `DATABASE_SSL=true` when required by the database provider.
- Replace the bootstrap `ADMIN_PASSWORD` after the first admin has been created.
- Deploy behind HTTPS. Camera and precise geolocation APIs are restricted to secure contexts outside `localhost`.
- Keep the Next.js server and PostgreSQL region close to Indian users for lower upload and dashboard latency.
- Verify the deployment with `GET /api/health`; it should return `database: "connected"`.

Visit images are compressed in the browser and stored as protected PostgreSQL records. API and image responses are intentionally excluded from the PWA service-worker cache.

## Mobile PWA experience

- Android installation uses the native browser install prompt.
- iPhone and iPad users receive Safari **Add to Home Screen** instructions.
- Installed mode runs full-screen with safe-area aware navigation, app-style transitions, touch feedback, and offline status.
- Desktop browsers retain the responsive website layout and do not show the mobile install banner.
