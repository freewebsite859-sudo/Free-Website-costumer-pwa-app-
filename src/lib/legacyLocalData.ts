// One-time migration helper: pre-integration builds stored customer data in
// localStorage. After the first successful Supabase sync we import values
// where a legacy copy exists, then PURGE the local copies so Supabase is the
// single source of truth.
//
// Device-only UI flags (install prompts, PWA dismissal, browsing location,
// recently viewed) legitimately keep using localStorage and are NOT touched.

import type { SupabaseClient } from '@supabase/supabase-js';
import { importLegacyPaymentMethods } from './paymentMethodsRepository';
import { settingsFromLegacyLocalStorage, loadSettings, saveSettings } from './settingsRepository';
import type { SavedUpi } from '../components/AddUpiModal';
import type { SavedCard } from '../components/AddCardModal';

export const LEGACY_MIGRATION_FLAG = 'nexora_customer_migrated_v1';

const PURGE_KEYS = [
  // settings copies (now customer_settings)
  'settings_push_notifs',
  'settings_booking_updates',
  'settings_appt_reminders',
  'settings_rewards_updates',
  'settings_offers_promo',
  'settings_email_notifs',
  'settings_use_loc_auto',
  'settings_display_mode',
  'settings_language',
  'user_location_name',
  // payment methods copies (now saved_payment_methods)
  'nexora_saved_upis',
  'nexora_saved_cards',
  // support copies (now support_tickets / customer_feedback)
  'nexora_support_tickets',
  'nexora_feedback',
  // fake seeded business data — never allowed back
  'nexora_service_reviews_salon-1',
];

/** Remove per-salon review keys written by pre-integration builds. */
const purgeLegacyReviewKeys = (): void => {
  try {
    const doomed: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nexora_service_reviews_')) doomed.push(key);
    }
    doomed.forEach((key) => localStorage.removeItem(key));
  } catch {
    // storage unavailable — nothing to purge
  }
};

export function purgeLegacyLocalStorage(): void {
  for (const key of PURGE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // storage unavailable — nothing to purge
    }
  }
  purgeLegacyReviewKeys();
}

const readJson = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

/**
 * One-time migration: imports legacy localStorage data into Supabase, then
 * purges the local copies. Runs at most once per device (flag key). Errors
 * are swallowed so a failed import never blocks the app — local data stays
 * until the next successful run.
 */
export async function runLegacyMigrationOnce(
  client: SupabaseClient,
  userId: string,
): Promise<void> {
  try {
    if (localStorage.getItem(LEGACY_MIGRATION_FLAG) === 'true') return;
  } catch {
    return;
  }

  try {
    // 1. Settings toggles → customer_settings (merged over server defaults,
    //    never clobbering a server-side value that is already present).
    const legacySettings = settingsFromLegacyLocalStorage((key) => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    });
    if (Object.keys(legacySettings).length > 0) {
      const { settings: serverSettings, exists } = await loadSettings(client, userId);
      if (!exists) {
        await saveSettings(client, userId, { ...serverSettings, ...legacySettings } as never);
      }
    }

    // 2. Saved UPI ids / cards → saved_payment_methods.
    const legacyUpis = readJson<SavedUpi[]>('nexora_saved_upis') ?? [];
    const legacyCards = readJson<SavedCard[]>('nexora_saved_cards') ?? [];
    if (legacyUpis.length > 0 || legacyCards.length > 0) {
      await importLegacyPaymentMethods(
        client,
        userId,
        legacyUpis.map(({ id: _id, ...rest }) => rest),
        legacyCards.map(({ id: _id, ...rest }) => rest),
      );
    }

    // Reviews and support tickets from pre-integration builds were seeded
    // fake data in this app — deliberately NOT imported; simply purged below.

    purgeLegacyLocalStorage();
    localStorage.setItem(LEGACY_MIGRATION_FLAG, 'true');
  } catch (err) {
    console.warn('Legacy migration deferred — will retry next session.', err);
  }
}
