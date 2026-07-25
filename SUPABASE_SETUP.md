# Nexora — Supabase + PWA setup

The app runs in **two modes**:

| | Supabase configured | Not configured |
|---|---|---|
| Accounts | Real email + password | Guest only |
| Data | Synced to Postgres, shared across devices | Stays in this browser |
| Banner | none | “Demo mode” strip |

Nothing crashes when the keys are missing — the app just falls back to local
data, so you can develop without a project.

---

## 1. Create the database

1. Open your project → **SQL Editor** → **New query**.
2. Paste and run **`supabase/migrations/0001_initial_schema.sql`**.
   Creates 13 tables, enums, triggers, and **Row Level Security on every table**.
3. Paste and run **`supabase/migrations/0002_seed_catalog.sql`**.
   Loads the 5 salons / 15 services / 9 staff from `src/data/mockData.ts`.
   Safe to re-run (`on conflict do update`).

> Both files are idempotent — running them twice will not duplicate anything.

## 2. Add your keys

**Project Settings → Data API** for the URL, **→ API Keys** for the anon key.

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL="https://YOUR-REF.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGci..."
```

Restart the dev server (Vite only reads env vars at startup).

⚠️ Use the **anon / publishable** key only. Anything in a `VITE_` variable is
inlined into the public JS bundle. The `service_role` key must never appear
there — RLS is what keeps the anon key safe. `.env` is gitignored.

## 3. Auth settings

**Authentication → Providers → Email** is on by default.

- **Testing:** turn *Confirm email* **off** so signups log in instantly.
- **Production:** leave it **on**, and set **URL Configuration → Site URL** to
  your deployed origin so confirmation and reset links come back to the app.

---

## What syncs

| Data | Table | Notes |
|---|---|---|
| Salons / services / staff | `salons`, `services`, `staff` | Public read, cached offline |
| Profile + preferences | `profiles` | Auto-created on signup by trigger |
| Bookings | `bookings` | Optimistic; rolls back if the insert fails |
| Favourite salons | `favorite_salons` | |
| Saved pros / services | `favorite_professionals`, `favorite_services` | |
| Addresses | `addresses` | Partial unique index enforces one default |
| Reviews | `service_reviews` | World-readable, author-only writes |
| Waitlist | `waitlist_entries` | |
| Notifications | `notifications` | |
| Support tickets | `support_tickets` | |

Catalog ids are namespaced `salonId:localId` because the source data reuses ids
like `s1` across salons; `stripSalonPrefix()` hides this from the UI.

## Security model

Every table has RLS enabled:

- **Catalog** — `select` for everyone, writes only via service role (dashboard).
- **Per-user tables** — `using (auth.uid() = user_id)` for all operations, so a
  user physically cannot read or write another user's rows.
- **Reviews** — readable by all, but insert/update/delete require authorship.
- **Profiles** — scoped to `auth.uid() = id`.

## Regenerating types

`src/lib/database.types.ts` mirrors the schema by hand. After changing the SQL:

```bash
npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
```

---

## PWA

`vite-plugin-pwa` generates the manifest and service worker at build time.

```bash
npm run build && npm run preview   # SW only runs in a production build
```

- **Install:** Chrome address-bar install icon, or iOS Share → *Add to Home Screen*.
- **Updates:** `registerType: 'prompt'` — a toast asks before reloading, so the
  app never refreshes mid-booking. It re-checks hourly.
- **Caching:** fonts and salon images `CacheFirst`; the read-only catalog
  `NetworkFirst` (5s timeout); **auth and realtime are `NetworkOnly`** so no
  session or per-user write is ever served from cache.

Icons in `public/` are generated from a single source image — replace
`pwa-*.png` / `apple-touch-icon.png` to rebrand. The maskable variants keep the
artwork inside the 80% safe zone for Android's circular crop.

## Troubleshooting

**“Demo mode” banner won't go away** — env vars missing or dev server not
restarted. Check `import.meta.env.VITE_SUPABASE_URL` in the console.

**Login says “Email not confirmed”** — confirm via the emailed link, or turn
off *Confirm email* while testing.

**Empty salon list** — run `0002_seed_catalog.sql`. The app falls back to
bundled mock data if the fetch fails, so also check the Network tab for 401s
(bad key) or an RLS policy error.

**Service worker serving stale files** — DevTools → Application → Service
Workers → *Unregister*, then hard-reload. `cleanupOutdatedCaches` handles this
automatically on normal version bumps.
