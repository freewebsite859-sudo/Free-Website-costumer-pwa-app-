# Customer PWA — Supabase Integration (Phase 1)

**Date:** 2026-08-04 · **Branch:** `arena/supabase-phase1-integration`
**Shared Supabase project:** `qwaehqsmodekbgvnaavz` (all 6 locked business rules verified)

Removes the remaining mock/localStorage business data from this PWA and wires
it to the same shared Supabase project the Main Website
(`nexora-main-website.vercel.app`) already uses. Auth (login/signup + customer
role guard) was already real Supabase auth and is untouched.

## What changed

### 1. `MOCK_SALONS` removed — live salon catalog
- `src/data/mockData.ts` no longer exports `MOCK_SALONS` or `INITIAL_BOOKINGS`
  (fake seeded bookings). Only static brand assets / city lists remain.
- New `src/lib/salonRepository.ts` reads the **approved/published** catalog:
  `salons` (verified + active) joined with bookable `services` and the
  published website `config` (staff, photos, hours, offers) from
  `salon_public_websites`. Fields with no live source yet (rating, distance)
  come back as `0` so the UI shows "New" instead of fabricated scores.
- `App.tsx` loads the catalog after the customer session is verified, with
  loading / error+retry states. `SalonDetailScreen` no longer pads staff with
  fake stylists and no longer seeds fake reviews.

### 2. Settings → `customer_settings`
- `src/lib/settingsRepository.ts` — one settings row per customer
  (`user_id` PK, `settings` jsonb), optimistic toggles + debounced upsert,
  Realtime multi-device sync, one-time import of the old `settings_*`
  localStorage keys.

### 3. Reviews → `customer_reviews`
- `src/lib/reviewsRepository.ts` — read/write the user's own reviews
  (RLS-enforced), idempotent upsert by id, graceful degradation if the table
  isn't provisioned. `SalonDetailScreen` and the bookings review flow now
  persist here; the old `nexora_service_reviews_*` localStorage keys are
  purged by the one-time legacy migration.

### 4. Payment methods → `saved_payment_methods`
- `src/lib/paymentMethodsRepository.ts` — saved UPI ids / masked cards
  (display-meta only, never PANs). ProfileScreen, the global QR scanner and
  the Add-UPI/Add-Card modals all persist to Supabase; fake seeded cards/UPIs
  removed.

### 5. Support → `support_tickets` + `customer_feedback`
- `src/lib/supportRepository.ts` — tickets are created/listed per customer
  (`created_by`). Fake seeded tickets and the fake "executive auto-reply"
  were removed. A new "Rate your app experience" card on Help Home writes to
  `customer_feedback` (also used by the Profile feedback form).

### 6. Legacy data migration
- `src/lib/legacyLocalData.ts` — on first signed-in load, imports surviving
  localStorage settings/UPIs/cards into Supabase, then purges the local
  copies (once, flagged by `nexora_customer_migrated_v1`). Device-only UI
  flags (install prompts, location choice) are intentionally left in
  localStorage.

## Out of scope (next phase)
- Bookings pipeline (`create_customer_booking` + Razorpay 25% advance) — the
  booking list is still device-local in this app; wiring the tested backend
  contract is the follow-up task.
- Favorites live tables, notifications table, rewards/wallet RPCs.

## Deploy checklist
1. Supabase migrations (shared project) must be applied:
   `supabase/migrations/20260802_customer_phase1_schema.sql` and
   `20260803_customer_phase1_completion.sql` (idempotent; live in the
   `nexora-main-website` repo).
2. Set on the host (Vercel): `VITE_SUPABASE_URL=https://qwaehqsmodekbgvnaavz.supabase.co`
   and `VITE_SUPABASE_ANON_KEY` (anon/publishable key from the dashboard).
   The app refuses to boot against any other Supabase project.

## Local testing
```bash
cp .env.example .env   # paste the anon key
npm install
npm run dev            # http://localhost:3000
```
Verified: `tsc --noEmit` clean, `vite build` clean.
